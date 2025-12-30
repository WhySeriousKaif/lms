import userModel from "../models/user.model";
import { Request, Response, NextFunction } from "express";

//get user by id
export const getUserById = async (id: string) => {
    const user = await userModel.findById(id);
    return user;
}

//get all users
export const getAllUsersService = async (req: Request, res: Response) => {
    const users = await userModel.find().sort({createdAt:-1});
    res.status(200).json({
        success: true,
        users,
    });


}

//update user role -- only for admin
export const updateUserRoleService = async (userId: string, role: string) => {
    const user = await userModel.findByIdAndUpdate(userId, { role }, { new: true });
    return user;
}