import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { User } from "../models/User";
import { Shop } from "../models/Shop";

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

interface AuthRequest extends Request {
  user?: any;
}

// Generate JWT token
const generateToken = (user: any): string => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      shopId: user.shopId,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
  );
};

// Register new shop owner
export async function register(req: Request, res: Response) {
  try {
    const { email, password, shopName, location } = req.body as {
      email: string;
      password: string;
      shopName: string;
      location?: string;
    };

    // Validation
    if (!email || !password || !shopName) {
      return res.status(400).json({
        message: "Email, password, and shop name are required"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long"
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        message: "User with this email already exists"
      });
    }

    // Generate unique shop ID
    const shopId = `shop-${crypto.randomBytes(3).toString("hex")}`;

    // Create user
    const user = await User.create({
      email: email.toLowerCase(),
      password,
      shopName,
      location: location || "",
      shopId,
    });

    // Create shop entry
    await Shop.create({
      name: shopName,
      shopId,
    });

    // Generate token
    const token = generateToken(user);

    // Return user data (without password) and token
    const userResponse = {
      id: user._id,
      email: user.email,
      shopName: user.shopName,
      location: user.location,
      shopId: user.shopId,
    };

    res.status(201).json({
      message: "Registration successful",
      user: userResponse,
      token,
    });

  } catch (err: any) {
    console.error("Registration error:", err);
    res.status(500).json({
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
}

// Login shop owner
export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body as {
      email: string;
      password: string;
    };

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        message: "Account is disabled. Please contact support."
      });
    }

    // Compare passwords
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    // Generate token
    const token = generateToken(user);

    // Return user data (without password) and token
    const userResponse = {
      id: user._id,
      email: user.email,
      shopName: user.shopName,
      location: user.location,
      shopId: user.shopId,
    };

    res.status(200).json({
      message: "Login successful",
      user: userResponse,
      token,
    });

  } catch (err: any) {
    console.error("Login error:", err);
    res.status(500).json({
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
}

// Get current user profile
export async function getProfile(req: AuthRequest, res: Response) {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        message: "Not authenticated"
      });
    }

    const userResponse = {
      id: user._id,
      email: user.email,
      shopName: user.shopName,
      location: user.location,
      shopId: user.shopId,
    };

    res.status(200).json({
      user: userResponse,
    });

  } catch (err: any) {
    console.error("Get profile error:", err);
    res.status(500).json({
      message: "Internal server error"
    });
  }
}

// Middleware to verify JWT token
export function authenticateToken(req: AuthRequest, res: Response, next: Function) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }

    req.user = user;
    next();
  });
}
