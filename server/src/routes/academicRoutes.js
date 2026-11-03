import express from "express";
import {
  getBatchAcademicData,
  addCourse,
  addRoutine,
  approveMaterial,
} from "../controllers/academicController.js";
import { verifyToken, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();
router.get("/", verifyToken, getBatchAcademicData);
router.post("/courses", verifyToken, requireRole("cr", "admin"), addCourse);
router.post("/routine", verifyToken, requireRole("cr", "admin"), addRoutine);
router.put("/materials/:materialId/approve", verifyToken, requireRole("cr", "admin"), approveMaterial);

export default router;
