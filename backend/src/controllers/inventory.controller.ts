import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { InventoryService } from '../services/inventory.service.js';

export class InventoryController {
  static getMovements(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      const productId = req.query.productId as string;
      const type = req.query.type as any;

      const result = InventoryService.getStockMovements({ page, limit, productId, type });
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  static async adjust(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { productId, quantity, movementType, reason, referenceType, referenceId } = req.body;
      const result = await InventoryService.adjustStock(
        productId,
        quantity,
        movementType,
        reason,
        referenceType,
        referenceId,
        req.user?.userId,
        req.user?.name
      );
      res.json({ success: true, message: 'Stock adjusted successfully.', data: result });
    } catch (error) {
      next(error);
    }
  }
}
