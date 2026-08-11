import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { ServiceJobService } from '../services/service.service.js';

export class ServiceController {
  static getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      const status = req.query.status as string;
      const technicianId = req.query.technicianId as string;
      let customerId = req.query.customerId as string;

      if (req.user && req.user.role === 'CUSTOMER') {
        customerId = req.user.userId;
      }

      const result = ServiceJobService.getAll({ page, limit, status, technicianId, customerId });
      res.json({ success: true, data: result.data, services: result.data, pagination: result.pagination });
    } catch (error) {
      next(error);
    }
  }

  static getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const job = ServiceJobService.getById(id);
      res.json({ success: true, data: job });
    } catch (error) {
      next(error);
    }
  }

  static create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { customerId, addressId, addressText, customerName, problemCategory, description, productId, productName, scheduledDate, timeSlot } = req.body;
      const job = ServiceJobService.create(
        customerId,
        addressId || addressText,
        problemCategory,
        description,
        productId,
        productName,
        scheduledDate,
        timeSlot,
        req.user?.userId,
        req.user?.name,
        customerName
      );
      res.status(201).json({ success: true, message: 'Service ticket created.', data: job });
    } catch (error) {
      next(error);
    }
  }

  static assign(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const { technicianId } = req.body;
      const result = ServiceJobService.assignTechnician(id, technicianId, req.user?.userId, req.user?.name);
      res.json({ success: true, message: 'Technician assigned to service job.', data: result });
    } catch (error) {
      next(error);
    }
  }

  static async complete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const { resolutionNotes, partsUsed } = req.body;
      const result = await ServiceJobService.complete(
        id,
        resolutionNotes,
        partsUsed,
        req.user?.userId,
        req.user?.name
      );
      res.json({ success: true, message: 'Service job resolved and parts inventory adjusted.', data: result });
    } catch (error) {
      next(error);
    }
  }

  static delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const result = ServiceJobService.delete(id, req.user?.userId, req.user?.name);
      res.json({ success: true, message: 'Service ticket deleted successfully.', data: result });
    } catch (error) {
      next(error);
    }
  }
}
