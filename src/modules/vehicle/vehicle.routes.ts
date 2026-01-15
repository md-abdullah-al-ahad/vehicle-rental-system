import { Router } from "express";
import { addVehicle } from "./vehicle.controller";
import { auth } from "../../middlewares/auth";

const router = Router();

router.post("/", auth("admin"), addVehicle);

export const vehicleRouter = router;
