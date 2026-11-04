-- ====================================================================
-- BATCHHUB MIGRATION 03: PRODUCTION INDEXES & REFERENTIAL INTEGRITY
-- ====================================================================
USE batchhub_db;

-- 1. Performance indexes for study material library
CREATE INDEX IF NOT EXISTS idx_materials_status_created ON materials (status, created_at);
CREATE INDEX IF NOT EXISTS idx_materials_course_code ON materials (course_code);

-- 2. Performance indexes for academic routines and schedules
CREATE INDEX IF NOT EXISTS idx_routines_batch ON routines (batch);

-- 3. Performance indexes for semester course lookups
CREATE INDEX IF NOT EXISTS idx_semester_courses_batch ON semester_courses (batch);

-- 4. Fast cohort queries and directory search
CREATE INDEX IF NOT EXISTS idx_users_batch_dept ON users (batch, department);
