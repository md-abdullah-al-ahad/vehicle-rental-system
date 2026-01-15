import { Router } from "express";
import {
  addVehicle,
  getAllVehicles,
  getVehicleById,
} from "./vehicle.controller";
import { auth } from "../../middlewares/auth";

const router = Router();

router.post("/", auth("admin"), addVehicle);
router.get("/", getAllVehicles);
router.get("/:vehicleId", getVehicleById);
export const vehicleRouter = router;
