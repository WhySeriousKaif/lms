import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import userModel, { IUser } from "../models/user.model";
import ErrorHandler from "../utils/ErrorHandler";
import { catchAsyncError } from "../middleware/catchAsyncError";
import sendMail from "../utils/sendMail";
import { sendToken } from "../utils/jwt";
import { redis } from "../utils/redis";
import { getUserById } from "../services/user.service";
import cloudinary from "cloudinary";

dotenv.config();

// ================= Register =================

interface RegisterUserBody {
  name: string;
  email: string;
  password: string;
}

export const registerUser = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password } = req.body as RegisterUserBody;

    if (!name || !email || !password) {
      return next(new ErrorHandler("All fields are required", 400));
    }

    const userExists = await userModel.findOne({ email });
    if (userExists) {
      return next(new ErrorHandler("User already exists", 400));
    }

    const user = await userModel.create({
      name,
      email,
      password,
      isVerified: false,
    });

    const { token, activationCode } = createActivationToken(user);

    await sendMail({
      email: user.email,
      subject: "Activate your account",
      template: "activation-mail.ejs",
      data: {
        user: {
          name: user.name,
        },
        activationCode,
      },
    });

    res.status(201).json({
      success: true,
      message: "Registration successful. Please verify your email.",
      activationToken: token,
    });
  }
);

// ================= Activation Token =================

export const createActivationToken = (user: IUser) => {
  const activationCode = Math.floor(100000 + Math.random() * 900000);

  const token = jwt.sign(
    {
      userId: user._id,
      activationCode,
    },
    process.env.JWT_SECRET as string,
    { expiresIn: "5m" }
  );

  return { token, activationCode };
};

// ================= Activate User =================

interface IActivationRequest {
  activation_token: string;
  activation_code: string;
}

export const activateUser = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { activation_token, activation_code } =
      req.body as IActivationRequest;

    const decoded = jwt.verify(
      activation_token,
      process.env.JWT_SECRET as string
    ) as { userId: string; activationCode: number };

    if (decoded.activationCode !== Number(activation_code)) {
      return next(new ErrorHandler("Invalid activation code", 400));
    }

    const user = await userModel.findById(decoded.userId);

    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    if (user.isVerified) {
      return next(new ErrorHandler("User already activated", 400));
    }

    user.isVerified = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Account activated successfully",
    });
  }
);

// ================= Login User =================
interface ILoginRequest {
  email: string;
  password: string;
}

export const loginUser = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body as ILoginRequest;
    if (!email || !password) {
      return next(new ErrorHandler("All fields are required", 400));
    }
    const user = await userModel.findOne({ email }).select("+password");
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }
    if (!user.isVerified) {
      return next(new ErrorHandler("Please verify your email first", 400));
    }
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return next(new ErrorHandler("Invalid password", 400));
    }
    sendToken(user, res, "Logged in successfully", 200);
  }
);

// ================= Logout User =================

export const logoutUser = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?._id?.toString() || "";

    res.cookie("refreshToken", "", {
      maxAge: 1,
    });
    res.cookie("accessToken", "", {
      maxAge: 1,
      httpOnly: true,
      sameSite: "lax",
    });

    res.clearCookie("refreshToken");

    res.status(200).json({ success: true, message: "Logged out successfully" });
  }
);

//update access token
export const updateAccessToken = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    sendToken(req.user, res, "Access token updated successfully", 200);
  }
);

//get user info
export const getUserInfo = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await getUserById(req.user._id.toString());

    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    res.status(200).json({
      success: true,
      user,
    });
  }
);

interface ISocialAuthRequest {
  email: string;
  name: string;
  avatar?: {
    public_id?: string;
    url?: string;
  };
}
//social auth
export const socialAuth = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, name, avatar } = req.body as ISocialAuthRequest;
    
    if (!email || !name) {
      return next(new ErrorHandler("Email and name are required", 400));
    }
    
    const user = await userModel.findOne({ email });
    if (!user) {
      const newUser = await userModel.create({ 
        email, 
        name, 
        avatar: avatar || { public_id: "", url: "" },
        isVerified: true, // Social auth users are auto-verified
      });
      sendToken(newUser, res, "User created successfully", 201);
    } else {
      sendToken(user, res, "User logged in successfully", 200);
    }
  }
);


//update user info
interface IUpdateUserInfo {
  name?: string;
  email?: string;
  avatar?: {
    public_id?: string;
    url?: string;
  };
}
export const updateUserInfo = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, avatar } = req.body as IUpdateUserInfo;
    const userId = req.user._id.toString();
    
    // Check if email is being updated and if it already exists
    if (email && email !== req.user.email) {
      const emailExists = await userModel.findOne({ email });
      if (emailExists) {
        return next(new ErrorHandler("Email already exists", 400));
      }
    }
    
    // Build update object with only provided fields
    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (avatar) updateData.avatar = avatar;
    
    const user = await userModel.findByIdAndUpdate(
      userId, 
      updateData, 
      { new: true, runValidators: true }
    );
    
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }
    
    // Update Redis cache
    await redis.set(userId, JSON.stringify(user));
    
    res.status(200).json({ 
      success: true, 
      message: "User info updated successfully", 
      user 
    });
  }
);

//update user password
interface IUpdateUserPassword {
  oldPassword: string;
  newPassword: string;
}
export const updateUserPassword = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { oldPassword, newPassword } = req.body as IUpdateUserPassword;

    if(!oldPassword || !newPassword) {
      return next(new ErrorHandler("All fields are required", 400));
    }

    const user = await userModel.findById(req.user._id.toString()).select("+password");
    if(user?.password===undefined) {
      return next(new ErrorHandler("User not found", 404));
    }
    const isPasswordMatch = await user?.comparePassword(oldPassword);
    if (!isPasswordMatch) {
      return next(new ErrorHandler("Old password is incorrect", 400));
    }

    user.password = newPassword;
    await user.save();
    await redis.set(req.user._id.toString(), JSON.stringify(user));

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  }
);

//update profile picture
interface IUpdateProfilePicture {
  avatar: string; // Base64 string or data URL
}
export const updateProfilePicture = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { avatar } = req.body as IUpdateProfilePicture;
    
    if (!avatar) {
      return next(new ErrorHandler("Avatar is required", 400));
    }
    
    const userId = req.user._id.toString();
    const user = await userModel.findById(userId);
    
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }
    
    // If user already has an avatar, delete the old one from Cloudinary
    if (user.avatar?.public_id) {
      try {
        await cloudinary.v2.uploader.destroy(user.avatar.public_id);
      } catch (error) {
        // Log error but continue with upload
        console.error("Error deleting old avatar:", error);
      }
    }
    
    // Upload new avatar to Cloudinary
    const myCloud = await cloudinary.v2.uploader.upload(avatar, {
      folder: "avatars",
      width: 150,
      height: 150,
      crop: "scale",
    });
    
    // Update user avatar
    user.avatar = {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    };
    
    await user.save();
    
    // Update Redis cache
    await redis.set(userId, JSON.stringify(user));
    
    res.status(200).json({
      success: true,
      message: "Profile picture updated successfully",
      user,
    });
  }
);