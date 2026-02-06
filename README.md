# 🚗 Vehicle Rental System

A backend API for a vehicle rental management system built with Node.js, TypeScript, Express.js, and PostgreSQL.

## 🌐 Live URL

[Live Deployment Link](https://carkhuji.vercel.app/)

## ✨ Features

- **Vehicle Management** - Add, view, update, and delete vehicles with availability tracking
- **User Management** - Customer registration and admin management of users
- **Booking System** - Create, view, and manage vehicle rentals with automatic price calculation
- **Authentication** - JWT-based authentication with role-based access control (Admin/Customer)
- **Authorization** - Protected routes with proper permission checks

## 🛠️ Technology Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs

## 📁 Project Structure

```
src/
├── config/
│   ├── db.ts          # Database connection and schema
│   └── index.ts       # Environment configuration
├── middlewares/
│   └── auth.ts        # JWT authentication middleware
├── modules/
│   ├── auth/          # Authentication (signup, signin)
│   ├── user/          # User management
│   ├── vehicle/       # Vehicle management
│   └── booking/       # Booking management
├── types/
│   └── index.d.ts     # TypeScript declarations
└── server.ts          # Application entry point
```

## 🚀 Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd vehicle-rental-system
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory:

```env
PORT=5000
CONNECTION_STRING=postgresql://username:password@localhost:5432/vehicle_rental
JWT_SECRET=your_secret_key_here
```

4. Start the development server:

```bash
npm run dev
```

The server will start at `http://localhost:5000`

## 🧪 Testing

This project includes comprehensive test coverage using Jest.

```bash
# Run all tests
npm test

# Run tests in watch mode (auto-rerun on changes)
npm run test:watch
```

**Test Coverage:**

- ✅ Authentication service (user signup, login, password hashing)
- ✅ Vehicle service (CRUD operations, business logic)
- ✅ Auth middleware (JWT validation, role-based access)

For detailed testing documentation, see [TESTING.md](TESTING.md)

## 📚 API Endpoints

### Authentication

| Method | Endpoint              | Description       |
| ------ | --------------------- | ----------------- |
| POST   | `/api/v1/auth/signup` | Register new user |
| POST   | `/api/v1/auth/signin` | Login user        |

### Vehicles

| Method | Endpoint                      | Access | Description       |
| ------ | ----------------------------- | ------ | ----------------- |
| POST   | `/api/v1/vehicles`            | Admin  | Add new vehicle   |
| GET    | `/api/v1/vehicles`            | Public | Get all vehicles  |
| GET    | `/api/v1/vehicles/:vehicleId` | Public | Get vehicle by ID |
| PUT    | `/api/v1/vehicles/:vehicleId` | Admin  | Update vehicle    |
| DELETE | `/api/v1/vehicles/:vehicleId` | Admin  | Delete vehicle    |

### Users

| Method | Endpoint                | Access    | Description   |
| ------ | ----------------------- | --------- | ------------- |
| GET    | `/api/v1/users`         | Admin     | Get all users |
| PUT    | `/api/v1/users/:userId` | Admin/Own | Update user   |
| DELETE | `/api/v1/users/:userId` | Admin     | Delete user   |

### Bookings

| Method | Endpoint                      | Access        | Description    |
| ------ | ----------------------------- | ------------- | -------------- |
| POST   | `/api/v1/bookings`            | Authenticated | Create booking |
| GET    | `/api/v1/bookings`            | Role-based    | Get bookings   |
| PUT    | `/api/v1/bookings/:bookingId` | Role-based    | Update booking |

## 🔐 Authentication

Protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```
