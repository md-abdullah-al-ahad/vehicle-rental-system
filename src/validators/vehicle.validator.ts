import { z } from "zod";

export const addVehicleSchema = z.object({
  vehicle_name: z
    .string({ error: "Vehicle name is required" })
    .min(1, "Vehicle name is required")
    .max(120, "Vehicle name must be at most 120 characters"),
  type: z.enum(["car", "bike", "van", "SUV"] as const, {
    error: "Type must be one of: car, bike, van, SUV",
  }),
  registration_number: z
    .string({ error: "Registration number is required" })
    .min(1, "Registration number is required")
    .max(80, "Registration number must be at most 80 characters"),
  daily_rent_price: z
    .number({ error: "Daily rent price is required" })
    .positive("Daily rent price must be positive"),
  availability_status: z
    .enum(["available", "booked"] as const, {
      error: "Status must be 'available' or 'booked'",
    })
    .default("available"),
});

export const updateVehicleSchema = z
  .object({
    vehicle_name: z
      .string()
      .min(1, "Vehicle name cannot be empty")
      .max(120, "Vehicle name must be at most 120 characters")
      .optional(),
    type: z
      .enum(["car", "bike", "van", "SUV"] as const, {
        error: "Type must be one of: car, bike, van, SUV",
      })
      .optional(),
    registration_number: z
      .string()
      .min(1, "Registration number cannot be empty")
      .max(80, "Registration number must be at most 80 characters")
      .optional(),
    daily_rent_price: z
      .number()
      .positive("Daily rent price must be positive")
      .optional(),
    availability_status: z
      .enum(["available", "booked"] as const, {
        error: "Status must be 'available' or 'booked'",
      })
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });
