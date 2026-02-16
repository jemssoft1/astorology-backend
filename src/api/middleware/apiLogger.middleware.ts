import { Request, Response, NextFunction } from 'express';
import { ApiLogRepository } from '../../database/repositories/ApiLogRepository';

/**
 * Middleware to log all API requests
 * Tracks performance, usage analytics, and debugging information
 */
export const apiLogger = async (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    
    // Capture response finish event
    const originalSend = res.send;
    res.send = function(data: any) {
        res.send = originalSend;
        
        const responseTime = Date.now() - startTime;
        const userId = (req as any).user?.id;
        
        // Log API call asynchronously (don't block response)
        ApiLogRepository.create({
            userId,
            endpoint: req.path,
            method: req.method,
            ipAddress: req.ip || req.socket.remoteAddress || 'unknown',
            userAgent: req.get('user-agent') || 'unknown',
            responseTime,
            statusCode: res.statusCode
        }).catch(err => {
            console.error('Failed to log API call:', err);
        });
        
        return originalSend.call(this, data);
    };
    
    next();
};
