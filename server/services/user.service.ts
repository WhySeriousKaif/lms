import userModel from "../models/user.model";

//get user by id
export const getUserById = async (id: string) => {
    const user = await userModel.findById(id);
    return user;
}