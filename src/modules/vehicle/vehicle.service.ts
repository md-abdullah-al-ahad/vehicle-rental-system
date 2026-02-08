import { pool } from "../../config/db";
import { AppError } from "../../utils/AppError";
import { Vehicle, PaginatedResponse } from "../../types/interfaces";

const addVehicle = async (payload: {
  vehicle_name: string;
  type: string;
  registration_number: string;
  daily_rent_price: number;
  availability_status?: string;
}): Promise<Vehicle> => {
  const {
    vehicle_name,
    type,
    registration_number,
    daily_rent_price,
    availability_status,
  } = payload;
  const result = await pool.query(
    "INSERT INTO vehicles (vehicle_name, type, registration_number, daily_rent_price, availability_status) VALUES ($1, $2, $3, $4, $5) RETURNING *",
    [
      vehicle_name,
      type,
      registration_number,
      daily_rent_price,
      availability_status || "available",
    ],
  );
  const vehicle = result.rows[0];
  if (vehicle.daily_rent_price) {
    vehicle.daily_rent_price = parseFloat(vehicle.daily_rent_price);
  }
  return vehicle as Vehicle;
};

const getAllVehicles = async (
  page = 1,
  limit = 10,
): Promise<PaginatedResponse<Vehicle>> => {
  const offset = (page - 1) * limit;

  const countResult = await pool.query("SELECT COUNT(*) FROM vehicles");
  const total = parseInt(countResult.rows[0].count, 10);

  const result = await pool.query(
    "SELECT * FROM vehicles ORDER BY id LIMIT $1 OFFSET $2",
    [limit, offset],
  );

  const data = result.rows.map((vehicle) => ({
    ...vehicle,
    daily_rent_price: vehicle.daily_rent_price
      ? parseFloat(vehicle.daily_rent_price)
      : vehicle.daily_rent_price,
  }));

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getVehicleById = async (vehicleId: string): Promise<Vehicle | null> => {
  const result = await pool.query("SELECT * FROM vehicles WHERE id = $1", [
    vehicleId,
  ]);
  const vehicle = result.rows[0];
  if (vehicle && vehicle.daily_rent_price) {
    vehicle.daily_rent_price = parseFloat(vehicle.daily_rent_price);
  }
  return (vehicle as Vehicle) || null;
};
const updateVehicleById = async (
  vehicleId: string,
  updatedData: Record<string, unknown>,
): Promise<Vehicle | null> => {
  const allowedFields = [
    "vehicle_name",
    "type",
    "registration_number",
    "daily_rent_price",
    "availability_status",
  ];

  const fieldsToUpdate = Object.keys(updatedData).filter(
    (key) => allowedFields.includes(key) && updatedData[key] !== undefined,
  );

  if (fieldsToUpdate.length === 0) {
    throw new AppError("No valid fields provided for update", 400);
  }

  const setClause = fieldsToUpdate
    .map((field, index) => `${field} = $${index + 1}`)
    .join(", ");

  const values = fieldsToUpdate.map((field) => updatedData[field]);
  values.push(vehicleId);

  const query = `UPDATE vehicles SET ${setClause} WHERE id = $${values.length} RETURNING *`;

  const result = await pool.query(query, values);
  const vehicle = result.rows[0];
  if (vehicle && vehicle.daily_rent_price) {
    vehicle.daily_rent_price = parseFloat(vehicle.daily_rent_price);
  }
  return (vehicle as Vehicle) || null;
};

const deleteVehicleById = async (
  vehicleId: string,
): Promise<Vehicle | null> => {
  const result = await pool.query("SELECT * FROM vehicles WHERE id = $1", [
    vehicleId,
  ]);

  if (result.rows.length === 0) {
    return null;
  }

  const activeBookings = await pool.query(
    "SELECT id FROM bookings WHERE vehicle_id = $1 AND status = 'active'",
    [vehicleId],
  );
  if (activeBookings.rows.length > 0) {
    throw new AppError(
      "Cannot delete vehicle with active bookings. Cancel or return them first.",
      409,
    );
  }
  await pool.query("DELETE FROM vehicles WHERE id = $1", [vehicleId]);
  return result.rows[0] as Vehicle;
};

export default {
  addVehicle,
  getAllVehicles,
  getVehicleById,
  updateVehicleById,
  deleteVehicleById,
};
