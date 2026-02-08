import { Request, Response, NextFunction } from "express";
import { userService } from "./user.service";
import { AppError } from "../../utils/AppError";

const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
    const result = await userService.getAllUsers(page, limit);
    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (err) {
    next(err);
  }
};

const updateUserById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.params.userId as string;
    const updatedUser = await userService.updateUserById(
      userId,
      req.body,
      req.user!,
    );
    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (err) {
    next(err);
  }
};

const deleteUserById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.params.userId as string;
    const deleted = await userService.deleteUserById(userId);
    if (!deleted) {
      throw new AppError("User not found", 404);
    }
    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};

export { getAllUsers, updateUserById, deleteUserById };
