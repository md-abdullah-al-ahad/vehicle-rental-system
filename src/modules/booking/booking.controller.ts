import { Request, Response } from "express";
import pool, { Query } from "pg";
import bookingService from "./booking.service";
const createBooking = async (req: Request, res: Response) => {
  try {
    const bookingData = await bookingService.createBooking(req.body);
    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: bookingData,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export { createBooking };
