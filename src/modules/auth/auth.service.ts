import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../../config/db";
import config from "../../config";
import { AppError } from "../../utils/AppError";
import { User, LoginResponse } from "../../types/interfaces";

const createUser = async (payload: {
  name: string;
  email: string;
  password: string;
  phone: string;
}): Promise<User> => {
  const { name, email, password, phone } = payload;
  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(
    "INSERT INTO users (name, email, password, phone, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, phone, role",
    [name, email, hashedPassword, phone, "customer"],
  );
  return result.rows[0] as User;
};

const loginUser = async (
  email: string,
  password: string,
): Promise<LoginResponse | null> => {
  const result = await pool.query(
    "SELECT id, name, email, password, phone, role FROM users WHERE email = $1",
    [email],
  );
  if (result.rows.length === 0) {
    return null;
  }
  const user = result.rows[0];
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return null;
  }

  const { password: _pw, ...userWithoutPassword } = user;

  const token = jwt.sign(
    {
      id: userWithoutPassword.id,
      name: userWithoutPassword.name,
      email: userWithoutPassword.email,
      phone: userWithoutPassword.phone,
      role: userWithoutPassword.role,
    },
    config.jwtSecret,
    { expiresIn: "7d" },
  );
  return { token, user: userWithoutPassword as User };
};

export default { createUser, loginUser };
