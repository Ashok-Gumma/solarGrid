import { db } from '../db/database.js';
import { Order, OrderItem, InstallationType } from '../types/index.js';
import { AppError } from '../middleware/error.js';
import { logAudit } from '../middleware/audit.js';
import { CustomerService } from './customer.service.js';
import { ChallanService } from './challan.service.js';

export class OrderService {
  static getAll(options: { page?: number; limit?: number; customerId?: string; status?: string }) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.max(1, Math.min(100, options.limit || 20));
    let orders = db.get('orders');

    if (options.customerId) {
      const customers = db.get('customers');
      const cust = customers.find((c) => c.id === options.customerId || c.userId === options.customerId);
      const custId = cust ? cust.id : options.customerId;
      orders = orders.filter((o) => o.customerId === custId || o.customerId === options.customerId || (cust && o.customerId === cust.userId));
    }
    if (options.status) {
      orders = orders.filter((o) => o.status === options.status);
    }

    const total = orders.length;
    const startIndex = (page - 1) * limit;
    const paginatedOrders = orders.slice(startIndex, startIndex + limit);
    const orderItems = db.get('orderItems');
    const itemsByOrderId = db.groupByKey(orderItems, 'orderId');

    const ordersWithItems = paginatedOrders.map((order) => {
      const items = itemsByOrderId.get(order.id) || [];
      return { ...order, items };
    });

    return {
      orders: ordersWithItems,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static getById(id: string) {
    const orders = db.get('orders');
    const order = orders.find((o) => o.id === id);
    if (!order) {
      throw new AppError('Order not found.', 404);
    }

    const orderItems = db.get('orderItems');
    const itemsByOrderId = db.groupByKey(orderItems, 'orderId');
    const items = itemsByOrderId.get(order.id) || [];
    return { ...order, items };
  }

  static async create(
    customerId: string,
    itemsInput: { productId: string; quantity: number }[],
    installationType: InstallationType = 'NO_INSTALLATION',
    addressId?: string,
    userId?: string,
    userName?: string,
    addressTextOverride?: string
  ) {
    if (!itemsInput || itemsInput.length === 0) {
      throw new AppError('Order must contain at least one product.', 400);
    }

    return await db.transactionWithPriority(4, async () => {
      // Deterministically sort product IDs alphabetically to eliminate deadlocks across concurrent orders
      const sortedItems = [...itemsInput].sort((a, b) => a.productId.localeCompare(b.productId));

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
      const orderId = `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const orderNumber = `SG-2026-${Math.floor(10000 + Math.random() * 90000)}`;

      const orderItems: OrderItem[] = [];
      let totalAmount = 0;
      let hasEligibleProduct = false;

      for (const item of sortedItems) {
        const product = products.find((p) => p.id === item.productId);
        if (!product) {
          throw new AppError(`Product '${item.productId}' not found.`, 400);
        }

        if (product.installationEligible) {
          hasEligibleProduct = true;
        }

        const itemTotal = product.unitPrice * item.quantity;
        totalAmount += itemTotal;

        orderItems.push({
          id: `ORI-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          orderId,
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          unitPrice: product.unitPrice,
          quantity: item.quantity,
          installationEligible: product.installationEligible,
        });
      }

      let effectiveInstallationType = installationType;
      if (!hasEligibleProduct && installationType === 'SOLARGRID_INSTALLER') {
        effectiveInstallationType = 'NO_INSTALLATION';
      }

      let finalAddressText = addressTextOverride || '';
      if (!finalAddressText && addressId) {
        const addr = db.get('addresses').find((a) => a.id === addressId);
        if (addr) {
          finalAddressText = `${addr.addressLine}, ${addr.city}, ${addr.state} ${addr.pincode}`;
        }
      }
      if (!finalAddressText) {
        finalAddressText = 'Registered Installation Address';
      }

      const newOrder: Order = {
        id: orderId,
        orderNumber,
        customerId: customer.id,
        customerName: customer.name,
        addressId: addressId || '',
        addressText: finalAddressText,
        installationType: effectiveInstallationType,
        totalAmount,
        status: 'CONFIRMED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      db.get('orders').unshift(newOrder);
      db.get('orderItems').push(...orderItems);

      ChallanService.create(
        customer.id,
        itemsInput.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        userId,
        userName,
        orderId
      );

      const notifications = db.get('notifications');
      notifications.unshift({
        id: `NOTIF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        targetRole: 'WAREHOUSE',
        title: `📦 New Equipment Order: ${orderNumber}`,
        message: `Customer ${customer.name} ordered ${orderItems.length} product line(s) totaling ₹${totalAmount.toLocaleString('en-IN')}. Delivery Address: ${finalAddressText}. Draft Sales Challan created for warehouse dispatch.`,
        referenceType: 'ORDER',
        referenceId: orderId,
        isRead: false,
        createdAt: new Date().toISOString(),
      });

      CustomerService.addTimelineEvent(
        customer.id,
        'ORDER_CREATED',
        `Order ${orderNumber} placed for ₹${totalAmount.toLocaleString('en-IN')}`
      );

      logAudit(userId, userName, 'CREATE_ORDER', 'Order', orderId, { orderNumber, totalAmount });

      return { ...newOrder, items: orderItems };
    });
  }

  static cancel(orderId: string, userId?: string, userName?: string) {
    const orders = db.get('orders');
    const order = orders.find((o) => o.id === orderId);
    if (!order) {
      throw new AppError('Order not found.', 404);
    }

    if (order.status === 'DELIVERED' || order.status === 'COMPLETED') {
      throw new AppError('Delivered orders cannot be cancelled directly. Please submit a Product Return request.', 400);
    }

    order.status = 'CANCELLED';
    order.updatedAt = new Date().toISOString();

    const challans = db.get('challans');
    const challan = challans.find((c) => c.orderId === orderId);
    if (challan) {
      challan.status = 'CANCELLED';
      challan.updatedAt = new Date().toISOString();
    }

    logAudit(userId, userName, 'CANCEL_ORDER', 'Order', orderId, { orderNumber: order.orderNumber });
    db.saveData();

    const orderItems = db.get('orderItems').filter((i) => i.orderId === order.id);
    return { ...order, items: orderItems };
  }

  static markDelivered(orderId: string, userId?: string, userName?: string) {
    const orders = db.get('orders');
    const order = orders.find((o) => o.id === orderId);
    if (!order) {
      throw new AppError('Order not found.', 404);
    }

    const now = new Date().toISOString();
    order.status = 'DELIVERED';
    order.deliveredAt = now;
    order.updatedAt = now;

    const orderItems = db.get('orderItems').filter((i) => i.orderId === order.id);
    const products = db.get('products');
    const warranties = db.get('warranties');

    for (const item of orderItems) {
      const product = products.find((p) => p.id === item.productId);
      const warrantyMonths = product?.warrantyMonths || 24;

      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + warrantyMonths);

      for (let k = 0; k < item.quantity; k++) {
        const serialNumber = `SG-SN-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
        warranties.push({
          id: `WAR-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          orderId: order.id,
          productId: item.productId,
          productName: item.productName,
          serialNumber,
          customerId: order.customerId,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
        });
      }
    }

    logAudit(userId, userName, 'DELIVER_ORDER', 'Order', orderId, { orderNumber: order.orderNumber });
    db.saveData();

    return { ...order, items: orderItems };
  }

  static requestReturn(orderId: string, reason: string, notes?: string, userId?: string, userName?: string) {
    const orders = db.get('orders');
    const order = orders.find((o) => o.id === orderId);
    if (!order) {
      throw new AppError('Order not found.', 404);
    }

    if (order.status !== 'DELIVERED' && order.status !== 'COMPLETED') {
      throw new AppError('Only delivered orders can be submitted for return.', 400);
    }

    // 15-Day Return Window Validation
    const deliveryTime = order.deliveredAt ? new Date(order.deliveredAt).getTime() : new Date(order.updatedAt).getTime();
    const currentTime = new Date().getTime();
    const diffInDays = (currentTime - deliveryTime) / (1000 * 60 * 60 * 24);

    if (diffInDays > 15) {
      throw new AppError(`The 15-day return period for order ${order.orderNumber} has expired. Returns are only allowed within 15 days of delivery.`, 400);
    }

    order.status = 'RETURN_REQUESTED';
    order.returnReason = reason;
    order.returnNotes = notes || '';
    order.updatedAt = new Date().toISOString();

    // Create notification for Warehouse staff
    const notifications = db.get('notifications');
    notifications.unshift({
      id: `NOTIF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: `Return Requested: ${order.orderNumber}`,
      message: `Customer requested return for order ${order.orderNumber}. Reason: ${reason}`,
      type: 'WARNING',
      targetRole: 'WAREHOUSE',
      createdAt: new Date().toISOString(),
      isRead: false,
    });

    logAudit(userId, userName, 'RETURN_ORDER', 'Order', orderId, { orderNumber: order.orderNumber, reason, notes });
    db.saveData();

    const orderItems = db.get('orderItems').filter((i) => i.orderId === order.id);
    return { ...order, items: orderItems };
  }

  static async approveReturn(orderId: string, warehouseUserId?: string, warehouseUserName?: string) {
    return await db.transaction(async () => {
      const orders = db.get('orders');
      const order = orders.find((o) => o.id === orderId);
      if (!order) {
        throw new AppError('Order not found.', 404);
      }

      if (order.status !== 'RETURN_REQUESTED') {
        throw new AppError('Only orders with a pending return request can be marked as returned.', 400);
      }

      order.status = 'RETURNED';
      order.updatedAt = new Date().toISOString();

      const orderItems = db.get('orderItems').filter((i) => i.orderId === order.id);
      const products = db.get('products');
      const stockMovements = db.get('stockMovements');

      // Restock products into inventory
      for (const item of orderItems) {
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
            reason: `Customer Return Restock for ${order.orderNumber}`,
            referenceType: 'CUSTOMER_RETURN',
            referenceId: order.id,
            createdBy: warehouseUserId || '',
            createdByName: warehouseUserName || 'Warehouse Staff',
            createdAt: new Date().toISOString(),
          });
        }
      }

      // Notify Customer: Product Received & Successfully Returned
      const notifications = db.get('notifications');
      notifications.unshift({
        id: `NOTIF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        userId: order.customerId,
        title: `Product Received & Returned: ${order.orderNumber}`,
        message: `Warehouse has received your returned items for order ${order.orderNumber}. Your return has been successfully processed!`,
        type: 'SUCCESS',
        targetRole: 'CUSTOMER',
        createdAt: new Date().toISOString(),
        isRead: false,
      });

      logAudit(warehouseUserId, warehouseUserName, 'APPROVE_RETURN', 'Order', orderId, { orderNumber: order.orderNumber });
      db.saveData();

      return { ...order, items: orderItems };
    });
  }
}
