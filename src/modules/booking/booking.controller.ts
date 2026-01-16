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
    let userMessage = "Unable to create booking. Please try again later.";
    if (err.message.includes("Vehicle not found")) {
      userMessage = "The selected vehicle does not exist.";
    } else if (err.message.includes("Customer not found")) {
      userMessage = "Invalid customer. Please check your account.";
    } else if (err.message.includes("not available")) {
      userMessage = "This vehicle is currently not available for booking.";
    } else if (err.message.includes("End date")) {
      userMessage = "Invalid dates. End date must be after start date.";
    }
    res.status(500).json({
      success: false,
      message: userMessage,
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
      message: "Unable to fetch bookings. Please try again later.",
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
        message: "The requested booking could not be found.",
        errors: `No booking exists with ID: ${bookingId}`,
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
    let userMessage = "Unable to update booking. Please try again later.";
    if (err.message.includes("Unauthorized")) {
      userMessage = "You don't have permission to update this booking.";
    } else if (err.message.includes("only cancel")) {
      userMessage = "You can only cancel your bookings, not modify them.";
    } else if (err.message.includes("after start date")) {
      userMessage = "Cannot cancel a booking that has already started.";
    }
    const statusCode =
      err.message.includes("Unauthorized") ||
      err.message.includes("only cancel") ||
      err.message.includes("after start date")
        ? 403
        : 500;
    res.status(statusCode).json({
      success: false,
      message: userMessage,
      errors: err.message || "Internal server error",
    });
  }
};

export { createBooking, getAllBookings, updateBookingById };
