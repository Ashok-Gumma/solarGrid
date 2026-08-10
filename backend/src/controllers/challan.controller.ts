import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { ChallanService } from '../services/challan.service.js';

export class ChallanController {
  static getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      const customerId = req.query.customerId as string;
      const status = req.query.status as string;

      const result = ChallanService.getAll({ page, limit, customerId, status });
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  static getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const challanId = req.params.id as string;
      const challan = ChallanService.getById(challanId);
      res.json({ success: true, data: challan });
    } catch (error) {
      next(error);
    }
  }

  static create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { customerId, items, orderId } = req.body;
      const challan = ChallanService.create(customerId, items, req.user?.userId, req.user?.name, orderId);
      res.status(201).json({ success: true, message: 'Draft Sales Challan generated.', data: challan });
    } catch (error) {
      next(error);
    }
  }

  static async confirm(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const challanId = req.params.id as string;
      const result = await ChallanService.confirm(challanId, req.user?.userId, req.user?.name);
      res.json({ success: true, message: 'Sales Challan confirmed and inventory updated.', data: result });
    } catch (error) {
      next(error);
    }
  }

  static delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const challanId = req.params.id as string;
      const result = ChallanService.delete(challanId, req.user?.userId, req.user?.name);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }
}
