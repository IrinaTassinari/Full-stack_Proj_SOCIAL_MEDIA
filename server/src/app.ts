/**
 app.ts = настройки Express-приложения
server.ts = запуск приложения
 */
import express from 'express';
import type {Request, Response} from 'express';
import cors from 'cors';
import { notFound } from './middlewares/notFound.js';
import { errorHandler } from './middlewares/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import postRoutes from './routes/postRoutes.js';
import likeRoutes from './routes/likeRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import subscriptionRoutes from './routes/subscribeRoutes.js';
import notificationsRoutes from './routes/notificationRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import notificationMessageRoutes from "./routes/notificationMessageRoutes.js";
import { env } from './config/env.js';


const app = express();

app.use(
  cors({
    origin: env.clientUrl,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());

app.get('/', (_req: Request, res: Response) => {
  res.json({
        success: true,
        message: 'Server Express is running'
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/message-notifications", notificationMessageRoutes);


app.use(notFound);

app.use(errorHandler);

export default app;
