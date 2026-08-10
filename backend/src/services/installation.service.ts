import { db } from '../db/database.js';
import { InstallationJob, ChecklistState } from '../types/index.js';
import { AppError } from '../middleware/error.js';
import { logAudit } from '../middleware/audit.js';
import { CustomerService } from './customer.service.js';

export class InstallationService {
  static getAll(options: { page?: number; limit?: number; status?: string; technicianId?: string; customerId?: string }) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.max(1, Math.min(100, options.limit || 20));
    let jobs = db.get('installationJobs');

    if (options.status) {
      jobs = jobs.filter((j) => j.status === options.status);
    }
    if (options.customerId) {
      jobs = jobs.filter((j) => j.customerId === options.customerId);
    }

    if (options.technicianId) {
      const jobTechs = db.get('jobTechnicians').filter(
        (jt) => jt.jobType === 'INSTALLATION' && jt.technicianId === options.technicianId
      );
      const assignedJobIds = new Set(jobTechs.map((jt) => jt.jobId));
      jobs = jobs.filter((j) => assignedJobIds.has(j.id));
    }

    const total = jobs.length;
    const startIndex = (page - 1) * limit;
    const paginated = jobs.slice(startIndex, startIndex + limit);

    // Enrich technician details
    const users = db.get('users');
    const enriched = paginated.map((job) => {
      const jobTechs = db.get('jobTechnicians').filter((jt) => jt.jobType === 'INSTALLATION' && jt.jobId === job.id);
      const techIds = new Set(jobTechs.map((jt) => jt.technicianId));
      const technicians = users.filter((u) => techIds.has(u.id)).map(({ passwordHash, ...u }) => u);
      return { ...job, technicians };
    });

    return {
      data: enriched,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  static getById(id: string) {
    const jobs = db.get('installationJobs');
    const job = jobs.find((j) => j.id === id);
    if (!job) {
      throw new AppError('Installation job not found.', 404);
    }

    const users = db.get('users');
    const jobTechs = db.get('jobTechnicians').filter((jt) => jt.jobType === 'INSTALLATION' && jt.jobId === id);
    const techIds = new Set(jobTechs.map((jt) => jt.technicianId));
    const technicians = users.filter((u) => techIds.has(u.id)).map(({ passwordHash, ...u }) => u);

    return { ...job, technicians };
  }

  static create(
    orderId: string,
    customerId: string,
    addressIdOrText: string,
    scheduledDate: string,
    timeSlot: string,
    notes?: string,
    userId?: string,
    userName?: string,
    lat?: number,
    lng?: number
  ) {
    const orders = db.get('orders');
    const order = orders.find((o) => o.id === orderId);

    const customers = db.get('customers');
    let customer = customers.find((c) => c.id === customerId || c.userId === customerId);

    if (!customer) {
      const users = db.get('users');
      const matchedUser = users.find((u) => u.id === customerId);
      customer = CustomerService.create(
        {
          name: matchedUser?.name || userName || 'Solar Customer',
          email: matchedUser?.email || 'customer@solargrid.com',
          phone: matchedUser?.phone || '+91 98765 00000',
          customerType: 'RETAIL',
          status: 'ACTIVE',
        },
        userId,
        userName
      );
      customer.userId = customerId;
    }

    let finalAddressText = addressIdOrText || 'Registered Installation Site';
    let latitude = lat || 18.5204;
    let longitude = lng || 73.8567;

    const addresses = db.get('addresses');
    const address = addresses.find((a) => a.id === addressIdOrText);
    if (address) {
      finalAddressText = `${address.addressLine}, ${address.city}, ${address.state} ${address.pincode}`;
      latitude = address.latitude || latitude;
      longitude = address.longitude || longitude;
    }

    const orderItems = db.get('orderItems').filter((i) => i.orderId === orderId);
    let requiredCrewSize = 2;
    for (const item of orderItems) {
      if (item.productName.toLowerCase().includes('panel') && item.quantity > 5) {
        requiredCrewSize = Math.max(requiredCrewSize, 3);
      }
    }

    const jobId = `INS-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const jobNumber = `INS-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newJob: InstallationJob = {
      id: jobId,
      jobNumber,
      orderId: orderId || '',
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      addressId: address ? address.id : '',
      addressText: finalAddressText,
      latitude,
      longitude,
      scheduledDate: scheduledDate || new Date().toISOString().split('T')[0],
      timeSlot: timeSlot || '09:00 - 12:00',
      requiredCrewSize,
      status: 'SCHEDULED',
      checklistState: { panels: false, inverter: false, wiring: false, safety: false, testing: false },
      notes: notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.get('installationJobs').unshift(newJob);

    // Notify Technicians & System Admin
    const notifications = db.get('notifications');
    notifications.unshift({
      id: `NOTIF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      targetRole: 'TECHNICIAN',
      title: `🛠️ New Rooftop Installation: ${jobNumber}`,
      message: `Customer ${customer.name} scheduled solar installation for ${scheduledDate} (${timeSlot}) at ${finalAddressText}.`,
      referenceType: 'INSTALLATION',
      referenceId: jobId,
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    CustomerService.addTimelineEvent(
      customer.id,
      'INSTALLATION_BOOKED',
      `Installation job ${jobNumber} scheduled for ${scheduledDate} (${timeSlot})`
    );

    logAudit(userId, userName, 'CREATE_INSTALLATION', 'InstallationJob', jobId, { jobNumber, scheduledDate, timeSlot });
    db.saveData();
    return newJob;
  }

  // Assign Technician with Slot Collision Check
  static assignTechnicians(jobId: string, technicianIds: string[], userId?: string, userName?: string) {
    const jobs = db.get('installationJobs');
    const job = jobs.find((j) => j.id === jobId);
    if (!job) {
      throw new AppError('Installation job not found.', 404);
    }

    const users = db.get('users');
    const jobTechs = db.get('jobTechnicians');

    for (const techId of technicianIds) {
      const tech = users.find((u) => u.id === techId && u.role === 'TECHNICIAN');
      if (!tech) {
        throw new AppError(`Technician ID '${techId}' is invalid or not a field technician.`, 400);
      }

      // Check slot collision across all installation and service jobs
      const existingTechAssignments = jobTechs.filter((jt) => jt.technicianId === techId);
      for (const assign of existingTechAssignments) {
        if (assign.jobType === 'INSTALLATION') {
          const otherJob = jobs.find((j) => j.id === assign.jobId && j.id !== jobId);
          if (otherJob && otherJob.status !== 'CANCELLED' && otherJob.status !== 'COMPLETED') {
            if (otherJob.scheduledDate === job.scheduledDate && otherJob.timeSlot === job.timeSlot) {
              throw new AppError(
                `Technician ${tech.name} is already assigned to Job ${otherJob.jobNumber} on ${job.scheduledDate} (${job.timeSlot}).`,
                409,
                { technician: tech.name, conflictingJob: otherJob.jobNumber }
              );
            }
          }
        }
      }

      // Add assignment
      if (!jobTechs.some((jt) => jt.jobType === 'INSTALLATION' && jt.jobId === jobId && jt.technicianId === techId)) {
        jobTechs.push({
          id: `JT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          jobType: 'INSTALLATION',
          jobId,
          technicianId: techId,
          assignedAt: new Date().toISOString(),
        });
      }
    }

    job.status = 'ASSIGNED';
    job.updatedAt = new Date().toISOString();
    logAudit(userId, userName, 'ASSIGN_TECHNICIANS', 'InstallationJob', jobId, { technicianIds });
    db.saveData();

    return this.getById(jobId);
  }

  static updateStatus(jobId: string, status: InstallationJob['status'], checklistState?: ChecklistState, userId?: string, userName?: string) {
    const jobs = db.get('installationJobs');
    const job = jobs.find((j) => j.id === jobId);
    if (!job) {
      throw new AppError('Installation job not found.', 404);
    }

    if (checklistState) {
      job.checklistState = { ...job.checklistState, ...checklistState };
    }

    // Require completion of all mandatory checklist items before status can be marked COMPLETED
    if (status === 'COMPLETED') {
      const c = job.checklistState;
      if (!c.panels || !c.inverter || !c.wiring || !c.safety) {
        throw new AppError('All checklist steps (Panels, Inverter, Wiring, Safety) must be checked before completing installation.', 400);
      }

      // AUTO ACTIVATE WARRANTIES FOR INSTALLED PRODUCTS
      const orderItems = db.get('orderItems').filter((i) => i.orderId === job.orderId);
      const warranties = db.get('warranties');
      const now = new Date();

      for (const item of orderItems) {
        if (item.installationEligible) {
          const product = db.get('products').find((p) => p.id === item.productId);
          const months = product?.warrantyMonths || 24;
          const endDate = new Date(now);
          endDate.setMonth(endDate.getMonth() + months);

          warranties.push({
            id: `WAR-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            customerId: job.customerId,
            orderId: job.orderId,
            productId: item.productId,
            productName: item.productName,
            serialNumber: `SN-${item.sku}-${Math.floor(10000 + Math.random() * 90000)}`,
            startDate: now.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            status: 'ACTIVE',
          });
        }
      }

      CustomerService.addTimelineEvent(
        job.customerId,
        'INSTALLATION_COMPLETED',
        `Installation job ${job.jobNumber} successfully completed. Equipment warranty activated.`
      );
    }

    job.status = status;
    job.updatedAt = new Date().toISOString();
    logAudit(userId, userName, 'UPDATE_INSTALLATION_STATUS', 'InstallationJob', jobId, { status });
    db.saveData();

    return job;
  }
}
