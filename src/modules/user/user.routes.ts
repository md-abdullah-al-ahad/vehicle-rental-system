import { Router } from "express";
import { getAllUsers, updateUserById } from "./user.controller";
import { auth } from "../../middlewares/auth";

const router = Router();

router.get("/", auth("admin"), getAllUsers);
router.put("/:userId", auth("admin", "user"), updateUserById);
export const userRouter = router;
