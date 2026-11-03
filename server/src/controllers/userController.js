import bcrypt from "bcryptjs";
import db from "../config/db.js";

// Get Profile
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const [users] = await db.execute(
      "SELECT id, name, email, student_id, batch, department, role, profile_picture, skills, gender, created_at FROM users WHERE id = ?",
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    res.status(200).json({ success: true, user: users[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to retrieve profile." });
  }
};

// Update Profile
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      name,
      student_id,
      batch,
      department,
      profile_picture,
      skills,
      gender,
    } = req.body;

    const query = `
      UPDATE users 
      SET name = ?, student_id = ?, batch = ?, department = ?, profile_picture = ?, skills = ?, gender = ? 
      WHERE id = ?
    `;
    await db.execute(query, [
      name ? name.trim() : null,
      student_id ? student_id.trim() : null,
      batch ? batch.trim() : null,
      department ? department.trim() : null,
      profile_picture || null,
      skills ? skills.trim() : null,
      gender || null,
      userId,
    ]);

    const [updatedUser] = await db.execute(
      "SELECT id, name, email, student_id, batch, department, role, profile_picture, skills, gender FROM users WHERE id = ?",
      [userId]
    );

    res.status(200).json({
      success: true,
      message: "Profile updated successfully!",
      user: updatedUser[0],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update profile." });
  }
};

// Change Password
export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Both current password and new password are required.",
      });
    }

    if (typeof newPassword !== "string" || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long.",
      });
    }

    const [users] = await db.execute("SELECT id, password FROM users WHERE id = ?", [userId]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const isMatch = await bcrypt.compare(currentPassword, users[0].password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect.",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await db.execute("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, userId]);

    res.status(200).json({
      success: true,
      message: "Password changed successfully!",
    });
  } catch (error) {
    console.error("Change Password Error:", error.message);
    res.status(500).json({ success: false, message: "Failed to update password." });
  }
};

// Admin Only: Promote or assign privileged roles
export const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!role || !["student", "cr", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role specified. Must be 'student', 'cr', or 'admin'.",
      });
    }

    const [user] = await db.execute("SELECT id, name, email, role FROM users WHERE id = ?", [userId]);
    if (user.length === 0) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    await db.execute("UPDATE users SET role = ? WHERE id = ?", [role, userId]);

    res.status(200).json({
      success: true,
      message: `User ${user[0].name} role successfully updated to '${role}'.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update user role." });
  }
};
