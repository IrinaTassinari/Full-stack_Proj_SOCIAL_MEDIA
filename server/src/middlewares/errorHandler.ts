import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/appError.js';

/**
 * Глобальный обработчик ошибок.
 *
 * Любая ошибка, переданная через next(error), придёт сюда.
 */
export const errorHandler = (
    err: Error | AppError,
    _req: Request,
    res: Response,
    _next: NextFunction,
): void => {
    // Если это наша кастомная ошибка, берём её statusCode.
    // Иначе ставим 500.
    const statusCode = err instanceof AppError ? err.statusCode : 500;

    res.status(statusCode).json({
        success: false,
        message: err.message || 'Internal server error',
    });
};