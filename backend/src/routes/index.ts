import { Router } from 'express';
import { authenticate, optionalAuthenticate, authorize, AuthenticatedRequest } from '../middleware/auth.js';
import { AuthController } from '../controllers/auth.controller.js';
import { CustomerController } from '../controllers/customer.controller.js';
import { ProductController } from '../controllers/product.controller.js';
import { InventoryController } from '../controllers/inventory.controller.js';
import { ChallanController } from '../controllers/challan.controller.js';
import { OrderController } from '../controllers/order.controller.js';
import { InstallationController } from '../controllers/installation.controller.js';
import { ServiceController } from '../controllers/service.controller.js';
import { CrmController } from '../controllers/crm.controller.js';
import { db } from '../db/database.js';

const router = Router();

// --- PUBLIC AUTH ROUTES ---
router.post('/auth/login', AuthController.login);
router.post('/auth/register', AuthController.register);
router.get('/auth/me', authenticate, AuthController.getMe);
router.put('/auth/profile', authenticate, AuthController.updateProfile);

// --- CUSTOMERS ---
router.get('/customers', authenticate, authorize('ADMIN'), CustomerController.getAll);
router.get('/customers/:id', authenticate, authorize('ADMIN'), CustomerController.getById);
router.post('/customers', authenticate, authorize('ADMIN'), CustomerController.create);
router.put('/customers/:id', authenticate, authorize('ADMIN'), CustomerController.update);
router.post('/customers/:id/addresses', authenticate, CustomerController.addAddress);

// --- PRODUCTS & CATALOG ---
router.get('/products', ProductController.getAll);
router.get('/products/:id', ProductController.getById);
router.post('/products', authenticate, authorize('ADMIN', 'WAREHOUSE'), ProductController.create);
router.put('/products/:id', authenticate, authorize('ADMIN', 'WAREHOUSE'), ProductController.update);

// --- INVENTORY & STOCK MOVEMENTS ---
router.get('/inventory', authenticate, authorize('ADMIN', 'WAREHOUSE'), (req, res, next) => {
  try {
    const products = db.get('products');
    const lowStockCount = products.filter((p) => p.currentStock <= p.minStockAlert).length;
    res.json({
      success: true,
      data: {
        totalProducts: products.length,
        lowStockCount,
        products,
      },
    });
  } catch (err) {
    next(err);
  }
});
router.get('/stock-movements', authenticate, authorize('ADMIN', 'WAREHOUSE'), InventoryController.getMovements);
router.post('/stock-movements', authenticate, authorize('ADMIN', 'WAREHOUSE'), InventoryController.adjust);

// --- SALES CHALLANS ---
router.get('/challans', authenticate, authorize('ADMIN', 'WAREHOUSE'), ChallanController.getAll);
router.get('/challans/:id', authenticate, authorize('ADMIN', 'WAREHOUSE'), ChallanController.getById);
router.post('/challans', authenticate, authorize('ADMIN', 'WAREHOUSE'), ChallanController.create);
router.post('/challans/:id/confirm', authenticate, authorize('ADMIN', 'WAREHOUSE'), ChallanController.confirm);
router.delete('/challans/:id', authenticate, authorize('ADMIN', 'WAREHOUSE'), ChallanController.delete);

// --- ORDERS ---
router.get('/orders', authenticate, OrderController.getAll);
router.get('/orders/:id', authenticate, OrderController.getById);
router.post('/orders', authenticate, OrderController.create);
router.post('/orders/:id/cancel', authenticate, OrderController.cancel);
router.post('/orders/:id/deliver', authenticate, authorize('ADMIN', 'WAREHOUSE', 'TECHNICIAN'), OrderController.markDelivered);
router.post('/orders/:id/return', authenticate, OrderController.requestReturn);
router.post('/orders/:id/approve-return', authenticate, authorize('ADMIN', 'WAREHOUSE'), OrderController.approveReturn);

// --- INSTALLATIONS ---
router.get('/installations', authenticate, authorize('ADMIN', 'TECHNICIAN'), InstallationController.getAll);
router.get('/installations/:id', authenticate, authorize('ADMIN', 'TECHNICIAN'), InstallationController.getById);
router.post('/installations', authenticate, InstallationController.create);
router.post('/installations/:id/assign', authenticate, authorize('ADMIN'), InstallationController.assign);
router.post('/installations/:id/status', authenticate, authorize('ADMIN', 'TECHNICIAN'), InstallationController.updateStatus);

// --- SERVICES ---
router.get('/services', authenticate, ServiceController.getAll);
router.get('/services/:id', authenticate, ServiceController.getById);
router.post('/services', authenticate, ServiceController.create);
router.post('/services/:id/assign', authenticate, authorize('ADMIN'), ServiceController.assign);
router.post('/services/:id/complete', authenticate, authorize('ADMIN', 'TECHNICIAN'), ServiceController.complete);
router.delete('/services/:id', authenticate, ServiceController.delete);

// --- ROLE-RESTRICTED NOTIFICATIONS ---
router.get('/notifications', optionalAuthenticate, (req: AuthenticatedRequest, res) => {
  const allNotifications = db.get('notifications');
  if (!req.user) {
    return res.json({ success: true, data: [] });
  }

  const userRole = req.user.role;
  const userId = req.user.userId;

  const notifications = allNotifications.filter(
    (n) =>
      n.targetRole === userRole ||
      n.targetRole === 'ALL' ||
      (n.userId && n.userId === userId)
  );

  res.json({ success: true, data: notifications });
});

router.post('/notifications/:id/read', authenticate, (req: AuthenticatedRequest, res) => {
  const id = req.params.id;
  const notifications = db.get('notifications');
  const notif = notifications.find((n) => n.id === id);
  if (notif) {
    notif.isRead = true;
  }
  db.saveData();
  res.json({ success: true, message: 'Notification marked as read.' });
});

// --- CRM & AUDIT LOGS ---
router.post('/crm/followups', authenticate, authorize('ADMIN'), CrmController.createFollowUp);
router.get('/audit-logs', authenticate, authorize('ADMIN'), (req, res) => {
  const logs = db.get('auditLogs');
  res.json({ success: true, data: logs });
});

export default router;
