import { Request, Response, NextFunction } from 'express';
import { catchAsyncError } from './catchAsyncError';
import ErrorHandler from '../utils/ErrorHandler';
import jwt from 'jsonwebtoken';
import { redis } from '../utils/redis';

//authenticate user by access token
export const isAuthenticated = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const accessToken = req.cookies.accessToken || req.headers.authorization?.split(' ')[1];

    if (!accessToken) {
        return next(new ErrorHandler('Please login to access this resource', 401));
    }
    
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN as string) as { id: string };
    
    if (!decoded) {
        return next(new ErrorHandler('Invalid access token', 401));
    }
    
    const user = await redis.get(decoded.id);
    if (!user) {
        return next(new ErrorHandler('User not found', 404));
    }
    
    req.user = JSON.parse(user as string);
    next();
});

//validate user role
export const authorizeRoles = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!roles.includes(req.user?.role || 'user')) {
            return next(new ErrorHandler(`Role: ${req.user?.role || 'user'} is not allowed to access this resource`, 403));
        }
        next();
    }
}

//update access token
export const updateAccessToken = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const refresh_token = req.cookies.refreshToken || req.headers.authorization?.split(' ')[1];
    
    if (!refresh_token) {
        return next(new ErrorHandler('Please login to access this resource', 401));
    }
    
    const decoded = jwt.verify(refresh_token, process.env.REFRESH_TOKEN as string) as { id: string };
    
    if (!decoded) {
        return next(new ErrorHandler('Invalid refresh token', 401));
    }
    
    const session = await redis.get(decoded.id);
    if (!session) {
        return next(new ErrorHandler('User not found', 404));
    }
    
    const user = JSON.parse(session as string);
    req.user = user;
    next();
});