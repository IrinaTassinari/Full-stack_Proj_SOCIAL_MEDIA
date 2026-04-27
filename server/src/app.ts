import express from 'express';
import type {Request, Response} from 'express';
import cors from 'cors';
import { notFound } from './middlewares/notFound.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

app.use(
  cors({
    origin: 'http://localhost:5173',
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

app.use(notFound);

app.use(errorHandler);

export default app;
