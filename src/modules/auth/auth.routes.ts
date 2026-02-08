import { Router } from "express";
import { createUser, loginUser } from "./auth.controller";
import { validate } from "../../middlewares/validate";
import { signupSchema, signinSchema } from "../../validators/auth.validator";
import { authLimiter } from "../../middlewares/rateLimiter";

const router = Router();

router.post("/signin", authLimiter, validate(signinSchema), loginUser);
router.post("/signup", authLimiter, validate(signupSchema), createUser);

export const authRouter = router;
