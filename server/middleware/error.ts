import { NextFunction, Request, Response } from "express";
import ErrorHandler from "../utils/ErrorHandler";

const errorMiddleware = (err: ErrorHandler, req: Request, res: Response, next: NextFunction) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || 'Internal Server Error';

   //wrong mongodb id error
   if(err.name === 'CastError'){
    const message = `Resource not found. Invalid: ${err.name}: ${err.message}`;
    err = new ErrorHandler(message, 400);
   }
   //duplicate key error
   if((err as any).code === 11000){
    const message = `Duplicate ${Object.keys((err as any).keyValue)} entered`;
    err = new ErrorHandler(message, 400);
   }
   //json web token error
   if(err.name === 'JsonWebTokenError'){
    const message = `Json Web Token is invalid, try again`;
    err = new ErrorHandler(message, 400);
   }

   //jwt expired error
   if(err.name === 'TokenExpiredError'){
    const message = `Json Web Token is expired, try again`;
    err = new ErrorHandler(message, 400);
   }

   return res.status(err.statusCode).json({
    success: false,
    message: err.message,
   });


};

export default errorMiddleware;