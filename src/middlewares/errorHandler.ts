import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import logger from "../utils/logger";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  // Handle known operational errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Handle PostgreSQL duplicate key errors
  if (
    err.message?.includes("duplicate key") ||
    err.message?.includes("unique")
  ) {
    return res.status(409).json({
      success: false,
      message: "A record with this information already exists.",
    });
  }

  // Handle PostgreSQL foreign key errors
  if (err.message?.includes("violates foreign key")) {
    return res.status(400).json({
      success: false,
      message: "Referenced resource does not exist.",
    });
  }

  // Handle PostgreSQL check constraint errors
  if (err.message?.includes("violates check constraint")) {
    return res.status(400).json({
      success: false,
      message: "Invalid data. Please check your input values.",
    });
  }

  // Log unexpected errors
  logger.error("Unexpected error:", err);

  res.status(500).json({
    success: false,
    message: "An unexpected error occurred. Please try again later.",
  });
};
