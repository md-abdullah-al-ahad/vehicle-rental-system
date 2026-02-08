import { z } from "zod";

export const updateUserSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must be at most 100 characters")
      .optional(),
    email: z
      .string()
      .email("Please provide a valid email address")
      .transform((val) => val.toLowerCase())
      .optional(),
    phone: z
      .string()
      .min(5, "Phone number must be at least 5 characters")
      .max(30, "Phone number must be at most 30 characters")
      .optional(),
    role: z
      .enum(["admin", "customer"] as const, {
        error: "Role must be 'admin' or 'customer'",
      })
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });
