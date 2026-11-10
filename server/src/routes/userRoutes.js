import express from "express";
import db from "../config/db.js";
import {
  getProfile,
  updateProfile,
  changePassword,
  updateUserRole,
} from "../controllers/userController.js";
import { verifyToken, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// User profile & credential management (Protected)
router.get("/profile", verifyToken, getProfile);
router.put("/profile", verifyToken, updateProfile);
router.put("/change-password", verifyToken, changePassword);

// Standard Admin Role Management
router.put("/:userId/role", verifyToken, requireRole("admin"), updateUserRole);

// =========================================================================
// Admin Master Control Center Routes (Strictly Gated to Administrators)
// =========================================================================

// Get all users (Admin only)
router.get("/", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, name, email, student_id, batch, department, role, created_at FROM users ORDER BY id DESC"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching users" });
  }
});

// Get all notices (Admin only)
router.get("/notices", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT n.*, u.name as author_name 
       FROM notices n 
       LEFT JOIN users u ON n.created_by = u.id 
       ORDER BY n.id DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching notices" });
  }
});

// Get all materials (Admin only)
router.get("/materials", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT m.*, u.name as uploader_name 
       FROM materials m 
       LEFT JOIN users u ON m.uploaded_by = u.id 
       ORDER BY m.id DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching materials" });
  }
});

// Get all tasks (Admin only)
router.get("/tasks", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT t.*, u.name as creator_name 
       FROM tasks t 
       LEFT JOIN users u ON t.created_by = u.id 
       ORDER BY t.id DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching tasks" });
  }
});

// Get all events (Admin only)
router.get("/events", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT e.*, u.name as organizer_name 
       FROM events e 
       LEFT JOIN users u ON e.created_by = u.id 
       ORDER BY e.id DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching events" });
  }
});

// Get all projects (Admin only)
router.get("/projects", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT p.*, u.name as publisher_name 
       FROM projects p 
       LEFT JOIN users u ON p.created_by = u.id 
       ORDER BY p.id DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching projects" });
  }
});

// Admin update role endpoint (Admin only)
router.put("/admin/users/:id/role", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const { role } = req.body;
    if (!["student", "cr", "admin"].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role specified" });
    }
    await db.query("UPDATE users SET role = ? WHERE id = ?", [role, req.params.id]);
    res.json({ success: true, message: "Role updated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update role" });
  }
});

// Admin universal deletion endpoint (Admin only)
router.delete("/admin/:tab/:id", verifyToken, requireRole("admin"), async (req, res) => {
  const { tab, id } = req.params;
  const tableNames = {
    students: "users",
    notices: "notices",
    resources: "materials",
    tasks: "tasks",
    events: "events",
    projects: "projects",
  };
  const table = tableNames[tab];
  if (!table) return res.status(400).json({ success: false, message: "Invalid category" });

  try {
    await db.query(`DELETE FROM ${table} WHERE id = ?`, [id]);
    res.json({ success: true, message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to delete record" });
  }
});

export default router;
