import { Router } from 'express';
import { AuthService } from '../services/auth';
import { LoginRequest, RegisterRequest } from '../models/types';

const router = Router();
const authService = new AuthService();

// POST /api/auth/login - User login
router.post('/login', async (req, res) => {
  try {
    const loginData: LoginRequest = req.body;

    if (!loginData.email || !loginData.password) {
      return res.status(400).json({
        message: 'Email and password are required'
      });
    }

    const result = await authService.loginUser(loginData);

    res.json(result);
  } catch (error: any) {
    res.status(401).json({
      message: error.message || 'Login failed'
    });
  }
});

// POST /api/auth/register - User registration
router.post('/register', async (req, res) => {
  try {
    const registerData: RegisterRequest = req.body;

    if (!registerData.email || !registerData.password || !registerData.shopName || !registerData.location) {
      return res.status(400).json({
        message: 'Email, password, shop name, and location are required'
      });
    }

    // Basic validation
    if (registerData.password.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters long'
      });
    }

    const result = await authService.registerUser(registerData);

    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({
      message: error.message || 'Registration failed'
    });
  }
});

// GET /api/auth/verify - Verify token (for protected routes)
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        message: 'No token provided'
      });
    }

    const decoded = authService.verifyToken(token);

    res.json({
      valid: true,
      user: decoded
    });
  } catch (error: any) {
    res.status(401).json({
      valid: false,
      message: error.message || 'Invalid token'
    });
  }
});

export default router;
