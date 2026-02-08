import { z } from "zod";

export const signupSchema = z.object({
  name: z
    .string({ error: "Name is required" })
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters"),
  email: z
    .string({ error: "Email is required" })
    .email("Please provide a valid email address")
    .transform((val) => val.toLowerCase()),
  password: z
    .string({ error: "Password is required" })
    .min(6, "Password must be at least 6 characters"),
  phone: z
    .string({ error: "Phone number is required" })
    .min(5, "Phone number must be at least 5 characters")
    .max(30, "Phone number must be at most 30 characters"),
});

export const signinSchema = z.object({
  email: z
    .string({ error: "Email is required" })
    .email("Please provide a valid email address"),
  password: z
    .string({ error: "Password is required" })
    .min(1, "Password is required"),
});
