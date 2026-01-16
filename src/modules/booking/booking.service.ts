import { pool } from "../../config/db";

const createBooking = async (bookingDetails: Record<string, unknown>) => {
  const { customer_id, vehicle_id, rent_start_date, rent_end_date } =
    bookingDetails;
  const vehicleResult = await pool.query(
    "SELECT daily_rent_price, availability_status FROM vehicles WHERE id = $1",
    [vehicle_id]
  );
  if (vehicleResult.rows.length === 0) {
    throw new Error("Vehicle not found");
  }
  const customerResult = await pool.query(
    "SELECT id FROM users WHERE id = $1",
    [customer_id]
  );
  if (customerResult.rows.length === 0) {
    throw new Error("Customer not found");
  }
  const totalDays =
    (new Date(rent_end_date as string).getTime() -
      new Date(rent_start_date as string).getTime()) /
    (1000 * 3600 * 24);
  if (totalDays <= 0) {
    throw new Error("End date must be after start date");
  }
  const dailyRentPrice = vehicleResult.rows[0].daily_rent_price;
  const totalPrice = dailyRentPrice * totalDays;
  if (vehicleResult.rows[0].availability_status !== "available") {
    throw new Error("Vehicle is not available for booking");
  }
  const bookingResult = await pool.query(
    `INSERT INTO bookings (customer_id, vehicle_id, rent_start_date, rent_end_date, total_price) 
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [customer_id, vehicle_id, rent_start_date, rent_end_date, totalPrice]
  );
  await pool.query(
    "UPDATE vehicles SET availability_status = $1 WHERE id = $2",
    ["booked", vehicle_id]
  );
  return bookingResult.rows[0];
};

const getAllBookings = async () => {
  const bookings = await pool.query("SELECT * FROM bookings");
  return bookings.rows;
};

const updateBookingById = async (
  bookingId: string,
  status: string,
  currentUser: any
) => {
  const result = await pool.query("SELECT * FROM bookings WHERE id = $1", [
    bookingId,
  ]);
  if (result.rows.length === 0) {
    return null;
  }
  if (currentUser.role === "admin") {
    const updateResult = await pool.query(
      "UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *",
      [status, bookingId]
    );
    return updateResult.rows[0];
  }
  if (currentUser.role === "customer") {
    const booking = result.rows[0];
    if (booking.customer_id.toString() !== currentUser.userId.toString()) {
      throw new Error("Unauthorized: You can only update your own bookings");
    }
    if (status !== "cancelled") {
      throw new Error("Customers can only cancel bookings");
    }
    const updateResult = await pool.query(
      "UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *",
      [status, bookingId]
    );
    return updateResult.rows[0];
  }
  return null;
};

export default { createBooking, getAllBookings, updateBookingById };
