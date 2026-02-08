import { Request, Response, NextFunction } from "express";
import bookingService from "./booking.service";
import { AppError } from "../../utils/AppError";

const createBooking = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Use authenticated user's ID — prevents impersonation
    const bookingData = await bookingService.createBooking({
      ...req.body,
      customer_id: req.user!.id,
    });
    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: bookingData,
    });
  } catch (err) {
    next(err);
  }
};

const getAllBookings = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
    const result = await bookingService.getAllBookings(req.user!, page, limit);
    const message =
      req.user?.role === "admin"
        ? "Bookings retrieved successfully"
        : "Your bookings retrieved successfully";
    res.status(200).json({
      success: true,
      message,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (err) {
    next(err);
  }
};

const updateBookingById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { status } = req.body;
    const bookingId = req.params.bookingId as string;
    const updatedBooking = await bookingService.updateBookingById(
      bookingId,
      status,
      req.user!,
    );
    if (!updatedBooking) {
      throw new AppError("Booking not found", 404);
    }
    let message = "Booking updated successfully";
    if (status === "cancelled") message = "Booking cancelled successfully";
    else if (status === "returned")
      message = "Booking marked as returned. Vehicle is now available";
    res.status(200).json({
      success: true,
      message,
      data: updatedBooking,
    });
  } catch (err) {
    next(err);
  }
};

export { createBooking, getAllBookings, updateBookingById };
