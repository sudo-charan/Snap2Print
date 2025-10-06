import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User, LoginRequest, RegisterRequest, AuthResponse } from '../models/types';
import { db } from './database';
import { config } from '../config/env';

export class AuthService {
  private jwtSecret: string;

  constructor() {
    this.jwtSecret = config.jwt.secret;
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  generateToken(user: User): string {
    return jwt.sign(
      {
        userId: user.userId,
        email: user.email,
        shopId: user.shopId
      },
      this.jwtSecret,
      { expiresIn: '7d' }
    );
  }

  async registerUser(request: RegisterRequest): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await db.getUserByEmail(request.email);
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // Generate unique IDs
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const shopId = `shop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Hash password
    const hashedPassword = await this.hashPassword(request.password);

    // Create user
    const user = await db.createUser({
      userId,
      email: request.email.toLowerCase(),
      password: hashedPassword,
      shopId,
      shopName: request.shopName,
      location: request.location
    });

    // Create shop entry as well
    await db.createShop({
      shopId,
      name: request.shopName,
      owner: user.userId,
      email: request.email.toLowerCase(),
      phone: '',
      address: request.location
    });

    // Generate token
    const token = this.generateToken(user);

    return {
      token,
      user: {
        id: user.userId,
        email: user.email,
        shopId: user.shopId,
        shopName: user.shopName
      }
    };
  }

  async loginUser(request: LoginRequest): Promise<AuthResponse> {
    // Find user by email
    const user = await db.getUserByEmail(request.email.toLowerCase());
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await this.comparePassword(request.password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Generate token
    const token = this.generateToken(user);

    return {
      token,
      user: {
        id: user.userId,
        email: user.email,
        shopId: user.shopId,
        shopName: user.shopName
      }
    };
  }

  verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}
