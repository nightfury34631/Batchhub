import express from "express";
import { register, login } from "../controllers/authController.js";
import { createRateLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many authentication attempts. Please try again after 15 minutes.",
});

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);

export default router;
