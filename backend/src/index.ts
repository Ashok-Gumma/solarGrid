import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import router from './routes/index.js';
import { errorHandler } from './middleware/error.js';
import { db } from './db/database.js';
import { seedDatabase } from './db/seed.js';

const app = express();

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

// Auto-seed if users table is empty
if (db.get('users').length === 0) {
  console.log('[SEED] Initializing seed data...');
  seedDatabase().catch((err) => console.error('[SEED_ERROR]', err));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'SolarGrid ERP/CRM Backend Engine',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api', router);

// Centralized Error Handling Middleware
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`⚡ SolarGrid Express Server running on port ${config.port}`);
  console.log(`👉 API Health Endpoint: http://localhost:${config.port}/api/health`);
});
