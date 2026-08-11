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
      id: 'usr-warehouse',
      name: 'Warehouse Manager',
      email: 'warehouse@solargrid.com',
      passwordHash,
      role: 'WAREHOUSE',
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
  users.push(...initialUsers);

  const customers = db.get('customers');
  customers.push(...initialCustomers);

  db.saveData();
  console.log('✅ Clean database engine initialized with 0 fake products, 0 fake customers, and 0 fake orders.');
}

if (process.argv[1]?.includes('seed')) {
  seedDatabase().catch(console.error);
}
