import { Request, Response } from "express";
import authService from "./auth.service";
const createUser = async (req: Request, res: Response) => {
  try {
    const user = await authService.createUser(req.body);
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: user,
    });
  } catch (err: any) {
    console.error(err);
    let userMessage = "Unable to register. Please try again later.";
    if (err.message.includes("duplicate") || err.message.includes("unique")) {
      userMessage = "An account with this email already exists.";
    } else if (err.message.includes("null value")) {
      userMessage = "Please fill in all required fields.";
    }
    res.status(500).json({
      success: false,
      message: userMessage,
      errors: err.message || "Internal server error",
    });
  }
};

const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const result = await authService.loginUser(email, password);
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Unable to log in. Please try again later.",
      errors: error.message || "Internal server error",
    });
  }
};

export { createUser, loginUser };
