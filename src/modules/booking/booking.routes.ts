import { Router } from "express";
import {
  createBooking,
  getAllBookings,
  updateBookingById,
} from "./booking.controller";
import { auth } from "../../middlewares/auth";
import { validate } from "../../middlewares/validate";
import {
  createBookingSchema,
  updateBookingSchema,
} from "../../validators/booking.validator";

const router = Router();

router.post("/", auth(), validate(createBookingSchema), createBooking);
router.get("/", auth("admin", "customer"), getAllBookings);
router.put(
  "/:bookingId",
  auth("admin", "customer"),
  validate(updateBookingSchema),
  updateBookingById,
);

export const bookingRouter = router;
