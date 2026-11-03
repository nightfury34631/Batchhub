import db from "../config/db.js";

// Helper utility to safely create a notification for any user
export const createNotification = async ({
  userId,
  type,
  title,
  message,
  relatedEntityType = null,
  relatedEntityId = null,
}) => {
  try {
    if (!userId || !title || !message) return null;
    const [result] = await db.execute(
      `INSERT INTO notifications (user_id, type, title, message, related_entity_type, related_entity_id, is_read)
       VALUES (?, ?, ?, ?, ?, ?, 0)`,
      [
        userId,
        type || "system",
        title.trim(),
        message.trim(),
        relatedEntityType,
        relatedEntityId,
      ]
    );
    return result.insertId;
  } catch (error) {
    console.error("Failed to generate notification:", error.message);
    return null;
  }
};

// Batch notification helper (e.g., notify all students in a batch about an announcement)
export const broadcastNotification = async ({
  batch = null,
  excludeUserId = null,
  type,
  title,
  message,
  relatedEntityType = null,
  relatedEntityId = null,
}) => {
  try {
    let query = "SELECT id FROM users WHERE 1=1";
    const params = [];

    if (batch && batch.toLowerCase() !== "all") {
      query += " AND LOWER(TRIM(batch)) = ?";
      params.push(batch.trim().toLowerCase());
    }

    if (excludeUserId) {
      query += " AND id != ?";
      params.push(excludeUserId);
    }

    const [users] = await db.execute(query, params);
    if (!users || users.length === 0) return 0;

    const values = [];
    const placeholders = users
      .map((u) => {
        values.push(
          u.id,
          type || "announcement",
          title.trim(),
          message.trim(),
          relatedEntityType,
          relatedEntityId
        );
        return "(?, ?, ?, ?, ?, ?, 0)";
      })
      .join(", ");

    await db.execute(
      `INSERT INTO notifications (user_id, type, title, message, related_entity_type, related_entity_id, is_read)
       VALUES ${placeholders}`,
      values
    );

    return users.length;
  } catch (error) {
    console.error("Broadcast notification error:", error.message);
    return 0;
  }
};

// GET /api/notifications
export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const [notifications] = await db.execute(
      `SELECT id, type, title, message, related_entity_type, related_entity_id, is_read, created_at
       FROM notifications
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 40`,
      [userId]
    );

    const [countRows] = await db.execute(
      `SELECT COUNT(*) as unread_count 
       FROM notifications 
       WHERE user_id = ? AND is_read = 0`,
      [userId]
    );

    const unreadCount = countRows[0]?.unread_count || 0;

    res.status(200).json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("Get notifications error:", error.message);
    res.status(500).json({ success: false, message: "Failed to retrieve notifications." });
  }
};

// PUT /api/notifications/:id/read
export const markNotificationRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await db.execute(
      "UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?",
      [id, userId]
    );

    res.status(200).json({ success: true, message: "Notification marked as read." });
  } catch (error) {
    console.error("Mark read error:", error.message);
    res.status(500).json({ success: false, message: "Failed to update notification." });
  }
};

// PUT /api/notifications/read-all
export const markAllNotificationsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await db.execute("UPDATE notifications SET is_read = 1 WHERE user_id = ?", [userId]);

    res.status(200).json({ success: true, message: "All notifications marked as read." });
  } catch (error) {
    console.error("Mark all read error:", error.message);
    res.status(500).json({ success: false, message: "Failed to mark all as read." });
  }
};
