import { Request, Response, NextFunction } from 'express';
import { ApiLogRepository } from '../../database/repositories/ApiLogRepository';
import { VisitorRepository } from '../../database/VisitorRepository';
import { GeoLocationService } from '../../services/GeoLocationService';

const visitorRepo = new VisitorRepository();

/**
 * Middleware to log all API requests and track visitors
 * Tracks performance, usage analytics, and visitor geolocation
 */
export const apiLogger = async (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    
    // 1. Track Visitor (Async)
    const trackVisitor = async () => {
        try {
            const visitorInfo = await GeoLocationService.getVisitorInfo(req);
            await visitorRepo.recordVisit({
                ...visitorInfo,
                firstVisit: new Date(),
                lastVisit: new Date(),
                visitCount: 1
            });
        } catch (err) {
            console.error('Failed to track visitor:', err);
        }
    };
    
    // Run visitor tracking in background
    trackVisitor();

    // 2. Intercept Response for API Logging
    const originalSend = res.send;
    res.send = function(data: any) {
        res.send = originalSend;
        
        const responseTime = Date.now() - startTime;
        const userId = (req as any).user?.id;
        
        // Log API call asynchronously
        ApiLogRepository.create({
            userId,
            endpoint: req.originalUrl || req.path,
            method: req.method,
            ipAddress: GeoLocationService.getIpAddress(req),
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
