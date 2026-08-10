import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import { config } from '../config/env.js';
import {
  User, Customer, Address, Category, Product, StockMovement,
  Order, OrderItem, Challan, ChallanItem, InstallationJob,
  Warranty, ServiceRequest, ServicePart, CrmFollowUp,
  CustomerTimelineEvent, Notification, AuditLog
} from '../types/index.js';

const { Pool } = pg;

export type LockPriority = 1 | 2 | 3 | 4;
// Priority Levels:
// 1 = URGENT_SERVICE_REPAIR (Highest Priority)
// 2 = CRITICAL_INVENTORY_ADJUSTMENT
// 3 = WHOLESALE_DISPATCH
// 4 = RETAIL_ORDER (Standard Priority)

interface DatabaseSchema {
  users: User[];
  customers: Customer[];
  addresses: Address[];
  categories: Category[];
  products: Product[];
  stockMovements: StockMovement[];
  orders: Order[];
  orderItems: OrderItem[];
  challans: Challan[];
  challanItems: ChallanItem[];
  installationJobs: InstallationJob[];
  jobTechnicians: { id: string; jobType: string; jobId: string; technicianId: string; assignedAt: string }[];
  warranties: Warranty[];
  serviceRequests: ServiceRequest[];
  serviceParts: ServicePart[];
  crmFollowUps: CrmFollowUp[];
  customerTimelineEvents: CustomerTimelineEvent[];
  notifications: Notification[];
  auditLogs: AuditLog[];
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, 'solargrid_db.json');
const SCHEMA_FILE = path.join(__dirname, 'schema.sql');

class DatabaseEngine {
  private data: DatabaseSchema;
  private inTransaction = false;
  private backupData: string | null = null;
  public pgPool: pg.Pool | null = null;

  // Priority Lock Queue for Deadlock-Free Concurrency
  private priorityQueue: {
    priority: LockPriority;
    resolve: (val: any) => void;
    reject: (err: any) => void;
    task: () => Promise<any> | any;
  }[] = [];
  private isProcessingQueue = false;

  constructor() {
    this.data = this.loadData();
    this.initPgPool();
  }

  private async initPgPool() {
    const dbUrl = process.env.DATABASE_URL || config.databaseUrl;
    if (dbUrl) {
      try {
        const isCloudPg = dbUrl.includes('neon.tech') || dbUrl.includes('sslmode=require');
        this.pgPool = new Pool({
          connectionString: dbUrl,
          ssl: isCloudPg || process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        });

        if (fs.existsSync(SCHEMA_FILE)) {
          const sql = fs.readFileSync(SCHEMA_FILE, 'utf-8');
          await this.pgPool.query(sql);
        }

        await this.syncFromPostgres();
        const hostName = dbUrl.split('@')[1]?.split('/')[0]?.split('?')[0] || 'Cloud/Local PG';
        console.log('🐘 PostgreSQL Database Connected & Synced:', hostName);
      } catch (err: any) {
        console.warn('⚠️ Could not initialize PostgreSQL Pool, fallback to clean local store:', err.message);
      }
    }
  }

  public async syncFromPostgres() {
    if (!this.pgPool) return;
    try {
      const uRes = await this.pgPool.query('SELECT id, name, email, password_hash as "passwordHash", role, phone, avatar_url as "avatarUrl", created_at as "createdAt", updated_at as "updatedAt" FROM users');
      const cRes = await this.pgPool.query('SELECT id, user_id as "userId", name, business_name as "businessName", email, phone, gst_number as "gstNumber", customer_type as "customerType", status, follow_up_date as "followUpDate", notes, created_at as "createdAt", updated_at as "updatedAt" FROM customers');
      const pRes = await this.pgPool.query('SELECT id, sku, name, category_id as "categoryId", category_name as "categoryName", unit_price::float as "unitPrice", current_stock as "currentStock", min_stock_alert as "minStockAlert", location, installation_eligible as "installationEligible", warranty_months as "warrantyMonths", description, specifications, created_at as "createdAt", updated_at as "updatedAt" FROM products');
      const smRes = await this.pgPool.query('SELECT id, product_id as "productId", product_name as "productName", product_sku as "productSku", quantity, movement_type as "movementType", reason, reference_type as "referenceType", reference_id as "referenceId", created_by as "createdBy", created_by_name as "createdByName", created_at as "createdAt" FROM stock_movements');
      const oRes = await this.pgPool.query('SELECT id, order_number as "orderNumber", customer_id as "customerId", customer_name as "customerName", address_id as "addressId", address_text as "addressText", installation_type as "installationType", total_amount::float as "totalAmount", status, created_at as "createdAt", updated_at as "updatedAt" FROM orders');
      const oiRes = await this.pgPool.query('SELECT id, order_id as "orderId", product_id as "productId", product_name as "productName", sku, unit_price::float as "unitPrice", quantity, installation_eligible as "installationEligible" FROM order_items');

      this.data.users = uRes.rows;
      this.data.customers = cRes.rows;
      this.data.products = pRes.rows;
      this.data.stockMovements = smRes.rows;
      this.data.orders = oRes.rows;
      this.data.orderItems = oiRes.rows;
    } catch (err: any) {
      console.error('Error syncing from PostgreSQL:', err.message);
    }
  }

  private getInitialSchema(): DatabaseSchema {
    return {
      users: [],
      customers: [],
      addresses: [],
      categories: [],
      products: [],
      stockMovements: [],
      orders: [],
      orderItems: [],
      challans: [],
      challanItems: [],
      installationJobs: [],
      jobTechnicians: [],
      warranties: [],
      serviceRequests: [],
      serviceParts: [],
      crmFollowUps: [],
      customerTimelineEvents: [],
      notifications: [],
      auditLogs: []
    };
  }

  private loadData(): DatabaseSchema {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.warn('Initializing clean database engine schema.');
    }
    return this.getInitialSchema();
  }

  public saveData() {
    // JSON file writing disabled - Operating in Pure Memory / PostgreSQL Database Mode
    return;
  }

  // Transaction with Deadlock Rollback Protection
  public async transaction<T>(callback: () => Promise<T> | T): Promise<T> {
    if (this.inTransaction) {
      return await callback();
    }

    this.inTransaction = true;
    this.backupData = JSON.stringify(this.data);

    try {
      const result = await callback();
      this.inTransaction = false;
      this.backupData = null;
      this.saveData();
      return result;
    } catch (error) {
      if (this.backupData) {
        this.data = JSON.parse(this.backupData);
      }
      this.inTransaction = false;
      this.backupData = null;
      throw error;
    }
  }

  // Priority-Based Deadlock-Free Queue Execution
  public async transactionWithPriority<T>(priority: LockPriority, callback: () => Promise<T> | T): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.priorityQueue.push({ priority, resolve, reject, task: callback });
      // Sort by priority ascending (1 = Highest Priority)
      this.priorityQueue.sort((a, b) => a.priority - b.priority);
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.isProcessingQueue || this.priorityQueue.length === 0) return;
    this.isProcessingQueue = true;

    const item = this.priorityQueue.shift();
    if (item) {
      try {
        const result = await this.transaction(item.task);
        item.resolve(result);
      } catch (err) {
        item.reject(err);
      }
    }

    this.isProcessingQueue = false;
    if (this.priorityQueue.length > 0) {
      this.processQueue();
    }
  }

  public get<K extends keyof DatabaseSchema>(table: K): DatabaseSchema[K] {
    return this.data[table];
  }

  public reset() {
    this.data = this.getInitialSchema();
    this.saveData();
  }
}

export const db = new DatabaseEngine();
