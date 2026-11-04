import express from "express";
import {
  getProfile,
  updateProfile,
  changePassword,
  updateUserRole,
} from "../controllers/userController.js";
import { verifyToken, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/profile", verifyToken, getProfile);
router.put("/profile", verifyToken, updateProfile);
router.put("/change-password", verifyToken, changePassword);

// Admin-only role management
router.put("/:userId/role", verifyToken, requireRole("admin"), updateUserRole);
const db = require("../config/db");

// 1. Get all batches summary
router.get("/admin/batches", async (req, res) => {
  try {
    const [[{ studentCount }]] = await db.query(
      "SELECT COUNT(*) AS studentCount FROM users",
    );
    const [[{ noticeCount }]] = await db.query(
      "SELECT COUNT(*) AS noticeCount FROM notices",
    );
    const [[{ resourceCount }]] = await db.query(
      "SELECT COUNT(*) AS resourceCount FROM materials",
    );

    res.json([
      {
        batchId: "Batch 3rd Year",
        name: "Batch 3rd Year (CSE)",
        department: "CSE",
        studentCount,
        noticeCount,
        resourceCount,
      },
    ]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching batches summary" });
  }
});

// 2. Get items by category for a batch
router.get("/admin/batches/:batchId/:tab", async (req, res) => {
  const { tab } = req.params;
  const tableMap = {
    students:
      "SELECT id, name, email, role, created_at FROM users ORDER BY id DESC",
    notices: "SELECT * FROM notices ORDER BY id DESC",
    resources: "SELECT * FROM materials ORDER BY id DESC",
    tasks: "SELECT * FROM tasks ORDER BY id DESC",
    events: "SELECT * FROM events ORDER BY id DESC",
    projects: "SELECT * FROM projects ORDER BY id DESC",
  };

  const query = tableMap[tab];
  if (!query) return res.status(400).json({ message: "Invalid tab" });

  try {
    const [rows] = await db.query(query);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: `Failed to fetch ${tab}` });
  }
});

// 3. Promote/Demote Student Role
router.put("/admin/users/:id/role", async (req, res) => {
  try {
    const { role } = req.body;
    await db.query("UPDATE users SET role = ? WHERE id = ?", [
      role,
      req.params.id,
    ]);
    res.json({ message: "Role updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update role" });
  }
});

// 4. Universal Admin Delete for any item
router.delete("/admin/:tab/:id", async (req, res) => {
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
  if (!table) return res.status(400).json({ message: "Invalid category" });

  try {
    await db.query(`DELETE FROM ${table} WHERE id = ?`, [id]);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete record" });
  }
});
export default router;
