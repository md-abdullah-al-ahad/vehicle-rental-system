import { Request, Response } from "express";
import vehicleService from "./vehicle.service";
const addVehicle = async (req: Request, res: Response) => {
  try {
    const vehicleData = await vehicleService.addVehicle(req.body);
    res.status(201).json({
      success: true,
      message: "Vehicle created successfully",
      data: vehicleData,
    });
  } catch (err: any) {
    console.error(err);
    const userMessage = err.message.includes("duplicate")
      ? "A vehicle with this registration number already exists."
      : "Unable to add vehicle. Please check your input and try again.";
    res.status(500).json({
      success: false,
      message: userMessage,
      errors: err.message || "Internal server error",
    });
  }
};

const getAllVehicles = async (req: Request, res: Response) => {
  try {
    const vehicles = await vehicleService.getAllVehicles();
    res.status(200).json({
      success: true,
      message:
        vehicles.length > 0
          ? "Vehicles retrieved successfully"
          : "No vehicles found",
      data: vehicles,
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Unable to fetch vehicles. Please try again later.",
      errors: err.message || "Internal server error",
    });
  }
};

const getVehicleById = async (req: Request, res: Response) => {
  try {
    const vehicleId = req.params.vehicleId;
    const vehicle = await vehicleService.getVehicleById(vehicleId as string);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "The requested vehicle could not be found.",
        errors: `No vehicle exists with ID: ${vehicleId}`,
      });
    }
    res.status(200).json({
      success: true,
      message: "Vehicle retrieved successfully",
      data: vehicle,
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Unable to fetch vehicle details. Please try again later.",
      errors: err.message || "Internal server error",
    });
  }
};

const updateVehicleById = async (req: Request, res: Response) => {
  try {
    const vehicleId = req.params.vehicleId;
    const updatedVehicle = await vehicleService.updateVehicleById(
      vehicleId as string,
      req.body
    );
    if (!updatedVehicle) {
      return res.status(404).json({
        success: false,
        message: "Cannot update. The vehicle does not exist.",
        errors: `No vehicle found with ID: ${vehicleId}`,
      });
    }
    res.status(200).json({
      success: true,
      message: "Vehicle updated successfully",
      data: updatedVehicle,
    });
  } catch (err: any) {
    console.error(err);
    const userMessage = err.message.includes("duplicate")
      ? "Cannot update. Registration number already exists."
      : "Unable to update vehicle. Please try again later.";
    res.status(500).json({
      success: false,
      message: userMessage,
      errors: err.message || "Internal server error",
    });
  }
};
const deleteVehicleById = async (req: Request, res: Response) => {
  try {
    const vehicleId = req.params.vehicleId;
    const deletedVehicle = await vehicleService.deleteVehicleById(
      vehicleId as string
    );
    if (!deletedVehicle) {
      return res.status(404).json({
        success: false,
        message: "Cannot delete. The vehicle does not exist.",
        errors: `No vehicle found with ID: ${vehicleId}`,
      });
    }
    res.status(200).json({
      success: true,
      message: "Vehicle deleted successfully",
    });
  } catch (err: any) {
    console.error(err);
    const userMessage = err.message.includes("active bookings")
      ? "Cannot delete this vehicle as it has active bookings."
      : "Unable to delete vehicle. Please try again later.";
    res.status(500).json({
      success: false,
      message: userMessage,
      errors: err.message || "Internal server error",
    });
  }
};

export {
  addVehicle,
  getAllVehicles,
  getVehicleById,
  updateVehicleById,
  deleteVehicleById,
};
