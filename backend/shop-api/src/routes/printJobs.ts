import { Router } from "express";
import multer from "multer";
import path from "path";
import { listPrintJobs, uploadPrintJob, uploadPrintJobs, deletePrintJob, createPrintJobMetadata } from "../controllers/printJobsController";

const router = Router();

// Check if S3 is enabled without importing S3 client
const isS3Enabled = Boolean(
    process.env.S3_BUCKET &&
    process.env.S3_ENDPOINT &&
    process.env.S3_ACCESS_KEY_ID &&
    process.env.S3_SECRET_ACCESS_KEY
);

const storage = isS3Enabled
    ? multer.memoryStorage()
    : multer.diskStorage({
        destination: (_req, _file, cb) => cb(null, path.join(process.cwd(), "uploads")),
        filename: (_req, file, cb) => {
            const timestamp = Date.now();
            const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
            cb(null, `${timestamp}-${safe}`);
        },
    });

const upload = multer({ storage });

router.get("/:shopId", listPrintJobs);
router.post("/:shopId/upload", upload.single("file"), uploadPrintJob);
router.post("/:shopId/uploads", upload.array("files"), uploadPrintJobs);
router.post("/:shopId/metadata", createPrintJobMetadata);
router.delete("/:id", deletePrintJob);

export default router;



