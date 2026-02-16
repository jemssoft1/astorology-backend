import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

/**
 * Rate limiting middleware
 * Converted from C# ThrottleManager.cs logic
 */

// Default rate limit for anonymous users
const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'); // 15 minutes
const MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100');
const AUTHENTICATED_MAX = parseInt(process.env.RATE_LIMIT_AUTHENTICATED_MAX || '500');

/**
 * Basic rate limiter for all requests
 */
export const basicRateLimiter = rateLimit({
    windowMs: WINDOW_MS,
    max: MAX_REQUESTS,
    message: {
        success: false,
        error: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Skip successful requests
    skipSuccessfulRequests: false,
    // Key generator based on IP
    keyGenerator: (req: Request) => {
        return req.ip || req.socket.remoteAddress || 'unknown';
    }
});

/**
 * Stricter rate limiter for authentication endpoints
 */
export const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts
    message: {
        success: false,
        error: 'Too many login attempts, please try again after 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true // Don't count successful logins
});

/**
 * Rate limiter for authenticated users (higher limit)
 */
export const authenticatedRateLimiter = rateLimit({
    windowMs: WINDOW_MS,
    max: AUTHENTICATED_MAX,
    message: {
        success: false,
        error: 'Rate limit exceeded for authenticated users.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req: Request) => {
        // Use user ID if available, otherwise IP
        return (req as any).user?.id || req.ip || 'unknown';
    },
    skip: (req: Request) => {
        // Skip rate limit for admin users
        return (req as any).user?.role === 'admin';
    }
});

/**
 * Dynamic rate limiter that checks if user is authenticated
 */
export const dynamicRateLimiter = (req: Request, res: Response, next: any) => {
    // Check if user is authenticated
    const user = (req as any).user;
    
    if (user && user.id && user.id !== '101') {
        // Use authenticated rate limiter
        return authenticatedRateLimiter(req, res, next);
    } else {
        // Use basic rate limiter for anonymous
        return basicRateLimiter(req, res, next);
    }
};
