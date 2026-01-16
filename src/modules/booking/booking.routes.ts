import { Router } from "express";
import {
  createBooking,
  getAllBookings,
  updateBookingById,
} from "./booking.controller";
import { auth } from "../../middlewares/auth";

const router = Router();

router.post("/", auth(), createBooking);
router.get("/", auth("admin"), getAllBookings);
router.put("/:bookingId", auth("admin", "customer"), updateBookingById);
export const bookingRouter = router;
