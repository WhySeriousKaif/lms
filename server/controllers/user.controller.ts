import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import userModel, { IUser } from '../models/user.model';
import ErrorHandler from '../utils/ErrorHandler';
import { catchAsyncError } from '../middleware/catchAsyncError';
import dotenv from 'dotenv';
import sendMail from '../utils/sendMail';

dotenv.config();

// ================= Register User =================

interface RegisterUserBody {
  name: string;
  email: string;
  password: string;
  avatar?: string;
}

export const registerUser = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password } = req.body as RegisterUserBody;

    if (!name || !email || !password) {
      return next(new ErrorHandler('All fields are required', 400));
    }

    const userExists = await userModel.findOne({ email });
    if (userExists) {
      return next(new ErrorHandler('User already exists', 400));
    }

    const user = await userModel.create({
      name,
      email,
      password,
    });
    const activationData = createActivationToken(user);
    const data = {
      user: user.name,
      activationCode: activationData.activationCode,
    };
    
    // Send activation email (non-blocking - don't fail registration if email fails)
    sendMail({
      email: user.email,
      subject: 'Activate your account',
      template: 'activation-mail.ejs',
      data,
    }).catch((error) => {
      console.error('Failed to send activation email:', error.message);
      // Log error but don't block user registration
    });
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email for activation',
      activationCode: activationData.activationCode, // Include activation code in response for development
    });
  }
);

// ================= Activation Token =================

interface ActivationToken {
  token: string;
  activationCode: number;
}

export const createActivationToken = (user: IUser): ActivationToken => {
  const activationCode = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP

  const token = jwt.sign(
    {
      userId: user._id,
      activationCode,
    },
    process.env.JWT_SECRET as string,
    { expiresIn: '5m' }
  );

  return {
    token,
    activationCode,
  };
};