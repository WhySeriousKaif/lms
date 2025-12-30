import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import errorMiddleware from './middleware/error';
import userRoutes from './routes/user.route';
import courseRoutes from './routes/course.route';
import orderRoutes from './routes/order.route';
import notificationRoutes from './routes/notification.route';
import analyticsRoutes from './routes/analytics.route';
import layoutRoutes from './routes/layout.route';
dotenv.config();

export const app = express();

// ================= Middleware =================
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
// ================= Routes =================
// app.use('/api/v1/', userRoutes); // this is the old way to combine all the routes
// app.use('/api/v1/', courseRoutes); // this is the old way to combine all the routes
// app.use('/api/v1/', orderRoutes); // this is the old way to combine all the routes
// or we can use this way to combine all the routes
app.use('/api/v1/', userRoutes, courseRoutes, orderRoutes, notificationRoutes, analyticsRoutes, layoutRoutes); // this is the best way to combine all the routes
// ================= Test Route =================
app.get('/test', (req: Request, res: Response) => {
  res.status(200).json({ message: 'API is working' });
});

// ================= Unknown Route (FIXED) =================
app.use((req: Request, res: Response, next: NextFunction) => {
  const error: any = new Error(`Can't find ${req.originalUrl} on this server!`);
  error.statusCode = 404;
  next(error);
});

app.use(errorMiddleware);