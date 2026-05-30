

import type { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import { AppError } from '../utils/appError.js';

// Global Express error handler. Expected API errors use AppError; all others become 500.
export const errorHandler = (
    err: Error | AppError,
    _req: Request,
    res: Response,
    _next: NextFunction,
): void => {
    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        res.status(400).json({
            success: false,
            message: 'Each image must be smaller than 10 MB',
        });
        return;
    }

    const statusCode = err instanceof AppError ? err.statusCode : 500;

    res.status(statusCode).json({
        success: false,
        message: err.message || 'Internal server error',
    });
};
