import { pool } from "../../config/db";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../../config";
const getAllUsers = async () => {
  const users = await pool.query("SELECT * FROM users");
  return users.rows;
};
const updateUserById = async (
  userId: string,
  updatedData: Record<string, unknown>,
  currentUser: any
) => {
  if (currentUser.role === "customer") {
    if (currentUser.userId.toString() !== userId) {
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
export const userService = {
  getAllUsers,
  updateUserById,
};
