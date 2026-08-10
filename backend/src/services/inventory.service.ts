import { db } from '../db/database.js';
import { StockMovement, MovementType } from '../types/index.js';
import { AppError } from '../middleware/error.js';
import { logAudit } from '../middleware/audit.js';

export class InventoryService {
  static getStockMovements(options: { page?: number; limit?: number; productId?: string; type?: MovementType }) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.max(1, Math.min(100, options.limit || 50));
    let movements = db.get('stockMovements');

    if (options.productId) {
      movements = movements.filter((m) => m.productId === options.productId);
    }

    if (options.type) {
      movements = movements.filter((m) => m.movementType === options.type);
    }

    const total = movements.length;
    const startIndex = (page - 1) * limit;
    const paginated = movements.slice(startIndex, startIndex + limit);

    return {
      data: paginated,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  static async adjustStock(
    productId: string,
    quantity: number,
    movementType: MovementType,
    reason: string,
    referenceType?: string,
    referenceId?: string,
    userId?: string,
    userName?: string
  ) {
    if (quantity <= 0) {
      throw new AppError('Quantity must be greater than 0.', 400);
    }

    return await db.transaction(async () => {
      const products = db.get('products');
      const product = products.find((p) => p.id === productId);
      if (!product) {
        throw new AppError('Product not found.', 404);
      }

      if (movementType === 'OUT' && product.currentStock < quantity) {
        throw new AppError(
          `Insufficient stock for ${product.name}. Available: ${product.currentStock}, Requested: ${quantity}.`,
          409,
          { available: product.currentStock, requested: quantity }
        );
      }

      // Update product currentStock safely inside transaction
      if (movementType === 'IN') {
        product.currentStock += quantity;
      } else {
        product.currentStock -= quantity;
      }
      product.updatedAt = new Date().toISOString();

      // Record audited movement log
      const movements = db.get('stockMovements');
      const movement: StockMovement = {
        id: `MOV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        productId,
        productName: product.name,
        productSku: product.sku,
        quantity,
        movementType,
        reason,
        referenceType: referenceType || 'MANUAL_ADJUSTMENT',
        referenceId: referenceId || '',
        createdBy: userId || '',
        createdByName: userName || 'System',
        createdAt: new Date().toISOString(),
      };
      movements.unshift(movement);

      logAudit(userId, userName, 'ADJUST_STOCK', 'Product', productId, {
        movementType,
        quantity,
        newStock: product.currentStock,
        reason,
      });

      return { product, movement };
    });
  }
}
