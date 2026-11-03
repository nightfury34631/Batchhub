import db from "../config/db.js";

// Get all approved active events (Pending events are strictly separated for CR/Admin review)
export const getEvents = async (req, res) => {
  try {
    const role = req.user.role;

    // 1. Fetch strictly approved events for all users (No pending events in public feed)
    const [events] = await db.execute(
      `SELECT e.*, u.name as organizer_name 
       FROM events e 
       LEFT JOIN users u ON e.created_by = u.id 
       WHERE e.status = 'approved' AND e.event_date >= NOW()
       ORDER BY e.event_date ASC`
    );

    // 2. Fetch pending events ONLY if user has 'cr' or 'admin' role
    let pendingEvents = [];
    if (role === "cr" || role === "admin") {
      const [pEvents] = await db.execute(
        `SELECT e.*, u.name as organizer_name 
         FROM events e 
         LEFT JOIN users u ON e.created_by = u.id 
         WHERE e.status = 'pending' AND e.event_date >= NOW()
         ORDER BY e.event_date ASC`
      );
      pendingEvents = pEvents;
    }

    res.status(200).json({ success: true, events, pendingEvents });
  } catch (error) {
    console.error("Get Events Error:", error.message);
    res.status(500).json({ success: false, message: "Failed to retrieve events." });
  }
};

// Create Event (Students require CR approval, CRs/Admins auto-approved)
export const createEvent = async (req, res) => {
  try {
    const { title, description, event_date, location, department } = req.body;
    const userId = req.user.id;
    const role = req.user.role;

    if (!title || typeof title !== "string" || title.trim() === "") {
      return res.status(400).json({ success: false, message: "Event title is required." });
    }

    if (!event_date) {
      return res.status(400).json({ success: false, message: "Event date and time are required." });
    }

    if (!location || typeof location !== "string" || location.trim() === "") {
      return res.status(400).json({ success: false, message: "Event location is required." });
    }

    // Role-governed initial status: client cannot pick 'approved'
    const status = role === "cr" || role === "admin" ? "approved" : "pending";
    const msg =
      status === "approved"
        ? "Event published successfully!"
        : "Event submitted successfully! Awaiting CR approval.";

    const [result] = await db.execute(
      `INSERT INTO events (title, description, event_date, location, department, created_by, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        title.trim(),
        description ? description.trim() : "",
        event_date,
        location.trim(),
        department ? department.trim() : "CSE",
        userId,
        status,
      ]
    );

    res.status(201).json({ success: true, message: msg, eventId: result.insertId });
  } catch (error) {
    console.error("Create Event Error:", error.message);
    res.status(500).json({ success: false, message: "Failed to create event." });
  }
};

// CR / Admin: Approve Event
export const approveEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    const [events] = await db.execute("SELECT id, status, title FROM events WHERE id = ?", [eventId]);
    if (events.length === 0) {
      return res.status(404).json({ success: false, message: "Event not found." });
    }

    const event = events[0];
    if (event.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Event is already ${event.status}. Only pending events can be approved.`,
      });
    }

    await db.execute('UPDATE events SET status = "approved" WHERE id = ?', [eventId]);

    res.status(200).json({
      success: true,
      message: `Event "${event.title}" approved and published successfully!`,
    });
  } catch (error) {
    console.error("Approve Event Error:", error.message);
    res.status(500).json({ success: false, message: "Failed to approve event." });
  }
};

// CR / Admin: Reject Event (Preserves audit trail with status = 'rejected')
export const rejectEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    const [events] = await db.execute("SELECT id, status, title FROM events WHERE id = ?", [eventId]);
    if (events.length === 0) {
      return res.status(404).json({ success: false, message: "Event not found." });
    }

    const event = events[0];
    if (event.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Event is already ${event.status}. Only pending events can be rejected.`,
      });
    }

    // Preserve audit trail: set status to 'rejected' instead of destructive deletion
    await db.execute('UPDATE events SET status = "rejected" WHERE id = ?', [eventId]);

    res.status(200).json({
      success: true,
      message: `Event "${event.title}" rejected and recorded.`,
    });
  } catch (error) {
    console.error("Reject Event Error:", error.message);
    res.status(500).json({ success: false, message: "Failed to reject event." });
  }
};
