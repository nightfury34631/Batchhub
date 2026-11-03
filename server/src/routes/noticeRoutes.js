import express from "express";
import {
  getNotices,
  createNotice,
  updateNotice,
  deleteNotice,
  togglePinNotice,
} from "../controllers/noticeController.js";
import { verifyToken, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, getNotices);
router.post("/", verifyToken, createNotice);
router.put("/:id", verifyToken, updateNotice);
router.delete("/:id", verifyToken, deleteNotice);
router.put("/:id/pin", verifyToken, requireRole("cr", "admin"), togglePinNotice);

export default router;
