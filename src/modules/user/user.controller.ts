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
      message: "Unable to fetch users. Please try again later.",
      errors: error.message || "Internal server error",
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
    const userMessage = error.message.includes("Unauthorized")
      ? "You don't have permission to update this user."
      : error.message.includes("No valid fields")
        ? "No valid fields were provided for update."
        : "Unable to update user. Please try again later.";
    res.status(statusCode).json({
      success: false,
      message: userMessage,
      errors: error.message || "Internal server error",
    });
  }
};

const deleteUserById = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const deletedUser = await userService.deleteUserById(userId as string);
    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: "The requested user could not be found.",
        errors: `No user exists with the provided ID: ${userId}`,
      });
    }
    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error: any) {
    const userMessage = error.message.includes("active bookings")
      ? "Cannot delete this user as they have active bookings."
      : "Unable to delete user. Please try again later.";
    res.status(500).json({
      success: false,
      message: userMessage,
      errors: error.message || "Internal server error",
    });
  }
};

export { getAllUsers, updateUserById, deleteUserById };
