import express from "express";
import {
  getEvents,
  createEvent,
  approveEvent,
  rejectEvent,
} from "../controllers/eventController.js";
import { verifyToken, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();
router.get("/", verifyToken, getEvents);
router.post("/", verifyToken, createEvent);
router.put("/:eventId/approve", verifyToken, requireRole("cr", "admin"), approveEvent);
router.delete("/:eventId/reject", verifyToken, requireRole("cr", "admin"), rejectEvent);

export default router;
