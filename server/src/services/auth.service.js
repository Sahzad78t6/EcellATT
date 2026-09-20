import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { generateToken } from '../utils/token.js';
import { auditService } from './audit.service.js';
import { AUDIT_ACTIONS } from '../config/constants.js';

class AuthService {
  async login({ identifier, password, ip = '' }) {
    const trimmed = identifier.trim();
    const isEmail = trimmed.includes('@');

    const user = await User.findOne(
      isEmail ? { email: trimmed.toLowerCase() } : { memberId: trimmed.toUpperCase() }
    ).select('+passwordHash');

    if (!user) {
      throw new Error('Invalid credentials');
    }

    if (!user.isActive) {
      throw new Error('Your account has been deactivated. Please contact an admin.');
    }

    // Check account lockout
    if (user.isLocked()) {
      const remainingMinutes = Math.ceil((new Date(user.lockUntil).getTime() - Date.now()) / (60 * 1000));
      throw new Error(`Account is temporarily locked due to failed attempts. Try again in ${remainingMinutes} minute(s).`);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      user.failedLoginCount += 1;
      if (user.failedLoginCount >= 5) {
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minute lock
        await user.save();
        await auditService.log({
          actor: user._id,
          action: 'ACCOUNT_LOCKED',
          entityType: 'User',
          entityId: user._id,
          reason: '5 consecutive failed login attempts',
          ip
        });
        throw new Error('Account locked for 15 minutes due to 5 failed login attempts.');
      }
      await user.save();
      throw new Error('Invalid credentials');
    }

    // Login successful - reset lockout counters
    user.failedLoginCount = 0;
    user.lockUntil = null;
    user.lastLoginAt = new Date();
    await user.save();

    const token = generateToken({
      userId: user._id,
      role: user.role
    });

    const userPopulated = await User.findById(user._id).populate('vertical', 'name slug');

    return {
      token,
      user: {
        _id: userPopulated._id,
        memberId: userPopulated.memberId,
        name: userPopulated.name,
        email: userPopulated.email,
        role: userPopulated.role,
        vertical: userPopulated.vertical,
        phone: userPopulated.phone,
        year: userPopulated.year,
        branch: userPopulated.branch,
        mustChangePassword: userPopulated.mustChangePassword,
        joinedAt: userPopulated.joinedAt
      }
    };
  }

  async changePassword({ userId, currentPassword, newPassword, ip = '' }) {
    const user = await User.findById(userId).select('+passwordHash');
    if (!user) {
      throw new Error('User not found');
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new Error('Incorrect current password');
    }

    const salt = await bcrypt.genSalt(12);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    user.mustChangePassword = false;
    await user.save();

    await auditService.log({
      actor: user._id,
      action: AUDIT_ACTIONS.PASSWORD_RESET,
      entityType: 'User',
      entityId: user._id,
      reason: 'User password changed successfully',
      ip
    });

    return { message: 'Password updated successfully' };
  }

  async getMe(userId) {
    const user = await User.findById(userId).populate('vertical', 'name slug');
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async updateMe(userId, { name, phone, year, branch }) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (year !== undefined) user.year = year.trim();
    if (branch !== undefined) user.branch = branch.trim();
    await user.save();

    return await User.findById(userId).populate('vertical', 'name slug');
  }
}

export const authService = new AuthService();

