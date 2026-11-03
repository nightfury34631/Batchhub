import express from "express";
import {
  getProfile,
  updateProfile,
  changePassword,
  updateUserRole,
} from "../controllers/userController.js";
import { verifyToken, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/profile", verifyToken, getProfile);
router.put("/profile", verifyToken, updateProfile);
router.put("/change-password", verifyToken, changePassword);

// Admin-only role management
router.put("/:userId/role", verifyToken, requireRole("admin"), updateUserRole);

export default router;
