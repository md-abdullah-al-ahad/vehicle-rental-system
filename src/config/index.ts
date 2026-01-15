import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const config = {
  port: process.env.PORT || 5000,
  connectionString: process.env.CONNECTION_STRING || "",
  JWT_SECRET: process.env.JWT_SECRET || "your_jwt_secret",
};

export default config;
