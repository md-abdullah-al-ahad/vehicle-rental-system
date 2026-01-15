import { Request, Response } from "express";
import vehicleService from "./vehicle.service";
const addVehicle = async (req: Request, res: Response) => {
  try {
    const vehicleData = await vehicleService.addVehicle(req.body);
    res.status(201).json({
      success: true,
      message: "Vehicle added successfully",
      data: vehicleData,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getAllVehicles = async (req: Request, res: Response) => {
  try {
    const vehicles = await vehicleService.getAllVehicles();
    res.status(200).json({
      success: true,
      message: "Vehicles retrieved successfully",
      data: vehicles,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getVehicleById = async (req: Request, res: Response) => {
  try {
    const vehicleId = req.params.vehicleId;
    const vehicle = await vehicleService.getVehicleById(vehicleId as string);
    if (!vehicle) {
      return res.status(404).json({ error: "Vehicle not found" });
    }
    res.status(200).json({
      success: true,
      message: "Vehicle retrieved successfully",
      data: vehicle,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export { addVehicle, getAllVehicles, getVehicleById };
