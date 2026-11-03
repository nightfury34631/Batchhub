import db from "../config/db.js";
import { createNotification } from "./notificationController.js";

// Get all published projects + user's incoming join requests for their projects
export const getProjects = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch projects with creator info and member count
    const [projects] = await db.execute(
      `SELECT p.*, u.name as publisher_name,
              (SELECT COUNT(*) FROM project_members pm WHERE pm.project_id = p.id) as member_count
       FROM projects p 
       LEFT JOIN users u ON p.created_by = u.id 
       ORDER BY p.created_at DESC`
    );

    // Fetch pending join requests for projects owned by the logged-in user
    const [incomingRequests] = await db.execute(
      `SELECT pr.id as request_id, pr.project_id, pr.status, pr.request_type, pr.created_at,
              p.title as project_title, 
              u.name as requester_name, u.id as requester_id, u.email as requester_email
       FROM project_requests pr
       JOIN projects p ON pr.project_id = p.id
       JOIN users u ON pr.user_id = u.id
       WHERE p.created_by = ? AND pr.status = 'pending' AND pr.request_type = 'join_request'
       ORDER BY pr.created_at DESC`,
      [userId]
    );

    // Fetch user's own sent requests / invitations so frontend can indicate status
    const [myRequests] = await db.execute(
      `SELECT project_id, status, request_type FROM project_requests WHERE user_id = ?`,
      [userId]
    );

    res.status(200).json({ success: true, projects, incomingRequests, myRequests });
  } catch (error) {
    console.error("Get Projects Error:", error.message);
    res.status(500).json({ success: false, message: "Failed to retrieve projects." });
  }
};

// Get projects owned by the logged-in user (for team invite dropdown)
export const getMyProjects = async (req, res) => {
  try {
    const userId = req.user.id;
    const [projects] = await db.execute(
      "SELECT id, title, tech_stack, team_members FROM projects WHERE created_by = ? ORDER BY created_at DESC",
      [userId]
    );
    res.status(200).json({ success: true, projects });
  } catch (error) {
    console.error("Get My Projects Error:", error.message);
    res.status(500).json({ success: false, message: "Failed to retrieve your projects." });
  }
};

// Get detailed project view with full team roster
export const getProjectDetails = async (req, res) => {
  try {
    const { projectId } = req.params;

    const [projects] = await db.execute(
      `SELECT p.*, u.name as creator_name, u.email as creator_email, u.profile_picture as creator_avatar
       FROM projects p
       LEFT JOIN users u ON p.created_by = u.id
       WHERE p.id = ?`,
      [projectId]
    );

    if (projects.length === 0) {
      return res.status(404).json({ success: false, message: "Project not found." });
    }

    const [members] = await db.execute(
      `SELECT pm.id as membership_id, pm.role_in_project, pm.user_id,
              u.name, u.email, u.student_id, u.profile_picture, u.skills
       FROM project_members pm
       JOIN users u ON pm.user_id = u.id
       WHERE pm.project_id = ?`,
      [projectId]
    );

    res.status(200).json({
      success: true,
      project: projects[0],
      members,
    });
  } catch (error) {
    console.error("Get Project Details Error:", error.message);
    res.status(500).json({ success: false, message: "Failed to retrieve project details." });
  }
};

// Publish Project (Transaction-protected with project_members integration)
export const createProject = async (req, res) => {
  const conn = await db.getConnection();
  try {
    const { title, description, tech_stack, repo_url, team_members, department } = req.body;
    const userId = req.user.id;

    if (!title || typeof title !== "string" || title.trim() === "") {
      return res.status(400).json({ success: false, message: "Project title is required." });
    }

    if (!tech_stack || typeof tech_stack !== "string" || tech_stack.trim() === "") {
      return res.status(400).json({ success: false, message: "Tech stack is required." });
    }

    const cleanTitle = title.trim();
    const cleanDesc = description ? description.trim() : "";
    const cleanStack = tech_stack.trim();
    const cleanRepo = repo_url ? repo_url.trim() : "";
    const cleanTeam = team_members ? team_members.trim() : "";
    const cleanDept = department ? department.trim() : "CSE";

    await conn.beginTransaction();

    // 1. Insert Project
    const [projResult] = await conn.execute(
      `INSERT INTO projects (title, description, tech_stack, repo_url, team_members, department, created_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [cleanTitle, cleanDesc, cleanStack, cleanRepo, cleanTeam, cleanDept, userId]
    );

    const projectId = projResult.insertId;

    // 2. Automatically assign creator as 'Owner' in relational project_members table
    await conn.execute(
      `INSERT INTO project_members (project_id, user_id, role_in_project) 
       VALUES (?, ?, 'Owner')
       ON DUPLICATE KEY UPDATE role_in_project = 'Owner'`,
      [projectId, userId]
    );

    await conn.commit();

    res.status(201).json({
      success: true,
      message: "Project published successfully!",
      projectId,
    });
  } catch (error) {
    await conn.rollback();
    console.error("Create Project Error:", error.message);
    res.status(500).json({ success: false, message: "Failed to create project." });
  } finally {
    conn.release();
  }
};

// Student: Send Join Request
export const joinProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    // 1. Verify Project Exists
    const [projects] = await db.execute("SELECT id, title, created_by FROM projects WHERE id = ?", [projectId]);
    if (projects.length === 0) {
      return res.status(404).json({ success: false, message: "Project not found." });
    }

    const project = projects[0];

    // 2. Ownership Check: Creator cannot request to join their own project
    if (project.created_by === userId) {
      return res.status(400).json({
        success: false,
        message: "You are the creator and owner of this project.",
      });
    }

    // 3. Membership Check: Cannot join if already an accepted member
    const [existingMember] = await db.execute(
      "SELECT id FROM project_members WHERE project_id = ? AND user_id = ?",
      [projectId, userId]
    );
    if (existingMember.length > 0) {
      return res.status(400).json({
        success: false,
        message: "You are already a member of this project.",
      });
    }

    // 4. Duplicate Request Check: Cannot submit multiple pending requests
    const [existingRequest] = await db.execute(
      "SELECT id, status FROM project_requests WHERE project_id = ? AND user_id = ? AND status = 'pending'",
      [projectId, userId]
    );
    if (existingRequest.length > 0) {
      return res.status(400).json({
        success: false,
        message: "You already have a pending join request for this project.",
      });
    }

    // 5. Insert Join Request
    await db.execute(
      `INSERT INTO project_requests (project_id, user_id, status, request_type) VALUES (?, ?, 'pending', 'join_request')`,
      [projectId, userId]
    );

    // 6. Cross-Module Notification: notify project owner
    const [requester] = await db.execute("SELECT name FROM users WHERE id = ?", [userId]);
    const requesterName = requester[0]?.name || "A student";

    createNotification({
      userId: project.created_by,
      type: "project",
      title: "🚀 Team Join Request",
      message: `${requesterName} requested to join your project "${project.title}".`,
      relatedEntityType: "project",
      relatedEntityId: Number(projectId),
    });

    res.status(201).json({
      success: true,
      message: "Join request sent successfully to the project owner!",
    });
  } catch (error) {
    console.error("Join Project Error:", error.message);
    res.status(500).json({ success: false, message: "Failed to submit join request." });
  }
};

// Project Owner: Invite a Student to Project
export const inviteStudent = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { studentId } = req.body;
    const currentUserId = req.user.id;

    if (!studentId) {
      return res.status(400).json({ success: false, message: "Target student ID is required." });
    }

    // 1. Verify Project & Ownership
    const [projects] = await db.execute("SELECT id, title, created_by FROM projects WHERE id = ?", [projectId]);
    if (projects.length === 0) {
      return res.status(404).json({ success: false, message: "Project not found." });
    }

    const project = projects[0];
    if (project.created_by !== currentUserId && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Only the project owner can invite students." });
    }

    // 2. Verify Target Student
    const [targetUsers] = await db.execute("SELECT id, name FROM users WHERE id = ?", [studentId]);
    if (targetUsers.length === 0) {
      return res.status(404).json({ success: false, message: "Student not found." });
    }

    const targetUser = targetUsers[0];

    // Cannot invite yourself
    if (Number(studentId) === Number(currentUserId)) {
      return res.status(400).json({ success: false, message: "You are already the owner of this project." });
    }

    // 3. Check if already member
    const [existingMember] = await db.execute(
      "SELECT id FROM project_members WHERE project_id = ? AND user_id = ?",
      [projectId, studentId]
    );
    if (existingMember.length > 0) {
      return res.status(400).json({ success: false, message: `${targetUser.name} is already a member of this project.` });
    }

    // 4. Check if pending request/invitation exists
    const [existingReq] = await db.execute(
      "SELECT id FROM project_requests WHERE project_id = ? AND user_id = ? AND status = 'pending'",
      [projectId, studentId]
    );
    if (existingReq.length > 0) {
      return res.status(400).json({ success: false, message: `An active request or invitation already exists for ${targetUser.name}.` });
    }

    // 5. Insert Invitation
    await db.execute(
      `INSERT INTO project_requests (project_id, user_id, status, request_type) VALUES (?, ?, 'pending', 'invitation')`,
      [projectId, studentId]
    );

    // 6. Cross-Module Notification: notify invited student
    const [inviter] = await db.execute("SELECT name FROM users WHERE id = ?", [currentUserId]);
    const inviterName = inviter[0]?.name || "Project Owner";

    createNotification({
      userId: Number(studentId),
      type: "project",
      title: "🤝 Project Team Invitation",
      message: `${inviterName} invited you to join their project team for "${project.title}".`,
      relatedEntityType: "project",
      relatedEntityId: Number(projectId),
    });

    res.status(201).json({
      success: true,
      message: `Invitation successfully sent to ${targetUser.name}!`,
    });
  } catch (error) {
    console.error("Invite Student Error:", error.message);
    res.status(500).json({ success: false, message: "Failed to send project invitation." });
  }
};

// Project Owner: Approve Join Request (Enforces Ownership + Transaction)
export const approveJoinRequest = async (req, res) => {
  const conn = await db.getConnection();
  try {
    const { requestId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // 1. Fetch Request, Project, and Requester Information
    const [reqs] = await conn.execute(
      `SELECT pr.*, 
              p.created_by as project_owner_id, p.id as proj_id, p.title as project_title, p.team_members,
              u.name as requester_name 
       FROM project_requests pr 
       JOIN projects p ON pr.project_id = p.id 
       JOIN users u ON pr.user_id = u.id 
       WHERE pr.id = ?`,
      [requestId]
    );

    if (reqs.length === 0) {
      return res.status(404).json({ success: false, message: "Join request not found." });
    }

    const request = reqs[0];

    // 2. Strict Ownership Verification: Only project owner or system admin can approve
    const isOwner = request.project_owner_id === userId;
    const isAdmin = userRole === "admin";
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Only the project owner can approve join requests.",
      });
    }

    // 3. Confirm Request is Pending
    if (request.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Request is already ${request.status}. Only pending requests can be approved.`,
      });
    }

    await conn.beginTransaction();

    // 4. Update request status to 'approved'
    await conn.execute('UPDATE project_requests SET status = "approved" WHERE id = ?', [requestId]);

    // 5. Add user to relational project_members table
    await conn.execute(
      `INSERT INTO project_members (project_id, user_id, role_in_project) 
       VALUES (?, ?, 'Member')
       ON DUPLICATE KEY UPDATE role_in_project = 'Member'`,
      [request.proj_id, request.user_id]
    );

    // 6. Update team_members text string for backward compatibility
    const updatedTeam = request.team_members && request.team_members.trim() !== ""
      ? `${request.team_members.trim()}, ${request.requester_name}`
      : request.requester_name;

    await conn.execute("UPDATE projects SET team_members = ? WHERE id = ?", [updatedTeam, request.proj_id]);

    await conn.commit();

    // 7. Cross-Module Notification: notify requester that they were approved!
    createNotification({
      userId: request.user_id,
      type: "project",
      title: "🎉 Join Request Approved!",
      message: `Your request to join the project "${request.project_title}" has been approved!`,
      relatedEntityType: "project",
      relatedEntityId: request.proj_id,
    });

    res.status(200).json({
      success: true,
      message: `Join request for ${request.requester_name} approved! Member added to the team.`,
    });
  } catch (error) {
    await conn.rollback();
    console.error("Approve Request Error:", error.message);
    res.status(500).json({ success: false, message: "Failed to process join request approval." });
  } finally {
    conn.release();
  }
};

// Project Owner: Reject Join Request (Enforces Ownership + Preserves Audit Trail)
export const rejectJoinRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // 1. Fetch Request and Project Owner Information
    const [reqs] = await db.execute(
      `SELECT pr.*, p.created_by as project_owner_id, p.id as proj_id, p.title as project_title, u.name as requester_name 
       FROM project_requests pr 
       JOIN projects p ON pr.project_id = p.id 
       JOIN users u ON pr.user_id = u.id 
       WHERE pr.id = ?`,
      [requestId]
    );

    if (reqs.length === 0) {
      return res.status(404).json({ success: false, message: "Join request not found." });
    }

    const request = reqs[0];

    // 2. Strict Ownership Verification: Only project owner or system admin can reject
    const isOwner = request.project_owner_id === userId;
    const isAdmin = userRole === "admin";
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Only the project owner can reject join requests.",
      });
    }

    // 3. Confirm Request is Pending
    if (request.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Request is already ${request.status}. Only pending requests can be rejected.`,
      });
    }

    // 4. Update status to 'rejected' (preserves audit trail)
    await db.execute('UPDATE project_requests SET status = "rejected" WHERE id = ?', [requestId]);

    // 5. Cross-Module Notification: notify requester
    createNotification({
      userId: request.user_id,
      type: "project",
      title: "Project Join Update",
      message: `Your request to join "${request.project_title}" was declined by the project owner.`,
      relatedEntityType: "project",
      relatedEntityId: request.proj_id,
    });

    res.status(200).json({
      success: true,
      message: `Join request for ${request.requester_name} rejected.`,
    });
  } catch (error) {
    console.error("Reject Request Error:", error.message);
    res.status(500).json({ success: false, message: "Failed to process join request rejection." });
  }
};

// Delete Project (Owner or Admin)
export const deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const [projects] = await db.execute("SELECT id, created_by, title FROM projects WHERE id = ?", [projectId]);
    if (projects.length === 0) {
      return res.status(404).json({ success: false, message: "Project not found." });
    }

    if (projects[0].created_by !== userId && userRole !== "admin") {
      return res.status(403).json({ success: false, message: "Forbidden: Only the owner can delete this project." });
    }

    await db.execute("DELETE FROM projects WHERE id = ?", [projectId]);

    res.status(200).json({ success: true, message: "Project deleted successfully." });
  } catch (error) {
    console.error("Delete Project Error:", error.message);
    res.status(500).json({ success: false, message: "Failed to delete project." });
  }
};
