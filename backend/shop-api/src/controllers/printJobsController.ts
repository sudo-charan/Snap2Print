import type { Request, Response } from "express";
import { PrintJob } from "../models/PrintJob";
import { Shop } from "../models/Shop";
import { isS3Enabled, createS3Client } from "../config/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";

export async function uploadPrintJob(req: Request, res: Response) {
	try {
		const { shopId } = req.params as { shopId: string };
		const shop = await Shop.findOne({ shopId });
		if (!shop) return res.status(404).json({ message: "Shop not found" });

		const { studentName, copies, printType } = req.body as {
			studentName?: string;
			copies?: string | number;
			printType?: "bw" | "color" | string;
		};

		if (!studentName) return res.status(400).json({ message: "studentName is required" });
		if (!req.file) return res.status(400).json({ message: "file is required" });

		const useS3 = isS3Enabled();
		const bucket = process.env.S3_BUCKET as string;
		const s3 = useS3 ? createS3Client() : null;

		let filePath = "";
		if (useS3 && s3) {
			const key = `${Date.now()}-${(req.file.originalname || "file").replace(/[^a-zA-Z0-9._-]/g, "_")}`;
			await s3.send(new PutObjectCommand({
				Bucket: bucket,
				Key: key,
				Body: req.file.buffer,
				ContentType: req.file.mimetype || "application/octet-stream",
			}));
			const publicBase = process.env.S3_PUBLIC_BASE || "";
			filePath = publicBase ? `${publicBase.replace(/\/$/, "")}/${key}` : `s3://${bucket}/${key}`;
		} else {
			filePath = `/uploads/${(req.file as any).filename}`;
		}

		const job = await PrintJob.create({
			shop: shop._id,
			studentName,
			fileOriginalName: req.file.originalname,
			filePath,
			fileSizeBytes: req.file.size,
			copies: copies ? Number(copies) : 1,
			printType: printType === "color" ? "color" : "bw",
		});

		console.log("[uploadPrintJob] created job=", job._id);
		return res.status(201).json(job);
	} catch (err) {
		console.error("[uploadPrintJob] error", err);
		return res.status(500).json({ message: "Failed to upload print job" });
	}
}

export async function uploadPrintJobs(req: Request, res: Response) {
    try {
        console.log("[uploadPrintJobs] shopId=", (req.params as any)?.shopId, " studentName=", (req.body as any)?.studentName, " files=", Array.isArray(req.files) ? (req.files as any[]).length : 0);
        const { shopId } = req.params as { shopId: string };
        const shop = await Shop.findOne({ shopId });
        if (!shop) return res.status(404).json({ message: "Shop not found" });

        const { studentName, copies, printType } = req.body as {
            studentName?: string;
            copies?: string | number;
            printType?: "bw" | "color" | string;
        };

        if (!studentName) return res.status(400).json({ message: "studentName is required" });

        const useS3 = isS3Enabled();
        const bucket = process.env.S3_BUCKET as string;
        const s3 = useS3 ? createS3Client() : null;

        const jobs = await Promise.all(
            (req.files as any[]).map(async (file) => {
                let filePath = "";
                if (useS3 && s3) {
                    const key = `${Date.now()}-${(file.originalname || "file").replace(/[^a-zA-Z0-9._-]/g, "_")}`;
                    await s3.send(new PutObjectCommand({
                        Bucket: bucket,
                        Key: key,
                        Body: file.buffer,
                        ContentType: file.mimetype || "application/octet-stream",
                    }));
                    const publicBase = process.env.S3_PUBLIC_BASE || "";
                    filePath = publicBase ? `${publicBase.replace(/\/$/, "")}/${key}` : `s3://${bucket}/${key}`;
                } else {
                    filePath = `/uploads/${(file as any).filename}`;
                }

                return PrintJob.create({
                    shop: shop._id,
                    studentName,
                    fileOriginalName: file.originalname,
                    filePath,
                    fileSizeBytes: file.size,
                    copies: copies ? Number(copies) : 1,
                    printType: printType === "color" ? "color" : "bw",
                });
            })
        );

        const jobIds = jobs.map(job => (job._id as any).toString());
        console.log("[uploadPrintJobs] created jobs=", jobIds);
        return res.status(201).json(jobs);
    } catch (err) {
        console.error("[uploadPrintJobs] error", err);
        return res.status(500).json({ message: "Failed to upload print jobs" });
    }
}

export async function listPrintJobs(req: Request, res: Response) {
	try {
		const { shopId } = req.params as { shopId: string };
		const shop = await Shop.findOne({ shopId });
		if (!shop) return res.status(404).json({ message: "Shop not found" });

		const jobs = await PrintJob.find({ shop: shop._id }).sort({ createdAt: -1 });
		return res.json(jobs);
	} catch (err) {
		return res.status(500).json({ message: "Failed to list print jobs" });
	}
}

export async function createPrintJobMetadata(req: Request, res: Response) {
	try {
		const { shopId } = req.params as { shopId: string };
		const shop = await Shop.findOne({ shopId });

		if (!shop) return res.status(404).json({ message: "Shop not found" });

		const { studentName, copies, printType, fileCount, fileNames } = req.body as {
			studentName?: string;
			copies?: string | number;
			printType?: "bw" | "color" | string;
			fileCount?: number;
			fileNames?: string[];
		};

		if (!studentName) return res.status(400).json({ message: "studentName is required" });

		// For testing purposes, just return success with the metadata
		res.status(201).json({
			message: "Print job metadata received successfully",
			job: {
				shopId,
				studentName,
				printType: printType || 'bw',
				copies: copies || 1,
				fileCount: fileCount || 0,
				fileNames: fileNames || [],
				status: 'received'
			}
		});
	} catch (err) {
		console.error("[createPrintJobMetadata] error", err);
		return res.status(500).json({ message: "Failed to process print job metadata" });
	}
}

export async function deletePrintJob(req: Request, res: Response) {
	try {
		const { id } = req.params as { id: string };
		const job = await PrintJob.findByIdAndDelete(id);
		if (!job) return res.status(404).json({ message: "Print job not found" });
		return res.json({ message: "Print job deleted successfully" });
	} catch (err) {
		console.error("Delete error:", err);
		return res.status(500).json({ message: "Failed to delete print job" });
	}
}
