import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { InstallationService } from '../services/installation.service.js';

export class InstallationController {
  static getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      const status = req.query.status as string;
      const technicianId = req.query.technicianId as string;
      const customerId = req.query.customerId as string;

      const result = InstallationService.getAll({ page, limit, status, technicianId, customerId });
      res.json({ success: true, data: result.data, installations: result.data, pagination: result.pagination });
    } catch (error) {
      next(error);
    }
  }

  static getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const job = InstallationService.getById(id);
      res.json({ success: true, data: job });
    } catch (error) {
      next(error);
    }
  }

  static create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { orderId, customerId, addressId, addressText, scheduledDate, timeSlot, notes, latitude, longitude } = req.body;
      const job = InstallationService.create(
        orderId,
        customerId,
        addressId || addressText,
        scheduledDate,
        timeSlot,
        notes,
        req.user?.userId,
        req.user?.name,
        latitude,
        longitude
      );
      res.status(201).json({ success: true, message: 'Installation job scheduled.', data: job });
    } catch (error) {
      next(error);
    }
  }

  static assign(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const { technicianIds } = req.body;
      const result = InstallationService.assignTechnicians(id, technicianIds, req.user?.userId, req.user?.name);
      res.json({ success: true, message: 'Technician team assigned to installation job.', data: result });
    } catch (error) {
      next(error);
    }
  }

  static updateStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const { status, checklistState } = req.body;
      const job = InstallationService.updateStatus(id, status, checklistState, req.user?.userId, req.user?.name);
      res.json({ success: true, message: `Installation job status updated to ${status}.`, data: job });
    } catch (error) {
      next(error);
    }
  }
}
