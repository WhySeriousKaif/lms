import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../utils/ErrorHandler";
import { catchAsyncError } from "../middleware/catchAsyncError";
import UserModel from "../models/user.model";
import CourseModel from "../models/course.model";
import NotificationModel from "../models/notification";
import sendMail from "../utils/sendMail";
import { getAllOrdersService, newOrder } from "../services/order.service";

export const createOrder = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { courseId } = req.body;

      // 1️⃣ Validate input
      if (!courseId) {
        return next(new ErrorHandler("CourseId is required", 400));
      }

      // 2️⃣ Get user from authenticated request
      const userId = req.user?._id;
      if (!userId) {
        return next(new ErrorHandler("User not authenticated", 401));
      }

      const user = await UserModel.findById(userId);
      if (!user) {
        return next(new ErrorHandler("User not found", 404));
      }

      // 3️⃣ Prevent duplicate enrollment
      const alreadyEnrolled = user.courses.some(
        (item: any) => item.courseId.toString() === courseId.toString()
      );

      if (alreadyEnrolled) {
        return next(
          new ErrorHandler("You are already enrolled in this course", 400)
        );
      }

      // 4️⃣ Get course
      const course = await CourseModel.findById(courseId);
      if (!course) {
        return next(new ErrorHandler("Course not found", 404));
      }

      // 5️⃣ Create order (only courseId needed)
      const orderPayload = {
        courseId,
        userId: userId.toString(),
      };

      const order = await newOrder(orderPayload, res, next);
      if (!order) return;

      // 6️⃣ Send confirmation email (non-blocking)
      try {
        await sendMail({
          email: user.email,
          subject: "🎉 Order Confirmed",
          template: "order-confirmation.ejs",
          data: {
            user: { name: user.name },
            order: {
              _id: order._id.toString().slice(0, 6),
              date: new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              }),
              items: [
                {
                  title: course.name,
                  quantity: 1,
                  price: course.price,
                },
              ],
              totalAmount: course.price,
            },
            dashboardUrl: `${process.env.CLIENT_URL}/dashboard`,
          },
        });
      } catch (error: any) {
        console.error("Order email failed:", error.message);
      }

      // 7️⃣ Enroll user in course
      user.courses.push({ courseId });
      await user.save();

      // 8️⃣ Increase course purchase count
      course.purchased ? course.purchased += 1 : course.purchased ;
      await course.save();

      // 9️⃣ Create notification (non-blocking)
      try {
        await NotificationModel.create({
          userId: userId.toString(),
          title: "New Course Enrolled",
          message: `You have successfully enrolled in ${course.name}`,
          status: "unread",
        });
      } catch (error: any) {
        console.error("Notification failed:", error.message);
      }

      // 🔟 Final response
      res.status(201).json({
        success: true,
        message: "Order created successfully",
        order,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

//get all orders --only for admin
export const getAllOrdersAdmin = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const orders = await getAllOrdersService(req, res);
    res.status(200).json({
      success: true,
      orders,
    });
  }
);