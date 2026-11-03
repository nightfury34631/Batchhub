import express from "express";
import { getNotices, createNotice } from "../controllers/noticeController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, getNotices);
router.post("/", verifyToken, createNotice);

export default router;
