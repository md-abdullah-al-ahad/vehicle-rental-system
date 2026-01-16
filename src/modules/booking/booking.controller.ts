import { Request, Response } from "express";
import bookingService from "./booking.service";

const createBooking = async (req: Request, res: Response) => {
  try {
    const bookingData = await bookingService.createBooking(req.body);
    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: bookingData,
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to create booking",
      errors: err.message || "Internal server error",
    });
  }
};

const getAllBookings = async (req: Request, res: Response) => {
  try {
    const currentUser = req.user;
    const bookings = await bookingService.getAllBookings(currentUser);
    const message =
      currentUser?.role === "admin"
        ? "Bookings retrieved successfully"
        : "Your bookings retrieved successfully";
    res.status(200).json({
      success: true,
      message,
      data: bookings,
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve bookings",
      errors: err.message || "Internal server error",
    });
  }
};

const updateBookingById = async (req: Request, res: Response) => {
  const status = req.body.status;
  const bookingId = req.params.bookingId;
  const currentUser = req.user;
  try {
    const updatedBooking = await bookingService.updateBookingById(
      bookingId as string,
      status,
      currentUser
    );
    if (!updatedBooking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
        errors: "Booking not found",
      });
    }
    let message = "Booking updated successfully";
    if (status === "cancelled") {
      message = "Booking cancelled successfully";
    } else if (status === "returned") {
      message = "Booking marked as returned. Vehicle is now available";
    }
    res.status(200).json({
      success: true,
      message,
      data: updatedBooking,
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to update booking",
      errors: err.message || "Internal server error",
    });
  }
};

export { createBooking, getAllBookings, updateBookingById };
