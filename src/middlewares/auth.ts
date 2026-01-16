import { Request, Response, NextFunction } from "express";
import config from "../config";
import jwt, { JwtPayload } from "jsonwebtoken";

const auth = (...roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized: No token provided",
          errors: "Unauthorized: No token provided",
        });
      }
      if (!authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized: Invalid token format",
          errors: "Unauthorized: Invalid token format",
        });
      }
      const token = authHeader.substring(7);
      const decoded = jwt.verify(
        token,
        config.JWT_SECRET as string
      ) as JwtPayload;
      req.user = decoded;
      if (roles.length && !roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: Access denied",
          errors: "Forbidden: Access denied",
        });
      }
      next();
    } catch (err: any) {
      if (err.name === "JsonWebTokenError") {
        return res.status(401).json({
          success: false,
          message: "Unauthorized: Invalid token",
          errors: "Unauthorized: Invalid token",
        });
      }
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Unauthorized: Token expired",
          errors: "Unauthorized: Token expired",
        });
      }
      res.status(500).json({
        success: false,
        message: "Internal server error",
        errors: err.message || "Internal server error",
      });
    }
  };
};

export { auth };
