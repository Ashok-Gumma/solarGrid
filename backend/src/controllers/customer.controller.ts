import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { CustomerService } from '../services/customer.service.js';

export class CustomerController {
  static getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      const search = req.query.search as string;
      const status = req.query.status as string;
      const type = req.query.type as string;

      const result = CustomerService.getAll({ page, limit, search, status, type });
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  static getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const customer = CustomerService.getById(id);
      res.json({ success: true, data: customer });
    } catch (error) {
      next(error);
    }
  }

  static create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customer = CustomerService.create(req.body, req.user?.userId, req.user?.name);
      res.status(201).json({ success: true, message: 'Customer created successfully.', data: customer });
    } catch (error) {
      next(error);
    }
  }

  static update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const customer = CustomerService.update(id, req.body, req.user?.userId, req.user?.name);
      res.json({ success: true, message: 'Customer updated successfully.', data: customer });
    } catch (error) {
      next(error);
    }
  }

  static addAddress(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const address = CustomerService.addAddress(id, req.body);
      res.status(201).json({ success: true, message: 'Address added successfully.', data: address });
    } catch (error) {
      next(error);
    }
  }
}
