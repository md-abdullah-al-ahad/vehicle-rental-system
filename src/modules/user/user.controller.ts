import { Request, Response } from "express";
import { userService } from "./user.service";
const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: users,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve users",
      error: error.message,
    });
  }
};

const updateUserById = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const updatedData = req.body;
    const currentUser = req.user;
    const updatedUser = await userService.updateUserById(
      userId as string,
      updatedData,
      currentUser
    );
    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error: any) {
    const statusCode = error.message.includes("Unauthorized") ? 403 : 500;
    res.status(statusCode).json({
      success: false,
      message: "Failed to update user",
      error: error.message,
    });
  }
};

export { getAllUsers, updateUserById };
