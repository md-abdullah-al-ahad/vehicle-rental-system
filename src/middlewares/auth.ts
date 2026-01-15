import { Request, Response, NextFunction } from "express";
import config from "../config";
import jwt, { JwtPayload } from "jsonwebtoken";
const auth = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        return res.status(401).json({ message: "No token provided" });
      }
      const decoded = jwt.verify(token, config.JWT_SECRET as string);
      req.user = decoded as JwtPayload;
      next();
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  };
};

export { auth };
