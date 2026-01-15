import bcrypt from "bcryptjs";
import { pool } from "../../config/db";
import { config } from "dotenv";
import jwt from "jsonwebtoken";
const createUser = async (payload: Record<string, unknown>) => {
  const { name, email, password, phone, role } = payload;
  const hashedPassword = await bcrypt.hash(password as string, 10);
  const result = await pool.query(
    "INSERT INTO users (name, email, password, phone, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, phone, role",
    [name, email, hashedPassword, phone, role]
  );
  return result.rows[0];
};

const loginUser = async (email: string, password: string) => {
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  if (result.rows.length === 0) {
    return null;
  }
  const user = result.rows[0];
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return null;
  }
  delete user.password;
  const secret = process.env.JWT_SECRET as string;
  const token = jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
    secret,
    {
      expiresIn: "7d",
    }
  );
  return { token, user };
};

export default { createUser, loginUser };
