import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import router from './routes/index.js';
import { errorHandler } from './middleware/error.js';
import { db } from './db/database.js';
import { seedDatabase } from './db/seed.js';

const app = express();

app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.options('*', cors());
app.use(express.json());

import { hashPassword } from './utils/password.js';
import { User, Customer } from './types/index.js';

// Auto-seed if users table is empty or missing default customer
async function ensureSeedData() {
  const users = db.get('users');
  if (users.length === 0) {
    console.log('[SEED] Initializing seed data...');
    await seedDatabase();
  } else {
    const hasDefaultCustomer = users.some((u) => u.email.toLowerCase() === 'user@gmail.com');
    if (!hasDefaultCustomer) {
      console.log('[SEED] Adding default customer user@gmail.com...');
      const defaultUserPasswordHash = await hashPassword('user@123');
      const defaultUser: User = {
        id: 'usr-customer-default',
        name: 'Default Customer',
        email: 'user@gmail.com',
        passwordHash: defaultUserPasswordHash,
        role: 'CUSTOMER',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      users.push(defaultUser);

      const customers = db.get('customers');
      customers.push({
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
      });
      db.saveData();
    }
  }
}
ensureSeedData().catch((err) => console.error('[SEED_ERROR]', err));

// Root & API Health check endpoints
app.get(['/', '/health', '/api/health'], (req, res) => {
  res.json({
    status: 'OK',
    service: 'SolarGrid ERP/CRM Backend Engine',
    timestamp: new Date().toISOString(),
  });
});

// API Routes (Mounted under both /api and / for universal compatibility)
app.use('/api', router);
app.use('/', router);

// Centralized Error Handling Middleware
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`⚡ SolarGrid Express Server running on port ${config.port}`);
  console.log(`👉 API Health Endpoint: http://localhost:${config.port}/api/health`);
});
