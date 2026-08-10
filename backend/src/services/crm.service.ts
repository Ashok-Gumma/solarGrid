import { db } from '../db/database.js';
import { CrmFollowUp } from '../types/index.js';
import { AppError } from '../middleware/error.js';
import { logAudit } from '../middleware/audit.js';

export class CrmService {
  static getFollowUps(options: { customerId?: string; status?: string }) {
    let followups = db.get('crmFollowUps');
    if (options.customerId) {
      followups = followups.filter((f) => f.customerId === options.customerId);
    }
    if (options.status) {
      followups = followups.filter((f) => f.status === options.status);
    }

    const customers = db.get('customers');
    return followups.map((f) => {
      const c = customers.find((cust) => cust.id === f.customerId);
      return { ...f, customerName: c?.name || 'Customer' };
    });
  }

  static createFollowUp(customerId: string, followUpDate: string, notes: string, userId?: string, userName?: string) {
    if (!followUpDate || !notes) {
      throw new AppError('Follow-up date and notes are required.', 400);
    }

    const customers = db.get('customers');
    const customer = customers.find((c) => c.id === customerId);
    if (!customer) {
      throw new AppError('Customer not found.', 404);
    }

    const entry: CrmFollowUp = {
      id: `CRM-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      customerId,
      customerName: customer.name,
      createdBy: userId || '',
      createdByName: userName || 'Sales Rep',
      followUpDate,
      notes,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    db.get('crmFollowUps').unshift(entry);

    // Update customer followUpDate field
    customer.followUpDate = followUpDate;
    customer.updatedAt = new Date().toISOString();

    logAudit(userId, userName, 'CREATE_CRM_FOLLOWUP', 'Customer', customerId, { followUpDate, notes });
    db.saveData();
    return entry;
  }
}
