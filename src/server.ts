import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import config from "./config";
import { pool } from "./config/db";
import { setupSwagger } from "./config/swagger";
import { authRouter } from "./modules/auth/auth.routes";
import { vehicleRouter } from "./modules/vehicle/vehicle.routes";
import { userRouter } from "./modules/user/user.routes";
import { bookingRouter } from "./modules/booking/booking.routes";
import { errorHandler } from "./middlewares/errorHandler";
import { apiLimiter } from "./middlewares/rateLimiter";
import logger from "./utils/logger";

const app = express();
const PORT = config.port;

// ── Security Middleware ──────────────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "10kb" }));
app.use(apiLimiter);

// ── API Documentation ────────────────────────────────────────────────
setupSwagger(app);

// ── Health Check ─────────────────────────────────────────────────────
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    message: "Vehicle Rental System API",
    version: "1.0.0",
    docs: "/api-docs",
    health: "/health",
  });
});

// ── Routes ───────────────────────────────────────────────────────────
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/vehicles", vehicleRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/bookings", bookingRouter);

// ── Global Error Handler (must be after routes) ──────────────────────
app.use(errorHandler);

// ── Start Server ─────────────────────────────────────────────────────
const server = app.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`);
  logger.info(`API Docs available at http://localhost:${PORT}/api-docs`);
});

// ── Graceful Shutdown ────────────────────────────────────────────────
const gracefulShutdown = (signal: string) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);
  server.close(() => {
    logger.info("HTTP server closed");
    pool.end().then(() => {
      logger.info("Database pool closed");
      process.exit(0);
    });
  });
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

export default app;
