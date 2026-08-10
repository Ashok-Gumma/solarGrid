import { db } from '../db/database.js';
import { ServiceRequest, ServicePart, WarrantyStatus } from '../types/index.js';
import { AppError } from '../middleware/error.js';
import { logAudit } from '../middleware/audit.js';
import { InventoryService } from './inventory.service.js';
import { CustomerService } from './customer.service.js';

export class ServiceJobService {
  static getAll(options: { page?: number; limit?: number; status?: string; technicianId?: string; customerId?: string }) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.max(1, Math.min(100, options.limit || 20));
    let requests = db.get('serviceRequests');

    if (options.status) {
      requests = requests.filter((s) => s.status === options.status);
    }
    if (options.customerId) {
      requests = requests.filter((s) => s.customerId === options.customerId);
    }

    if (options.technicianId) {
      const jobTechs = db.get('jobTechnicians').filter(
        (jt) => jt.jobType === 'SERVICE' && jt.technicianId === options.technicianId
      );
      const assignedIds = new Set(jobTechs.map((jt) => jt.jobId));
      requests = requests.filter((r) => assignedIds.has(r.id));
    }

    const total = requests.length;
    const startIndex = (page - 1) * limit;
    const paginated = requests.slice(startIndex, startIndex + limit);

    // Enrich technician and parts details
    const users = db.get('users');
    const enriched = paginated.map((req) => {
      const jobTechs = db.get('jobTechnicians').filter((jt) => jt.jobType === 'SERVICE' && jt.jobId === req.id);
      const techIds = new Set(jobTechs.map((jt) => jt.technicianId));
      const technicians = users.filter((u) => techIds.has(u.id)).map(({ passwordHash, ...u }) => u);
      const partsUsed = db.get('serviceParts').filter((sp) => sp.serviceRequestId === req.id);
      return { ...req, technicians, partsUsed };
    });

    return {
      data: enriched,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  static getById(id: string) {
    const requests = db.get('serviceRequests');
    const req = requests.find((r) => r.id === id);
    if (!req) {
      throw new AppError('Service request not found.', 404);
    }

    const users = db.get('users');
    const jobTechs = db.get('jobTechnicians').filter((jt) => jt.jobType === 'SERVICE' && jt.jobId === id);
    const techIds = new Set(jobTechs.map((jt) => jt.technicianId));
    const technicians = users.filter((u) => techIds.has(u.id)).map(({ passwordHash, ...u }) => u);
    const partsUsed = db.get('serviceParts').filter((sp) => sp.serviceRequestId === id);

    return { ...req, technicians, partsUsed };
  }

  static create(
    customerId: string,
    addressIdOrText: string,
    problemCategory: string,
    description: string,
    productId?: string,
    productNameOverride?: string,
    scheduledDate?: string,
    timeSlot?: string,
    userId?: string,
    userName?: string,
    customerNameOverride?: string
  ) {
    const customers = db.get('customers');
    let customer = customers.find((c) => c.id === customerId || c.userId === customerId);

    if (!customer) {
      const users = db.get('users');
      const matchedUser = users.find((u) => u.id === customerId);
      customer = CustomerService.create(
        {
          name: matchedUser?.name || customerNameOverride || userName || 'Solar Customer',
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

    let finalAddressText = addressIdOrText || 'Registered Service Site';
    let latitude = 18.5204;
    let longitude = 73.8567;

    const addresses = db.get('addresses');
    const address = addresses.find((a) => a.id === addressIdOrText);
    if (address) {
      finalAddressText = `${address.addressLine}, ${address.city}, ${address.state} ${address.pincode}`;
      latitude = address.latitude || latitude;
      longitude = address.longitude || longitude;
    }

    let productName = productNameOverride || '';
    let warrantyStatus: WarrantyStatus = 'EXPIRED';

    // Check Warranty Status
    if (productId) {
      const product = db.get('products').find((p) => p.id === productId);
      if (product) {
        productName = productName || product.name;
      }
      const warranties = db.get('warranties').filter((w) => w.customerId === customer.id && w.productId === productId);
      const activeWarranty = warranties.find((w) => w.status === 'ACTIVE' && new Date(w.endDate) >= new Date());
      if (activeWarranty) {
        warrantyStatus = 'ACTIVE';
      }
    }

    if (description.includes('[WARRANTY CLAIM') || problemCategory.includes('Warranty')) {
      warrantyStatus = 'ACTIVE';
    }

    const requestId = `SRV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const serviceNumber = `SRV-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newRequest: ServiceRequest = {
      id: requestId,
      serviceNumber,
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      addressId: address ? address.id : '',
      addressText: finalAddressText,
      latitude,
      longitude,
      productId: productId || '',
      productName: productName || problemCategory,
      problemCategory,
      description,
      warrantyStatus,
      scheduledDate: scheduledDate || new Date().toISOString().split('T')[0],
      timeSlot: timeSlot || '09:00 - 12:00',
      status: 'OPEN',
      resolutionNotes: '',
      totalCost: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.get('serviceRequests').unshift(newRequest);

    // Notify Technicians & System Admin
    const notifications = db.get('notifications');
    notifications.unshift({
      id: `NOTIF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      targetRole: 'TECHNICIAN',
      title: `🔧 New Service Ticket: ${serviceNumber}`,
      message: `Customer ${customer.name} logged service ticket for ${problemCategory} at ${finalAddressText}. (${warrantyStatus === 'ACTIVE' ? 'Under Active Warranty' : 'Out of Warranty'})`,
      referenceType: 'SERVICE_REQUEST',
      referenceId: requestId,
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    CustomerService.addTimelineEvent(
      customer.id,
      'SERVICE_REQUESTED',
      `Service request ${serviceNumber} logged for ${problemCategory} (${warrantyStatus === 'ACTIVE' ? 'Under Warranty' : 'Out of Warranty'})`
    );

    logAudit(userId, userName, 'CREATE_SERVICE_REQUEST', 'ServiceRequest', requestId, { serviceNumber, problemCategory });
    db.saveData();
    return newRequest;
  }

  static assignTechnician(requestId: string, technicianId: string, userId?: string, userName?: string) {
    const requests = db.get('serviceRequests');
    const req = requests.find((r) => r.id === requestId);
    if (!req) {
      throw new AppError('Service request not found.', 404);
    }

    const users = db.get('users');
    const tech = users.find((u) => u.id === technicianId && u.role === 'TECHNICIAN');
    if (!tech) {
      throw new AppError('Invalid technician ID.', 400);
    }

    const jobTechs = db.get('jobTechnicians');
    if (!jobTechs.some((jt) => jt.jobType === 'SERVICE' && jt.jobId === requestId && jt.technicianId === technicianId)) {
      jobTechs.push({
        id: `JT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        jobType: 'SERVICE',
        jobId: requestId,
        technicianId,
        assignedAt: new Date().toISOString(),
      });
    }

    req.status = 'ASSIGNED';
    req.updatedAt = new Date().toISOString();
    logAudit(userId, userName, 'ASSIGN_SERVICE_TECHNICIAN', 'ServiceRequest', requestId, { technicianId });
    db.saveData();
    return this.getById(requestId);
  }

  // Complete Service Request with Parts Used Stock Deduction
  static async complete(
    requestId: string,
    resolutionNotes: string,
    partsUsedInput?: { productId: string; quantity: number }[],
    userId?: string,
    userName?: string
  ) {
    return await db.transaction(async () => {
      const requests = db.get('serviceRequests');
      const req = requests.find((r) => r.id === requestId);
      if (!req) {
        throw new AppError('Service request not found.', 404);
      }

      let totalPartsCost = 0;
      const recordedParts: ServicePart[] = [];
      const serviceParts = db.get('serviceParts');
      const products = db.get('products');

      // RECORD PARTS & DEDUCT INVENTORY
      if (partsUsedInput && partsUsedInput.length > 0) {
        for (const item of partsUsedInput) {
          if (item.quantity <= 0) continue;

          // Perform stock OUT via InventoryService
          await InventoryService.adjustStock(
            item.productId,
            item.quantity,
            'OUT',
            `Service Repair (${req.serviceNumber})`,
            'SERVICE_REPAIR',
            req.serviceNumber,
            userId,
            userName
          );

          const product = products.find((p) => p.id === item.productId)!;
          const cost = product.unitPrice * item.quantity;
          totalPartsCost += cost;

          const partRecord: ServicePart = {
            id: `SP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            serviceRequestId: requestId,
            productId: item.productId,
            productName: product.name,
            quantity: item.quantity,
            unitPrice: product.unitPrice,
          };

          serviceParts.push(partRecord);
          recordedParts.push(partRecord);
        }
      }

      req.status = 'RESOLVED';
      req.resolutionNotes = resolutionNotes;
      req.totalCost = req.warrantyStatus === 'ACTIVE' ? 0 : totalPartsCost;
      req.updatedAt = new Date().toISOString();

      CustomerService.addTimelineEvent(
        req.customerId,
        'SERVICE_RESOLVED',
        `Service ticket ${req.serviceNumber} resolved. Notes: ${resolutionNotes}`
      );

      logAudit(userId, userName, 'COMPLETE_SERVICE', 'ServiceRequest', requestId, { serviceNumber: req.serviceNumber, totalCost: req.totalCost });
      return { ...req, partsUsed: recordedParts };
    });
  }

  static delete(id: string, userId?: string, userName?: string) {
    const requests = db.get('serviceRequests');
    const index = requests.findIndex((r) => r.id === id);
    if (index === -1) {
      throw new AppError('Service request not found.', 404);
    }
    const removed = requests.splice(index, 1)[0];
    logAudit(userId, userName, 'DELETE_SERVICE_REQUEST', 'ServiceRequest', id, { serviceNumber: removed.serviceNumber });
    db.saveData();
    return { id, serviceNumber: removed.serviceNumber };
  }
}
