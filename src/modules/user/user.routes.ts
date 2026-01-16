import { Router } from "express";
import { getAllUsers, updateUserById, deleteUserById } from "./user.controller";
import { auth } from "../../middlewares/auth";

const router = Router();

router.get("/", auth("admin"), getAllUsers);
router.put("/:userId", auth("admin", "customer"), updateUserById);
router.delete("/:userId", auth("admin"), deleteUserById);
export const userRouter = router;
