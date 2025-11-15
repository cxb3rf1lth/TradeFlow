import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { storage } from '../memory-storage';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Extend Express Request type
declare global {
  namespace Express {
    interface User {
      id: string;
      username: string;
      role: string;
    }
  }
}

// Configure passport JWT strategy
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: JWT_SECRET,
};

passport.use(
  new JwtStrategy(jwtOptions, async (payload: any, done: any) => {
    try {
      const user = await storage.getUser(payload.id);
      if (user) {
        return done(null, {
          id: user.id,
          username: user.username,
          role: user.role,
        });
      }
      return done(null, false);
    } catch (error) {
      return done(error, false);
    }
  })
);

// Middleware to require authentication
export const requireAuth = passport.authenticate('jwt', { session: false });

// Middleware to require specific roles
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }

    next();
  };
};

// Generate JWT token
export const generateToken = (userId: string, role: string): string => {
  return jwt.sign({ id: userId, role }, JWT_SECRET, { expiresIn: '7d' });
};

// Verify JWT token
export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};
