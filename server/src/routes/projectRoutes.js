import express from "express";
import {
  getProjects,
  getMyProjects,
  getProjectDetails,
  createProject,
  updateProject,
  joinProject,
  inviteStudent,
  acceptInvitation,
  rejectInvitation,
  approveJoinRequest,
  rejectJoinRequest,
  removeProjectMember,
  deleteProject,
} from "../controllers/projectController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, getProjects);
router.get("/my-projects", verifyToken, getMyProjects);
router.get("/:projectId", verifyToken, getProjectDetails);
router.post("/", verifyToken, createProject);
router.put("/:projectId", verifyToken, updateProject);
router.delete("/:projectId", verifyToken, deleteProject);

// Collaboration & Requests
router.post("/:projectId/join", verifyToken, joinProject);
router.post("/:projectId/invite", verifyToken, inviteStudent);
router.put("/requests/:requestId/approve", verifyToken, approveJoinRequest);
router.delete("/requests/:requestId/reject", verifyToken, rejectJoinRequest);

// Student Invitations
router.put("/invitations/:requestId/accept", verifyToken, acceptInvitation);
router.delete("/invitations/:requestId/reject", verifyToken, rejectInvitation);

// Team Member Management
router.delete("/:projectId/members/:memberUserId", verifyToken, removeProjectMember);

export default router;
