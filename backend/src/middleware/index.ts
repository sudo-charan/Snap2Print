import cors from 'cors';
import { config } from '../config/env';

// CORS middleware
export const corsMiddleware = cors({
  origin: (origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      'http://localhost:5173',      // Local frontend
      'http://localhost:3000',      // Local backend (for testing)
      'https://snap2print.vercel.app', // Deployed frontend
      config.cors.origin            // Additional origins from env
    ].filter(Boolean);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: config.cors.credentials,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
});

// Error handling middleware
export const errorHandler = (err: any, req: any, res: any, next: any) => {
  // Handle multer file size errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      error: 'File too large. Maximum size is 10MB.'
    });
  }

  // Handle other errors
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
};

// 404 handler
export const notFound = (req: any, res: any) => {
  res.status(404).json({
    error: 'Endpoint not found'
  });
};
