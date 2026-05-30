import type { Request, Response } from 'express';

// Fallback middleware for requests that did not match any route.
export const notFound = (req: Request, res: Response): void => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`,
    });
};
