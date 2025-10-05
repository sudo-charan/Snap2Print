import { Schema, model, Document, Types } from "mongoose";

export interface PrintJobDocument extends Document {
	shop: Types.ObjectId;
	studentName: string;
	fileOriginalName: string;
	filePath: string;
	fileSizeBytes: number;
	status: "pending" | "completed";
	copies: number;
	printType: "bw" | "color";
	createdAt: Date;
	updatedAt: Date;
}

const PrintJobSchema = new Schema<PrintJobDocument>(
	{
		shop: { type: Schema.Types.ObjectId, ref: "Shop", required: true, index: true },
		studentName: { type: String, required: true },
		fileOriginalName: { type: String, required: true },
		filePath: { type: String, required: true },
		fileSizeBytes: { type: Number, required: true },
		status: { type: String, enum: ["pending", "completed"], default: "pending", index: true },
		copies: { type: Number, default: 1, min: 1 },
		printType: { type: String, enum: ["bw", "color"], default: "bw" },
	},
	{ timestamps: true }
);

export const PrintJob = model<PrintJobDocument>("PrintJob", PrintJobSchema);



