import { db } from '../db/database.js';
import { Customer, Address, CustomerTimelineEvent } from '../types/index.js';
import { AppError } from '../middleware/error.js';
import { logAudit } from '../middleware/audit.js';

export class CustomerService {
  static getAll(options: { page?: number; limit?: number; search?: string; status?: string; type?: string }) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.max(1, Math.min(100, options.limit || 20));
    let customers = db.get('customers');

    if (options.search) {
      const q = options.search.toLowerCase();
      customers = customers.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.businessName && c.businessName.toLowerCase().includes(q)) ||
          c.phone.includes(q) ||
          c.email.toLowerCase().includes(q)
      );
    }

    if (options.status) {
      customers = customers.filter((c) => c.status === options.status);
    }

    if (options.type) {
      customers = customers.filter((c) => c.customerType === options.type);
    }

    const total = customers.length;
    const startIndex = (page - 1) * limit;
    const paginated = customers.slice(startIndex, startIndex + limit);

    return {
      data: paginated,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static getById(id: string) {
    const customers = db.get('customers');
    const customer = customers.find((c) => c.id === id || c.userId === id);
    if (!customer) {
      // Return a clean default structure instead of throwing 404
      return {
        id,
        name: 'Customer Account',
        email: '',
        phone: '',
        customerType: 'RETAIL',
        status: 'ACTIVE',
        addresses: [],
        orders: [],
        challans: [],
        installations: [],
        services: [],
        warranties: [],
        followups: [],
        timeline: [],
      };
    }

    const realId = customer.id;
    const addresses = db.groupByKey(db.get('addresses'), 'customerId').get(realId) || [];
    const orders = db.groupByKey(db.get('orders'), 'customerId').get(realId) || [];
    const challans = db.groupByKey(db.get('challans'), 'customerId').get(realId) || [];
    const installations = db.groupByKey(db.get('installationJobs'), 'customerId').get(realId) || [];
    const services = db.groupByKey(db.get('serviceRequests'), 'customerId').get(realId) || [];
    const warranties = db.groupByKey(db.get('warranties'), 'customerId').get(realId) || [];
    const followups = db.groupByKey(db.get('crmFollowUps'), 'customerId').get(realId) || [];
    const timeline = db.groupByKey(db.get('customerTimelineEvents'), 'customerId').get(realId) || [];

    return {
      ...customer,
      addresses,
      orders,
      challans,
      installations,
      services,
      warranties,
      followups,
      timeline,
    };
  }

  static create(data: Partial<Customer> & { initialAddress?: Partial<Address> }, createdByUserId?: string, createdByName?: string) {
    if (!data.name || !data.email || !data.phone || !data.customerType) {
      throw new AppError('Name, email, phone, and customer type are required.', 400);
    }

    const customers = db.get('customers');
    const newCustomer: Customer = {
      id: `CUST-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: data.name,
      businessName: data.businessName || '',
      email: data.email,
      phone: data.phone,
      gstNumber: data.gstNumber || '',
      customerType: data.customerType || 'RETAIL',
      status: data.status || 'ACTIVE',
      followUpDate: data.followUpDate || undefined,
      notes: data.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    customers.unshift(newCustomer);

    if (data.initialAddress && data.initialAddress.addressLine) {
      this.addAddress(newCustomer.id, data.initialAddress);
    }

    this.addTimelineEvent(newCustomer.id, 'CUSTOMER_CREATED', `Customer profile created for ${newCustomer.name}`);
    logAudit(createdByUserId, createdByName, 'CREATE_CUSTOMER', 'Customer', newCustomer.id, { name: newCustomer.name });

    db.saveData();
    return newCustomer;
  }

  static update(id: string, data: Partial<Customer>, userId?: string, userName?: string) {
    const customers = db.get('customers');
    const index = customers.findIndex((c) => c.id === id || c.userId === id);
    if (index === -1) {
      throw new AppError('Customer not found.', 404);
    }

    const existing = customers[index];
    const updated: Customer = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    customers[index] = updated;
    logAudit(userId, userName, 'UPDATE_CUSTOMER', 'Customer', id, data);
    db.saveData();
    return updated;
  }

  static addAddress(customerId: string, addressData: Partial<Address>) {
    if (!addressData.addressLine || !addressData.city || !addressData.state || !addressData.pincode) {
      throw new AppError('Address line, city, state, and pincode are required.', 400);
    }

    const addresses = db.get('addresses');
    const newAddress: Address = {
      id: `ADDR-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      customerId,
      addressLabel: addressData.addressLabel || 'Home',
      addressLine: addressData.addressLine,
      area: addressData.area || '',
      city: addressData.city,
      state: addressData.state,
      pincode: addressData.pincode,
      landmark: addressData.landmark || '',
      contactPerson: addressData.contactPerson || '',
      contactPhone: addressData.contactPhone || '',
      latitude: addressData.latitude || 18.5204,
      longitude: addressData.longitude || 73.8567,
      isDefault: addressData.isDefault || addresses.filter((a) => a.customerId === customerId).length === 0,
      createdAt: new Date().toISOString(),
    };

    addresses.push(newAddress);
    db.saveData();
    return newAddress;
  }

  static addTimelineEvent(customerId: string, eventType: string, description: string) {
    const events = db.get('customerTimelineEvents');
    const entry: CustomerTimelineEvent = {
      id: `TL-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      customerId,
      eventType,
      description,
      createdAt: new Date().toISOString(),
    };
    events.unshift(entry);
    db.saveData();
  }
}
