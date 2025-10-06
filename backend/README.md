# Snap2Print API

A simple Node.js/Express API for the Snap2Print print shop management system with MongoDB integration.

## Features

- Shop management (CRUD operations)
- Print job management with file uploads
- MongoDB database with indexes for performance
- File upload support for PDF and images
- CORS enabled for frontend integration
- Health check endpoint with database status
- Graceful shutdown handling

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or Atlas)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` file:
```env
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/snap2print
```

3. Start MongoDB (if using local):
```bash
mongod
```

4. Start development server:
```bash
npm run dev
```

## API Endpoints

### Shops
- `GET /api/shops` - Get all shops
- `GET /api/shops/:shopId` - Get specific shop
- `POST /api/shops` - Create new shop
- `PUT /api/shops/:shopId` - Update shop
- `DELETE /api/shops/:shopId` - Delete shop

### Print Jobs
- `GET /api/print-jobs/:shopId` - Get print jobs for a shop
- `POST /api/print-jobs` - Create new print job (with file upload)
- `PATCH /api/print-jobs/status/:jobId` - Update print job status
- `DELETE /api/print-jobs/:jobId` - Delete print job

### Health Check
- `GET /health` - API health status (includes database connectivity)

## Database Schema

### Shops Collection
```javascript
{
  _id: ObjectId,
  shopId: String (unique),
  name: String,
  owner: String,
  email: String (unique),
  phone: String,
  address: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Print Jobs Collection
```javascript
{
  _id: ObjectId,
  jobId: String (unique),
  shopId: String,
  studentName: String,
  fileName: String,
  fileOriginalName: String,
  filePath: String,
  fileSize: Number,
  fileType: String,
  status: 'pending' | 'completed',
  createdAt: Date,
  updatedAt: Date
}
```

## Development

- Built with TypeScript and Express
- MongoDB with Mongoose-like operations
- File uploads stored in `uploads/` directory
- CORS configured for frontend development
- Database indexes for optimal performance

## Testing

Run the test script to verify API functionality:
```bash
npm run test
```

This will test:
- Health check endpoint
- Shop creation and retrieval
- Database connectivity
- Error handling
