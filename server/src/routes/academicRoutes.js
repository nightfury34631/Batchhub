import express from "express";
import {
  getBatchAcademicData,
  addCourse,
  deleteCourse,
  addRoutine,
  deleteRoutine,
  approveMaterial,
} from "../controllers/academicController.js";
import { verifyToken, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();
router.get("/", verifyToken, getBatchAcademicData);
router.post("/courses", verifyToken, requireRole("cr", "admin"), addCourse);
router.delete("/courses/:courseId", verifyToken, requireRole("cr", "admin"), deleteCourse);
router.post("/routine", verifyToken, requireRole("cr", "admin"), addRoutine);
router.delete("/routine/:routineId", verifyToken, requireRole("cr", "admin"), deleteRoutine);
router.put("/materials/:materialId/approve", verifyToken, requireRole("cr", "admin"), approveMaterial);

export default router;
