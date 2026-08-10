import { db } from '../db/database.js';
import { AuditLog } from '../types/index.js';

export function logAudit(
  userId: string | undefined,
  userName: string | undefined,
  action: string,
  entity: string,
  entityId?: string,
  details?: Record<string, any>
) {
  const auditLogs = db.get('auditLogs');
  const entry: AuditLog = {
    id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    userId,
    userName,
    action,
    entity,
    entityId,
    details,
    createdAt: new Date().toISOString(),
  };
  auditLogs.unshift(entry);
  db.saveData();
}
