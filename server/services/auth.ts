import bcrypt from 'bcryptjs';
import { storage } from '../memory-storage';
import { generateToken } from '../middleware/auth';
import { InsertUser } from '@shared/schema';

const SALT_ROUNDS = 12;

export class AuthService {
  async register(data: { username: string; password: string; name?: string; role?: string }) {
    // Check if user already exists
    const existingUser = await storage.getUserByUsername(data.username);
    if (existingUser) {
      throw new Error('Username already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

    // Create user
    const user = await storage.createUser({
      username: data.username,
      name: data.name || data.username,
      password: hashedPassword,
      role: data.role || 'user',
      avatar: null,
    });

    // Generate token
    const token = generateToken(user.id, user.role);

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return { token, user: userWithoutPassword };
  }

  async login(username: string, password: string) {
    // Find user
    const user = await storage.getUserByUsername(username);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    // Generate token
    const token = generateToken(user.id, user.role);

    // Return user without password
    return { token, user: { id: user.id, username: user.username, role: user.role } };
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await storage.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify old password
    const isValid = await bcrypt.compare(oldPassword, user.password);
    if (!isValid) {
      throw new Error('Invalid current password');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Update password (would need to add method to storage)
    // await storage.updateUserPassword(userId, hashedPassword);

    return { success: true };
  }
}

export const authService = new AuthService();
