import { Request, Response, NextFunction } from "express";
import { z } from "zod";

export const validate = (
  schema: z.ZodSchema,
  source: "body" | "query" | "params" = "body",
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed. Please check your input.",
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }
    req[source] = result.data;
    next();
  };
};
