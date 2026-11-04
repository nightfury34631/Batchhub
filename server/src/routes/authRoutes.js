import express from "express";
import { register, login } from "../controllers/authController.js";
import { createRateLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

const loginWindow = Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000;
const loginMax = Number(process.env.RATE_LIMIT_LOGIN_MAX) || 50;
const registerMax = Number(process.env.RATE_LIMIT_REGISTER_MAX) || 20;

// Rate limiter for login (brute force protection)
const loginLimiter = createRateLimiter({
  windowMs: loginWindow,
  max: loginMax,
  message: "Too many login attempts. Please try again after 15 minutes.",
  keyPrefix: "auth_login",
});

// Rate limiter for registration (mass account creation prevention)
const registerLimiter = createRateLimiter({
  windowMs: loginWindow,
  max: registerMax,
  message: "Too many registration attempts from this network. Please try again later.",
  keyPrefix: "auth_register",
});

router.post("/register", registerLimiter, register);
router.post("/login", loginLimiter, login);

export default router;
