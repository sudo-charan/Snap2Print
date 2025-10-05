import cors from 'cors';
import { config } from '../config/env';

// CORS middleware
export const corsMiddleware = cors({
  origin: config.cors.origin,
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
