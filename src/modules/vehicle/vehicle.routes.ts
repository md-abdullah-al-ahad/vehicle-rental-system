import { Router } from "express";
import { addVehicle } from "./vehicle.controller";

const router = Router();

router.post("/", addVehicle);

export const vehicleRouter = router;
