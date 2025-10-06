import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { config } from './config/env';
import { corsMiddleware, errorHandler, notFound } from './middleware';
import shopRoutes from './routes/shops';
import printJobRoutes from './routes/print-jobs';
import authRoutes from './routes/auth';
import { db } from './services/database';

const app = express();

// Security middleware
app.use(helmet());

// CORS middleware
app.use(corsMiddleware);

// Logging middleware
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static file serving for uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));


// API routes
app.use('/api/shops', shopRoutes);
app.use('/api/print-jobs', printJobRoutes);
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    let dbHealth = false;
    try {
      dbHealth = await db.healthCheck();
    } catch (error) {
      // Silent fail for health checks
    }

    res.json({
      status: 'OK',
      database: dbHealth ? 'connected' : 'disconnected'
    });
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      database: 'disconnected'
    });
  }
});

// 404 handler (must be after all routes)
app.use(notFound);

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const server = app.listen(config.port, () => {
  console.log(`Snap2Print is running on port ${config.port}`);
});

// Graceful shutdown
const gracefulShutdown = async () => {
  server.close(async () => {
    try {
      await db.close();
    } catch (error) {
      // Silent fail for cleanup errors
    }
    process.exit(0);
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Fatal error:', error.message);
  gracefulShutdown();
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled promise rejection');
  gracefulShutdown();
});

export default app;
