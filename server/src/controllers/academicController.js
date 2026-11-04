import db from "../config/db.js";

export const getBatchAcademicData = async (req, res) => {
  try {
    const userBatch = req.user.batch ? req.user.batch.trim().toLowerCase() : "";
    const role = req.user.role;

    const [courses] = await db.execute(
      "SELECT * FROM semester_courses WHERE LOWER(TRIM(batch)) = ?",
      [userBatch],
    );
    const [routine] = await db.execute(
      'SELECT * FROM routines WHERE LOWER(TRIM(batch)) = ? ORDER BY FIELD(day_of_week, "Saturday","Sunday","Monday","Tuesday","Wednesday","Thursday","Friday")',
      [userBatch],
    );

    let pendingMaterials = [];
    if (role === "cr" || role === "admin") {
      try {
        const [materials] = await db.execute(
          'SELECT m.*, u.name as uploader_name FROM materials m LEFT JOIN users u ON m.uploaded_by = u.id WHERE m.status = "pending"',
        );
        pendingMaterials = materials;
      } catch (e) {}
    }

    res.status(200).json({ success: true, courses, routine, pendingMaterials });
  } catch (error) {
    console.error("Academic Data Error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const addCourse = async (req, res) => {
  try {
    if (req.user.role !== "cr" && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized." });
    }
    const { course_code, course_title, department, batch } = req.body;
    if (!course_code || !course_title || !department || !batch) {
      return res.status(400).json({ success: false, message: "All course fields are required." });
    }
    const [result] = await db.execute(
      "INSERT INTO semester_courses (course_code, course_title, department, batch) VALUES (?, ?, ?, ?)",
      [
        course_code.trim(),
        course_title.trim(),
        department.trim(),
        batch.trim(),
      ],
    );
    res
      .status(201)
      .json({ success: true, message: "Course added successfully!", courseId: result.insertId });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY" || error.errno === 1062) {
      return res.status(409).json({
        success: false,
        message: "This course is already registered for this batch and department.",
      });
    }
    res.status(500).json({ success: false, error: error.message });
  }
};

export const addRoutine = async (req, res) => {
  try {
    if (req.user.role !== "cr" && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized." });
    }
    const { batch, day_of_week, time_slot, course_name } = req.body;
    const room = req.body.room_no || req.body.room_number;
    if (!batch || !day_of_week || !time_slot || !course_name || !room) {
      return res.status(400).json({ success: false, message: "All routine fields are required." });
    }
    const [result] = await db.execute(
      "INSERT INTO routines (batch, day_of_week, time_slot, course_name, room_no) VALUES (?, ?, ?, ?, ?)",
      [
        batch.trim(),
        day_of_week.trim(),
        time_slot.trim(),
        course_name.trim(),
        room.trim(),
      ],
    );
    res
      .status(201)
      .json({ success: true, message: "Routine slot added successfully!", routineId: result.insertId });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY" || error.errno === 1062) {
      return res.status(409).json({
        success: false,
        message: "A routine slot already exists for this room, day, time, and batch.",
      });
    }
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateRoutine = async (req, res) => {
  try {
    if (req.user.role !== "cr" && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized." });
    }
    const { routineId } = req.params;
    const { batch, day_of_week, time_slot, course_name } = req.body;
    const room = req.body.room_no || req.body.room_number;

    const [existing] = await db.execute("SELECT id FROM routines WHERE id = ?", [routineId]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: "Routine slot not found." });
    }

    await db.execute(
      `UPDATE routines 
       SET batch = COALESCE(?, batch),
           day_of_week = COALESCE(?, day_of_week),
           time_slot = COALESCE(?, time_slot),
           course_name = COALESCE(?, course_name),
           room_no = COALESCE(?, room_no)
       WHERE id = ?`,
      [
        batch ? batch.trim() : null,
        day_of_week ? day_of_week.trim() : null,
        time_slot ? time_slot.trim() : null,
        course_name ? course_name.trim() : null,
        room ? room.trim() : null,
        routineId,
      ]
    );

    res.status(200).json({ success: true, message: "Routine slot updated successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteRoutine = async (req, res) => {
  try {
    if (req.user.role !== "cr" && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized." });
    }
    const { routineId } = req.params;
    await db.execute("DELETE FROM routines WHERE id = ?", [routineId]);
    res.status(200).json({ success: true, message: "Routine slot deleted successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateCourse = async (req, res) => {
  try {
    if (req.user.role !== "cr" && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized." });
    }
    const { courseId } = req.params;
    const { course_code, course_title, department, batch } = req.body;

    const [existing] = await db.execute("SELECT id FROM semester_courses WHERE id = ?", [courseId]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: "Course not found." });
    }

    await db.execute(
      `UPDATE semester_courses 
       SET course_code = COALESCE(?, course_code),
           course_title = COALESCE(?, course_title),
           department = COALESCE(?, department),
           batch = COALESCE(?, batch)
       WHERE id = ?`,
      [
        course_code ? course_code.trim() : null,
        course_title ? course_title.trim() : null,
        department ? department.trim() : null,
        batch ? batch.trim() : null,
        courseId,
      ]
    );

    res.status(200).json({ success: true, message: "Course updated successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    if (req.user.role !== "cr" && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized." });
    }
    const { courseId } = req.params;
    await db.execute("DELETE FROM semester_courses WHERE id = ?", [courseId]);
    res.status(200).json({ success: true, message: "Course deleted successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const approveMaterial = async (req, res) => {
  try {
    if (req.user.role !== "cr" && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized." });
    }
    const { materialId } = req.params;
    await db.execute('UPDATE materials SET status = "approved" WHERE id = ?', [
      materialId,
    ]);
    res
      .status(200)
      .json({ success: true, message: "Material approved successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
