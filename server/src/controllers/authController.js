import db from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Simple RFC-compliant email regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Public User Registration (Role Escalation Protected)
export const register = async (req, res) => {
  try {
    const { name, email, password, student_id, batch, department } = req.body;

    // 1. Mandatory Fields Validation
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Full name is required (minimum 2 characters).",
      });
    }

    if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim().toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: "A valid email address is required.",
      });
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password is required (minimum 6 characters).",
      });
    }

    if (!student_id || typeof student_id !== "string" || student_id.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Student ID is required.",
      });
    }

    if (!batch || typeof batch !== "string" || batch.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Academic batch is required.",
      });
    }

    if (!department || typeof department !== "string" || department.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Department is required.",
      });
    }

    // 2. Normalization
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanStudentId = student_id.trim();
    const cleanBatch = batch.trim();
    const cleanDepartment = department.trim();

    // 3. Prevent Privilege Escalation
    // CRITICAL: Public registration CANNOT set role = 'cr' or 'admin'.
    // Every public registration is strictly assigned 'student'.
    const assignedRole = "student";

    // 4. Check for duplicate email
    const [existingEmail] = await db.execute(
      "SELECT id FROM users WHERE LOWER(email) = ?",
      [cleanEmail]
    );
    if (existingEmail.length > 0) {
      return res.status(409).json({
        success: false,
        message: "An account with this email address already exists.",
      });
    }

    // 5. Check for duplicate student_id
    const [existingStudentId] = await db.execute(
      "SELECT id FROM users WHERE student_id = ?",
      [cleanStudentId]
    );
    if (existingStudentId.length > 0) {
      return res.status(409).json({
        success: false,
        message: "An account with this Student ID already exists.",
      });
    }

    // 6. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 7. Insert into database
    const query = `
      INSERT INTO users (name, email, password, student_id, batch, department, role) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.execute(query, [
      cleanName,
      cleanEmail,
      hashedPassword,
      cleanStudentId,
      cleanBatch,
      cleanDepartment,
      assignedRole,
    ]);

    res.status(201).json({
      success: true,
      message: "Account registered successfully as Student! Please sign in.",
      userId: result.insertId,
      user: {
        id: result.insertId,
        name: cleanName,
        email: cleanEmail,
        role: assignedRole,
      },
    });
  } catch (error) {
    console.error("Registration Error:", error.message);
    res.status(500).json({
      success: false,
      message: "An error occurred during registration. Please try again.",
    });
  }
};

// Login User
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email address and password are required.",
      });
    }

    const cleanEmail = String(email).trim().toLowerCase();

    // Fetch user
    const [users] = await db.execute(
      "SELECT id, name, email, password, student_id, batch, department, role, profile_picture FROM users WHERE LOWER(email) = ?",
      [cleanEmail]
    );

    // Generic error message prevents account enumeration
    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(String(password), user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Require configured JWT_SECRET (no fallback!)
    if (!process.env.JWT_SECRET) {
      console.error("FATAL: JWT_SECRET is not configured.");
      return res.status(500).json({
        success: false,
        message: "Server authentication configuration error.",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        batch: user.batch,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    delete user.password;

    res.status(200).json({
      success: true,
      message: "Login successful!",
      token,
      user,
    });
  } catch (error) {
    console.error("Login Error:", error.message);
    res.status(500).json({
      success: false,
      message: "An error occurred during sign in. Please try again.",
    });
  }
};
