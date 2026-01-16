import { Router } from "express";
import { createBooking, getAllBookings } from "./booking.controller";
import { auth } from "../../middlewares/auth";

const router = Router();

router.post("/", auth(), createBooking);
router.get("/", auth("admin"), getAllBookings);
export const bookingRouter = router;
