/**
 app.ts = настройки Express-приложения
server.ts = запуск приложения
 */
import express from 'express';
import cors from 'cors';
import { notFound } from './middlewares/notFound.js';
import { errorHandler } from './middlewares/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
const app = express();
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.get('/', (_req, res) => {
    res.json({
        success: true,
        message: 'Server Express is running'
    });
});
app.use('/api/auth', authRoutes);
app.use(notFound);
app.use(errorHandler);
export default app;
