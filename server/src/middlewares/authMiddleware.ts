import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from './../config/env.js';
import { AppError } from '../utils/appError.js';
import { User } from '../models/User.js';



export const authMiddleware = async (req: Request, _res: Response, next: NextFunction) => {
    try {
        // Protected routes expect an Authorization header in the form: Bearer <token>.
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            throw new AppError('Token was not provided', 401);
        }

        const [bearer, token] = authHeader.split(' ');

        if (bearer !== 'Bearer' || !token) {
            throw new AppError('Invalid token format', 401);
        }

        // Verify the JWT signature and read the user id from the token payload.
        const decoded = jwt.verify(token, env.jwtSecret) as { id: string };

        // Attach the current user to the request for the next controllers.
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            throw new AppError('User not found', 401);
        }

        req.user = user;
        next();
    } catch (error) {
        // Expired, invalid, or malformed tokens are handled by the global error handler.
        next(error);
    }
};
