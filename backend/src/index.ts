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

// Auto-seed if users table is empty
if (db.get('users').length === 0) {
  console.log('[SEED] Initializing seed data...');
  seedDatabase().catch((err) => console.error('[SEED_ERROR]', err));
}

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
