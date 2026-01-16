import { Pool } from "pg";
import config from "./index";

export const pool = new Pool({
  connectionString: config.connectionString,
});

export const initDB = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(150) NOT NULL UNIQUE,
      password TEXT NOT NULL,
      phone VARCHAR(30) NOT NULL,
      role VARCHAR(20) NOT NULL DEFAULT 'customer',
      CONSTRAINT users_email_lowercase CHECK (email = lower(email)),
      CONSTRAINT users_password_min_len CHECK (char_length(password) >= 6),
      CONSTRAINT users_role_check CHECK (role IN ('admin', 'customer'))
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS vehicles (
      id SERIAL PRIMARY KEY,
      vehicle_name VARCHAR(120) NOT NULL,
      type VARCHAR(20) NOT NULL,
      registration_number VARCHAR(80) NOT NULL UNIQUE,
      daily_rent_price NUMERIC(10,2) NOT NULL,
      availability_status VARCHAR(20) NOT NULL DEFAULT 'available',
      CONSTRAINT vehicles_type_check CHECK (type IN ('car', 'bike', 'van', 'SUV')),
      CONSTRAINT vehicles_price_positive CHECK (daily_rent_price > 0),
      CONSTRAINT vehicles_status_check CHECK (availability_status IN ('available', 'booked'))
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS bookings (
      id SERIAL PRIMARY KEY,
      customer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
      rent_start_date TIMESTAMP NOT NULL,
      rent_end_date TIMESTAMP NOT NULL,
      total_price NUMERIC(10,2) NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'active',
      CONSTRAINT bookings_date_check CHECK (rent_end_date > rent_start_date),
      CONSTRAINT bookings_price_positive CHECK (total_price > 0),
      CONSTRAINT bookings_status_check CHECK (status IN ('active', 'cancelled', 'returned'))
    );
  `);
};

initDB()
  .then(() => {
    console.log("DB Initialized");
  })
  .catch((err) => {
    console.error("Error initializing DB", err);
  });

export default initDB;
