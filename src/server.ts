import express, { Request, Response } from "express";
import config from "./config";
import initDB from "./config/db";
import { authRouter } from "./modules/auth/auth.routes";
import { auth } from "./middlewares/auth";
import { vehicleRouter } from "./modules/vehicle/vehicle.routes";

const app = express();
const PORT = config.port;

initDB();

app.use(express.json());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/vehicles", auth(), vehicleRouter);
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;
