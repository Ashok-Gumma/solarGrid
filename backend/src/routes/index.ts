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
router.get('/customers', optionalAuthenticate, CustomerController.getAll);
router.get('/customers/:id', optionalAuthenticate, CustomerController.getById);
router.post('/customers', optionalAuthenticate, CustomerController.create);
router.put('/customers/:id', optionalAuthenticate, CustomerController.update);
router.post('/customers/:id/addresses', optionalAuthenticate, CustomerController.addAddress);

// --- PRODUCTS & CATALOG ---
router.get('/products', ProductController.getAll);
router.get('/products/:id', ProductController.getById);
router.post('/products', optionalAuthenticate, ProductController.create);
router.put('/products/:id', optionalAuthenticate, ProductController.update);

// --- INVENTORY & STOCK MOVEMENTS ---
router.get('/inventory', optionalAuthenticate, (req, res, next) => {
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
router.get('/stock-movements', optionalAuthenticate, InventoryController.getMovements);
router.post('/stock-movements', optionalAuthenticate, InventoryController.adjust);

// --- SALES CHALLANS ---
router.get('/challans', optionalAuthenticate, ChallanController.getAll);
router.get('/challans/:id', optionalAuthenticate, ChallanController.getById);
router.post('/challans', optionalAuthenticate, ChallanController.create);
router.post('/challans/:id/confirm', optionalAuthenticate, ChallanController.confirm);
router.delete('/challans/:id', optionalAuthenticate, ChallanController.delete);

// --- ORDERS ---
router.get('/orders', optionalAuthenticate, OrderController.getAll);
router.get('/orders/:id', optionalAuthenticate, OrderController.getById);
router.post('/orders', optionalAuthenticate, OrderController.create);
router.post('/orders/:id/cancel', optionalAuthenticate, OrderController.cancel);
router.post('/orders/:id/deliver', optionalAuthenticate, OrderController.markDelivered);
router.post('/orders/:id/return', optionalAuthenticate, OrderController.requestReturn);

// --- INSTALLATIONS ---
router.get('/installations', optionalAuthenticate, InstallationController.getAll);
router.get('/installations/:id', optionalAuthenticate, InstallationController.getById);
router.post('/installations', optionalAuthenticate, InstallationController.create);
router.post('/installations/:id/assign', optionalAuthenticate, InstallationController.assign);
router.post('/installations/:id/status', optionalAuthenticate, InstallationController.updateStatus);

// --- SERVICES ---
router.get('/services', optionalAuthenticate, ServiceController.getAll);
router.get('/services/:id', optionalAuthenticate, ServiceController.getById);
router.post('/services', optionalAuthenticate, ServiceController.create);
router.post('/services/:id/assign', optionalAuthenticate, ServiceController.assign);
router.post('/services/:id/complete', optionalAuthenticate, ServiceController.complete);
router.delete('/services/:id', optionalAuthenticate, ServiceController.delete);

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

router.post('/notifications/:id/read', optionalAuthenticate, (req: AuthenticatedRequest, res) => {
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
router.post('/crm/followups', optionalAuthenticate, CrmController.createFollowUp);
router.get('/audit-logs', optionalAuthenticate, (req, res) => {
  const logs = db.get('auditLogs');
  res.json({ success: true, data: logs });
});

export default router;
