import { Router } from "express";
import { register, login, getProfile, authenticateToken } from "../controllers/authController";

const router = Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes
router.get("/profile", authenticateToken, getProfile);

export default router;
