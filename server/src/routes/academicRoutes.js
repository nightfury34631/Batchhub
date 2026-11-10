import express from "express";
import {
  getBatchAcademicData,
  addCourse,
  updateCourse,
  deleteCourse,
  addRoutine,
  updateRoutine,
  deleteRoutine,
  approveMaterial,
} from "../controllers/academicController.js";
import { verifyToken, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, getBatchAcademicData);
router.post("/courses", verifyToken, requireRole("cr", "admin"), addCourse);
router.put("/courses/:courseId", verifyToken, requireRole("cr", "admin"), updateCourse);
router.delete("/courses/:courseId", verifyToken, requireRole("cr", "admin"), deleteCourse);
router.post("/routine", verifyToken, requireRole("cr", "admin"), addRoutine);
router.put("/routine/:routineId", verifyToken, requireRole("cr", "admin"), updateRoutine);
router.delete("/routine/:routineId", verifyToken, requireRole("cr", "admin"), deleteRoutine);
router.put("/materials/:materialId/approve", verifyToken, requireRole("cr", "admin"), approveMaterial);

export default router;
