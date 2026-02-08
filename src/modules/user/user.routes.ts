import { Router } from "express";
import { getAllUsers, updateUserById, deleteUserById } from "./user.controller";
import { auth } from "../../middlewares/auth";
import { validate } from "../../middlewares/validate";
import { updateUserSchema } from "../../validators/user.validator";

const router = Router();

router.get("/", auth("admin"), getAllUsers);
router.put(
  "/:userId",
  auth("admin", "customer"),
  validate(updateUserSchema),
  updateUserById,
);
router.delete("/:userId", auth("admin"), deleteUserById);

export const userRouter = router;
