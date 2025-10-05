import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { db } from '../services/database';
import { config } from '../config/env';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueName = `print_${Date.now()}_${Math.random().toString(36).substr(2, 9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: config.upload.maxFileSize
  },
  fileFilter: (req, file, cb) => {
    if (config.upload.allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and images are allowed.'));
    }
  }
});

// GET /api/print-jobs/:shopId - Get print jobs for a shop
router.get('/:shopId', async (req, res) => {
  try {
    const { shopId } = req.params;
    const printJobs = await db.getPrintJobsByShop(shopId);
    res.json(printJobs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch print jobs' });
  }
});

// POST /api/print-jobs - Create new print job with file upload
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { shopId, studentName } = req.body;

    if (!shopId || !studentName) {
      return res.status(400).json({ error: 'Shop ID and student name are required' });
    }

    // Verify shop exists
    const shop = await db.getShop(shopId);
    if (!shop) {
      return res.status(404).json({ error: 'Shop not found' });
    }

    // Generate unique job ID
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const printJob = await db.createPrintJob({
      jobId,
      shopId,
      studentName,
      fileName: req.file.filename,
      fileOriginalName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      fileType: req.file.mimetype,
      status: 'pending'
    });

    res.status(201).json(printJob);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create print job' });
  }
});

// PATCH /api/print-jobs/status/:jobId - Update print job status
router.patch('/status/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const { status } = req.body;

    if (!['pending', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be pending or completed' });
    }

    const printJob = await db.updatePrintJobStatus(jobId, status);

    if (!printJob) {
      return res.status(404).json({ error: 'Print job not found' });
    }

    res.json(printJob);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update print job status' });
  }
});

// DELETE /api/print-jobs/:jobId - Delete print job
router.delete('/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const deleted = await db.deletePrintJob(jobId);

    if (!deleted) {
      return res.status(404).json({ error: 'Print job not found' });
    }

    res.json({ message: 'Print job deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete print job' });
  }
});

export default router;
