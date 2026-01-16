import { Router } from "express";
import {
  addVehicle,
  getAllVehicles,
  getVehicleById,
  updateVehicleById,
  deleteVehicleById,
} from "./vehicle.controller";
import { auth } from "../../middlewares/auth";

const router = Router();

router.post("/", auth("admin"), addVehicle);
router.get("/", getAllVehicles);
router.get("/:vehicleId", getVehicleById);
router.put("/:vehicleId", auth("admin"), updateVehicleById);
router.delete("/:vehicleId", auth("admin"), deleteVehicleById);
export const vehicleRouter = router;
