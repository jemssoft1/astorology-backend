import { Request, Response, NextFunction } from 'express';
import { ErrorLogRepository } from '../../database/repositories/ErrorLogRepository';

/**
 * Global error handling middleware
 * Catches all errors and returns consistent error responses
 */
export const errorHandler = async (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error('Error:', err);
    
    // Log error to database
    try {
        await ErrorLogRepository.create({
            endpoint: req.path,
            errorMessage: err.message,
            stackTrace: err.stack || '',
            userId: (req as any).user?.id,
            requestBody: JSON.stringify(req.body)
        });
    } catch (logError) {
        console.error('Failed to log error:', logError);
    }
    
    // Determine status code
    const statusCode = (err as any).statusCode || 500;
    
    // Send error response
    res.status(statusCode).json({
        success: false,
        error: process.env.NODE_ENV === 'production' 
            ? 'An error occurred' 
            : err.message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

/**
 * Wraps async route handlers to catch errors
 */
export const asyncHandler = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
