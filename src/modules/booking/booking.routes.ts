import { Router } from "express";
import { createBooking } from "./booking.controller";
import { auth } from "../../middlewares/auth";

const router = Router();

router.post("/", auth(), createBooking);
export const bookingRouter = router;
