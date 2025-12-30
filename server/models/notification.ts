import mongoose, { Document, Schema, model } from 'mongoose';
import { IUser } from './user.model';

export interface INotification extends Document {
    title:string;
    message:string;
    status:string;
    userId:string;
}

const notificationSchema: Schema<INotification> = new mongoose.Schema({
    title:{
        type:String,        
        required:true,
    },
    message:{
        type:String,
        required:true,
    },
    status:{
        type:String,
        required:true,
    },
    userId:{
        type:String,
        required:true,
    },
}, {timestamps:true});

const NotificationModel = model<INotification>('Notification', notificationSchema);
export default NotificationModel;
