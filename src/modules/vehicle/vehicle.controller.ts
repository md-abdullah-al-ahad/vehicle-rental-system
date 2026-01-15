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

export { addVehicle };
