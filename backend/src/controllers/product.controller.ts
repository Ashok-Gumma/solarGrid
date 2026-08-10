import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { ProductService } from '../services/product.service.js';

export class ProductController {
  static getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      const search = req.query.search as string;
      const category = req.query.category as string;
      const lowStock = req.query.lowStock === 'true';

      const result = ProductService.getAll({ page, limit, search, category, lowStock });
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  static getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const product = ProductService.getById(id);
      res.json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  }

  static create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const product = ProductService.create(req.body, req.user?.userId, req.user?.name);
      res.status(201).json({ success: true, message: 'Product created successfully.', data: product });
    } catch (error) {
      next(error);
    }
  }

  static update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const product = ProductService.update(id, req.body, req.user?.userId, req.user?.name);
      res.json({ success: true, message: 'Product updated successfully.', data: product });
    } catch (error) {
      next(error);
    }
  }
}
