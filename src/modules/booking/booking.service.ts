import { pool } from "../../config/db";
import { AppError } from "../../utils/AppError";
import { AuthPayload, PaginatedResponse } from "../../types/interfaces";

const createBooking = async (bookingDetails: {
  vehicle_id: number;
  rent_start_date: string;
  rent_end_date: string;
  customer_id: number;
}) => {
  const { customer_id, vehicle_id, rent_start_date, rent_end_date } =
    bookingDetails;

  // Use a transaction to prevent double-booking race conditions
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Lock the vehicle row to prevent concurrent bookings
    const vehicleResult = await client.query(
      "SELECT id, vehicle_name, daily_rent_price, availability_status FROM vehicles WHERE id = $1 FOR UPDATE",
      [vehicle_id],
    );
    if (vehicleResult.rows.length === 0) {
      throw new AppError("Vehicle not found", 404);
    }

    const vehicle = vehicleResult.rows[0];
    if (vehicle.availability_status !== "available") {
      throw new AppError("Vehicle is not available for booking", 400);
    }

    const totalDays =
      (new Date(rent_end_date).getTime() -
        new Date(rent_start_date).getTime()) /
      (1000 * 3600 * 24);
    if (totalDays <= 0) {
      throw new AppError("End date must be after start date", 400);
    }

    const dailyRentPrice = parseFloat(vehicle.daily_rent_price);
    const totalPrice = dailyRentPrice * totalDays;

    const bookingResult = await client.query(
      `INSERT INTO bookings (customer_id, vehicle_id, rent_start_date, rent_end_date, total_price) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [customer_id, vehicle_id, rent_start_date, rent_end_date, totalPrice],
    );

    await client.query(
      "UPDATE vehicles SET availability_status = $1 WHERE id = $2",
      ["booked", vehicle_id],
    );

    await client.query("COMMIT");

    const booking = bookingResult.rows[0];
    return {
      ...booking,
      total_price: parseFloat(booking.total_price),
      vehicle: {
        vehicle_name: vehicle.vehicle_name,
        daily_rent_price: dailyRentPrice,
      },
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

const getAllBookings = async (
  currentUser: AuthPayload,
  page = 1,
  limit = 10,
): Promise<PaginatedResponse<Record<string, unknown>>> => {
  const offset = (page - 1) * limit;

  if (currentUser.role === "admin") {
    const countResult = await pool.query("SELECT COUNT(*) FROM bookings");
    const total = parseInt(countResult.rows[0].count, 10);

    const bookings = await pool.query(
      `SELECT b.*, 
             u.name as customer_name, u.email as customer_email,
             v.vehicle_name, v.registration_number
      FROM bookings b
      JOIN users u ON b.customer_id = u.id
      JOIN vehicles v ON b.vehicle_id = v.id
      ORDER BY b.id DESC
      LIMIT $1 OFFSET $2`,
      [limit, offset],
    );

    return {
      data: bookings.rows.map((row: Record<string, unknown>) => ({
        id: row.id,
        customer_id: row.customer_id,
        vehicle_id: row.vehicle_id,
        rent_start_date: row.rent_start_date,
        rent_end_date: row.rent_end_date,
        total_price: parseFloat(row.total_price as string),
        status: row.status,
        customer: {
          name: row.customer_name,
          email: row.customer_email,
        },
        vehicle: {
          vehicle_name: row.vehicle_name,
          registration_number: row.registration_number,
        },
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  } else {
    const countResult = await pool.query(
      "SELECT COUNT(*) FROM bookings WHERE customer_id = $1",
      [currentUser.id],
    );
    const total = parseInt(countResult.rows[0].count, 10);

    const bookings = await pool.query(
      `SELECT b.*, v.vehicle_name, v.registration_number, v.type
      FROM bookings b
      JOIN vehicles v ON b.vehicle_id = v.id
      WHERE b.customer_id = $1
      ORDER BY b.id DESC
      LIMIT $2 OFFSET $3`,
      [currentUser.id, limit, offset],
    );

    return {
      data: bookings.rows.map((row: Record<string, unknown>) => ({
        id: row.id,
        vehicle_id: row.vehicle_id,
        rent_start_date: row.rent_start_date,
        rent_end_date: row.rent_end_date,
        total_price: parseFloat(row.total_price as string),
        status: row.status,
        vehicle: {
          vehicle_name: row.vehicle_name,
          registration_number: row.registration_number,
          type: row.type,
        },
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
};

const updateBookingById = async (
  bookingId: string,
  status: string,
  currentUser: AuthPayload,
) => {
  const result = await pool.query("SELECT * FROM bookings WHERE id = $1", [
    bookingId,
  ]);
  if (result.rows.length === 0) {
    return null;
  }
  const booking = result.rows[0];

  if (currentUser.role === "admin") {
    // Use transaction for status changes that affect vehicle availability
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      if (status === "returned" || status === "cancelled") {
        await client.query(
          "UPDATE vehicles SET availability_status = $1 WHERE id = $2",
          ["available", booking.vehicle_id],
        );
      }

      const updateResult = await client.query(
        "UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *",
        [status, bookingId],
      );

      await client.query("COMMIT");

      const updatedBooking = updateResult.rows[0];
      return {
        ...updatedBooking,
        total_price: parseFloat(updatedBooking.total_price),
      };
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }

  if (currentUser.role === "customer") {
    if (booking.customer_id.toString() !== currentUser.id.toString()) {
      throw new AppError("You can only update your own bookings", 403);
    }
    if (status !== "cancelled") {
      throw new AppError("Customers can only cancel bookings", 403);
    }
    const now = new Date();
    const startDate = new Date(booking.rent_start_date);
    if (now >= startDate) {
      throw new AppError(
        "Cannot cancel a booking that has already started",
        403,
      );
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      await client.query(
        "UPDATE vehicles SET availability_status = $1 WHERE id = $2",
        ["available", booking.vehicle_id],
      );
      const updateResult = await client.query(
        "UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *",
        [status, bookingId],
      );

      await client.query("COMMIT");

      return {
        ...updateResult.rows[0],
        total_price: parseFloat(updateResult.rows[0].total_price),
      };
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }

  return null;
};

export default { createBooking, getAllBookings, updateBookingById };
