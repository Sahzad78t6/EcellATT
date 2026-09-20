import { AuditLog } from '../models/AuditLog.js';

class AuditService {
  async log({ actor = null, action, entityType, entityId, before = null, after = null, reason = '', ip = '' }) {
    try {
      await AuditLog.create({
        actor: actor?._id || actor || null,
        action,
        entityType,
        entityId: entityId ? entityId.toString() : 'N/A',
        before,
        after,
        reason,
        ip
      });
    } catch (err) {
      console.error('[AuditService] Failed to record audit log:', err.message);
    }
  }
}

export const auditService = new AuditService();
