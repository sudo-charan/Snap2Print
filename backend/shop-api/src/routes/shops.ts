import { Router } from "express";
import { getShopById, upsertShopById } from "../controllers/shopsController";

const router = Router();

router.get("/:shopId", getShopById);
router.put("/:shopId", upsertShopById);

export default router;
