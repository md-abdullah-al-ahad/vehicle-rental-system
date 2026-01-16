import { pool } from "../../config/db";

const getAllUsers = async () => {
  const users = await pool.query(
    "SELECT id, name, email, phone, role FROM users"
  );
  return users.rows;
};
const updateUserById = async (
  userId: string,
  updatedData: Record<string, unknown>,
  currentUser: any
) => {
  if (currentUser.role === "customer") {
    if (currentUser.id.toString() !== userId) {
      throw new Error("Unauthorized: You can only update your own profile");
    }
    delete updatedData.role;
  }

  const allowedFields =
    currentUser.role === "admin"
      ? ["name", "email", "role", "phone"]
      : ["name", "email", "phone"];

  const fieldsToUpdate = Object.keys(updatedData).filter(
    (key) => allowedFields.includes(key) && updatedData[key] !== undefined
  );

  if (fieldsToUpdate.length === 0) {
    throw new Error("No valid fields to update");
  }

  const setClause = fieldsToUpdate
    .map((field, index) => `${field} = $${index + 1}`)
    .join(", ");

  const values = fieldsToUpdate.map((field) => updatedData[field]);
  values.push(userId);

  const query = `UPDATE users SET ${setClause} WHERE id = $${values.length} RETURNING *`;

  const result = await pool.query(query, values);
  return result.rows[0];
};

const deleteUserById = async (userId: string) => {
  const result = await pool.query("SELECT * FROM users WHERE id = $1", [
    userId,
  ]);
  if (result.rows.length === 0) {
    return null;
  }
  const bookings = await pool.query(
    "SELECT * FROM bookings WHERE customer_id = $1 AND status = 'active'",
    [userId]
  );
  if (bookings.rows.length > 0) {
    throw new Error("Cannot delete user with active bookings");
  }
  await pool.query("DELETE FROM users WHERE id = $1", [userId]);
  return true;
};

export const userService = {
  getAllUsers,
  updateUserById,
  deleteUserById,
};
