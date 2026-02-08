import { Request, Response, NextFunction } from "express";
import vehicleService from "./vehicle.service";
import { AppError } from "../../utils/AppError";

const addVehicle = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vehicleData = await vehicleService.addVehicle(req.body);
    res.status(201).json({
      success: true,
      message: "Vehicle created successfully",
      data: vehicleData,
    });
  } catch (err) {
    next(err);
  }
};

const getAllVehicles = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
    const result = await vehicleService.getAllVehicles(page, limit);
    res.status(200).json({
      success: true,
      message:
        result.data.length > 0
          ? "Vehicles retrieved successfully"
          : "No vehicles found",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (err) {
    next(err);
  }
};

const getVehicleById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const vehicleId = req.params.vehicleId as string;
    const vehicle = await vehicleService.getVehicleById(vehicleId);
    if (!vehicle) {
      throw new AppError("Vehicle not found", 404);
    }
    res.status(200).json({
      success: true,
      message: "Vehicle retrieved successfully",
      data: vehicle,
    });
  } catch (err) {
    next(err);
  }
};

const updateVehicleById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const vehicleId = req.params.vehicleId as string;
    const updatedVehicle = await vehicleService.updateVehicleById(
      vehicleId,
      req.body,
    );
    if (!updatedVehicle) {
      throw new AppError("Vehicle not found", 404);
    }
    res.status(200).json({
      success: true,
      message: "Vehicle updated successfully",
      data: updatedVehicle,
    });
  } catch (err) {
    next(err);
  }
};

const deleteVehicleById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const vehicleId = req.params.vehicleId as string;
    const deletedVehicle = await vehicleService.deleteVehicleById(vehicleId);
    if (!deletedVehicle) {
      throw new AppError("Vehicle not found", 404);
    }
    res.status(200).json({
      success: true,
      message: "Vehicle deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};

export {
  addVehicle,
  getAllVehicles,
  getVehicleById,
  updateVehicleById,
  deleteVehicleById,
};
