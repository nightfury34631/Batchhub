import db from "../config/db.js";

// Helper utility to safely create a notification for any user with deduplication & transaction support
export const createNotification = async ({
  userId,
  type,
  title,
  message,
  relatedEntityType = null,
  relatedEntityId = null,
  idempotencyKey = null,
  conn = null,
}) => {
  const executor = conn || db;
  try {
    if (!userId || !title || !message) return null;

    const cleanTitle = title.trim();
    const cleanMessage = message.trim();
    const cleanType = type || "system";

    // Deduplication check: prevent identical unread notification for the SAME entity
    // If related entity is specified, deduplicate by entity; otherwise deduplicate by title + message
    let duplicateQuery = `
      SELECT id FROM notifications 
      WHERE user_id = ? AND type = ? AND is_read = 0 
        AND created_at >= NOW() - INTERVAL 1 MINUTE
    `;
    const duplicateParams = [userId, cleanType];

    if (relatedEntityType && relatedEntityId) {
      duplicateQuery += " AND related_entity_type = ? AND related_entity_id = ?";
      duplicateParams.push(relatedEntityType, relatedEntityId);
    } else {
      duplicateQuery += " AND title = ? AND message = ?";
      duplicateParams.push(cleanTitle, cleanMessage);
    }
    duplicateQuery += " LIMIT 1";

    const [recent] = await executor.execute(duplicateQuery, duplicateParams);
    if (recent.length > 0) {
      return recent[0].id;
    }

    const [result] = await executor.execute(
      `INSERT INTO notifications (user_id, type, title, message, related_entity_type, related_entity_id, is_read)
       VALUES (?, ?, ?, ?, ?, ?, 0)`,
      [
        userId,
        cleanType,
        cleanTitle,
        cleanMessage,
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
    // Prevent duplicate broadcast for the exact same entity within 60 seconds
    if (relatedEntityType && relatedEntityId) {
      const [existingBroadcast] = await db.execute(
        `SELECT id FROM notifications 
         WHERE type = ? AND related_entity_type = ? AND related_entity_id = ? 
           AND created_at >= NOW() - INTERVAL 1 MINUTE 
         LIMIT 1`,
        [type || "announcement", relatedEntityType, relatedEntityId]
      );
      if (existingBroadcast.length > 0) {
        return 0; // Already broadcasted
      }
    }

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

// DELETE /api/notifications/:id
export const deleteNotification = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const [notif] = await db.execute("SELECT id, user_id FROM notifications WHERE id = ?", [id]);
    if (notif.length === 0) {
      return res.status(404).json({ success: false, message: "Notification not found." });
    }

    if (notif[0].user_id !== userId && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized to delete this notification." });
    }

    await db.execute("DELETE FROM notifications WHERE id = ?", [id]);

    res.status(200).json({ success: true, message: "Notification deleted successfully." });
  } catch (error) {
    console.error("Delete notification error:", error.message);
    res.status(500).json({ success: false, message: "Failed to delete notification." });
  }
};

