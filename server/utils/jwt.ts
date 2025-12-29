import dotenv from 'dotenv';
dotenv.config();

import { Response } from 'express';
import jwt from 'jsonwebtoken';
import { IUser } from '../models/user.model';
import { redis } from './redis';

interface ITokenOptions {
  expires: Date;
  maxAge: number;
  httpOnly: boolean;
  sameSite: 'lax' | 'strict' | 'none';
  secure?: boolean;
}

export const sendToken = (user: IUser, res: Response, message: string, statusCode: number) => {
    // Generate tokens directly (works with both Mongoose documents and plain objects)
    const accessToken = jwt.sign(
        { id: user._id },
        process.env.ACCESS_TOKEN as string,
        { expiresIn: '5m' }
    );
    const refreshToken = jwt.sign(
        { id: user._id },
        process.env.REFRESH_TOKEN as string,
        { expiresIn: '7d' }
    );
    
    // Upload session to redis
    redis.set(user._id.toString(), JSON.stringify(user) as any); 



    //parse env variables to integrate with fallback values

    const accessTokenExpire=parseInt(process.env.ACCESS_TOKEN_EXPIRE as string || '300', 10);
    const refreshTokenExpire=parseInt(process.env.REFRESH_TOKEN_EXPIRE as string || '1200', 10);

    //options for cookies
    const options: ITokenOptions = {
        expires: new Date(Date.now() + accessTokenExpire * 60*60* 1000),
        maxAge: accessTokenExpire * 60*60*  1000,
        httpOnly: true,
        sameSite: 'lax',
    };
   //refress
   const refreshTokenOptions: ITokenOptions = {
    expires: new Date(Date.now() + refreshTokenExpire * 24*60*60* 1000),
    maxAge: refreshTokenExpire *24*60*60* 1000,
    httpOnly: true,
    sameSite: 'lax',
   };
    //only set secure to true in production
    if(process.env.NODE_ENV === 'production') {
        options.secure = true;
        refreshTokenOptions.secure = true;
    }
    res.cookie('accessToken', accessToken, options);

    res.cookie('refreshToken', refreshToken, refreshTokenOptions);

    res.status(statusCode).json({
        success: true,
        message,
        accessToken,
        refreshToken,
    });
}