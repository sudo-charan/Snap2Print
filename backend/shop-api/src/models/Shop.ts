import { Schema, model, Document } from "mongoose";

export interface ShopDocument extends Document {
	name: string;
	shopId: string; // human-readable or slug used in QR
	createdAt: Date;
	updatedAt: Date;
}

const ShopSchema = new Schema<ShopDocument>(
	{
		name: { type: String, required: true },
		shopId: { type: String, required: true, unique: true, index: true },
	},
	{ timestamps: true }
);

export const Shop = model<ShopDocument>("Shop", ShopSchema);



