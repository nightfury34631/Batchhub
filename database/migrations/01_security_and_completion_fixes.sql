-- BatchHub Migration: 01_security_and_completion_fixes.sql
-- Description:
-- 1. Create task_completions table for per-user task tracking without deleting shared tasks.
-- 2. Add unique constraints to prevent duplicate project memberships and race-condition join requests.
-- 3. Add performance and filtering indexes for status fields.

USE batchhub_db;

-- 1. Task Completions Table (Preserves original task while tracking individual user completions)
CREATE TABLE IF NOT EXISTS task_completions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT NOT NULL,
    user_id INT NOT NULL,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_task_completion UNIQUE (user_id, task_id),
    CONSTRAINT fk_task_completions_task FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    CONSTRAINT fk_task_completions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 2. Project Members Unique Key (Prevent duplicate project memberships)
SET @exist_pm_idx := (
    SELECT COUNT(*) FROM information_schema.statistics 
    WHERE table_schema = DATABASE() 
    AND table_name = 'project_members' 
    AND index_name = 'unique_project_user_member'
);

SET @sql_pm := IF(@exist_pm_idx = 0, 
    'ALTER TABLE project_members ADD UNIQUE KEY unique_project_user_member (project_id, user_id)', 
    'SELECT "unique_project_user_member already exists"'
);
PREPARE stmt_pm FROM @sql_pm;
EXECUTE stmt_pm;
DEALLOCATE PREPARE stmt_pm;

-- 3. Project Requests Index (Fast lookup for project join request ownership and duplicate prevention)
SET @exist_pr_idx := (
    SELECT COUNT(*) FROM information_schema.statistics 
    WHERE table_schema = DATABASE() 
    AND table_name = 'project_requests' 
    AND index_name = 'idx_project_user_status'
);

SET @sql_pr := IF(@exist_pr_idx = 0, 
    'ALTER TABLE project_requests ADD INDEX idx_project_user_status (project_id, user_id, status)', 
    'SELECT "idx_project_user_status already exists"'
);
PREPARE stmt_pr FROM @sql_pr;
EXECUTE stmt_pr;
DEALLOCATE PREPARE stmt_pr;

-- 4. Status and Date Indexes for Query Optimization
SET @exist_ev_idx := (
    SELECT COUNT(*) FROM information_schema.statistics 
    WHERE table_schema = DATABASE() 
    AND table_name = 'events' 
    AND index_name = 'idx_events_status_date'
);
SET @sql_ev := IF(@exist_ev_idx = 0, 
    'ALTER TABLE events ADD INDEX idx_events_status_date (status, event_date)', 
    'SELECT "idx_events_status_date already exists"'
);
PREPARE stmt_ev FROM @sql_ev;
EXECUTE stmt_ev;
DEALLOCATE PREPARE stmt_ev;

SET @exist_task_idx := (
    SELECT COUNT(*) FROM information_schema.statistics 
    WHERE table_schema = DATABASE() 
    AND table_name = 'tasks' 
    AND index_name = 'idx_tasks_status_date'
);
SET @sql_task := IF(@exist_task_idx = 0, 
    'ALTER TABLE tasks ADD INDEX idx_tasks_status_date (status, due_date)', 
    'SELECT "idx_tasks_status_date already exists"'
);
PREPARE stmt_task FROM @sql_task;
EXECUTE stmt_task;
DEALLOCATE PREPARE stmt_task;
