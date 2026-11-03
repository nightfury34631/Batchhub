import express from "express";
import {
  getResources,
  uploadResource,
  approveResource,
  rejectResource,
} from "../controllers/resourceController.js";
import { verifyToken, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();
router.get("/", verifyToken, getResources);
router.post("/", verifyToken, uploadResource);
router.put("/:materialId/approve", verifyToken, requireRole("cr", "admin"), approveResource);
router.delete("/:materialId/reject", verifyToken, requireRole("cr", "admin"), rejectResource);

export default router;
