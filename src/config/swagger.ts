import swaggerUi from "swagger-ui-express";
import { Express } from "express";

const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "Vehicle Rental System API",
    version: "1.0.0",
    description:
      "A production-ready RESTful API for vehicle rental management. Features JWT authentication, role-based access control, input validation, and comprehensive error handling.",
    contact: {
      name: "API Support",
    },
    license: {
      name: "ISC",
    },
  },
  servers: [
    { url: "http://localhost:5000", description: "Development" },
    { url: "https://carkhuji.vercel.app", description: "Production" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http" as const,
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Enter your JWT token obtained from /api/v1/auth/signin",
      },
    },
    schemas: {
      User: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          name: { type: "string", example: "John Doe" },
          email: { type: "string", example: "john@example.com" },
          phone: { type: "string", example: "+1234567890" },
          role: {
            type: "string",
            enum: ["admin", "customer"],
            example: "customer",
          },
        },
      },
      Vehicle: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          vehicle_name: { type: "string", example: "Toyota Camry" },
          type: {
            type: "string",
            enum: ["car", "bike", "van", "SUV"],
            example: "car",
          },
          registration_number: { type: "string", example: "ABC-1234" },
          daily_rent_price: { type: "number", example: 50.0 },
          availability_status: {
            type: "string",
            enum: ["available", "booked"],
            example: "available",
          },
        },
      },
      Booking: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          customer_id: { type: "integer", example: 1 },
          vehicle_id: { type: "integer", example: 1 },
          rent_start_date: { type: "string", format: "date-time" },
          rent_end_date: { type: "string", format: "date-time" },
          total_price: { type: "number", example: 250.0 },
          status: {
            type: "string",
            enum: ["active", "cancelled", "returned"],
            example: "active",
          },
        },
      },
      Pagination: {
        type: "object",
        properties: {
          page: { type: "integer", example: 1 },
          limit: { type: "integer", example: 10 },
          total: { type: "integer", example: 50 },
          totalPages: { type: "integer", example: 5 },
        },
      },
      Error: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string" },
          errors: {},
        },
      },
    },
  },
  paths: {
    "/api/v1/auth/signup": {
      post: {
        tags: ["Authentication"],
        summary: "Register a new user",
        description: "Creates a new customer account.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "password", "phone"],
                properties: {
                  name: {
                    type: "string",
                    example: "John Doe",
                    minLength: 2,
                    maxLength: 100,
                  },
                  email: {
                    type: "string",
                    format: "email",
                    example: "john@example.com",
                  },
                  password: {
                    type: "string",
                    minLength: 6,
                    example: "securePass123",
                  },
                  phone: { type: "string", example: "+1234567890" },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "User registered successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: {
                      type: "string",
                      example: "User registered successfully",
                    },
                    data: { $ref: "#/components/schemas/User" },
                  },
                },
              },
            },
          },
          "400": { description: "Validation error" },
          "409": { description: "Email already exists" },
        },
      },
    },
    "/api/v1/auth/signin": {
      post: {
        tags: ["Authentication"],
        summary: "Login user",
        description: "Authenticates a user and returns a JWT token.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: {
                    type: "string",
                    format: "email",
                    example: "john@example.com",
                  },
                  password: { type: "string", example: "securePass123" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Login successful",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Login successful" },
                    data: {
                      type: "object",
                      properties: {
                        token: { type: "string" },
                        user: { $ref: "#/components/schemas/User" },
                      },
                    },
                  },
                },
              },
            },
          },
          "401": { description: "Invalid credentials" },
        },
      },
    },
    "/api/v1/vehicles": {
      get: {
        tags: ["Vehicles"],
        summary: "Get all vehicles",
        description: "Returns a paginated list of all vehicles. Public access.",
        parameters: [
          {
            name: "page",
            in: "query",
            schema: { type: "integer", default: 1 },
            description: "Page number",
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", default: 10, maximum: 100 },
            description: "Items per page",
          },
        ],
        responses: {
          "200": {
            description: "Vehicles retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string" },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Vehicle" },
                    },
                    pagination: { $ref: "#/components/schemas/Pagination" },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Vehicles"],
        summary: "Add a new vehicle",
        description: "Creates a new vehicle. Admin only.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: [
                  "vehicle_name",
                  "type",
                  "registration_number",
                  "daily_rent_price",
                ],
                properties: {
                  vehicle_name: { type: "string", example: "Toyota Camry" },
                  type: { type: "string", enum: ["car", "bike", "van", "SUV"] },
                  registration_number: { type: "string", example: "ABC-1234" },
                  daily_rent_price: { type: "number", example: 50.0 },
                  availability_status: {
                    type: "string",
                    enum: ["available", "booked"],
                    default: "available",
                  },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Vehicle created successfully" },
          "400": { description: "Validation error" },
          "401": { description: "Unauthorized" },
          "403": { description: "Forbidden — Admin only" },
          "409": { description: "Registration number already exists" },
        },
      },
    },
    "/api/v1/vehicles/{vehicleId}": {
      get: {
        tags: ["Vehicles"],
        summary: "Get vehicle by ID",
        parameters: [
          {
            name: "vehicleId",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          "200": { description: "Vehicle retrieved successfully" },
          "404": { description: "Vehicle not found" },
        },
      },
      put: {
        tags: ["Vehicles"],
        summary: "Update vehicle",
        description: "Admin only.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "vehicleId",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  vehicle_name: { type: "string" },
                  type: { type: "string", enum: ["car", "bike", "van", "SUV"] },
                  registration_number: { type: "string" },
                  daily_rent_price: { type: "number" },
                  availability_status: {
                    type: "string",
                    enum: ["available", "booked"],
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Vehicle updated successfully" },
          "400": { description: "Validation error" },
          "404": { description: "Vehicle not found" },
        },
      },
      delete: {
        tags: ["Vehicles"],
        summary: "Delete vehicle",
        description: "Admin only. Cannot delete vehicles with active bookings.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "vehicleId",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          "200": { description: "Vehicle deleted successfully" },
          "404": { description: "Vehicle not found" },
          "409": { description: "Vehicle has active bookings" },
        },
      },
    },
    "/api/v1/users": {
      get: {
        tags: ["Users"],
        summary: "Get all users",
        description: "Admin only. Returns a paginated list of users.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "page",
            in: "query",
            schema: { type: "integer", default: 1 },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", default: 10 },
          },
        ],
        responses: {
          "200": { description: "Users retrieved successfully" },
          "401": { description: "Unauthorized" },
          "403": { description: "Admin only" },
        },
      },
    },
    "/api/v1/users/{userId}": {
      put: {
        tags: ["Users"],
        summary: "Update user",
        description:
          "Admins can update any user. Customers can only update their own profile (excluding role).",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "userId",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  email: { type: "string", format: "email" },
                  phone: { type: "string" },
                  role: {
                    type: "string",
                    enum: ["admin", "customer"],
                    description: "Admin only",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "User updated successfully" },
          "403": { description: "Not allowed to update this user" },
          "404": { description: "User not found" },
        },
      },
      delete: {
        tags: ["Users"],
        summary: "Delete user",
        description: "Admin only. Cannot delete users with active bookings.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "userId",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          "200": { description: "User deleted successfully" },
          "404": { description: "User not found" },
          "409": { description: "User has active bookings" },
        },
      },
    },
    "/api/v1/bookings": {
      post: {
        tags: ["Bookings"],
        summary: "Create a booking",
        description:
          "Creates a vehicle booking. Customer ID is extracted from the JWT token. Uses database transactions to prevent double-booking.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["vehicle_id", "rent_start_date", "rent_end_date"],
                properties: {
                  vehicle_id: { type: "integer", example: 1 },
                  rent_start_date: {
                    type: "string",
                    format: "date",
                    example: "2026-03-01",
                  },
                  rent_end_date: {
                    type: "string",
                    format: "date",
                    example: "2026-03-05",
                  },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Booking created successfully" },
          "400": { description: "Invalid dates or vehicle not available" },
          "404": { description: "Vehicle not found" },
        },
      },
      get: {
        tags: ["Bookings"],
        summary: "Get bookings",
        description: "Admins see all bookings. Customers see only their own.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "page",
            in: "query",
            schema: { type: "integer", default: 1 },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", default: 10 },
          },
        ],
        responses: {
          "200": { description: "Bookings retrieved successfully" },
        },
      },
    },
    "/api/v1/bookings/{bookingId}": {
      put: {
        tags: ["Bookings"],
        summary: "Update booking status",
        description:
          "Admins can update to any status. Customers can only cancel their own bookings (before the start date).",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "bookingId",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["status"],
                properties: {
                  status: {
                    type: "string",
                    enum: ["active", "cancelled", "returned"],
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Booking updated successfully" },
          "403": { description: "Not allowed to update this booking" },
          "404": { description: "Booking not found" },
        },
      },
    },
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Health check",
        description: "Returns server health status and uptime.",
        responses: {
          "200": {
            description: "Server is healthy",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "healthy" },
                    uptime: { type: "number" },
                    timestamp: { type: "string", format: "date-time" },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  tags: [
    { name: "Health", description: "Health check endpoint" },
    { name: "Authentication", description: "User registration and login" },
    { name: "Vehicles", description: "Vehicle management (CRUD)" },
    { name: "Users", description: "User management" },
    { name: "Bookings", description: "Booking management" },
  ],
};

export const setupSwagger = (app: Express) => {
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customSiteTitle: "Vehicle Rental API Docs",
      customCss: ".swagger-ui .topbar { display: none }",
    }),
  );
};
