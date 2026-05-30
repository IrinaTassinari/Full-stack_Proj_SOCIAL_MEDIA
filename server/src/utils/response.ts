import type { Response } from "express";

// Optional response helpers for controllers that want a shared response shape.
interface SuccessResponse<T> {
    success: boolean;
    message: string;
    data: null | T;
}

interface ErrorResponse {
    success: boolean;
    message: string;
}

export const sendSuccess = <T>(
    res: Response,
    statusCode: number,
    message: string,
    data: T | null = null
) => {
    const payload: SuccessResponse<T> = {
        success: true,
        message,
        data
    }
    return res.status(statusCode).json(payload);
};


export const sendError = (
    res: Response,
    statusCode: number,
    message: string
) => {
    const payload: ErrorResponse = {
        success: false,
        message
    }
    return res.status(statusCode).json(payload);
};
