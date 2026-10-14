import express from "express";
import {
  getBatchAcademicData,
  addCourse,
  addRoutine,
  approveMaterial,
} from "../controllers/academicController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();
router.get("/", verifyToken, getBatchAcademicData);
router.post("/courses", verifyToken, addCourse);
router.post("/routine", verifyToken, addRoutine);
router.put("/materials/:materialId/approve", verifyToken, approveMaterial);

export default router;
