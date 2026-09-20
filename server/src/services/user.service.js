import bcrypt from 'bcryptjs';
import { parse } from 'csv-parse/sync';
import { User } from '../models/User.js';
import { Vertical } from '../models/Vertical.js';
import { EmailLog } from '../models/EmailLog.js';
import { generateTemporaryPassword } from '../utils/passwordGenerator.js';
import { emailService } from './email.service.js';
import { auditService } from './audit.service.js';
import { generateWelcomeEmail } from '../templates/welcomeEmail.js';
import { ROLES, AUDIT_ACTIONS, EMAIL_TYPES, EMAIL_STATUS } from '../config/constants.js';
import { ENV } from '../config/env.js';

class UserService {
  async createUser({
    name,
    email,
    memberId,
    role = ROLES.MEMBER,
    vertical = null,
    phone = '',
    year = '1st Year',
    branch = '',
    password = null,
    sendEmailCredentials = false,
    actor = null,
    ip = ''
  }) {
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      throw new Error(`Email ${email} is already registered.`);
    }

    const existingMemberId = await User.findOne({ memberId: memberId.toUpperCase() });
    if (existingMemberId) {
      throw new Error(`Member ID ${memberId} is already taken.`);
    }

    let verticalDoc = null;
    if (vertical) {
      verticalDoc = await Vertical.findById(vertical);
      if (!verticalDoc) {
        throw new Error('Specified vertical does not exist.');
      }
    }

    const tempPassword = password || generateTemporaryPassword(10);
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(tempPassword, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      memberId: memberId.toUpperCase(),
      passwordHash,
      role,
      vertical: verticalDoc ? verticalDoc._id : null,
      phone,
      year,
      branch,
      isActive: true,
      mustChangePassword: true,
      joinedAt: new Date()
    });

    await auditService.log({
      actor: actor?._id || actor,
      action: AUDIT_ACTIONS.CREATE,
      entityType: 'User',
      entityId: user._id,
      after: { name: user.name, email: user.email, memberId: user.memberId, role: user.role, vertical: user.vertical },
      reason: 'Admin created user account',
      ip
    });

    // Send credentials email if requested
    if (sendEmailCredentials) {
      try {
        const { html, text } = generateWelcomeEmail({
          memberName: user.name,
          email: user.email,
          memberId: user.memberId,
          tempPassword,
          role: user.role,
          verticalName: verticalDoc ? verticalDoc.name : '',
          portalUrl: ENV.PORTAL_URL
        });

        const sendResult = await emailService.sendMail({
          to: user.email,
          subject: 'Welcome to E-Cell - Your Login Credentials',
          html,
          text
        });

        await EmailLog.create({
          member: user._id,
          event: null,
          type: EMAIL_TYPES.WELCOME,
          toEmail: user.email,
          status: sendResult.success ? EMAIL_STATUS.SENT : EMAIL_STATUS.FAILED,
          error: sendResult.error || null,
          sentAt: new Date()
        });
      } catch (mailErr) {
        console.error('[UserService] Failed to send welcome email:', mailErr.message);
      }
    }

    const populatedUser = await User.findById(user._id).populate('vertical', 'name slug');

    return {
      user: populatedUser,
      tempPassword
    };
  }

  async bulkCreateUsersFromCsv({ csvContent, sendEmailCredentials = false, actor = null, ip = '' }) {
    let records = [];
    try {
      records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      });
    } catch (err) {
      throw new Error(`CSV parsing error: ${err.message}`);
    }

    if (!records || records.length === 0) {
      throw new Error('CSV file is empty or invalid.');
    }

    const verticals = await Vertical.find();
    const verticalMap = new Map();
    verticals.forEach((v) => {
      verticalMap.set(v.name.toLowerCase(), v._id);
      verticalMap.set(v.slug.toLowerCase(), v._id);
      verticalMap.set(v._id.toString(), v._id);
    });

    const createdUsers = [];
    const errors = [];
    let rowNum = 1;

    for (const row of records) {
      rowNum++;
      try {
        const name = row.name || row.Name;
        const email = (row.email || row.Email || '').toLowerCase().trim();
        const memberId = (row.memberId || row.member_id || row.MemberID || '').toUpperCase().trim();
        const role = (row.role || row.Role || ROLES.MEMBER).toUpperCase().trim();
        const verticalName = row.vertical || row.Vertical || '';
        const phone = row.phone || row.Phone || '';
        const year = row.year || row.Year || '1st Year';
        const branch = row.branch || row.Branch || '';
        const rawPassword = row.password || row.Password || null;

        if (!name || !email || !memberId) {
          errors.push({ row: rowNum, email: email || 'N/A', error: 'Missing required fields (name, email, or memberId)' });
          continue;
        }

        if (!Object.values(ROLES).includes(role)) {
          errors.push({ row: rowNum, email, error: `Invalid role "${role}"` });
          continue;
        }

        const emailExists = await User.findOne({ email });
        if (emailExists) {
          errors.push({ row: rowNum, email, error: `Email ${email} already exists` });
          continue;
        }

        const idExists = await User.findOne({ memberId });
        if (idExists) {
          errors.push({ row: rowNum, email, error: `Member ID ${memberId} already exists` });
          continue;
        }

        let verticalId = null;
        if (verticalName) {
          verticalId = verticalMap.get(verticalName.toLowerCase()) || null;
          if (!verticalId && role !== ROLES.ADMIN) {
            errors.push({ row: rowNum, email, error: `Vertical "${verticalName}" not found` });
            continue;
          }
        }

        const tempPassword = rawPassword || generateTemporaryPassword(10);
        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash(tempPassword, salt);

        const newUser = await User.create({
          name,
          email,
          memberId,
          passwordHash,
          role,
          vertical: verticalId,
          phone,
          year,
          branch,
          isActive: true,
          mustChangePassword: true,
          joinedAt: new Date()
        });

        if (sendEmailCredentials) {
          try {
            const vObj = verticals.find((v) => v._id.toString() === (verticalId?.toString() || ''));
            const { html, text } = generateWelcomeEmail({
              memberName: newUser.name,
              email: newUser.email,
              memberId: newUser.memberId,
              tempPassword,
              role: newUser.role,
              verticalName: vObj ? vObj.name : '',
              portalUrl: ENV.PORTAL_URL
            });

            const sendResult = await emailService.sendMail({
              to: newUser.email,
              subject: 'Welcome to E-Cell - Your Login Credentials',
              html,
              text
            });

            await EmailLog.create({
              member: newUser._id,
              event: null,
              type: EMAIL_TYPES.WELCOME,
              toEmail: newUser.email,
              status: sendResult.success ? EMAIL_STATUS.SENT : EMAIL_STATUS.FAILED,
              error: sendResult.error || null,
              sentAt: new Date()
            });
          } catch (mErr) {
            console.error('[Bulk Import] Welcome mail error:', mErr.message);
          }
        }

        createdUsers.push({
          _id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          memberId: newUser.memberId,
          role: newUser.role,
          tempPassword
        });
      } catch (err) {
        errors.push({ row: rowNum, email: row.email || 'N/A', error: err.message });
      }
    }

    await auditService.log({
      actor: actor?._id || actor,
      action: AUDIT_ACTIONS.BULK_IMPORT,
      entityType: 'User',
      entityId: 'BATCH',
      after: { importedCount: createdUsers.length, failedCount: errors.length },
      reason: `Bulk imported ${createdUsers.length} users (${errors.length} errors)`,
      ip
    });

    return {
      totalRows: records.length,
      importedCount: createdUsers.length,
      failedCount: errors.length,
      createdUsers,
      errors
    };
  }

  async listUsers({ page = 1, limit = 20, search = '', role, vertical, isActive, sortBy = 'name', sortOrder = 'asc' }) {
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { memberId: { $regex: search, $options: 'i' } }
      ];
    }

    if (role) {
      query.role = role;
    }

    if (vertical) {
      query.vertical = vertical;
    }

    if (isActive !== undefined && isActive !== '') {
      query.isActive = isActive === 'true' || isActive === true;
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const [users, total] = await Promise.all([
      User.find(query)
        .populate('vertical', 'name slug')
        .sort(sort)
        .skip(skip)
        .limit(limitNum),
      User.countDocuments(query)
    ]);

    return {
      users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    };
  }

  async getUserById(id) {
    const user = await User.findById(id).populate('vertical', 'name slug');
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async updateUser(id, updateData, actor = null, ip = '') {
    const user = await User.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    const before = user.toObject();

    if (updateData.email && updateData.email.toLowerCase() !== user.email) {
      const emailExists = await User.findOne({ email: updateData.email.toLowerCase() });
      if (emailExists) throw new Error('Email is already taken by another user');
      user.email = updateData.email.toLowerCase();
    }

    if (updateData.memberId && updateData.memberId.toUpperCase() !== user.memberId) {
      const idExists = await User.findOne({ memberId: updateData.memberId.toUpperCase() });
      if (idExists) throw new Error('Member ID is already taken by another user');
      user.memberId = updateData.memberId.toUpperCase();
    }

    if (updateData.name) user.name = updateData.name;
    if (updateData.role) user.role = updateData.role;
    if (updateData.vertical !== undefined) user.vertical = updateData.vertical || null;
    if (updateData.phone !== undefined) user.phone = updateData.phone;
    if (updateData.year !== undefined) user.year = updateData.year;
    if (updateData.branch !== undefined) user.branch = updateData.branch;
    if (updateData.isActive !== undefined) user.isActive = updateData.isActive;

    await user.save();

    await auditService.log({
      actor: actor?._id || actor,
      action: AUDIT_ACTIONS.UPDATE,
      entityType: 'User',
      entityId: user._id,
      before,
      after: user.toObject(),
      reason: 'Admin updated user profile',
      ip
    });

    return User.findById(user._id).populate('vertical', 'name slug');
  }

  async resetPassword(id, { password = null, sendEmailCredentials = false }, actor = null, ip = '') {
    const user = await User.findById(id).populate('vertical', 'name slug');
    if (!user) {
      throw new Error('User not found');
    }

    const tempPassword = password || generateTemporaryPassword(10);
    const salt = await bcrypt.genSalt(12);
    user.passwordHash = await bcrypt.hash(tempPassword, salt);
    user.mustChangePassword = true;
    user.failedLoginCount = 0;
    user.lockUntil = null;
    await user.save();

    await auditService.log({
      actor: actor?._id || actor,
      action: AUDIT_ACTIONS.PASSWORD_RESET,
      entityType: 'User',
      entityId: user._id,
      reason: 'Admin reset user password',
      ip
    });

    if (sendEmailCredentials) {
      try {
        const { html, text } = generateWelcomeEmail({
          memberName: user.name,
          email: user.email,
          memberId: user.memberId,
          tempPassword,
          role: user.role,
          verticalName: user.vertical ? user.vertical.name : '',
          portalUrl: ENV.PORTAL_URL
        });

        const sendResult = await emailService.sendMail({
          to: user.email,
          subject: 'Your E-Cell Portal Password Has Been Reset',
          html,
          text
        });

        await EmailLog.create({
          member: user._id,
          event: null,
          type: EMAIL_TYPES.WELCOME,
          toEmail: user.email,
          status: sendResult.success ? EMAIL_STATUS.SENT : EMAIL_STATUS.FAILED,
          error: sendResult.error || null,
          sentAt: new Date()
        });
      } catch (mailErr) {
        console.error('[UserService] Reset email error:', mailErr.message);
      }
    }

    return {
      message: 'Password reset successfully',
      tempPassword
    };
  }
}

export const userService = new UserService();
