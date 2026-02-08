import { Router } from "express";
import {
  addVehicle,
  getAllVehicles,
  getVehicleById,
  updateVehicleById,
  deleteVehicleById,
} from "./vehicle.controller";
import { auth } from "../../middlewares/auth";
import { validate } from "../../middlewares/validate";
import {
  addVehicleSchema,
  updateVehicleSchema,
} from "../../validators/vehicle.validator";

const router = Router();

router.post("/", auth("admin"), validate(addVehicleSchema), addVehicle);
router.get("/", getAllVehicles);
router.get("/:vehicleId", getVehicleById);
router.put(
  "/:vehicleId",
  auth("admin"),
  validate(updateVehicleSchema),
  updateVehicleById,
);
router.delete("/:vehicleId", auth("admin"), deleteVehicleById);

export const vehicleRouter = router;
