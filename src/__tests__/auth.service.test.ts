import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import authService from "../modules/auth/auth.service";
import { pool } from "../config/db";

// Mock the database and external libraries
jest.mock("../config/db");
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");

describe("Auth Service", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe("createUser", () => {
    it("should create a new user successfully", async () => {
      // Arrange: Set up test data and mock responses
      const userData = {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        phone: "1234567890",
      };

      const hashedPassword = "hashed_password_123";
      const mockUser = {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        phone: "1234567890",
        role: "customer",
      };

      // Mock bcrypt to return a fake hashed password
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      // Mock database query to return the new user
      (pool.query as jest.Mock).mockResolvedValue({
        rows: [mockUser],
      });

      // Act: Call the function we're testing
      const result = await authService.createUser(userData);

      // Assert: Verify the results
      expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);
      expect(pool.query).toHaveBeenCalledWith(
        "INSERT INTO users (name, email, password, phone, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, phone, role",
        [
          "John Doe",
          "john@example.com",
          hashedPassword,
          "1234567890",
          "customer",
        ],
      );
      expect(result).toEqual(mockUser);
    });

    it("should throw error if email already exists", async () => {
      // Arrange
      const userData = {
        name: "Jane Doe",
        email: "existing@example.com",
        password: "password123",
        phone: "9876543210",
      };

      (bcrypt.hash as jest.Mock).mockResolvedValue("hashed_password");

      // Mock database to throw duplicate error
      (pool.query as jest.Mock).mockRejectedValue(
        new Error("duplicate key value violates unique constraint"),
      );

      // Act & Assert: Expect the function to throw an error
      await expect(authService.createUser(userData)).rejects.toThrow();
    });
  });

  describe("loginUser", () => {
    it("should login user with correct credentials", async () => {
      // Arrange
      const email = "john@example.com";
      const password = "password123";
      const mockUser = {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        password: "hashed_password",
        phone: "1234567890",
        role: "customer",
      };
      const mockToken = "jwt_token_123";

      // Mock database to return user
      (pool.query as jest.Mock).mockResolvedValue({
        rows: [mockUser],
      });

      // Mock bcrypt to verify password is correct
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Mock JWT to return a token
      (jwt.sign as jest.Mock).mockReturnValue(mockToken);

      // Act
      const result = await authService.loginUser(email, password);

      // Assert
      expect(pool.query).toHaveBeenCalledWith(
        "SELECT id, name, email, password, phone, role FROM users WHERE email = $1",
        [email],
      );
      expect(bcrypt.compare).toHaveBeenCalledWith(password, "hashed_password");
      expect(jwt.sign).toHaveBeenCalled();
      expect(result).toHaveProperty("token", mockToken);
      expect(result).toHaveProperty("user");
      expect(result?.user).not.toHaveProperty("password"); // Password should be removed
    });

    it("should return null if user not found", async () => {
      // Arrange
      (pool.query as jest.Mock).mockResolvedValue({
        rows: [], // No user found
      });

      // Act
      const result = await authService.loginUser(
        "nonexistent@example.com",
        "password",
      );

      // Assert
      expect(result).toBeNull();
    });

    it("should return null if password is incorrect", async () => {
      // Arrange
      const mockUser = {
        id: 1,
        email: "john@example.com",
        password: "hashed_password",
      };

      (pool.query as jest.Mock).mockResolvedValue({
        rows: [mockUser],
      });

      // Mock bcrypt to indicate password doesn't match
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Act
      const result = await authService.loginUser(
        "john@example.com",
        "wrong_password",
      );

      // Assert
      expect(result).toBeNull();
    });
  });
});
