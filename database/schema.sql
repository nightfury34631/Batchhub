-- Create Database
CREATE DATABASE IF NOT EXISTS batchhub_db;
USE batchhub_db;

-- 1. Users Table (Supports Students, CRs, and Administrators)[cite: 2, 6]
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    student_id VARCHAR(50) UNIQUE DEFAULT NULL,
    batch VARCHAR(50) DEFAULT NULL,
    department VARCHAR(100) DEFAULT NULL,
    role ENUM('student', 'cr', 'admin') DEFAULT 'student',
    profile_picture VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Courses Table[cite: 6]
CREATE TABLE IF NOT EXISTS courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_code VARCHAR(50) UNIQUE NOT NULL,
    course_title VARCHAR(150) NOT NULL,
    description TEXT,
    department VARCHAR(100) NOT NULL,
    batch VARCHAR(50) NOT NULL,
    created_by INT,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Notices Table[cite: 6, 7]
CREATE TABLE IF NOT EXISTS notices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category ENUM('academic', 'examination', 'event', 'general') DEFAULT 'general',
    target_audience VARCHAR(100) DEFAULT 'all',
    created_by INT,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Course Materials Table[cite: 7]
CREATE TABLE IF NOT EXISTS materials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    course_id INT,
    category VARCHAR(50) DEFAULT 'Lecture Notes',
    file_path VARCHAR(255) NOT NULL,
    uploaded_by INT,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Projects Table[cite: 7]
CREATE TABLE IF NOT EXISTS projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    course_context VARCHAR(100),
    created_by INT,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Project Members / Groups Table[cite: 7]
CREATE TABLE IF NOT EXISTS project_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT,
    user_id INT,
    role_in_project VARCHAR(50) DEFAULT 'Member',
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);