import db from "../config/db.js";

// Get all approved active tasks (with current user's completion status)
export const getTasks = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch tasks and check if the current user completed them
    const [tasks] = await db.execute(
      `SELECT t.*, u.name as creator_name,
              CASE WHEN tc.id IS NOT NULL THEN 1 ELSE 0 END as is_completed,
              tc.completed_at
       FROM tasks t 
       LEFT JOIN users u ON t.created_by = u.id 
       LEFT JOIN task_completions tc ON t.id = tc.task_id AND tc.user_id = ?
       WHERE t.status = 'approved' AND t.due_date >= NOW()
       ORDER BY t.due_date ASC`,
      [userId]
    );

    res.status(200).json({ success: true, tasks });
  } catch (error) {
    console.error("Get Tasks Error:", error.message);
    res.status(500).json({ success: false, message: "Failed to retrieve tasks." });
  }
};

// Create Task / Deadline (Students need CR approval, CRs/Admins auto-approve)
export const createTask = async (req, res) => {
  try {
    const { title, description, course_code, due_date, priority, department } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (!title || typeof title !== "string" || title.trim() === "") {
      return res.status(400).json({ success: false, message: "Task title is required." });
    }

    if (!due_date) {
      return res.status(400).json({ success: false, message: "Due date is required." });
    }

    const validPriorities = ["Low", "Medium", "High"];
    const assignedPriority = validPriorities.includes(priority) ? priority : "Medium";

    const status = userRole === "cr" || userRole === "admin" ? "approved" : "pending";

    const [result] = await db.execute(
      `INSERT INTO tasks (title, description, course_code, due_date, priority, department, created_by, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title.trim(),
        description ? description.trim() : "",
        course_code ? course_code.trim() : "General",
        due_date,
        assignedPriority,
        department ? department.trim() : "CSE",
        userId,
        status,
      ]
    );

    const message =
      status === "pending"
        ? "Task submitted successfully! Awaiting CR approval."
        : "Task deadline added and published successfully!";

    res.status(201).json({ success: true, message, taskId: result.insertId });
  } catch (error) {
    console.error("Create Task Error:", error.message);
    res.status(500).json({ success: false, message: "Failed to create task." });
  }
};

// Get Pending Tasks (Guarded by requireRole("cr", "admin") in router)
export const getPendingTasks = async (req, res) => {
  try {
    const [pendingTasks] = await db.execute(
      `SELECT t.*, u.name as uploader_name 
       FROM tasks t 
       LEFT JOIN users u ON t.created_by = u.id 
       WHERE t.status = 'pending'
       ORDER BY t.due_date ASC`
    );

    res.status(200).json({ success: true, pendingTasks });
  } catch (error) {
    console.error("Get Pending Tasks Error:", error.message);
    res.status(500).json({ success: false, message: "Failed to retrieve pending tasks." });
  }
};

// CR / Admin: Approve Task
export const approveTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const [tasks] = await db.execute("SELECT id, status, title FROM tasks WHERE id = ?", [taskId]);
    if (tasks.length === 0) {
      return res.status(404).json({ success: false, message: "Task not found." });
    }

    const task = tasks[0];
    if (task.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Task is already ${task.status}. Only pending tasks can be approved.`,
      });
    }

    await db.execute('UPDATE tasks SET status = "approved" WHERE id = ?', [taskId]);

    res.status(200).json({ success: true, message: "Task approved and published to the batch!" });
  } catch (error) {
    console.error("Approve Task Error:", error.message);
    res.status(500).json({ success: false, message: "Failed to approve task." });
  }
};

// CR / Admin: Reject Task (Preserves audit trail with status = 'rejected')
export const rejectTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const [tasks] = await db.execute("SELECT id, status, title FROM tasks WHERE id = ?", [taskId]);
    if (tasks.length === 0) {
      return res.status(404).json({ success: false, message: "Task not found." });
    }

    const task = tasks[0];
    if (task.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Task is already ${task.status}. Only pending tasks can be rejected.`,
      });
    }

    // Preserve audit trail: set status to 'rejected' instead of destructive deletion
    await db.execute('UPDATE tasks SET status = "rejected" WHERE id = ?', [taskId]);

    res.status(200).json({ success: true, message: "Task request rejected and recorded." });
  } catch (error) {
    console.error("Reject Task Error:", error.message);
    res.status(500).json({ success: false, message: "Failed to reject task." });
  }
};

// Delete Task (Strict Ownership Verification)
export const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const [tasks] = await db.execute("SELECT id, created_by, title FROM tasks WHERE id = ?", [taskId]);
    if (tasks.length === 0) {
      return res.status(404).json({ success: false, message: "Task not found." });
    }

    const task = tasks[0];

    // Ownership Policy: Task creator, CR, or Admin may delete
    const isOwner = task.created_by === userId;
    const isStaff = userRole === "admin" || userRole === "cr";

    if (!isOwner && !isStaff) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You are not authorized to delete another student's task.",
      });
    }

    await db.execute("DELETE FROM tasks WHERE id = ?", [taskId]);

    res.status(200).json({ success: true, message: "Task removed successfully." });
  } catch (error) {
    console.error("Delete Task Error:", error.message);
    res.status(500).json({ success: false, message: "Failed to delete task." });
  }
};

// Student: Mark Task Completed (Does NOT delete shared task)
export const completeTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.id;

    // Check task exists and is approved
    const [tasks] = await db.execute("SELECT id, title, status FROM tasks WHERE id = ?", [taskId]);
    if (tasks.length === 0) {
      return res.status(404).json({ success: false, message: "Task not found." });
    }

    if (tasks[0].status !== "approved") {
      return res.status(400).json({ success: false, message: "Only approved tasks can be completed." });
    }

    // Insert user completion record
    await db.execute(
      `INSERT INTO task_completions (task_id, user_id) 
       VALUES (?, ?) 
       ON DUPLICATE KEY UPDATE completed_at = CURRENT_TIMESTAMP`,
      [taskId, userId]
    );

    res.status(200).json({
      success: true,
      message: `Task marked as completed!`,
    });
  } catch (error) {
    console.error("Complete Task Error:", error.message);
    res.status(500).json({ success: false, message: "Failed to record task completion." });
  }
};

// Student: Undo Task Completion
export const uncompleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.id;

    await db.execute("DELETE FROM task_completions WHERE task_id = ? AND user_id = ?", [taskId, userId]);

    res.status(200).json({
      success: true,
      message: "Task marked as active.",
    });
  } catch (error) {
    console.error("Uncomplete Task Error:", error.message);
    res.status(500).json({ success: false, message: "Failed to update task completion." });
  }
};
