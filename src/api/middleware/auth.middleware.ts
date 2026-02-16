import { Request, Response, NextFunction } from "express";
import { User, UserRole } from "../../database/models/User.model";

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

/**
 * Middleware to authenticate JWT token
 * BYPASSED: Always calls next()
 */
export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  // Set a dummy user so code doesn't crash if it expects req.user
  req.user = {
    id: "guest_bypass",
    username: "guest",
    email: "guest@example.com",
    role: UserRole.ADMIN, // Grant High Permissions by default since Auth is off
    firstName: "Guest",
    lastName: "User",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as any;
  next();
};

/**
 * Middleware for optional authentication
 * BYPASSED: Always calls next()
 */
export const optionalAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  // Set a dummy user
  req.user = {
    id: "guest_bypass",
    username: "guest",
    email: "guest@example.com",
    role: UserRole.ADMIN,
    firstName: "Guest",
    lastName: "User",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as any;
  next();
};

/**
 * Middleware to check if user has required role
 * BYPASSED: Always calls next()
 */
export const authorizeRole = (...allowedRoles: any[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    next();
  };
};

/**
 * Middleware to check if user is admin
 * BYPASSED
 */
export const requireAdmin = authorizeRole(UserRole.ADMIN);

/**
 * Middleware to check if user is authenticated (not guest)
 * BYPASSED
 */
export const requireAuthenticated = authorizeRole(
  UserRole.USER,
  UserRole.ADMIN,
);
