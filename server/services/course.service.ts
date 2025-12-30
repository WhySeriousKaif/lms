import {Request, Response, NextFunction} from "express";

import CourseModel from "../models/course.model";
import { catchAsyncError } from "../middleware/catchAsyncError";


export const createCourse=catchAsyncError(async (data:any,res:Response) => {
   const course=await CourseModel.create(data);
   res.status(201).json({
    success: true,
    message: "Course created successfully",
    course,
   });
});

//get all courses
export const getAllCoursesService = async (req: Request, res: Response) => {
    const courses = await CourseModel.find().sort({createdAt:-1});
    res.status(200).json({
        success: true,
        courses,
    });
};