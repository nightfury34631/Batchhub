-- =========================================================================
-- BATCHHUB MIGRATION 04: RESOURCE MODERATION HISTORY & UNIQUE CONSTRAINTS
-- =========================================================================

-- 1. Extend materials status to preserve rejected submissions
ALTER TABLE materials 
MODIFY COLUMN status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending';

-- 2. Add moderation audit columns to materials
ALTER TABLE materials 
ADD COLUMN IF NOT EXISTS reviewed_by INT NULL,
ADD COLUMN IF NOT EXISTS reviewed_at DATETIME NULL,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT NULL;

-- 3. Add foreign key for reviewer if not exists
SET @fk_exists = (
    SELECT COUNT(*) 
    FROM information_schema.TABLE_CONSTRAINTS 
    WHERE CONSTRAINT_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'materials' 
      AND CONSTRAINT_NAME = 'fk_materials_reviewer'
);
SET @sql = IF(@fk_exists = 0, 
    'ALTER TABLE materials ADD CONSTRAINT fk_materials_reviewer FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL', 
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 4. Unique constraints to prevent duplicate routine slots & room/batch timetable conflicts
CREATE UNIQUE INDEX IF NOT EXISTS uq_routines_slot 
ON routines (batch, day_of_week, time_slot, room_no);

CREATE UNIQUE INDEX IF NOT EXISTS uq_routines_room_time 
ON routines (day_of_week, time_slot, room_no);

CREATE UNIQUE INDEX IF NOT EXISTS uq_routines_batch_time 
ON routines (batch, day_of_week, time_slot);

-- 5. Unique constraint to prevent duplicate course registrations
-- (course_code, batch, department)
CREATE UNIQUE INDEX IF NOT EXISTS uq_course_batch_dept 
ON semester_courses (course_code, batch, department);

-- 6. Shared rate limits table (optional database adapter for multi-instance clusters)
CREATE TABLE IF NOT EXISTS rate_limits (
    ip_key VARCHAR(100) PRIMARY KEY,
    hit_count INT DEFAULT 1,
    reset_time BIGINT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

