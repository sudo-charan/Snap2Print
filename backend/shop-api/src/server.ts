import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import dotenv from "dotenv";
import { connectToDatabase } from "./config/db";
import shopsRouter from "./routes/shops";
import printJobsRouter from "./routes/printJobs";
import authRouter from "./routes/auth";

dotenv.config();

const app = express();

app.use(cors({
  origin: true, // Allow all origins for development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(morgan("dev"));

const uploadsDir = path.join(process.cwd(), "uploads");
app.use("/uploads", express.static(uploadsDir));

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/api/shops", shopsRouter);
app.use("/api/print-jobs", printJobsRouter);
app.use("/api/auth", authRouter);

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || "";

connectToDatabase(MONGO_URI)
	.then(() => {
		app.listen(PORT, () => {
			console.log(`shop-api listening on :${PORT}`);
		});
	})
	.catch((err) => {
		console.error("Database connection failed, but server will still start with in-memory storage:", err);
		// Don't exit, just log the error and continue with in-memory storage
		app.listen(PORT, () => {
			console.log(`shop-api listening on :${PORT} (using in-memory storage)`);
		});
	});



