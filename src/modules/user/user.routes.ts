import { Router } from "express";
import { getAllUsers } from "./user.controller";
import { auth } from "../../middlewares/auth";

const router = Router();

router.get("/", auth("admin"), getAllUsers);
export const userRouter = router;
