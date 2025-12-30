import mongoose, { Document, Schema, model } from 'mongoose';
import { IUser } from './user.model';

interface IComment extends Document {
    user: IUser;
    comment: string;
    commentReplies?: IComment[];
}

interface IReview extends Document {
    user: IUser;
    rating: number;
    comment: string;
    createdAt: Date;
    commentReplies: IComment[];
}

interface ILink extends Document {
    title: string;
    url: string;
}

interface ICourseData extends Document {
    title: string;
    description: string;
    videoUrl: string;
    videoThumbnail:object;
    videoSection:string;
    videoLength:number;
    videoPlayerUrl:string;
    links:ILink[];
    suggestions:string;
    questions:IComment[];
   
   
   
}
interface ICourse extends Document {
    name: string;
    description: string;
    price: number;
    estimatedPrice: number;
    thumbnail:object;
    tags: string;
    level: string;
    demoUrl: string;
    benefits: {title: string; description: string}[];
    prerequisites: {title: string; description: string}[];
    reviews: IReview[];
    courseData: ICourseData[];
    ratings: number;
    purchased: number;
}
const reviewSchema = new Schema<IReview>({
    user:Object,
    rating:{
        type:Number,
        default:0,
    },
    comment:{
        type:String,
      
    },
    createdAt:{
        type:Date,
        default:Date.now,
    },
    commentReplies: [Object], // Array of comment replies
}, {timestamps: true});
const commentSchema = new Schema<IComment>({
    user:Object,
    comment:{
        type:String,
    },
    commentReplies: [Object],
}, {timestamps: true});
const linkSchema = new Schema<ILink>({
    title:String,
    url:String,
});

const courseDataSchema = new Schema<ICourseData>({
    title:String,
    description:String,
    videoUrl:String,
    videoSection:String,
    videoLength:Number,
    videoPlayerUrl:String,
    links: [linkSchema],
    suggestions:String,
    questions: [commentSchema],
});

const courseSchema = new Schema<ICourse>({
    name:String,
    description:String,
    price:Number,
    estimatedPrice:Number,
    thumbnail:{
        public_id:{
            type:String,
        },
        url:{
            type:String,
        },
    },
    tags:{
        required:true,
        type:String,
    },
    level:{
        required:true,
        type:String,
    },
    demoUrl:{
        required:true,
        type:String,
    },
    benefits: [{title: String, description: String}],
    prerequisites: [{title: String, description: String}],
    reviews: [reviewSchema],
    courseData: [courseDataSchema],
    ratings: {
        type:Number,
        default:0,
    },
    purchased: {
        type:Number,
        default:0,
    },
}, {timestamps: true});

const CourseModel = model<ICourse>('Course', courseSchema);
export default CourseModel;