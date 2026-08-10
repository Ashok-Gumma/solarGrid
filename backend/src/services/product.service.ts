import { db } from '../db/database.js';
import { Product } from '../types/index.js';
import { AppError } from '../middleware/error.js';
import { logAudit } from '../middleware/audit.js';

export class ProductService {
  static getAll(options: { page?: number; limit?: number; search?: string; category?: string; lowStock?: boolean }) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.max(1, Math.min(100, options.limit || 50));
    let products = db.get('products');

    if (options.search) {
      const q = options.search.toLowerCase();
      products = products.filter(
        (p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
      );
    }

    if (options.category) {
      products = products.filter((p) => p.categoryName?.toLowerCase() === options.category?.toLowerCase());
    }

    if (options.lowStock) {
      products = products.filter((p) => p.currentStock <= p.minStockAlert);
    }

    const total = products.length;
    const startIndex = (page - 1) * limit;
    const paginated = products.slice(startIndex, startIndex + limit);

    return {
      data: paginated,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static getById(id: string) {
    const products = db.get('products');
    const product = products.find((p) => p.id === id);
    if (!product) {
      throw new AppError('Product not found.', 404);
    }
    return product;
  }

  static create(data: Partial<Product>, userId?: string, userName?: string) {
    if (!data.name || !data.sku || data.unitPrice === undefined) {
      throw new AppError('Product name, SKU, and unit price are required.', 400);
    }

    const products = db.get('products');
    if (products.some((p) => p.sku.toLowerCase() === data.sku?.toLowerCase())) {
      throw new AppError(`Product with SKU '${data.sku}' already exists.`, 409);
    }

    const newProduct: Product = {
      id: `PROD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      sku: data.sku,
      name: data.name,
      categoryId: data.categoryId || '',
      categoryName: data.categoryName || 'General',
      unitPrice: Number(data.unitPrice),
      currentStock: Number(data.currentStock || 0),
      minStockAlert: Number(data.minStockAlert || 5),
      location: data.location || 'Main Warehouse',
      installationEligible: Boolean(data.installationEligible),
      warrantyMonths: Number(data.warrantyMonths || 0),
      description: data.description || '',
      specifications: Array.isArray(data.specifications) ? data.specifications : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    products.unshift(newProduct);
    logAudit(userId, userName, 'CREATE_PRODUCT', 'Product', newProduct.id, { name: newProduct.name, sku: newProduct.sku });
    db.saveData();
    return newProduct;
  }

  static update(id: string, data: Partial<Product>, userId?: string, userName?: string) {
    const products = db.get('products');
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new AppError('Product not found.', 404);
    }

    const existing = products[index];
    const updated: Product = {
      ...existing,
      ...data,
      unitPrice: data.unitPrice !== undefined ? Number(data.unitPrice) : existing.unitPrice,
      currentStock: data.currentStock !== undefined ? Number(data.currentStock) : existing.currentStock,
      minStockAlert: data.minStockAlert !== undefined ? Number(data.minStockAlert) : existing.minStockAlert,
      installationEligible: data.installationEligible !== undefined ? Boolean(data.installationEligible) : existing.installationEligible,
      updatedAt: new Date().toISOString(),
    };

    products[index] = updated;
    logAudit(userId, userName, 'UPDATE_PRODUCT', 'Product', id, data);
    db.saveData();
    return updated;
  }
}
