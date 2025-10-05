import { Request, Response } from "express";
import crypto from "crypto";
import { Shop } from "../models/Shop";

export async function createShop(req: Request, res: Response) {
	try {
		const { name } = req.body as { name?: string };
		if (!name) {
			return res.status(400).json({ message: "name is required" });
		}
		const shopId = `shop-${crypto.randomBytes(3).toString("hex")}`;
		const shop = await Shop.create({ name, shopId });
		return res.status(201).json(shop);
	} catch (err) {
		return res.status(500).json({ message: "Failed to create shop" });
	}
}

export async function getShopById(req: Request, res: Response) {
	try {
		const { shopId } = req.params as { shopId: string };
		const shop = await Shop.findOne({ shopId });
		if (!shop) return res.status(404).json({ message: "Shop not found" });
		return res.json(shop);
	} catch (err) {
		return res.status(500).json({ message: "Failed to fetch shop" });
	}
}

export async function upsertShopById(req: Request, res: Response) {
	try {
		const { shopId } = req.params as { shopId: string };
		const { name } = req.body as { name?: string };
		if (!shopId) return res.status(400).json({ message: "shopId is required" });
		const update: any = {};
		if (name) update.name = name;
		const shop = await Shop.findOneAndUpdate(
			{ shopId },
			{ $setOnInsert: { shopId }, $set: Object.keys(update).length ? update : {} },
			{ new: true, upsert: true }
		);
		return res.status(200).json(shop);
	} catch (err) {
		return res.status(500).json({ message: "Failed to upsert shop" });
	}
}


