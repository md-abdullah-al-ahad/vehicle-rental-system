import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const isTest = process.env.NODE_ENV === "test";

const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  connectionString: process.env.CONNECTION_STRING || "",
  jwtSecret: process.env.JWT_SECRET || "",
};

// Validate required environment variables (skip in test mode)
if (!isTest) {
  const required: { key: keyof typeof config; name: string }[] = [
    { key: "connectionString", name: "CONNECTION_STRING" },
    { key: "jwtSecret", name: "JWT_SECRET" },
  ];

  for (const { key, name } of required) {
    if (!config[key]) {
      throw new Error(
        `❌ Missing required environment variable: ${name}. Check your .env file.`,
      );
    }
  }
}

export default config;
