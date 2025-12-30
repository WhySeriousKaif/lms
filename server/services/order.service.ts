import {NextFunction, Response, Request} from "express";
import { catchAsyncError } from "../middleware/catchAsyncError";
import ErrorHandler from "../utils/ErrorHandler";
import orderModel from "../models/order";


//create new order
export const newOrder = async (data:any, res:Response, next:NextFunction) => {
    try {
        const order = await orderModel.create(data);
        // Ensure we return a single document, not an array
        return Array.isArray(order) ? order[0] : order;
    } catch (error: any) {
        next(new ErrorHandler(error.message, 500));
        return undefined;
    }
};

//get all orders --only for admin
export const getAllOrdersService = async (req: Request, res: Response) => {
    const orders = await orderModel.find().sort({createdAt:-1});
    return orders;
};