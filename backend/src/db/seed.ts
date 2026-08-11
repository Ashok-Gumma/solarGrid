import { db } from './database.js';
import { hashPassword } from '../utils/password.js';
import { User, Customer } from '../types/index.js';

export async function seedDatabase() {
  console.log('⚡ Initializing clean database & system desk accounts...');
  db.reset();

  const passwordHash = await hashPassword('password123');
  const userPasswordHash = await hashPassword('user@123');

  // Operational Desk System Accounts & Default Customer
  const initialUsers: User[] = [
    {
      id: 'usr-admin',
      name: 'System Admin',
      email: 'admin@solargrid.com',
      passwordHash,
      role: 'ADMIN',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'usr-sales',
      name: 'Sales Manager',
      email: 'sales@solargrid.com',
      passwordHash,
      role: 'SALES',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'usr-warehouse',
      name: 'Warehouse Manager',
      email: 'warehouse@solargrid.com',
      passwordHash,
      role: 'WAREHOUSE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'usr-accounts',
      name: 'Accounts Officer',
      email: 'accounts@solargrid.com',
      passwordHash,
      role: 'ACCOUNTS',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'usr-tech',
      name: 'Field Technician',
      email: 'tech@solargrid.com',
      passwordHash,
      role: 'TECHNICIAN',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'usr-customer-default',
      name: 'Default Customer',
      email: 'user@gmail.com',
      passwordHash: userPasswordHash,
      role: 'CUSTOMER',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const initialCustomers: Customer[] = [
    {
      id: 'CUST-default',
      userId: 'usr-customer-default',
      name: 'Default Customer',
      businessName: '',
      email: 'user@gmail.com',
      phone: '9876543210',
      gstNumber: '',
      customerType: 'RETAIL',
      status: 'ACTIVE',
      notes: 'Default customer account for testing',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const users = db.get('users');
  for (const u of initialUsers) {
    if (!users.some((existing) => existing.email.toLowerCase() === u.email.toLowerCase())) {
      users.push(u);
    }
  }

  const customers = db.get('customers');
  for (const c of initialCustomers) {
    if (!customers.some((existing) => existing.id === c.id || existing.email.toLowerCase() === c.email.toLowerCase())) {
      customers.push(c);
    }
  }

  if (db.pgPool) {
    try {
      for (const u of initialUsers) {
        await db.pgPool.query(
          `INSERT INTO users (id, name, email, password_hash, role, phone, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
          [u.id, u.name, u.email, u.passwordHash, u.role, u.phone || '', u.createdAt, u.updatedAt]
        );
      }
      for (const c of initialCustomers) {
        await db.pgPool.query(
          `INSERT INTO customers (id, user_id, name, business_name, email, phone, gst_number, customer_type, status, notes, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
           ON CONFLICT (id) DO NOTHING`,
          [c.id, c.userId, c.name, c.businessName || '', c.email, c.phone, c.gstNumber || '', c.customerType, c.status, c.notes, c.createdAt, c.updatedAt]
        );
      }
      console.log('🐘 Seed users successfully synced to PostgreSQL database.');
    } catch (pgErr: any) {
      console.warn('⚠️ Could not insert seed users into PostgreSQL:', pgErr.message);
    }
  }

  db.saveData();
  console.log('✅ System accounts initialized.');
}

if (process.argv[1]?.includes('seed')) {
  seedDatabase().catch(console.error);
}
