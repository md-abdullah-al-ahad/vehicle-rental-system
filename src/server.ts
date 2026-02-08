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
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Vehicle Rental System API</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Segoe UI',system-ui,-apple-system,sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f7f9fc;color:#2d3748}
    .container{text-align:center;max-width:580px;padding:3rem 2rem}
    .badge{display:inline-flex;align-items:center;gap:.4rem;padding:.35rem 1rem;border-radius:999px;font-size:.75rem;font-weight:600;letter-spacing:.04em;text-transform:uppercase;background:#eef4fb;color:#5a8ec2;border:1px solid #dce8f5;margin-bottom:1.8rem}
    .dot{width:7px;height:7px;border-radius:50%;background:#6ab089;animation:pulse 2s infinite}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
    h1{font-size:2.2rem;font-weight:700;color:#1e293b;letter-spacing:-.01em;line-height:1.25;margin-bottom:.5rem}
    .subtitle{color:#6b7a8d;font-size:.95rem;line-height:1.7;margin-bottom:2.2rem}
    .links{display:flex;gap:.75rem;justify-content:center;flex-wrap:wrap;margin-bottom:2.5rem}
    .links a{display:inline-flex;align-items:center;gap:.45rem;padding:.65rem 1.5rem;border-radius:.5rem;font-size:.85rem;font-weight:600;text-decoration:none;transition:all .15s ease}
    .primary{background:#a8ccee;color:#1e293b}
    .primary:hover{background:#96c1e8;transform:translateY(-1px);box-shadow:0 2px 8px rgba(168,204,238,.4)}
    .secondary{background:#fff;color:#3e5060;border:1px solid #dde4ec}
    .secondary:hover{background:#f4f7fa;transform:translateY(-1px)}
    .divider{width:48px;height:1px;background:#dde4ec;margin:0 auto 2rem}
    .cards{display:grid;grid-template-columns:repeat(3,1fr);gap:.7rem;margin-bottom:2.2rem}
    .card{background:#fff;border:1px solid #e5eaf0;border-radius:.5rem;padding:1rem .7rem}
    .card-icon{font-size:1.1rem;margin-bottom:.35rem}
    .card-label{font-size:.7rem;color:#8c9aaa;text-transform:uppercase;letter-spacing:.05em;margin-bottom:.1rem}
    .card-value{font-size:.85rem;font-weight:600;color:#334155}
    .footer{color:#9ca8b7;font-size:.78rem}
    .footer a{color:#7a8da3;text-decoration:none}
    .footer a:hover{color:#4a6580}
    @media(max-width:500px){h1{font-size:1.7rem}.cards{grid-template-columns:1fr}.container{padding:2rem 1.5rem}}
  </style>
</head>
<body>
  <div class="container">
    <div class="badge"><span class="dot"></span> Live</div>
    <h1>Vehicle Rental System</h1>
    <p class="subtitle">RESTful API with JWT authentication, role-based access control, input validation and interactive documentation.</p>
    <div class="links">
      <a href="/api-docs" class="primary">
        <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
        API Documentation
      </a>
      <a href="/health" class="secondary">
        <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
        Health Check
      </a>
    </div>
    <div class="divider"></div>
    <div class="cards">
      <div class="card">
        <div class="card-icon">🔐</div>
        <div class="card-label">Auth</div>
        <div class="card-value">JWT + RBAC</div>
      </div>
      <div class="card">
        <div class="card-icon">🚗</div>
        <div class="card-label">Vehicles</div>
        <div class="card-value">Full CRUD</div>
      </div>
      <div class="card">
        <div class="card-icon">📋</div>
        <div class="card-label">Bookings</div>
        <div class="card-value">Transactions</div>
      </div>
    </div>
    <p class="footer">v1.0.0 &middot; <a href="https://github.com/md-abdullah-al-ahad/vehicle-rental-system" target="_blank">GitHub</a></p>
  </div>
</body>
</html>`);
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
