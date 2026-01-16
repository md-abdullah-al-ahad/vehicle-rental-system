import { pool } from "../../config/db";

const addVehicle = async (payload: Record<string, unknown>) => {
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
      availability_status,
    ]
  );
  const vehicle = result.rows[0];
  if (vehicle.daily_rent_price) {
    vehicle.daily_rent_price = parseFloat(vehicle.daily_rent_price);
  }
  return vehicle;
};

const getAllVehicles = async () => {
  const result = await pool.query("SELECT * FROM vehicles");
  return result.rows.map((vehicle) => ({
    ...vehicle,
    daily_rent_price: vehicle.daily_rent_price
      ? parseFloat(vehicle.daily_rent_price)
      : vehicle.daily_rent_price,
  }));
};

const getVehicleById = async (vehicleId: string) => {
  const result = await pool.query("SELECT * FROM vehicles WHERE id = $1", [
    vehicleId,
  ]);
  const vehicle = result.rows[0];
  if (vehicle && vehicle.daily_rent_price) {
    vehicle.daily_rent_price = parseFloat(vehicle.daily_rent_price);
  }
  return vehicle;
};
const updateVehicleById = async (
  vehicleId: string,
  updatedData: Record<string, unknown>
) => {
  const allowedFields = [
    "vehicle_name",
    "type",
    "registration_number",
    "daily_rent_price",
    "availability_status",
  ];

  const fieldsToUpdate = Object.keys(updatedData).filter(
    (key) => allowedFields.includes(key) && updatedData[key] !== undefined
  );

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
  return vehicle;
};

const deleteVehicleById = async (vehicleId: string) => {
  const result = await pool.query("SELECT * FROM vehicles WHERE id = $1", [
    vehicleId,
  ]);
  const { availability_status } = result.rows[0];
  if (availability_status === "booked") {
    throw new Error("Cannot delete a rented vehicle");
  }
  await pool.query("DELETE FROM vehicles WHERE id = $1", [vehicleId]);
  return result.rows[0];
};

export default {
  addVehicle,
  getAllVehicles,
  getVehicleById,
  updateVehicleById,
  deleteVehicleById,
};
