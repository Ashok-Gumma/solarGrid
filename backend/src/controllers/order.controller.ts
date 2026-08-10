import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { OrderService } from '../services/order.service.js';

export class OrderController {
  static getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      let customerId = req.query.customerId as string;

      // STRICT ACCOUNT ISOLATION: Customers can ONLY view their own orders!
      if (req.user && req.user.role === 'CUSTOMER') {
        customerId = req.user.userId;
      } else if (!req.user && !customerId) {
        // Unauthenticated request receives empty array, never other users' orders
        return res.json({
          success: true,
          data: [],
          orders: [],
          pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
        });
      }

      const status = req.query.status as string;
      const result = OrderService.getAll({ page, limit, customerId, status });
      res.json({
        success: true,
        data: result.orders,
        orders: result.orders,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  static getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const order = OrderService.getById(id);
      res.json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { customerId, items, installationType, addressId, addressText } = req.body;
      const targetCustId = req.user?.userId || customerId;
      const order = await OrderService.create(
        targetCustId,
        items,
        installationType,
        addressId,
        req.user?.userId,
        req.user?.name,
        addressText
      );
      res.status(201).json({ success: true, message: 'Order placed successfully.', data: order });
    } catch (error) {
      next(error);
    }
  }

  static cancel(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const order = OrderService.cancel(id, req.user?.userId, req.user?.name);
      res.json({ success: true, message: 'Order cancelled successfully.', data: order });
    } catch (error) {
      next(error);
    }
  }

  static markDelivered(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const order = OrderService.markDelivered(id, req.user?.userId, req.user?.name);
      res.json({ success: true, message: 'Order marked as DELIVERED. Warranties registered.', data: order });
    } catch (error) {
      next(error);
    }
  }

  static requestReturn(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const { reason, notes } = req.body;
      const order = OrderService.requestReturn(id, reason, notes, req.user?.userId, req.user?.name);
      res.json({ success: true, message: 'Return request submitted successfully.', data: order });
    } catch (error) {
      next(error);
    }
  }
}
