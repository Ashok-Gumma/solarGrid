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

// Auto-seed if missing default accounts or after DB sync
async function ensureSeedData() {
  await db.ready;
  const users = db.get('users');
  const hasDefaultCustomer = users.some((u) => u.email.toLowerCase() === 'user@gmail.com');
  if (users.length === 0 || !hasDefaultCustomer) {
    console.log('[SEED] Initializing seed accounts...');
    await seedDatabase();
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
