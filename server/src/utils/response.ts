/**
 * Это утилита, чтобы все ответы API были в одном стиле.
 * Например вместо того, чтобы в каждом контроллере писать:
  res.status(200).json({
  success: true,
  message: 'User created',
  data: user,
});
можно  писать короче:
sendSuccess(res, 200, 'User created', user);

 Единый формат успешного ответа - Это помогает держать API аккуратным и предсказуемым
 Дженерик <T> позволяет передавать любые данные:объект, массив, null и т.д.
 
 */

import type { Response } from "express";

// Тип для успешного ответа
interface SuccessResponse<T> {
    success: boolean;
    message: string;
    data: null | T;
}

// Тип для ответа с ошибкой
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


// Единый формат ответа с ошибкой
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