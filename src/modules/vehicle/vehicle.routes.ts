import { Router } from "express";
import { addVehicle, getAllVehicles } from "./vehicle.controller";
import { auth } from "../../middlewares/auth";

const router = Router();

router.post("/", auth("admin"), addVehicle);
router.get("/", getAllVehicles);

export const vehicleRouter = router;
