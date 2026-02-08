import { Request, Response, NextFunction } from "express";
import authService from "./auth.service";
import { AppError } from "../../utils/AppError";

const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await authService.createUser(req.body);
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: user,
    });
  } catch (err) {
    next(err); // Global error handler catches duplicate key → 409
  }
};

const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password);
    if (!result) {
      throw new AppError("Invalid email or password", 401);
    }
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export { createUser, loginUser };
