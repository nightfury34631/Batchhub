import express from "express";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getPendingTasks,
  approveTask,
  rejectTask,
  completeTask,
  uncompleteTask,
} from "../controllers/taskController.js";
import { verifyToken, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public authenticated task routes
router.get("/", verifyToken, getTasks);
router.post("/", verifyToken, createTask);
router.put("/:taskId", verifyToken, updateTask);
router.delete("/:taskId", verifyToken, deleteTask);

// User-specific completion workflow (no task deletion)
router.post("/:taskId/complete", verifyToken, completeTask);
router.delete("/:taskId/complete", verifyToken, uncompleteTask);

// CR & Admin privileged task administration
router.get("/pending", verifyToken, requireRole("cr", "admin"), getPendingTasks);
router.put("/:taskId/approve", verifyToken, requireRole("cr", "admin"), approveTask);
router.delete("/:taskId/reject", verifyToken, requireRole("cr", "admin"), rejectTask);

export default router;
