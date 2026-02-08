import { pool } from "../../config/db";
import { AppError } from "../../utils/AppError";
import { User, AuthPayload, PaginatedResponse } from "../../types/interfaces";

const getAllUsers = async (
  page = 1,
  limit = 10,
): Promise<PaginatedResponse<User>> => {
  const offset = (page - 1) * limit;

  const countResult = await pool.query("SELECT COUNT(*) FROM users");
  const total = parseInt(countResult.rows[0].count, 10);

  const result = await pool.query(
    "SELECT id, name, email, phone, role FROM users ORDER BY id LIMIT $1 OFFSET $2",
    [limit, offset],
  );

  return {
    data: result.rows as User[],
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const updateUserById = async (
  userId: string,
  updatedData: Record<string, unknown>,
  currentUser: AuthPayload,
): Promise<User> => {
  if (currentUser.role === "customer") {
    if (currentUser.id.toString() !== userId) {
      throw new AppError("You can only update your own profile", 403);
    }
    delete updatedData.role;
  }

  const allowedFields =
    currentUser.role === "admin"
      ? ["name", "email", "role", "phone"]
      : ["name", "email", "phone"];

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
  values.push(userId);

  const query = `UPDATE users SET ${setClause} WHERE id = $${values.length} RETURNING id, name, email, phone, role`;

  const result = await pool.query(query, values);
  if (result.rows.length === 0) {
    throw new AppError("User not found", 404);
  }
  return result.rows[0] as User;
};

const deleteUserById = async (userId: string): Promise<boolean> => {
  const result = await pool.query("SELECT id FROM users WHERE id = $1", [
    userId,
  ]);
  if (result.rows.length === 0) {
    return false;
  }
  const bookings = await pool.query(
    "SELECT id FROM bookings WHERE customer_id = $1 AND status = 'active'",
    [userId],
  );
  if (bookings.rows.length > 0) {
    throw new AppError(
      "Cannot delete user with active bookings. Cancel or return them first.",
      409,
    );
  }
  await pool.query("DELETE FROM users WHERE id = $1", [userId]);
  return true;
};

export const userService = {
  getAllUsers,
  updateUserById,
  deleteUserById,
};
