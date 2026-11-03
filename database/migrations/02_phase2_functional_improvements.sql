-- ====================================================================
-- SDP-I BATCHHUB MIGRATION 02: PHASE 2 FUNCTIONAL IMPROVEMENTS
-- ====================================================================
USE batchhub_db;

-- 1. Create Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    related_entity_type VARCHAR(50) DEFAULT NULL,
    related_entity_id INT DEFAULT NULL,
    is_read TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_read (user_id, is_read, created_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 2. Enhance Notices Table with Real Pinned and Priority Fields
ALTER TABLE notices
ADD COLUMN IF NOT EXISTS is_pinned TINYINT(1) DEFAULT 0,
ADD COLUMN IF NOT EXISTS priority ENUM('Normal', 'Important', 'Urgent') DEFAULT 'Normal';

-- 3. Enhance Project Requests to Support Both Join Requests and Direct Invitations
ALTER TABLE project_requests
ADD COLUMN IF NOT EXISTS request_type ENUM('join_request', 'invitation') DEFAULT 'join_request';

-- 4. Add Performance Index for Notices Sorting
CREATE INDEX IF NOT EXISTS idx_notices_pinned_date ON notices (is_pinned, created_at);
