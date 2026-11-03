import express from "express";
import {
  getProjects,
  getMyProjects,
  getProjectDetails,
  createProject,
  joinProject,
  inviteStudent,
  approveJoinRequest,
  rejectJoinRequest,
  deleteProject,
} from "../controllers/projectController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, getProjects);
router.get("/my-projects", verifyToken, getMyProjects);
router.get("/:projectId", verifyToken, getProjectDetails);
router.post("/", verifyToken, createProject);
router.delete("/:projectId", verifyToken, deleteProject);

// Collaboration & Requests
router.post("/:projectId/join", verifyToken, joinProject);
router.post("/:projectId/invite", verifyToken, inviteStudent);
router.put("/requests/:requestId/approve", verifyToken, approveJoinRequest);
router.delete("/requests/:requestId/reject", verifyToken, rejectJoinRequest);

export default router;
