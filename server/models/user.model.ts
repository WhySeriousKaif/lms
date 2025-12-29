import mongoose, { Document, Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';

const emailRegex: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
import dotenv from 'dotenv';
dotenv.config();

import jwt from 'jsonwebtoken';
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatar: {
    public_id: string;
    url: string;
  };
  role: string;
  isVerified: boolean;
  courses: Array<{ courseId: string }>;
  comparePassword: (password: string) => Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
  SignAccessToken: () => string;
  SignRefreshToken: () => string;
}

const userSchema: Schema<IUser> = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      minlength: [3, 'Name must be at least 3 characters long'],
      maxlength: [30, 'Name must be at most 30 characters long'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      validate: {
        validator: function (value: string) {
          return emailRegex.test(value);
        },
        message: 'Please enter a valid email',
      },
      unique: true,
    },
    password: {
      type: String,
      minlength: [8, 'Password must be at least 8 characters long'],
      maxlength: [32, 'Password must be at most 32 characters long'],
      select: false, // 🔥 SECURITY BEST PRACTICE
    },
    avatar: {
      public_id: String,
      url: String,
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    courses: [
      {
        courseId: String,
      },
    ],
  },
  { timestamps: true }
);

// ================= Hooks =================
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 10);
});

//sign access token
userSchema.methods.SignAccessToken = function () {
  return jwt.sign({id: this._id}, process.env.ACCESS_TOKEN as string, {expiresIn: '5m'});
};

//sign refresh token
userSchema.methods.SignRefreshToken = function () {
  return jwt.sign({id: this._id}, process.env.REFRESH_TOKEN as string, {expiresIn: '7d'});
};


// ================= Methods =================
userSchema.methods.comparePassword = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

const userModel = model<IUser>('User', userSchema);
export default userModel;
