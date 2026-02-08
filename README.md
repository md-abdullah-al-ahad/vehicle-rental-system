# 🚗 Vehicle Rental System — RESTful API

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=nodedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express-5.x-000000?logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![Tests](https://img.shields.io/badge/Tests-20%20passing-brightgreen)
![License](https://img.shields.io/badge/License-ISC-blue)

A **production-ready** backend API for a vehicle rental management platform. Built with TypeScript, Express 5, and PostgreSQL — featuring JWT authentication, role-based access control, input validation, database transactions, rate limiting, Swagger documentation, and comprehensive test coverage.

### [🌐 Live Demo](https://carkhuji.vercel.app/) &nbsp;|&nbsp; [📖 API Docs (Swagger)](https://carkhuji.vercel.app/api-docs)

---

## ✨ Key Features

| Feature                      | Description                                                                                               |
| ---------------------------- | --------------------------------------------------------------------------------------------------------- |
| 🔐 **JWT Authentication**    | Secure signup/login with bcrypt password hashing and 7-day token expiry                                   |
| 🛡️ **Role-Based Access**     | Admin & Customer roles with granular permission checks on every route                                     |
| ✅ **Input Validation**      | Request body validation using Zod schemas — rejects malformed data with helpful error messages            |
| 🗃️ **Database Transactions** | Booking operations use `BEGIN`/`COMMIT`/`ROLLBACK` with `SELECT ... FOR UPDATE` to prevent double-booking |
| 📄 **Pagination**            | All list endpoints support `?page=` & `?limit=` query parameters                                          |
| 📚 **Swagger / OpenAPI**     | Interactive API documentation at `/api-docs`                                                              |
| 🧱 **Global Error Handling** | Centralized error handler with `AppError` class — no 500s leaking stack traces                            |
| 🚦 **Rate Limiting**         | API-wide and per-auth-endpoint rate limits to prevent abuse                                               |
| 🔒 **Security Hardened**     | Helmet security headers, CORS, JSON body size limit                                                       |
| 🧪 **Tested**                | 20 unit tests covering auth, vehicles, and middleware                                                     |
| 🌍 **Deployed**              | Live on Vercel with graceful shutdown support                                                             |

---

## 🏗️ Architecture

```
src/
├── config/
│   ├── db.ts              # PostgreSQL pool + table initialization
│   ├── index.ts           # Environment config with validation
│   └── swagger.ts         # OpenAPI 3.0 spec + Swagger UI setup
├── middlewares/
│   ├── auth.ts            # JWT verification + role-based guard
│   ├── errorHandler.ts    # Global error handler (AppError + DB errors)
│   ├── rateLimiter.ts     # express-rate-limit configs
│   └── validate.ts        # Zod schema validation middleware
├── modules/
│   ├── auth/              # Signup, signin (controller → service)
│   ├── user/              # User CRUD (admin + self-update)
│   ├── vehicle/           # Vehicle CRUD with availability tracking
│   └── booking/           # Booking lifecycle with transactions
├── validators/            # Zod schemas per module
├── utils/
│   ├── AppError.ts        # Custom error class with HTTP status codes
│   └── logger.ts          # Structured logging utility
├── types/
│   ├── index.d.ts         # Express Request augmentation
│   └── interfaces.ts      # Shared TypeScript interfaces
└── server.ts              # App bootstrap (Express 5)
```

**Design principles:**

- **Layered architecture** — Routes → Controllers → Services → Database
- **Separation of concerns** — Validation, auth, error handling all in dedicated middleware
- **No `any` types** — Fully typed with TypeScript strict mode
- **Fail-fast config** — App crashes on startup if required env vars are missing

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ &nbsp;&nbsp;·&nbsp;&nbsp; **PostgreSQL** 14+ &nbsp;&nbsp;·&nbsp;&nbsp; **npm** 9+

### Installation

```bash
# Clone
git clone https://github.com/md-abdullah-al-ahad/vehicle-rental-system.git
cd vehicle-rental-system

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Then edit .env with your database credentials and a strong JWT secret
```

### Environment Variables

| Variable            | Required | Description                                                 |
| ------------------- | -------- | ----------------------------------------------------------- |
| `PORT`              | No       | Server port (default: `5000`)                               |
| `NODE_ENV`          | No       | `development` / `production` / `test`                       |
| `CONNECTION_STRING` | **Yes**  | PostgreSQL connection URI                                   |
| `JWT_SECRET`        | **Yes**  | Secret key for signing JWTs — use `openssl rand -base64 32` |

### Run

```bash
# Development (hot-reload)
npm run dev

# Build for production
npm run build

# Run production build
node dist/server.js
```

The server starts at `http://localhost:5000` with:

- API root → `http://localhost:5000/`
- Swagger docs → `http://localhost:5000/api-docs`
- Health check → `http://localhost:5000/health`

---

## 📚 API Reference

> Full interactive documentation available at [`/api-docs`](https://carkhuji.vercel.app/api-docs)

### Authentication

| Method | Endpoint              | Description             | Auth   |
| ------ | --------------------- | ----------------------- | ------ |
| `POST` | `/api/v1/auth/signup` | Register a new customer | Public |
| `POST` | `/api/v1/auth/signin` | Login and receive JWT   | Public |

### Vehicles

| Method   | Endpoint               | Description                   | Auth   |
| -------- | ---------------------- | ----------------------------- | ------ |
| `GET`    | `/api/v1/vehicles`     | List all vehicles (paginated) | Public |
| `GET`    | `/api/v1/vehicles/:id` | Get vehicle details           | Public |
| `POST`   | `/api/v1/vehicles`     | Add a new vehicle             | Admin  |
| `PUT`    | `/api/v1/vehicles/:id` | Update vehicle                | Admin  |
| `DELETE` | `/api/v1/vehicles/:id` | Delete vehicle                | Admin  |

### Users

| Method   | Endpoint            | Description                | Auth        |
| -------- | ------------------- | -------------------------- | ----------- |
| `GET`    | `/api/v1/users`     | List all users (paginated) | Admin       |
| `PUT`    | `/api/v1/users/:id` | Update user profile        | Admin / Own |
| `DELETE` | `/api/v1/users/:id` | Delete user                | Admin       |

### Bookings

| Method | Endpoint               | Description               | Auth          |
| ------ | ---------------------- | ------------------------- | ------------- |
| `POST` | `/api/v1/bookings`     | Create a booking          | Authenticated |
| `GET`  | `/api/v1/bookings`     | List bookings (paginated) | Role-based    |
| `PUT`  | `/api/v1/bookings/:id` | Update booking status     | Role-based    |

### Utility

| Method | Endpoint    | Description            |
| ------ | ----------- | ---------------------- |
| `GET`  | `/health`   | Server health + uptime |
| `GET`  | `/api-docs` | Swagger UI             |

### Authentication Header

All protected endpoints require:

```
Authorization: Bearer <jwt_token>
```

### Pagination

List endpoints accept optional query parameters:

```
GET /api/v1/vehicles?page=1&limit=10
```

Response includes:

```json
{
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 47,
    "totalPages": 5
  }
}
```

---

## 🔐 Security

| Layer                        | Implementation                                                               |
| ---------------------------- | ---------------------------------------------------------------------------- |
| **Authentication**           | JWT tokens (7-day expiry) with bcrypt password hashing (salt rounds: 10)     |
| **Authorization**            | Role-based middleware — `admin` and `customer` roles enforced per-route      |
| **Input Validation**         | Zod schemas reject invalid payloads before they reach business logic         |
| **Rate Limiting**            | 100 req/15min API-wide · 20 req/15min on auth endpoints                      |
| **HTTP Headers**             | Helmet sets security headers (X-Content-Type-Options, X-Frame-Options, etc.) |
| **CORS**                     | Configured via `cors` middleware                                             |
| **Body Size Limit**          | JSON payloads capped at 10KB                                                 |
| **SQL Injection**            | Parameterized queries only — no string interpolation in SQL                  |
| **Double-Booking**           | `SELECT ... FOR UPDATE` row locks inside database transactions               |
| **Impersonation Prevention** | Booking `customer_id` extracted from JWT — not from request body             |
| **Config Validation**        | Server refuses to start if `JWT_SECRET` or `CONNECTION_STRING` is missing    |

---

## 🧱 Error Handling

Centralized error handling via `AppError` class + global Express error middleware:

```
Client Request
     ↓
Validation Middleware (Zod) → 400 with field-level errors
     ↓
Auth Middleware (JWT) → 401 / 403
     ↓
Controller → Service
     ↓ (throws AppError)
Global Error Handler
  ├── AppError       → sends statusCode + message
  ├── Duplicate key  → 409 Conflict
  ├── FK violation   → 400 Bad Request
  └── Unknown error  → 500 (no stack trace leaked)
```

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch
```

**Test coverage:**

| Suite           | Tests | What's covered                                         |
| --------------- | ----- | ------------------------------------------------------ |
| Auth Service    | 5     | User creation, login, password hashing, JWT generation |
| Vehicle Service | 8     | CRUD operations, pagination, active booking guards     |
| Auth Middleware | 7     | Token validation, expiry, role checks, error responses |

All tests use **Jest** with mocked database (`pg`) and external libraries (`bcryptjs`, `jsonwebtoken`) — no real database required.

For detailed testing documentation, see [TESTING.md](TESTING.md)

---

## 🛠️ Tech Stack

| Category   | Technology                         |
| ---------- | ---------------------------------- |
| Runtime    | Node.js 18+                        |
| Language   | TypeScript 5 (strict mode)         |
| Framework  | Express 5                          |
| Database   | PostgreSQL                         |
| Auth       | JWT (`jsonwebtoken`) + `bcryptjs`  |
| Validation | Zod                                |
| Docs       | Swagger UI (`swagger-ui-express`)  |
| Security   | Helmet · CORS · express-rate-limit |
| Testing    | Jest + ts-jest                     |
| Deployment | Vercel                             |

---

## 📂 Scripts

| Command              | Description                      |
| -------------------- | -------------------------------- |
| `npm run dev`        | Start dev server with hot-reload |
| `npm run build`      | Compile TypeScript to `dist/`    |
| `npm test`           | Run all tests with coverage      |
| `npm run test:watch` | Run tests in watch mode          |

---

## 📄 License

ISC
