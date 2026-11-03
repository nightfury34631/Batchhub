import db from "../config/db.js";
import { createNotification } from "./notificationController.js";

// Get all approved materials + pending materials for CR panel
export const getResources = async (req, res) => {
  try {
    const role = req.user.role;

    // Fetch all approved materials
    const [materials] = await db.execute(
      `SELECT m.*, u.name as uploader_name, sc.course_title 
       FROM materials m 
       LEFT JOIN users u ON m.uploaded_by = u.id 
       LEFT JOIN semester_courses sc ON m.course_code = sc.course_code
       WHERE m.status = 'approved'
       ORDER BY m.created_at DESC`
    );

    // Fetch pending materials for CR/Admin review
    let pendingMaterials = [];
    if (role === "cr" || role === "admin") {
      const [pMaterials] = await db.execute(
        `SELECT m.*, u.name as uploader_name, sc.course_title 
         FROM materials m 
         LEFT JOIN users u ON m.uploaded_by = u.id 
         LEFT JOIN semester_courses sc ON m.course_code = sc.course_code
         WHERE m.status = 'pending'
         ORDER BY m.created_at DESC`
      );
      pendingMaterials = pMaterials;
    }

    res.status(200).json({ success: true, materials, pendingMaterials });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Upload Material (CR = auto-approved, Student = pending)
export const uploadResource = async (req, res) => {
  try {
    const { course_code, title, file_url, category } = req.body;
    const userId = req.user.id;
    const role = req.user.role;

    if (!title || typeof title !== "string" || title.trim() === "") {
      return res.status(400).json({ success: false, message: "Resource title is required." });
    }

    if (!file_url || typeof file_url !== "string" || file_url.trim() === "") {
      return res.status(400).json({ success: false, message: "Resource link / URL is required." });
    }

    // CRs and Admins bypass approval; students require approval
    const status = role === "cr" || role === "admin" ? "approved" : "pending";
    const msg =
      status === "approved"
        ? "Resource uploaded successfully!"
        : "Resource uploaded and submitted for CR approval!";

    const [result] = await db.execute(
      "INSERT INTO materials (course_code, title, file_url, category, status, uploaded_by) VALUES (?, ?, ?, ?, ?, ?)",
      [
        course_code ? course_code.trim() : "General",
        title.trim(),
        file_url.trim(),
        category || "Lecture Notes",
        status,
        userId,
      ]
    );

    res.status(201).json({ success: true, message: msg, materialId: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// CR / Admin: Approve Material
export const approveResource = async (req, res) => {
  try {
    if (req.user.role !== "cr" && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized." });
    }

    const { materialId } = req.params;
    const [materials] = await db.execute("SELECT id, title, uploaded_by FROM materials WHERE id = ?", [materialId]);
    if (materials.length === 0) {
      return res.status(404).json({ success: false, message: "Resource not found." });
    }

    await db.execute('UPDATE materials SET status = "approved" WHERE id = ?', [materialId]);

    // Cross-Module Notification: notify uploader
    if (materials[0].uploaded_by) {
      createNotification({
        userId: materials[0].uploaded_by,
        type: "resource",
        title: "📚 Study Material Approved",
        message: `Your resource "${materials[0].title}" has been approved and published to the batch library!`,
        relatedEntityType: "resource",
        relatedEntityId: Number(materialId),
      });
    }

    res.status(200).json({ success: true, message: "Resource approved successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// CR / Admin: Reject Material
export const rejectResource = async (req, res) => {
  try {
    if (req.user.role !== "cr" && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized." });
    }

    const { materialId } = req.params;
    const [materials] = await db.execute("SELECT id, title, uploaded_by FROM materials WHERE id = ?", [materialId]);
    if (materials.length === 0) {
      return res.status(404).json({ success: false, message: "Resource not found." });
    }

    await db.execute("DELETE FROM materials WHERE id = ?", [materialId]);

    // Cross-Module Notification: notify uploader
    if (materials[0].uploaded_by) {
      createNotification({
        userId: materials[0].uploaded_by,
        type: "resource",
        title: "Study Material Update",
        message: `Your submitted resource "${materials[0].title}" was declined by the batch representative.`,
        relatedEntityType: "resource",
        relatedEntityId: Number(materialId),
      });
    }

    res.status(200).json({ success: true, message: "Resource rejected and removed." });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
