import { db } from './database.js';
import { hashPassword } from '../utils/password.js';
import { User } from '../types/index.js';

export async function seedDatabase() {
  console.log('⚡ Initializing clean database & system desk accounts...');
  db.reset();

  const passwordHash = await hashPassword('password123');

  // Operational Desk System Accounts
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
  ];

  const users = db.get('users');
  users.push(...initialUsers);

  db.saveData();
  console.log('✅ Clean database engine initialized with 0 fake products, 0 fake customers, and 0 fake orders.');
}

if (process.argv[1]?.includes('seed')) {
  seedDatabase().catch(console.error);
}
