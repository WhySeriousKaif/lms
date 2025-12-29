import { Request, Response, NextFunction } from "express";
import { catchAsyncError } from "../middleware/catchAsyncError";
import ErrorHandler from "../utils/ErrorHandler";
import CourseModel from "../models/course.model";
import cloudinary from "cloudinary";
import { createCourse } from "../services/course.service";
import { redis } from "../utils/redis";
import mongoose from "mongoose";

//upload course
interface IUploadCourse {
  title: string;
  description: string;
  videoUrl: string;
  videoThumbnail: object;
  videoSection: string;
  videoLength: number;
  videoPlayerUrl: string;
}
// upload course
export const uploadCourse = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const thumbnail = data.thumbnail;

      if (thumbnail) {
        // Check if thumbnail is already an object (has public_id and url)
        if (
          typeof thumbnail === "object" &&
          thumbnail.public_id &&
          thumbnail.url
        ) {
          // Thumbnail is already uploaded, use it directly
          data.thumbnail = {
            public_id: thumbnail.public_id,
            url: thumbnail.url,
          };
        } else if (typeof thumbnail === "string") {
          // Thumbnail is a string (base64/data URL), upload to Cloudinary
          const cloudResult = await cloudinary.v2.uploader.upload(thumbnail, {
            folder: "courses",
          });

          data.thumbnail = {
            public_id: cloudResult.public_id,
            url: cloudResult.secure_url,
          };
        } else {
          return next(new ErrorHandler("Invalid thumbnail format", 400));
        }
      }

      await createCourse(data, res, next);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// edit course
export const editCourse = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const courseId = req.params.id;
      const thumbnail = data.thumbnail;

      /**
       * Handle thumbnail update ONLY if a new image is sent (base64 / string)
       */
      if (thumbnail && typeof thumbnail === "string") {
        // get existing course
        const existingCourse = await CourseModel.findById(courseId);

        if (!existingCourse) {
          return next(new ErrorHandler("Course not found", 404));
        }

        // delete old thumbnail if exists
        const existingThumbnailObj = existingCourse.thumbnail as { public_id?: string; url?: string };
        if (existingThumbnailObj?.public_id) {
          await cloudinary.v2.uploader.destroy(
            existingThumbnailObj.public_id
          );
        }

        // upload new thumbnail (thumbnail here is the string from req.body)
        const uploadResult = await cloudinary.v2.uploader.upload(thumbnail, {
          folder: "courses",
        });

        data.thumbnail = {
          public_id: uploadResult.public_id,
          url: uploadResult.secure_url,
        };
      }

      // update course
      const course = await CourseModel.findByIdAndUpdate(
        courseId,
        { $set: data },
        { new: true }
      );

      res.status(200).json({
        success: true,
        course,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);
//delete course
export const deleteCourse = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const course = await CourseModel.findByIdAndDelete(req.params.id);
    if (!course) {
      return next(new ErrorHandler("Course not found", 404));
    }
    res.status(200).json({
      success: true,
      message: "Course deleted successfully",
      course,
    });
  }
);

// get single course -- without purchasing
export const getSingleCourse = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const courseId = req.params.id;
    const isCacheExists = await redis.get(`course-${courseId}`);
    if (isCacheExists) {
      const course = JSON.parse(isCacheExists);
      res.status(200).json({
        success: true,
        course,
      });
    } else {
      const course = await CourseModel.findById(req.params.id).select(
        "-courseData.videoUrl -courseData.suggestions -courseData.questions -courseData.links "
      );
      await redis.set(`course-${courseId}`, JSON.stringify(course));

      res.status(200).json({
        success: true,
        course,
      });
    }
  }
);

//get all courses -- without purchasing

export const getAllCourses = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const isCacheExists = await redis.get(`courses`);
    if (isCacheExists) {
      const courses = JSON.parse(isCacheExists);
      console.log("Cache hit for courses - fetching from cache");
      res.status(200).json({
        success: true,
        courses,
      });
    } else {
      const courses = await CourseModel.find().select(
        "-courseData.videoUrl -courseData.suggestions -courseData.questions -courseData.links "
      );
      await redis.set(`courses`, JSON.stringify(courses));
      console.log("Cache miss for courses - fetching from database");
      res.status(200).json({
        success: true,
        courses,
      });
    }
  }
);

//get course content -- only for valid users

export const getCourseContent = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const userCourseList = req.user?.courses || [];
    const courseId = req.params.id;
    
    if (!userCourseList || userCourseList.length === 0) {
      return next(
        new ErrorHandler("Please buy this course to access the content", 400)
      );
    }

    // Check for both courseId and _id (MongoDB might store it as _id)
    const courseExists = userCourseList.find(
      (item: any) => {
        const itemCourseId = item?.courseId?.toString() || item?._id?.toString();
        return itemCourseId === courseId;
      }
    );

    if (!courseExists) {
      return next(
        new ErrorHandler("Please buy this course to access the content", 400)
      );
    }

    const course = await CourseModel.findById(courseId);
    if (!course) {
      return next(new ErrorHandler("Course not found", 404));
    }
    const content = course?.courseData;
    res.status(200).json({
      success: true,
      content,
    });
  }
);


// get all questions of a course
// add question payload
export interface IAddQuestionData {
    question: string;
    courseId: string;
    contentId: string;
  }

  // add question in course content
export const addQuestion = catchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        // Handle both 'question' and 'questions' field names
        const questionText = req.body.question || req.body.questions;
        const { courseId, contentId } = req.body;
  
        if (!questionText) {
          return next(new ErrorHandler("Question is required", 400));
        }
  
        if (!courseId) {
          return next(new ErrorHandler("Course ID is required", 400));
        }
  
        if (!contentId) {
          return next(new ErrorHandler("Content ID is required", 400));
        }
  
        // validate contentId
        if (!mongoose.Types.ObjectId.isValid(contentId)) {
          return next(new ErrorHandler("Invalid content id", 400));
        }
  
        // validate courseId
        if (!mongoose.Types.ObjectId.isValid(courseId)) {
          return next(new ErrorHandler("Invalid course id", 400));
        }
  
        // find course
        const course = await CourseModel.findById(courseId);
        if (!course) {
          return next(new ErrorHandler("Course not found", 404));
        }
  
        // find specific course content
        const courseContent = course.courseData.find((item: any) =>
          item._id.toString() === contentId.toString()
        );
  
        if (!courseContent) {
          return next(new ErrorHandler("Invalid content id", 400));
        }
  
        // Initialize questions array if it doesn't exist
        if (!courseContent.questions) {
          courseContent.questions = [];
        }
  
        // create new question with proper structure: user, comment, commentReplies
        const newQuestion = {
          user: req.user._id || req.user, // Store user ID or user object
          comment: questionText, // The question/comment text
          commentReplies: [], // Initialize empty array for comment replies
        };
  
        // push question to the questions array
        courseContent.questions.push(newQuestion as any);
  
        // save course
        await course.save();
  
        res.status(200).json({
          success: true,
          message: "Question added successfully",
          course,
        });
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
      }
    }
  );