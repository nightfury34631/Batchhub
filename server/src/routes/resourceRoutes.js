import express from "express";
import {
  getResources,
  uploadResource,
  updateResource,
  deleteResource,
  approveResource,
  rejectResource,
} from "../controllers/resourceController.js";
import { verifyToken, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();
router.get("/", verifyToken, getResources);
router.post("/", verifyToken, uploadResource);
router.put("/:materialId", verifyToken, updateResource);
router.delete("/:materialId", verifyToken, deleteResource);
router.put("/:materialId/approve", verifyToken, requireRole("cr", "admin"), approveResource);
router.put("/:materialId/reject", verifyToken, requireRole("cr", "admin"), rejectResource);
router.delete("/:materialId/reject", verifyToken, requireRole("cr", "admin"), rejectResource);

export default router;
