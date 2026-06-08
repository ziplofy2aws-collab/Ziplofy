import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Request, Response } from 'express';
import { config } from './config';
import { errorMiddleware } from './middleware/error.middleware';
import { authRouter } from './routes/auth.route';

export const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: config.allowedOrigins,
  credentials: true,
}));

app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok -updated ci cd updated',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.use('/api/auth', authRouter);
app.use(errorMiddleware);
