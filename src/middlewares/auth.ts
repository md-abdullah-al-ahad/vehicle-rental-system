import { Request, Response, NextFunction } from "express";
import config from "../config";
import jwt from "jsonwebtoken";
import { AuthPayload } from "../types/interfaces";

const auth = (...roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({
          success: false,
          message: "Authentication required. Please log in to continue.",
          errors: "No authorization token provided in request headers",
        });
      }
      if (!authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
          success: false,
          message: "Invalid authentication format. Please log in again.",
          errors: "Authorization header must use Bearer token format",
        });
      }
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, config.jwtSecret) as AuthPayload;
      req.user = decoded;
      if (roles.length && !roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: "You don't have permission to perform this action.",
          errors: `Access denied. Required role(s): ${roles.join(", ")}. Your role: ${req.user.role}`,
        });
      }
      next();
    } catch (err: unknown) {
      const error = err as Error & { name: string };
      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({
          success: false,
          message: "Your session is invalid. Please log in again.",
          errors: "JWT verification failed: Invalid or malformed token",
        });
      }
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Your session has expired. Please log in again.",
          errors: "JWT token has expired",
        });
      }
      res.status(500).json({
        success: false,
        message: "An unexpected error occurred during authentication.",
      });
    }
  };
};

export { auth };
