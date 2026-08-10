import { db } from '../db/database.js';
import { Challan, ChallanItem } from '../types/index.js';
import { AppError } from '../middleware/error.js';
import { logAudit } from '../middleware/audit.js';
import { CustomerService } from './customer.service.js';

export class ChallanService {
  static getAll(options: { page?: number; limit?: number; customerId?: string; status?: string }) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.max(1, Math.min(100, options.limit || 20));
    let challans = db.get('challans');

    if (options.customerId) {
      challans = challans.filter((c) => c.customerId === options.customerId);
    }
    if (options.status) {
      challans = challans.filter((c) => c.status === options.status);
    }

    const total = challans.length;
    const startIndex = (page - 1) * limit;
    const paginated = challans.slice(startIndex, startIndex + limit);

    return {
      data: paginated,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  static getById(id: string) {
    const challans = db.get('challans');
    const challan = challans.find((c) => c.id === id || c.challanNumber === id);
    if (!challan) {
      throw new AppError('Sales Challan not found.', 404);
    }

    const items = db.get('challanItems').filter((i) => i.challanId === challan.id);
    return { ...challan, items };
  }

  static create(
    customerId: string,
    itemsInput: { productId: string; quantity: number }[],
    userId?: string,
    userName?: string,
    orderId?: string
  ) {
    if (!itemsInput || itemsInput.length === 0) {
      throw new AppError('Challan must contain at least one product.', 400);
    }

    const customers = db.get('customers');
    let customer = customers.find((c) => c.id === customerId || c.userId === customerId);
    
    if (!customer) {
      const users = db.get('users');
      const matchedUser = users.find((u) => u.id === customerId);

      customer = CustomerService.create(
        {
          name: matchedUser?.name || userName || 'Customer Account',
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

    const products = db.get('products');
    const challanId = `CHAL-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const challanNumber = `SCH-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const challanItems: ChallanItem[] = [];
    let totalQuantity = 0;

    for (const item of itemsInput) {
      if (item.quantity <= 0) {
        throw new AppError('Item quantity must be greater than 0.', 400);
      }
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        throw new AppError(`Product ID '${item.productId}' not found.`, 404);
      }

      challanItems.push({
        id: `CHI-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        challanId,
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        unitPrice: product.unitPrice,
        quantity: item.quantity,
      });

      totalQuantity += item.quantity;
    }

    const newChallan: Challan = {
      id: challanId,
      challanNumber,
      orderId: orderId || '',
      customerId: customer.id,
      customerName: customer.name,
      status: 'DRAFT',
      totalQuantity,
      createdBy: userId || '',
      createdByName: userName || 'Sales User',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.get('challans').unshift(newChallan);
    db.get('challanItems').push(...challanItems);
    db.saveData();

    logAudit(userId, userName, 'CREATE_CHALLAN', 'Challan', challanId, { challanNumber, status: 'DRAFT' });
    return { ...newChallan, items: challanItems };
  }

  static async confirm(id: string, userId?: string, userName?: string) {
    return await db.transaction(async () => {
      const challans = db.get('challans');
      const challan = challans.find((c) => c.id === id || c.challanNumber === id);
      if (!challan) {
        throw new AppError('Challan not found.', 404);
      }

      if (challan.status === 'CONFIRMED') {
        throw new AppError('Challan is already confirmed.', 400);
      }

      if (challan.status === 'CANCELLED') {
        throw new AppError('Cannot confirm a cancelled challan.', 400);
      }

      const items = db.get('challanItems').filter((i) => i.challanId === challan.id);
      const products = db.get('products');
      const stockMovements = db.get('stockMovements');

      for (const item of items) {
        const product = products.find((p) => p.id === item.productId);
        if (!product) {
          throw new AppError(`Product '${item.productName}' no longer exists in catalog.`, 404);
        }
        if (product.currentStock < item.quantity) {
          throw new AppError(
            `Insufficient stock for ${product.name}. Available: ${product.currentStock}, Requested: ${item.quantity}.`,
            409,
            { available: product.currentStock, requested: item.quantity, productId: product.id }
          );
        }
      }

      for (const item of items) {
        const product = products.find((p) => p.id === item.productId)!;
        product.currentStock -= item.quantity;
        product.updatedAt = new Date().toISOString();

        stockMovements.unshift({
          id: `MOV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          productId: product.id,
          productName: product.name,
          productSku: product.sku,
          quantity: item.quantity,
          movementType: 'OUT',
          reason: 'Sales Challan Confirmation',
          referenceType: 'SALES_CHALLAN',
          referenceId: challan.challanNumber,
          createdBy: userId || '',
          createdByName: userName || 'System',
          createdAt: new Date().toISOString(),
        });
      }

      challan.status = 'CONFIRMED';
      challan.confirmedAt = new Date().toISOString();
      challan.updatedAt = new Date().toISOString();

      CustomerService.addTimelineEvent(
        challan.customerId,
        'CHALLAN_CONFIRMED',
        `Sales Challan ${challan.challanNumber} confirmed (${challan.totalQuantity} items). Stock updated.`
      );

      logAudit(userId, userName, 'CONFIRM_CHALLAN', 'Challan', id, { challanNumber: challan.challanNumber });
      return { ...challan, items };
    });
  }

  static delete(id: string, userId?: string, userName?: string) {
    const challans = db.get('challans');
    const index = challans.findIndex((c) => c.id === id || c.challanNumber === id);
    if (index === -1) {
      throw new AppError('Challan not found.', 404);
    }

    const challan = challans[index];

    // If confirmed, restore deducted stock back into inventory!
    if (challan.status === 'CONFIRMED') {
      const items = db.get('challanItems').filter((i) => i.challanId === challan.id);
      const products = db.get('products');
      const stockMovements = db.get('stockMovements');

      for (const item of items) {
        const product = products.find((p) => p.id === item.productId);
        if (product) {
          product.currentStock += item.quantity;
          product.updatedAt = new Date().toISOString();

          stockMovements.unshift({
            id: `MOV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            productId: product.id,
            productName: product.name,
            productSku: product.sku,
            quantity: item.quantity,
            movementType: 'IN',
            reason: 'Accidental Sales Challan Void / Deletion',
            referenceType: 'SALES_CHALLAN_VOID',
            referenceId: challan.challanNumber,
            createdBy: userId || '',
            createdByName: userName || 'System Admin',
            createdAt: new Date().toISOString(),
          });
        }
      }
    }

    challans.splice(index, 1);
    const items = db.get('challanItems');
    const remainingItems = items.filter((i) => i.challanId !== challan.id);
    db.get('challanItems').length = 0;
    db.get('challanItems').push(...remainingItems);

    logAudit(userId, userName, 'DELETE_CHALLAN', 'Challan', id, { challanNumber: challan.challanNumber });
    db.saveData();

    return { message: 'Challan deleted successfully. Stock restored if applicable.' };
  }
}
