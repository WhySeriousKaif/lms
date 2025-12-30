import mongoose, { Document, Schema, model } from 'mongoose';
import { IUser } from './user.model';

export interface IOrder extends Document {
    courseId:string;
    userId:string;
    payment_info:object;
}

const orderSchema: Schema<IOrder> = new mongoose.Schema({
    courseId:{
        type:String,
        required:true,
    },
    userId:{
        type:String,
        required:true,
    },
    payment_info:{
        type:Object,
        // required:true,
    },
}, {timestamps:true});

const OrderModel = model<IOrder>('Order', orderSchema);
export default OrderModel;