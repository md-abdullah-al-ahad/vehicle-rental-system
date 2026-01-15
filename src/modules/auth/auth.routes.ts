import { Router } from "express";
import { createUser, loginUser } from "./auth.controller";

const router = Router();

router.post("/signin", loginUser);
router.post("/signup", createUser);

export const authRouter = router;
