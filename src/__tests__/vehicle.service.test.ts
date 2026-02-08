import vehicleService from "../modules/vehicle/vehicle.service";
import { pool } from "../config/db";

jest.mock("../config/db");

describe("Vehicle Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllVehicles", () => {
    it("should return all vehicles with pagination", async () => {
      // Arrange
      const mockVehicles = [
        {
          id: 1,
          vehicle_name: "Toyota Camry",
          type: "car",
          registration_number: "ABC123",
          daily_rent_price: "50.00",
          availability_status: "available",
        },
        {
          id: 2,
          vehicle_name: "Honda Civic",
          type: "car",
          registration_number: "XYZ789",
          daily_rent_price: "45.00",
          availability_status: "booked",
        },
      ];

      (pool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [{ count: "2" }] })
        .mockResolvedValueOnce({ rows: mockVehicles });

      // Act
      const result = await vehicleService.getAllVehicles();

      // Assert
      expect(result.data).toHaveLength(2);
      expect(result.data[0]!.daily_rent_price).toBe(50.0);
      expect(result.data[1]!.daily_rent_price).toBe(45.0);
      expect(result.pagination.total).toBe(2);
      expect(result.pagination.page).toBe(1);
    });

    it("should return empty array when no vehicles exist", async () => {
      // Arrange
      (pool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [{ count: "0" }] })
        .mockResolvedValueOnce({ rows: [] });

      // Act
      const result = await vehicleService.getAllVehicles();

      // Assert
      expect(result.data).toEqual([]);
      expect(result.pagination.total).toBe(0);
    });
  });

  describe("getVehicleById", () => {
    it("should return vehicle by id", async () => {
      // Arrange
      const mockVehicle = {
        id: 1,
        vehicle_name: "Toyota Camry",
        type: "car",
        registration_number: "ABC123",
        daily_rent_price: "50.00",
        availability_status: "available",
      };

      (pool.query as jest.Mock).mockResolvedValue({
        rows: [mockVehicle],
      });

      // Act
      const result = await vehicleService.getVehicleById("1");

      // Assert
      expect(pool.query).toHaveBeenCalledWith(
        "SELECT * FROM vehicles WHERE id = $1",
        ["1"],
      );
      expect(result!.id).toBe(1);
      expect(result!.daily_rent_price).toBe(50.0);
    });

    it("should return undefined when vehicle not found", async () => {
      // Arrange
      (pool.query as jest.Mock).mockResolvedValue({
        rows: [],
      });

      // Act
      const result = await vehicleService.getVehicleById("999");

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("addVehicle", () => {
    it("should add a new vehicle successfully", async () => {
      // Arrange
      const vehicleData = {
        vehicle_name: "Tesla Model 3",
        type: "car",
        registration_number: "TESLA001",
        daily_rent_price: 100,
        availability_status: "available",
      };

      const mockCreatedVehicle = {
        id: 1,
        ...vehicleData,
        daily_rent_price: "100.00",
      };

      (pool.query as jest.Mock).mockResolvedValue({
        rows: [mockCreatedVehicle],
      });

      // Act
      const result = await vehicleService.addVehicle(vehicleData);

      // Assert
      expect(pool.query).toHaveBeenCalledWith(
        "INSERT INTO vehicles (vehicle_name, type, registration_number, daily_rent_price, availability_status) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        ["Tesla Model 3", "car", "TESLA001", 100, "available"],
      );
      expect(result.vehicle_name).toBe("Tesla Model 3");
      expect(result.daily_rent_price).toBe(100);
    });
  });

  describe("deleteVehicleById", () => {
    it("should delete vehicle when no active bookings", async () => {
      // Arrange
      const vehicleId = "1";
      const mockVehicle = {
        id: 1,
        vehicle_name: "Toyota Camry",
      };

      // Mock: Vehicle exists
      (pool.query as jest.Mock).mockResolvedValueOnce({
        rows: [mockVehicle],
      });

      // Mock: No active bookings
      (pool.query as jest.Mock).mockResolvedValueOnce({
        rows: [],
      });

      // Mock: Delete successful
      (pool.query as jest.Mock).mockResolvedValueOnce({
        rows: [],
      });

      // Act
      const result = await vehicleService.deleteVehicleById(vehicleId);

      // Assert
      expect(result).toEqual(mockVehicle);
    });

    it("should throw error when vehicle has active bookings", async () => {
      // Arrange
      const vehicleId = "1";
      const mockVehicle = { id: 1 };
      const mockActiveBooking = { id: 1, status: "active" };

      (pool.query as jest.Mock).mockResolvedValueOnce({
        rows: [mockVehicle],
      });

      (pool.query as jest.Mock).mockResolvedValueOnce({
        rows: [mockActiveBooking],
      });

      // Act & Assert
      await expect(vehicleService.deleteVehicleById(vehicleId)).rejects.toThrow(
        "Cannot delete vehicle with active bookings",
      );
    });

    it("should return null when vehicle not found", async () => {
      // Arrange
      (pool.query as jest.Mock).mockResolvedValue({
        rows: [],
      });

      // Act
      const result = await vehicleService.deleteVehicleById("999");

      // Assert
      expect(result).toBeNull();
    });
  });
});
