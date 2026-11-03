USE batchhub_db;

INSERT INTO users (name, email, password, student_id, batch, department, role, skills, profile_picture) VALUES
('Ahmad Ibrahim Nahian', 'nahian@university.edu', '$2a$10$DummyHashedPasswordForTest1', '24524203110', '3rd Year', 'CSE', 'student', 'Python, C++, Socket Programming, Git', 'https://api.dicebear.com/7.x/bottts/svg?seed=Nahian'),
('Nokibur Rahman', 'nokib@university.edu', '$2a$10$DummyHashedPasswordForTest2', '24524203161', '3rd Year', 'CSE', 'student', 'Java, React, Node.js, MySQL', 'https://api.dicebear.com/7.x/bottts/svg?seed=Nokib'),
('Tanvir Ahmed', 'tanvir@university.edu', '$2a$10$DummyHashedPasswordForTest3', '24524203185', '3rd Year', 'CSE', 'student', 'Arduino, C++, Robotics, Sensors', 'https://api.dicebear.com/7.x/bottts/svg?seed=Tanvir'),
('Sadia Islam', 'sadia@university.edu', '$2a$10$DummyHashedPasswordForTest4', '24524203200', '2nd Year', 'CSE', 'student', 'HTML, CSS, JavaScript, UI/UX', 'https://api.dicebear.com/7.x/bottts/svg?seed=Sadia'),
('Rahim Uddin', 'rahim@university.edu', '$2a$10$DummyHashedPasswordForTest5', '24524203210', '4th Year', 'EEE', 'student', 'Circuit Design, Verilog, MATLAB', 'https://api.dicebear.com/7.x/bottts/svg?seed=Rahim');
 
INSERT INTO events (title, description, event_date, location, department, status, created_by) VALUES
('Algorithmic Coding Contest 2026', 'Inter-batch competitive programming contest featuring dynamic programming and graph theory problems.', '2026-11-10 15:00:00', 'Lab-3, CSE Building', 'CSE', 'approved', 1),
('Operating Systems Midterm Review', 'Comprehensive review session covering CPU scheduling, semaphores, and virtual memory management.', '2026-11-14 11:00:00', 'Room 401', 'CSE', 'approved', 1),
('DBMS Project Demo', 'Final hands-on project demo and repository code submission for BatchHub system.', '2026-11-18 14:00:00', 'Lab-2', 'CSE', 'approved', 1),
('AI & Agent Development Workshop', 'Hands-on workshop exploring the Google Agent Development Kit and automated workflow creation.', '2026-11-24 14:30:00', 'Seminar Room 402', 'CSE', 'approved', 1),
('Annual Batch Sports Meet 2026', 'Cricket and football tournament for batchmates. Form your departmental teams and register with the CR.', '2026-12-05 09:00:00', 'University Central Playground', 'CSE', 'approved', 1);

INSERT INTO notices (title, description, category, target_audience, created_by) VALUES
('Final-year Project Proposal Submission', 'All final year student teams must submit their software development project proposals before the upcoming deadline.', 'academic', 'all', 1),
('Class Routine Update for 3rd Year', 'Room reallocation for Database Systems lab starting this Wednesday. Please check the updated routine.', 'academic', '3rd Year', 1),
('Semester Registration Fee Notice', 'Accounts office reminder regarding fee clearance for semester final examinations.', 'general', 'all', 1);
