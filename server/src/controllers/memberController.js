import db from "../config/db.js";

// GET /api/members — Privacy-Preserving Member Directory
export const getAllMembers = async (req, res) => {
  try {
    const callerId = req.user.id;
    const callerRole = req.user.role;
    const callerBatch = req.user.batch ? req.user.batch.trim().toLowerCase() : "";
    const callerDept = req.user.department ? req.user.department.trim().toLowerCase() : "";

    const { q, batch, department, role } = req.query;

    let query = `
      SELECT id, name, email, student_id, batch, department, role, skills, profile_picture 
      FROM users 
      WHERE 1=1
    `;
    const params = [];

    // 1. Sanitize & validate search query
    if (q && typeof q === "string") {
      const sanitizedQ = q.trim().slice(0, 100);
      if (sanitizedQ.length > 0) {
        query += " AND (name LIKE ? OR student_id LIKE ? OR skills LIKE ?)";
        const pattern = `%${sanitizedQ}%`;
        params.push(pattern, pattern, pattern);
      }
    }

    // 2. Batch filter
    if (batch && typeof batch === "string") {
      const sanitizedBatch = batch.trim().slice(0, 50);
      if (sanitizedBatch.length > 0 && sanitizedBatch.toLowerCase() !== "all") {
        query += " AND LOWER(TRIM(batch)) = ?";
        params.push(sanitizedBatch.toLowerCase());
      }
    }

    // 3. Department filter
    if (department && typeof department === "string") {
      const sanitizedDept = department.trim().slice(0, 50);
      if (sanitizedDept.length > 0 && sanitizedDept.toLowerCase() !== "all") {
        query += " AND LOWER(TRIM(department)) = ?";
        params.push(sanitizedDept.toLowerCase());
      }
    }

    // 4. Role filter
    if (role && typeof role === "string") {
      const cleanRole = role.trim().toLowerCase();
      if (["student", "cr", "admin"].includes(cleanRole)) {
        query += " AND role = ?";
        params.push(cleanRole);
      }
    }

    query += " ORDER BY role = 'admin' DESC, role = 'cr' DESC, name ASC";

    const [rows] = await db.execute(query, params);

    // 5. Apply Field-Level Privacy Rules
    // Leadership & own cohort see email; cross-batch/dept ordinary students' emails are masked/null
    const sanitizedMembers = rows.map((member) => {
      const isSelf = member.id === callerId;
      const isCallerStaff = callerRole === "cr" || callerRole === "admin";
      const isTargetStaff = member.role === "cr" || member.role === "admin";
      const isSameCohort =
        callerBatch &&
        callerDept &&
        member.batch &&
        member.department &&
        member.batch.trim().toLowerCase() === callerBatch &&
        member.department.trim().toLowerCase() === callerDept;

      const canViewEmail = isSelf || isCallerStaff || isTargetStaff || isSameCohort;

      return {
        id: member.id,
        name: member.name,
        email: canViewEmail ? member.email : null,
        student_id: member.student_id,
        batch: member.batch,
        department: member.department,
        role: member.role,
        skills: member.skills,
        profile_picture: member.profile_picture,
      };
    });

    res.status(200).json({ success: true, members: sanitizedMembers });
  } catch (error) {
    console.error("Get All Members Error:", error.message);
    res.status(500).json({ success: false, message: "Failed to retrieve members directory." });
  }
};
