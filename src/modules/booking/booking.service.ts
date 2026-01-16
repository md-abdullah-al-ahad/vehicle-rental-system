import { pool } from "../../config/db";

const createBooking = async (bookingDetails: Record<string, unknown>) => {
  const { customer_id, vehicle_id, rent_start_date, rent_end_date } =
    bookingDetails;
  const vehicleResult = await pool.query(
    "SELECT id, vehicle_name, daily_rent_price, availability_status FROM vehicles WHERE id = $1",
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
  const vehicle = vehicleResult.rows[0];
  const dailyRentPrice = parseFloat(vehicle.daily_rent_price);
  const totalPrice = dailyRentPrice * totalDays;
  if (vehicle.availability_status !== "available") {
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
  const booking = bookingResult.rows[0];
  return {
    ...booking,
    total_price: parseFloat(booking.total_price),
    vehicle: {
      vehicle_name: vehicle.vehicle_name,
      daily_rent_price: dailyRentPrice,
    },
  };
};

const getAllBookings = async (currentUser: any) => {
  if (currentUser.role === "admin") {
    const bookings = await pool.query(`
      SELECT b.*, 
             u.name as customer_name, u.email as customer_email,
             v.vehicle_name, v.registration_number
      FROM bookings b
      JOIN users u ON b.customer_id = u.id
      JOIN vehicles v ON b.vehicle_id = v.id
    `);
    return bookings.rows.map((row: any) => ({
      id: row.id,
      customer_id: row.customer_id,
      vehicle_id: row.vehicle_id,
      rent_start_date: row.rent_start_date,
      rent_end_date: row.rent_end_date,
      total_price: parseFloat(row.total_price),
      status: row.status,
      customer: {
        name: row.customer_name,
        email: row.customer_email,
      },
      vehicle: {
        vehicle_name: row.vehicle_name,
        registration_number: row.registration_number,
      },
    }));
  } else {
    const bookings = await pool.query(
      `
      SELECT b.*, v.vehicle_name, v.registration_number, v.type
      FROM bookings b
      JOIN vehicles v ON b.vehicle_id = v.id
      WHERE b.customer_id = $1
    `,
      [currentUser.id]
    );
    return bookings.rows.map((row: any) => ({
      id: row.id,
      vehicle_id: row.vehicle_id,
      rent_start_date: row.rent_start_date,
      rent_end_date: row.rent_end_date,
      total_price: parseFloat(row.total_price),
      status: row.status,
      vehicle: {
        vehicle_name: row.vehicle_name,
        registration_number: row.registration_number,
        type: row.type,
      },
    }));
  }
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
  const booking = result.rows[0];

  if (currentUser.role === "admin") {
    if (status === "returned") {
      await pool.query(
        "UPDATE vehicles SET availability_status = $1 WHERE id = $2",
        ["available", booking.vehicle_id]
      );
      const updateResult = await pool.query(
        "UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *",
        [status, bookingId]
      );
      const updatedBooking = updateResult.rows[0];
      return {
        ...updatedBooking,
        total_price: parseFloat(updatedBooking.total_price),
        vehicle: {
          availability_status: "available",
        },
      };
    }
    const updateResult = await pool.query(
      "UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *",
      [status, bookingId]
    );
    return {
      ...updateResult.rows[0],
      total_price: parseFloat(updateResult.rows[0].total_price),
    };
  }

  if (currentUser.role === "customer") {
    if (booking.customer_id.toString() !== currentUser.id.toString()) {
      throw new Error("Unauthorized: You can only update your own bookings");
    }
    if (status !== "cancelled") {
      throw new Error("Customers can only cancel bookings");
    }
    const now = new Date();
    const startDate = new Date(booking.rent_start_date);
    if (now >= startDate) {
      throw new Error("Cannot cancel booking after start date");
    }
    await pool.query(
      "UPDATE vehicles SET availability_status = $1 WHERE id = $2",
      ["available", booking.vehicle_id]
    );
    const updateResult = await pool.query(
      "UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *",
      [status, bookingId]
    );
    return {
      ...updateResult.rows[0],
      total_price: parseFloat(updateResult.rows[0].total_price),
    };
  }
  return null;
};

export default { createBooking, getAllBookings, updateBookingById };
