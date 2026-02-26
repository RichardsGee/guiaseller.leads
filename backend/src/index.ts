import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimit.js';
import { leadsDB } from './lib/prisma.js';

// Route imports
import authRoutes from './routes/auth.js';
import leadsRoutes from './routes/leads.js';
import analyticsRoutes from './routes/analytics.js';
import adminRoutes from './routes/admin.js';

const app = express();

// --- Global Middleware ---
app.use(helmet());
app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use('/api', apiLimiter);

// --- Health Check ---
app.get('/health', async (_req, res) => {
  try {
    // Check database connectivity
    await leadsDB.$queryRaw`SELECT 1`;
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
      version: '1.0.0',
      services: {
        database: 'connected',
        api: 'running',
      },
    });
  } catch (error) {
    res.status(503).json({
      status: 'degraded',
      timestamp: new Date().toISOString(),
      services: {
        database: 'disconnected',
        api: 'running',
      },
    });
  }
});

// --- API Routes ---
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/leads', leadsRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/admin', adminRoutes);

// --- 404 Handler ---
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: 'Route not found' },
  });
});

// --- Error Handler ---
app.use(errorHandler);

// --- Start Server ---
async function start() {
  try {
    // Test database connection
    await leadsDB.$connect();
    console.log('✅ Database connected');

    const server = app.listen(env.PORT, () => {
      console.log(`🚀 GuiaSeller Leads API running on http://localhost:${env.PORT}`);
      console.log(`📊 Environment: ${env.NODE_ENV}`);
      console.log('');
      console.log('Endpoints:');
      console.log(`  GET  /health              — Health check`);
      console.log(`  POST /api/v1/auth/signin  — Firebase auth → JWT`);
      console.log(`  GET  /api/v1/leads        — List leads`);
      console.log(`  GET  /api/v1/analytics/*  — Analytics`);
      console.log(`  GET  /api/v1/admin/users  — Admin users`);
    });

    // Graceful shutdown
    const shutdown = async () => {
      console.log('\n⏹️  Shutting down...');
      server.close(async () => {
        await leadsDB.$disconnect();
        console.log('✅ Server stopped');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

start();

export default app;
