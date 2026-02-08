import { z } from "zod";

export const createBookingSchema = z
  .object({
    vehicle_id: z
      .number({ error: "Vehicle ID is required" })
      .int("Vehicle ID must be an integer")
      .positive("Vehicle ID must be positive"),
    rent_start_date: z
      .string({ error: "Start date is required" })
      .datetime({ message: "Start date must be a valid ISO date" })
      .or(
        z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be YYYY-MM-DD format"),
      ),
    rent_end_date: z
      .string({ error: "End date is required" })
      .datetime({ message: "End date must be a valid ISO date" })
      .or(
        z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be YYYY-MM-DD format"),
      ),
  })
  .refine(
    (data) => new Date(data.rent_end_date) > new Date(data.rent_start_date),
    { message: "End date must be after start date", path: ["rent_end_date"] },
  );

export const updateBookingSchema = z.object({
  status: z.enum(["active", "cancelled", "returned"] as const, {
    error: "Status must be 'active', 'cancelled', or 'returned'",
  }),
});
