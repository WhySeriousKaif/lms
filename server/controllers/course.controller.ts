import { Request, Response, NextFunction } from "express";
import { catchAsyncError } from "../middleware/catchAsyncError";
import ErrorHandler from "../utils/ErrorHandler";
import CourseModel from "../models/course.model";
import cloudinary from "cloudinary";
import { createCourse, getAllCoursesService } from "../services/course.service";
import { redis } from "../utils/redis";
import mongoose from "mongoose";
import { userInfo } from "os";
import path from "path";
import sendMail from "../utils/sendMail";
import userModel from "../models/user.model";
import NotificationModel from "../models/notification";

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

        // create notification
        await NotificationModel?.create?.({
          userId: (req.user._id || req.user)?.toString() || "",
          title: "New Question Reply Added",
          message: `You have a new question reply in ${courseContent.title}`,
          status: "unread",
        });
  
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

  //add ans in course qeustions
  interface IAddAnswerData{
    answer:string;
    questionId:string;
    courseId:string;
    contentId:string;


  }
  export const addAnswer = catchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { answer, questionId, courseId, contentId }: IAddAnswerData = req.body;
  
        const course = await CourseModel.findById(courseId);
        if (!course) {
          return next(new ErrorHandler("Course not found", 404));
        }
  
        // ❌ was wrong earlier (logic inverted)
        if (!mongoose.Types.ObjectId.isValid(contentId)) {
          return next(new ErrorHandler("Invalid content id", 400));
        }
  
        const courseContent = course.courseData.find(
          (item: any) => item._id.toString() === contentId.toString()
        );
  
        if (!courseContent) {
          return next(new ErrorHandler("Invalid content id", 400));
        }
  
        const question = courseContent.questions.find(
          (item: any) => item._id.toString() === questionId.toString()
        );
  
        if (!question) {
          return next(new ErrorHandler("Invalid question id", 400));
        }
  
        // Initialize commentReplies if it doesn't exist
        if (!question.commentReplies) {
          question.commentReplies = [];
        }

        // create new answer - must match IComment structure: user, comment, commentReplies
        const newAnswer = {
          user: req.user._id || req.user,
          comment: answer, // Use 'comment' field to match IComment interface
          commentReplies: [],
        };
  
        question.commentReplies.push(newAnswer as any);
        await course.save();
  
        // send mail only if someone else replied
        // Handle both cases: question.user might be string (ID) or object (IUser)
        const questionUserId = typeof question.user === 'string' 
          ? question.user 
          : question.user._id?.toString() || question.user._id;
        const currentUserId = req.user._id?.toString() || req.user._id;
        
        if (currentUserId !== questionUserId) {
          // Get user info for email - handle both string ID and object
          let questionUserEmail: string;
          let questionUserName: string;
          
          if (typeof question.user === 'string') {
            // If user is just an ID, fetch the user from database
            const userModel = (await import('../models/user.model')).default;
            const questionUser = await userModel.findById(question.user);
            questionUserEmail = questionUser?.email || '';
            questionUserName = questionUser?.name || 'User';
          } else {
            questionUserEmail = question.user.email || '';
            questionUserName = question.user.name || 'User';
          }
  
          const data = {
            name: questionUserName,
            title: courseContent.title,
          };
  
          await sendMail({
            email: questionUserEmail,
            subject: "New Reply to your question",
            template: "question.reply.ejs", // Fixed: use dot instead of hyphen
            data,
          });
        }
  
        res.status(200).json({
          success: true,
          course,
        });
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
      }
    }
  );

  //add review in course
  interface IAddReviewData{
    review:string;
    rating:number;
  }
  export const addReview = catchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userCourseList = req.user?.courses || [];
        const courseId = req.params.id;

        // Validate courseId
        if (!mongoose.Types.ObjectId.isValid(courseId)) {
          return next(new ErrorHandler("Invalid course id", 400));
        }

        // Check if user is enrolled in the course
        const courseExists = userCourseList.find((item:any) => 
          (item.courseId?.toString() === courseId.toString()) || 
          (item._id?.toString() === courseId.toString())
        );
        if(!courseExists){
          return next(new ErrorHandler("You are not enrolled in this course", 400));
        }

        // Find the course
        const course = await CourseModel.findById(courseId);
        if (!course) {
          return next(new ErrorHandler("Course not found", 404));
        }

        // Get review data from request body
        const { review, rating } = req.body as IAddReviewData;

        // Validate required fields
        if (!review || !rating) {
          return next(new ErrorHandler("Review and rating are required", 400));
        }

        // Validate rating (should be between 1 and 5)
        if (rating < 1 || rating > 5) {
          return next(new ErrorHandler("Rating must be between 1 and 5", 400));
        }

        // Initialize reviews array if it doesn't exist
        if (!course.reviews) {
          course.reviews = [];
        }

        // Check if user already reviewed this course (prevent duplicate reviews)
        const userId = req.user._id?.toString() || req.user._id;
        const existingReview = course.reviews.find((rev: any) => {
          const revUserId = typeof rev.user === 'string' 
            ? rev.user.toString() 
            : rev.user?._id?.toString() || rev.user?._id;
          return revUserId === userId;
        });

        if (existingReview) {
          return next(new ErrorHandler("You have already reviewed this course", 400));
        }

        // Create review data - use authenticated user's ID (security: don't trust req.body.userId)
        const reviewData = {
          user: req.user._id || req.user,
          rating: Number(rating),
          comment: review,
        };

        // Add review to course
        course.reviews.push(reviewData as any);
        await course.save();

        // Calculate average rating
        let avg = 0;
        if (course.reviews.length > 0) {
          course.reviews.forEach((item: any) => {
            avg += item.rating || 0;
          });
          avg = avg / course.reviews.length;
        }
        course.ratings = Math.round(avg * 10) / 10; // Round to 1 decimal place
        await course.save();

        // Send success response
        res.status(200).json({
          success: true,
          course,
          message: "Review added successfully",
        });

        // Note: Email notification to course creator can be added here if course has a creator/instructor field
        // For now, we'll skip it since the course model doesn't have a userId/creator field
        
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
      }
    }
  );

  //add replies in review by admin
  interface IAddReplyToReviewData{
    reviewId:string;
    comment:string;
    courseId:string;
  }
  export const addReplyToReview = catchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { comment, courseId, reviewId }: IAddReplyToReviewData = req.body;

        // Validate required fields
        if (!comment || !courseId || !reviewId) {
          return next(new ErrorHandler("Comment, courseId, and reviewId are required", 400));
        }

        // Validate courseId
        if (!mongoose.Types.ObjectId.isValid(courseId)) {
          return next(new ErrorHandler("Invalid course id", 400));
        }

        // Validate reviewId
        if (!mongoose.Types.ObjectId.isValid(reviewId)) {
          return next(new ErrorHandler("Invalid review id", 400));
        }
  
        const course = await CourseModel.findById(courseId);
        if (!course) {
          return next(new ErrorHandler("Course not found", 404));
        }

        // Initialize reviews array if it doesn't exist
        if (!course.reviews) {
          course.reviews = [];
        }
  
        const review = course.reviews.find(
          (rev: any) => rev._id.toString() === reviewId.toString()
        );
  
        if (!review) {
          return next(new ErrorHandler("Review not found", 404));
        }

        // Initialize commentReplies array if it doesn't exist
        if (!review.commentReplies) {
          review.commentReplies = [];
        }
  
        // Create reply data - must match IComment structure: user, comment, commentReplies
        const replyData = {
          user: req.user._id || req.user,
          comment: comment,
          commentReplies: [], // Initialize empty array for nested replies
        };
  
        // push reply inside review replies (NOT course.reviews)
        review.commentReplies.push(replyData as any);
  
        await course.save();
  
        res.status(200).json({
          success: true,
          course,
          message: "Reply added successfully",
        });
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
      }
    }
  );

  //get all courses --only for admin
  export const getAllCoursesAdmin = catchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      const courses = await getAllCoursesService(req, res);
      res.status(200).json({
        success: true,
        courses,
      });
    }
  );

//Delete user -- only for admin
export const deleteCourseAdmin = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { courseId } = req.params;
    const course = await CourseModel.findByIdAndDelete(courseId);
    if (!course) {
      return next(new ErrorHandler("Course not found", 404));
    }
    await course.deleteOne({_id: courseId});
    await redis.del(`course-${courseId}`);
    res.status(200).json({
      success: true,
      message: "Course deleted successfully",
      course,
    });
  }
);  