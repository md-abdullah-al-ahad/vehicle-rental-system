import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { auth } from "../middlewares/auth";

jest.mock("jsonwebtoken");

describe("Auth Middleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    // Create mock request, response, and next function
    mockRequest = {
      headers: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should pass authentication with valid token", async () => {
    // Arrange
    const mockToken = "valid_jwt_token";
    const mockDecodedToken = {
      id: 1,
      email: "user@example.com",
      role: "customer",
    };

    mockRequest.headers = {
      authorization: `Bearer ${mockToken}`,
    };

    (jwt.verify as jest.Mock).mockReturnValue(mockDecodedToken);

    // Act
    await auth()(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction,
    );

    // Assert
    expect(jwt.verify).toHaveBeenCalled();
    expect(mockRequest.user).toEqual(mockDecodedToken);
    expect(nextFunction).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
  });

  it("should reject request without authorization header", async () => {
    // Arrange
    mockRequest.headers = {}; // No authorization header

    // Act
    await auth()(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction,
    );

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: "Authentication required. Please log in to continue.",
      errors: "No authorization token provided in request headers",
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it("should reject request with invalid token format", async () => {
    // Arrange
    mockRequest.headers = {
      authorization: "InvalidFormat token123",
    };

    // Act
    await auth()(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction,
    );

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: "Invalid authentication format. Please log in again.",
      errors: "Authorization header must use Bearer token format",
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it("should reject request with expired token", async () => {
    // Arrange
    mockRequest.headers = {
      authorization: "Bearer expired_token",
    };

    const error = new Error("jwt expired");
    error.name = "TokenExpiredError";
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw error;
    });

    // Act
    await auth()(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction,
    );

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: "Your session has expired. Please log in again.",
      errors: "JWT token has expired",
    });
  });

  it("should reject request with invalid JWT", async () => {
    // Arrange
    mockRequest.headers = {
      authorization: "Bearer invalid_token",
    };

    const error = new Error("invalid signature");
    error.name = "JsonWebTokenError";
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw error;
    });

    // Act
    await auth()(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction,
    );

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: "Your session is invalid. Please log in again.",
      errors: "JWT verification failed: Invalid or malformed token",
    });
  });

  it("should check user role and allow access for admin", async () => {
    // Arrange
    const mockToken = "valid_jwt_token";
    const mockDecodedToken = {
      id: 1,
      email: "admin@example.com",
      role: "admin",
    };

    mockRequest.headers = {
      authorization: `Bearer ${mockToken}`,
    };

    (jwt.verify as jest.Mock).mockReturnValue(mockDecodedToken);

    // Act
    await auth("admin")(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction,
    );

    // Assert
    expect(nextFunction).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
  });

  it("should reject access when user role does not match required role", async () => {
    // Arrange
    const mockToken = "valid_jwt_token";
    const mockDecodedToken = {
      id: 1,
      email: "customer@example.com",
      role: "customer",
    };

    mockRequest.headers = {
      authorization: `Bearer ${mockToken}`,
    };

    (jwt.verify as jest.Mock).mockReturnValue(mockDecodedToken);

    // Act - Try to access admin-only route
    await auth("admin")(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction,
    );

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: "You don't have permission to perform this action.",
      errors: "Access denied. Required role(s): admin. Your role: customer",
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });
});
