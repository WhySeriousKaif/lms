import { Request, Response, NextFunction } from "express";
import NotificationModel from "../models/notification";
import { catchAsyncError } from "../middleware/catchAsyncError";
import ErrorHandler from "../utils/ErrorHandler";


//get all notifications -for admin
export const getNotifications = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const notifications = await NotificationModel.find().sort({createdAt:-1}) ;
        res.status(200).json({
            success: true,
            notifications,
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
});

//update notification status - only admin
export const updateNotification = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Find notification by ID
        const notification = await NotificationModel.findById(req.params.id);
        
        if (!notification) {
            return next(new ErrorHandler("Notification not found", 404));
        }

        // Update status to "read"
        notification.status = "read";
        await notification.save();

        // Get all notifications sorted by createdAt (most recent first)
        const notifications = await NotificationModel.find().sort({
            createdAt: -1,
        });

        res.status(200).json({
            success: true,
            notifications,
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
});

//delete all notifications - for admin
 export const deleteAllNotifications = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        await NotificationModel.deleteMany({ status: "read" });
        res.status(200).json({
            success: true,
            message: "All notifications deleted successfully",
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
 });