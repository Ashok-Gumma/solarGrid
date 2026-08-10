import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { CrmService } from '../services/crm.service.js';

export class CrmController {
  static getFollowUps(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.query.customerId as string;
      const status = req.query.status as string;
      const data = CrmService.getFollowUps({ customerId, status });
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static createFollowUp(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { customerId, followUpDate, notes } = req.body;
      const result = CrmService.createFollowUp(customerId, followUpDate, notes, req.user?.userId, req.user?.name);
      res.status(201).json({ success: true, message: 'CRM follow-up created.', data: result });
    } catch (error) {
      next(error);
    }
  }
}
