import db from "../config/db.js";

// Get all announcements/notices
export const getNotices = async (req, res) => {
  try {
    const [notices] = await db.execute(
      `SELECT n.*, u.name as author_name 
       FROM notices n 
       LEFT JOIN users u ON n.created_by = u.id 
       ORDER BY n.created_at DESC`
    );

    res.status(200).json({ success: true, notices });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create a new announcement/notice
export const createNotice = async (req, res) => {
  try {
    const { title, description, category, target_audience } = req.body;
    const userId = req.user.id;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: "Title and description are required." });
    }

    const [result] = await db.execute(
      `INSERT INTO notices (title, description, category, target_audience, created_by) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        title.trim(),
        description.trim(),
        category || "general",
        target_audience || "all",
        userId,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Announcement posted successfully!",
      noticeId: result.insertId,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
