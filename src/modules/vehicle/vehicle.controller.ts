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
    res.status(500).json({
      success: false,
      message: "Failed to add vehicle",
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
      message: "Failed to retrieve vehicles",
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
        message: "Vehicle not found",
        errors: "Vehicle not found",
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
      message: "Failed to retrieve vehicle",
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
        message: "Vehicle not found",
        errors: "Vehicle not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Vehicle updated successfully",
      data: updatedVehicle,
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to update vehicle",
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
        message: "Vehicle not found",
        errors: "Vehicle not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Vehicle deleted successfully",
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to delete vehicle",
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
