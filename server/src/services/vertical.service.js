import { Vertical } from '../models/Vertical.js';
import { User } from '../models/User.js';
import { Attendance } from '../models/Attendance.js';
import { Event } from '../models/Event.js';
import { auditService } from './audit.service.js';
import { AUDIT_ACTIONS, EVENT_STATUS, ATTENDANCE_STATUS, ROLES } from '../config/constants.js';

class VerticalService {
  async listVerticals() {
    const verticals = await Vertical.find()
      .populate('secretary', 'name email memberId phone')
      .populate('leads', 'name email memberId phone')
      .sort({ name: 1 });

    const results = await Promise.all(
      verticals.map(async (v) => {
        const memberCount = await User.countDocuments({ vertical: v._id, isActive: true });
        return {
          ...v.toObject(),
          memberCount
        };
      })
    );

    return results;
  }

  async getVerticalById(id) {
    const vertical = await Vertical.findById(id)
      .populate('secretary', 'name email memberId phone')
      .populate('leads', 'name email memberId phone');

    if (!vertical) {
      throw new Error('Vertical not found');
    }

    const memberCount = await User.countDocuments({ vertical: vertical._id, isActive: true });
    return {
      ...vertical.toObject(),
      memberCount
    };
  }

  async createVertical({ name, description = '', secretary = null, leads = [], actor = null, ip = '' }) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const exists = await Vertical.findOne({ $or: [{ name }, { slug }] });
    if (exists) {
      throw new Error(`Vertical "${name}" already exists`);
    }

    const vertical = await Vertical.create({
      name,
      slug,
      description,
      secretary: secretary || null,
      leads: leads || [],
      isActive: true
    });

    // Update user roles if secretary / leads assigned
    if (secretary) {
      await User.findByIdAndUpdate(secretary, { role: ROLES.SECRETARY, vertical: vertical._id });
    }
    if (leads && leads.length > 0) {
      await User.updateMany({ _id: { $in: leads } }, { role: ROLES.LEAD, vertical: vertical._id });
    }

    await auditService.log({
      actor: actor?._id || actor,
      action: AUDIT_ACTIONS.CREATE,
      entityType: 'Vertical',
      entityId: vertical._id,
      after: vertical.toObject(),
      reason: 'Created new vertical',
      ip
    });

    return Vertical.findById(vertical._id)
      .populate('secretary', 'name email memberId')
      .populate('leads', 'name email memberId');
  }

  async updateVertical(id, updateData, actor = null, ip = '') {
    const vertical = await Vertical.findById(id);
    if (!vertical) {
      throw new Error('Vertical not found');
    }

    const before = vertical.toObject();

    if (updateData.name && updateData.name !== vertical.name) {
      vertical.name = updateData.name;
      vertical.slug = updateData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    if (updateData.description !== undefined) vertical.description = updateData.description;
    if (updateData.isActive !== undefined) vertical.isActive = updateData.isActive;

    if (updateData.secretary !== undefined) {
      const oldSecretary = vertical.secretary;
      vertical.secretary = updateData.secretary || null;
      if (oldSecretary && oldSecretary.toString() !== (updateData.secretary || '')) {
        // Demote old secretary to member if they were only secretary
        await User.findByIdAndUpdate(oldSecretary, { role: ROLES.MEMBER });
      }
      if (updateData.secretary) {
        await User.findByIdAndUpdate(updateData.secretary, { role: ROLES.SECRETARY, vertical: vertical._id });
      }
    }

    if (updateData.leads !== undefined) {
      const oldLeads = (vertical.leads || []).map((l) => l.toString());
      const newLeads = (updateData.leads || []).map((l) => l.toString());

      // Leads removed
      const removed = oldLeads.filter((l) => !newLeads.includes(l));
      if (removed.length > 0) {
        await User.updateMany({ _id: { $in: removed } }, { role: ROLES.MEMBER });
      }
      // Leads added
      if (newLeads.length > 0) {
        await User.updateMany({ _id: { $in: newLeads } }, { role: ROLES.LEAD, vertical: vertical._id });
      }

      vertical.leads = updateData.leads;
    }

    await vertical.save();

    await auditService.log({
      actor: actor?._id || actor,
      action: AUDIT_ACTIONS.UPDATE,
      entityType: 'Vertical',
      entityId: vertical._id,
      before,
      after: vertical.toObject(),
      reason: 'Admin updated vertical configuration',
      ip
    });

    return Vertical.findById(vertical._id)
      .populate('secretary', 'name email memberId')
      .populate('leads', 'name email memberId');
  }

  async deleteVertical(id, actor = null, ip = '') {
    const vertical = await Vertical.findById(id);
    if (!vertical) {
      throw new Error('Vertical not found');
    }

    const before = vertical.toObject();

    // Unassign users from this vertical
    await User.updateMany(
      { vertical: vertical._id },
      { $set: { vertical: null } }
    );

    // Remove vertical from targetVerticals of any events
    await Event.updateMany(
      { targetVerticals: vertical._id },
      { $pull: { targetVerticals: vertical._id } }
    );

    await Vertical.findByIdAndDelete(id);

    await auditService.log({
      actor: actor?._id || actor,
      action: AUDIT_ACTIONS.DELETE,
      entityType: 'Vertical',
      entityId: vertical._id,
      before,
      reason: `Admin deleted vertical: ${vertical.name}`,
      ip
    });

    return { message: `Vertical "${vertical.name}" deleted successfully` };
  }
}

export const verticalService = new VerticalService();
