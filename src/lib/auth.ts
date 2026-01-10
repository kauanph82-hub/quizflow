import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Database, User } from './database';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

export interface AuthUser {
  id: string;
  email: string;
  isPremium: boolean;
  trialEndsAt?: string;
  subscriptionExpiresAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
}

export class AuthService {
  // Hash password
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  // Verify password
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  // Generate JWT token
  static generateToken(user: User): string {
    const payload: AuthUser = {
      id: user.id,
      email: user.email,
      isPremium: user.is_premium,
      trialEndsAt: user.trial_ends_at,
      subscriptionExpiresAt: user.subscription_expires_at,
    };

    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }

  // Verify JWT token
  static verifyToken(token: string): AuthUser | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
      return decoded;
    } catch (error) {
      return null;
    }
  }

  // Register new user
  static async register(credentials: RegisterCredentials): Promise<{ user: AuthUser; token: string }> {
    const { email, password } = credentials;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    // Validate password strength
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    // Check if user already exists
    const existingUser = await Database.getUserByEmail(email);
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // Hash password and create user
    const passwordHash = await this.hashPassword(password);
    const user = await Database.createUser(email, passwordHash);

    // Generate token
    const token = this.generateToken(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        isPremium: user.is_premium,
        trialEndsAt: user.trial_ends_at,
        subscriptionExpiresAt: user.subscription_expires_at,
      },
      token,
    };
  }

  // Login user
  static async login(credentials: LoginCredentials): Promise<{ user: AuthUser; token: string }> {
    const { email, password } = credentials;

    // Find user by email
    const user = await Database.getUserByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isValidPassword = await this.verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // Generate token
    const token = this.generateToken(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        isPremium: user.is_premium,
        trialEndsAt: user.trial_ends_at,
        subscriptionExpiresAt: user.subscription_expires_at,
      },
      token,
    };
  }

  // Refresh user data
  static async refreshUser(userId: string): Promise<AuthUser | null> {
    const user = await Database.getUserById(userId);
    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      isPremium: user.is_premium,
      trialEndsAt: user.trial_ends_at,
      subscriptionExpiresAt: user.subscription_expires_at,
    };
  }

  // Check if user is premium (including trial)
  static isPremiumActive(user: AuthUser): boolean {
    if (user.isPremium) {
      // Check if subscription is still valid
      if (user.subscriptionExpiresAt) {
        return new Date(user.subscriptionExpiresAt) > new Date();
      }
      return true;
    }

    // Check if trial is still active
    if (user.trialEndsAt) {
      return new Date(user.trialEndsAt) > new Date();
    }

    return false;
  }

  // Get premium status details
  static getPremiumStatus(user: AuthUser): {
    isActive: boolean;
    type: 'trial' | 'premium' | 'expired';
    expiresAt?: string;
    daysLeft?: number;
  } {
    const now = new Date();

    // Check premium subscription
    if (user.isPremium && user.subscriptionExpiresAt) {
      const expiresAt = new Date(user.subscriptionExpiresAt);
      const isActive = expiresAt > now;
      const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      return {
        isActive,
        type: isActive ? 'premium' : 'expired',
        expiresAt: user.subscriptionExpiresAt,
        daysLeft: isActive ? daysLeft : 0,
      };
    }

    // Check trial
    if (user.trialEndsAt) {
      const expiresAt = new Date(user.trialEndsAt);
      const isActive = expiresAt > now;
      const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      return {
        isActive,
        type: isActive ? 'trial' : 'expired',
        expiresAt: user.trialEndsAt,
        daysLeft: isActive ? daysLeft : 0,
      };
    }

    return {
      isActive: false,
      type: 'expired',
      daysLeft: 0,
    };
  }

  // Upgrade user to premium
  static async upgradeToPremium(userId: string, expiresAt?: string): Promise<void> {
    const subscriptionExpiresAt = expiresAt || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(); // 1 year from now
    await Database.updateUserPremiumStatus(userId, true, subscriptionExpiresAt);
  }

  // Middleware for protecting routes
  static async requireAuth(token?: string): Promise<AuthUser> {
    if (!token) {
      throw new Error('Authentication required');
    }

    const user = this.verifyToken(token);
    if (!user) {
      throw new Error('Invalid or expired token');
    }

    // Refresh user data from database
    const freshUser = await this.refreshUser(user.id);
    if (!freshUser) {
      throw new Error('User not found');
    }

    return freshUser;
  }

  // Middleware for requiring premium access
  static async requirePremium(token?: string): Promise<AuthUser> {
    const user = await this.requireAuth(token);
    
    if (!this.isPremiumActive(user)) {
      throw new Error('Premium subscription required');
    }

    return user;
  }
}

// Client-side auth utilities
export class ClientAuth {
  private static readonly TOKEN_KEY = 'xquiz_auth_token';
  private static readonly USER_KEY = 'xquiz_user';

  // Store auth data
  static setAuth(token: string, user: AuthUser): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.TOKEN_KEY, token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
  }

  // Get stored token
  static getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  // Get stored user
  static getUser(): AuthUser | null {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem(this.USER_KEY);
      return userData ? JSON.parse(userData) : null;
    }
    return null;
  }

  // Clear auth data
  static clearAuth(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getUser();
    return !!(token && user);
  }

  // Check if user has premium access
  static hasPremiumAccess(): boolean {
    const user = this.getUser();
    return user ? AuthService.isPremiumActive(user) : false;
  }
}