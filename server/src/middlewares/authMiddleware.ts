import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from './../config/env.js';
import { AppError } from '../utils/appError.js';
import { User } from '../models/User.js';



// =======================
// Middleware проверки JWT

// Этот middleware используется для защиты маршрутов.
// Он проверяет, есть ли токен и валиден ли он.
export const authMiddleware = async (req: Request, _res: Response, next: NextFunction) => {
    try {
        // Получаем заголовок Authorization
        // Обычно выглядит так: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
        const authHeader = req.headers.authorization;

        // Если заголовок отсутствует - пользователь не авторизован
        if (!authHeader) {
            throw new AppError('Token was not provided', 401);
        }

        // Разбиваем строку по пробелу
        // Например: "Bearer token123" → ['Bearer', 'token123']
        const [bearer, token] = authHeader.split(' ');

        // Проверяем:
        // 1. что первая часть - это именно 'Bearer'
        // 2. что токен вообще есть
        if (bearer !== 'Bearer' || !token) {
            throw new AppError('Invalid token format', 401);
        }

        // Проверяем токен с помощью секретного ключа
        // jwt.verify:
        // - декодирует токен
        // - проверяет подпись
        // - проверяет срок действия (expiresIn)
        // { id: string } потому что в generateToken.ts создаётся токен с payload: {id: userId}
        const decoded = jwt.verify(token, env.jwtSecret) as { id: string };

        // найди пользователя в MongoDB по id из токена, но не возвращай его пароль
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            throw new AppError('User not found', 401);
        }

        // Сохраняем данные из токена в req.user
        // Теперь в следующих middleware/контроллерах доступно:
        // req.user.id, req.user.email и т.д. (зависит от payload)
        req.user = user;
        // Передаём управление следующему middleware/контроллеру
        next();
    } catch (error) {
        // Если произошла ошибка:
        // - токен просрочен
        // - токен подделан
        // - неверный формат
        // передаём её в глобальный обработчик ошибок
        next(error);
    }
};