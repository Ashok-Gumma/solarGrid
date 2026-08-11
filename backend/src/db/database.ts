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
  public ready: Promise<void>;

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
    this.ready = this.initPgPool();
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
      const chRes = await this.pgPool.query('SELECT id, challan_number as "challanNumber", order_id as "orderId", customer_id as "customerId", customer_name as "customerName", status, total_quantity as "totalQuantity", created_by as "createdBy", created_by_name as "createdByName", confirmed_at as "confirmedAt", created_at as "createdAt", updated_at as "updatedAt" FROM challans');
      const chiRes = await this.pgPool.query('SELECT id, challan_id as "challanId", product_id as "productId", product_name as "productName", sku, unit_price::float as "unitPrice", quantity FROM challan_items');
      const ijRes = await this.pgPool.query('SELECT id, job_number as "jobNumber", order_id as "orderId", customer_id as "customerId", customer_name as "customerName", customer_phone as "customerPhone", address_id as "addressId", address_text as "addressText", latitude::float, longitude::float, scheduled_date as "scheduledDate", time_slot as "timeSlot", required_crew_size as "requiredCrewSize", status, checklist_state as "checklistState", notes, created_at as "createdAt", updated_at as "updatedAt" FROM installation_jobs');
      const wRes = await this.pgPool.query('SELECT id, customer_id as "customerId", order_id as "orderId", product_id as "productId", product_name as "productName", serial_number as "serialNumber", start_date as "startDate", end_date as "endDate", status FROM warranties');
      const srRes = await this.pgPool.query('SELECT id, service_number as "serviceNumber", customer_id as "customerId", customer_name as "customerName", customer_phone as "customerPhone", address_id as "addressId", address_text as "addressText", latitude::float, longitude::float, product_id as "productId", product_name as "productName", problem_category as "problemCategory", description, warranty_status as "warrantyStatus", scheduled_date as "scheduledDate", time_slot as "timeSlot", status, resolution_notes as "resolutionNotes", total_cost::float as "totalCost", created_at as "createdAt", updated_at as "updatedAt" FROM service_requests');

      if (uRes.rows && uRes.rows.length > 0) this.data.users = uRes.rows;
      if (cRes.rows && cRes.rows.length > 0) this.data.customers = cRes.rows;
      if (pRes.rows && pRes.rows.length > 0) this.data.products = pRes.rows;
      if (smRes.rows && smRes.rows.length > 0) this.data.stockMovements = smRes.rows;
      if (oRes.rows && oRes.rows.length > 0) this.data.orders = oRes.rows;
      if (oiRes.rows && oiRes.rows.length > 0) this.data.orderItems = oiRes.rows;
      if (chRes.rows && chRes.rows.length > 0) this.data.challans = chRes.rows;
      if (chiRes.rows && chiRes.rows.length > 0) this.data.challanItems = chiRes.rows;
      if (ijRes.rows && ijRes.rows.length > 0) this.data.installationJobs = ijRes.rows;
      if (wRes.rows && wRes.rows.length > 0) this.data.warranties = wRes.rows;
      if (srRes.rows && srRes.rows.length > 0) this.data.serviceRequests = srRes.rows;
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

  public async saveDataAsync() {
    try {
      await fs.promises.writeFile(DATA_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err: any) {
      console.warn('Non-blocking local db save warning:', err.message);
    }
  }

  public saveData() {
    this.saveDataAsync();
  }

  // Lightweight Transaction Execution with Rollback Protection
  public async transaction<T>(callback: () => Promise<T> | T): Promise<T> {
    if (this.inTransaction) {
      return await callback();
    }

    this.inTransaction = true;
    // Shallow snapshot of table arrays for fast rollback without heavy JSON stringification
    const snapshotKeys = Object.keys(this.data) as (keyof DatabaseSchema)[];
    const snapshot: Partial<DatabaseSchema> = {};
    for (const key of snapshotKeys) {
      snapshot[key] = [...(this.data[key] as any[])] as any;
    }

    try {
      const result = await callback();
      this.inTransaction = false;
      this.saveDataAsync();
      return result;
    } catch (error) {
      // Fast array rollback
      for (const key of snapshotKeys) {
        if (snapshot[key]) {
          this.data[key] = snapshot[key] as any;
        }
      }
      this.inTransaction = false;
      throw error;
    }
  }

  // Priority-Based Deadlock-Free Queue Execution
  public async transactionWithPriority<T>(priority: LockPriority, callback: () => Promise<T> | T): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.priorityQueue.push({ priority, resolve, reject, task: callback });
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
    if (!this.data[table]) {
      this.data[table] = [] as any;
    }
    return this.data[table];
  }

  // Fast O(N) Map-indexing helper for relational standard lookups
  public groupByKey<T>(items: T[], key: keyof T): Map<string, T[]> {
    const map = new Map<string, T[]>();
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const k = String(item[key]);
      const list = map.get(k);
      if (list) {
        list.push(item);
      } else {
        map.set(k, [item]);
      }
    }
    return map;
  }

  // Fast O(1) Key-to-Object Map index builder
  public indexByKey<T>(items: T[], key: keyof T): Map<string, T> {
    const map = new Map<string, T>();
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const k = String(item[key]);
      map.set(k, item);
    }
    return map;
  }

  // Safe async query execution on PostgreSQL pool
  public async queryPg(sql: string, params: any[] = []) {
    if (!this.pgPool) return null;
    try {
      return await this.pgPool.query(sql, params);
    } catch (err: any) {
      console.error('PostgreSQL Query Execution Error:', err.message);
      return null;
    }
  }

  public reset() {
    this.data = this.getInitialSchema();
    this.saveDataAsync();
  }
}

export const db = new DatabaseEngine();


