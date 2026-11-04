import db from "../src/config/db.js";
import bcrypt from "bcryptjs";

async function seedDemoData() {
  console.log("🌱 Starting BatchHub Demo Data Seeding...");

  try {
    // 1. Password hash for demo users
    const DEMO_PASSWORD = "BatchHub@123";
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, salt);

    // 2. Demo User Accounts Specification
    const demoUsers = [
      {
        name: "Mustavi Tripto",
        email: "tripto.demo@batchhub.test",
        student_id: "24524203151",
        batch: "3rd Year",
        department: "CSE",
        role: "student",
        skills: "React, TypeScript, Node.js, MySQL, Tailwind CSS, Git",
        gender: "Male",
        profile_picture: "https://api.dicebear.com/7.x/bottts/svg?seed=Tripto",
      },
      {
        name: "Arif Hasan",
        email: "arif.demo@batchhub.test",
        student_id: "24524203152",
        batch: "3rd Year",
        department: "CSE",
        role: "student",
        skills: "Python, Django, Machine Learning, Data Structures, C++",
        gender: "Male",
        profile_picture: "https://api.dicebear.com/7.x/bottts/svg?seed=Arif",
      },
      {
        name: "Nusrat Jahan",
        email: "nusrat.demo@batchhub.test",
        student_id: "24524203153",
        batch: "3rd Year",
        department: "CSE",
        role: "student",
        skills: "UI/UX Design, Figma, React, Tailwind CSS, Prototyping",
        gender: "Female",
        profile_picture: "https://api.dicebear.com/7.x/bottts/svg?seed=Nusrat",
      },
      {
        name: "Fahim Ahmed",
        email: "fahim.demo@batchhub.test",
        student_id: "24524203154",
        batch: "3rd Year",
        department: "CSE",
        role: "student",
        skills: "Computer Networks, Linux, Cyber Security, Wireshark, Docker",
        gender: "Male",
        profile_picture: "https://api.dicebear.com/7.x/bottts/svg?seed=Fahim",
      },
      {
        name: "Sakib Rahman",
        email: "sakib.cr@batchhub.test",
        student_id: "24524203150",
        batch: "3rd Year",
        department: "CSE",
        role: "cr",
        skills: "Full-Stack Development, Git, Agile Project Management, Java",
        gender: "Male",
        profile_picture: "https://api.dicebear.com/7.x/bottts/svg?seed=Sakib",
      },
      {
        name: "Demo Admin",
        email: "admin.demo@batchhub.test",
        student_id: "ADMIN-DEMO-01",
        batch: "3rd Year",
        department: "CSE",
        role: "admin",
        skills: "System Administration, Database Optimization, Network Security",
        gender: "Other",
        profile_picture: "https://api.dicebear.com/7.x/bottts/svg?seed=Admin",
      },
    ];

    const userMap = {};

    for (const u of demoUsers) {
      const [existing] = await db.execute(
        "SELECT id, email, role FROM users WHERE LOWER(email) = ? OR student_id = ?",
        [u.email.toLowerCase(), u.student_id]
      );

      if (existing.length > 0) {
        const id = existing[0].id;
        await db.execute(
          `UPDATE users 
           SET name = ?, password = ?, student_id = ?, batch = ?, department = ?, 
               role = ?, skills = ?, gender = ?, profile_picture = ?
           WHERE id = ?`,
          [
            u.name,
            hashedPassword,
            u.student_id,
            u.batch,
            u.department,
            u.role,
            u.skills,
            u.gender,
            u.profile_picture,
            id,
          ]
        );
        userMap[u.email] = id;
        console.log(`  ✓ Updated demo user: ${u.name} (${u.role}) -> ID: ${id}`);
      } else {
        const [res] = await db.execute(
          `INSERT INTO users (name, email, password, student_id, batch, department, role, skills, gender, profile_picture)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            u.name,
            u.email.toLowerCase(),
            hashedPassword,
            u.student_id,
            u.batch,
            u.department,
            u.role,
            u.skills,
            u.gender,
            u.profile_picture,
          ]
        );
        userMap[u.email] = res.insertId;
        console.log(`  ✓ Created demo user: ${u.name} (${u.role}) -> ID: ${res.insertId}`);
      }
    }

    const triptoId = userMap["tripto.demo@batchhub.test"];
    const arifId = userMap["arif.demo@batchhub.test"];
    const nusratId = userMap["nusrat.demo@batchhub.test"];
    const fahimId = userMap["fahim.demo@batchhub.test"];
    const sakibCrId = userMap["sakib.cr@batchhub.test"];
    const adminId = userMap["admin.demo@batchhub.test"];

    // 3. Clean up obsolete automated test debris (without touching real user records)
    await db.execute("DELETE FROM tasks WHERE title LIKE 'Flawed Homework Submission%'");
    await db.execute(
      "DELETE FROM notices WHERE title LIKE 'CR Authorized Announcement%' OR title LIKE 'Admin Announcement%' OR title LIKE 'CR Notice Test%' OR title LIKE 'Admin Notice Test%'"
    );
    await db.execute("DELETE FROM projects WHERE title LIKE 'Invite Test Proj%'");
    console.log("  ✓ Cleaned obsolete automated test artifacts");

    // 4. Academic Semester Courses (for CSE 3rd Year)
    const courses = [
      {
        course_code: "CSE-3201",
        course_title: "Software Engineering",
        department: "CSE",
        batch: "3rd Year",
      },
      {
        course_code: "CSE-3203",
        course_title: "Database Management Systems",
        department: "CSE",
        batch: "3rd Year",
      },
      {
        course_code: "CSE-3205",
        course_title: "Computer Networks",
        department: "CSE",
        batch: "3rd Year",
      },
      {
        course_code: "CSE-3207",
        course_title: "Operating Systems",
        department: "CSE",
        batch: "3rd Year",
      },
      {
        course_code: "CSE-3209",
        course_title: "Computer Architecture",
        department: "CSE",
        batch: "3rd Year",
      },
    ];

    for (const c of courses) {
      await db.execute(
        `INSERT INTO semester_courses (course_code, course_title, department, batch)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE course_title = VALUES(course_title), department = VALUES(department)`,
        [c.course_code, c.course_title, c.department, c.batch]
      );
    }
    console.log("  ✓ Seeded 5 academic semester courses for CSE 3rd Year");

    // 5. Academic Routine (5-7 balanced weekly slots)
    // Clean old routines for this batch to ensure no duplicate slot conflicts
    await db.execute("DELETE FROM routines WHERE batch = '3rd Year'");

    const routineSlots = [
      {
        batch: "3rd Year",
        day_of_week: "Sunday",
        time_slot: "09:00 AM - 10:30 AM",
        course_name: "Software Engineering (CSE-3201)",
        room_no: "Room 402, Dept of CSE",
      },
      {
        batch: "3rd Year",
        day_of_week: "Sunday",
        time_slot: "11:00 AM - 12:30 PM",
        course_name: "Database Management Systems (CSE-3203)",
        room_no: "Lab 2, CSE Building",
      },
      {
        batch: "3rd Year",
        day_of_week: "Monday",
        time_slot: "10:00 AM - 11:30 AM",
        course_name: "Operating Systems (CSE-3207)",
        room_no: "Room 401, Dept of CSE",
      },
      {
        batch: "3rd Year",
        day_of_week: "Tuesday",
        time_slot: "09:00 AM - 10:30 AM",
        course_name: "Computer Networks (CSE-3205)",
        room_no: "Lab 3, CSE Building",
      },
      {
        batch: "3rd Year",
        day_of_week: "Wednesday",
        time_slot: "11:00 AM - 12:30 PM",
        course_name: "Computer Architecture (CSE-3209)",
        room_no: "Room 405, Dept of CSE",
      },
      {
        batch: "3rd Year",
        day_of_week: "Thursday",
        time_slot: "02:00 PM - 03:30 PM",
        course_name: "Software Engineering Lab (CSE-3202)",
        room_no: "Software Lab 1",
      },
    ];

    for (const r of routineSlots) {
      await db.execute(
        `INSERT INTO routines (batch, day_of_week, time_slot, course_name, room_no)
         VALUES (?, ?, ?, ?, ?)`,
        [r.batch, r.day_of_week, r.time_slot, r.course_name, r.room_no]
      );
    }
    console.log("  ✓ Seeded 6 realistic weekly academic routine slots");

    // 6. Tasks and Deadlines
    // Clean demo-specific tasks first
    await db.execute(
      "DELETE FROM tasks WHERE title IN ('Database Design Assignment', 'Software Requirements Specification', 'Network Configuration Lab Report', 'Operating Systems Quiz Preparation', 'Project Proposal Submission', 'Computer Architecture Micro-project')"
    );

    const tasksToInsert = [
      {
        title: "Database Design Assignment",
        description: "Complete the ER diagram, schema relational mapping, and normalization up to BCNF for the university management system.",
        course_code: "CSE-3203",
        due_date: "2026-11-08 23:59:00",
        priority: "High",
        department: "CSE",
        status: "approved",
        created_by: sakibCrId,
        isCompletedForTripto: false,
      },
      {
        title: "Software Requirements Specification",
        description: "Draft the IEEE 830 compliant SRS document including UML use case diagrams, functional workflows, and non-functional requirements.",
        course_code: "CSE-3201",
        due_date: "2026-11-12 23:59:00",
        priority: "Medium",
        department: "CSE",
        status: "approved",
        created_by: sakibCrId,
        isCompletedForTripto: false,
      },
      {
        title: "Network Configuration Lab Report",
        description: "Submit Cisco Packet Tracer lab report demonstrating multi-router subnetting, VLAN trunking, and OSPF routing configuration.",
        course_code: "CSE-3205",
        due_date: "2026-11-02 23:59:00",
        priority: "Medium",
        department: "CSE",
        status: "approved",
        created_by: sakibCrId,
        isCompletedForTripto: true, // Marked completed
      },
      {
        title: "Operating Systems Quiz Preparation",
        description: "Prepare for Class Test 2 covering process synchronization, mutex locks, semaphores, and deadlock prevention algorithms.",
        course_code: "CSE-3207",
        due_date: "2026-11-10 14:00:00",
        priority: "High",
        department: "CSE",
        status: "approved",
        created_by: sakibCrId,
        isCompletedForTripto: false,
      },
      {
        title: "Project Proposal Submission",
        description: "Submit final team project proposals with system architecture diagram, tech stack rationale, and sprint milestone roadmap.",
        course_code: "CSE-3201",
        due_date: "2026-11-18 17:00:00",
        priority: "Medium",
        department: "CSE",
        status: "approved",
        created_by: sakibCrId,
        isCompletedForTripto: false,
      },
      {
        title: "Computer Architecture Micro-project",
        description: "Design and simulate an 8-bit Arithmetic Logic Unit (ALU) using Logisim or Verilog HDL with carry-lookahead addition.",
        course_code: "CSE-3209",
        due_date: "2026-11-22 23:59:00",
        priority: "Low",
        department: "CSE",
        status: "pending", // Pending CR moderation demonstration
        created_by: arifId,
        isCompletedForTripto: false,
      },
    ];

    for (const t of tasksToInsert) {
      const [res] = await db.execute(
        `INSERT INTO tasks (title, description, course_code, due_date, priority, department, status, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          t.title,
          t.description,
          t.course_code,
          t.due_date,
          t.priority,
          t.department,
          t.status,
          t.created_by,
        ]
      );
      const taskId = res.insertId;

      if (t.isCompletedForTripto) {
        await db.execute(
          `INSERT IGNORE INTO task_completions (task_id, user_id, completed_at)
           VALUES (?, ?, NOW() - INTERVAL 1 DAY)`,
          [taskId, triptoId]
        );
      }
    }
    console.log("  ✓ Seeded 6 realistic tasks with pending/completed states and CR moderation queue");

    // 7. Announcements / Notices
    await db.execute(
      "DELETE FROM notices WHERE title IN ('Database Lab Submission Deadline', 'Software Engineering Presentation Schedule', 'Upcoming Operating Systems Class Test')"
    );

    const noticesToInsert = [
      {
        title: "Database Lab Submission Deadline",
        description: "Reminder to all batchmates: The Database Management Systems Lab report must be uploaded before Sunday 11:59 PM. Late submissions will incur a mark deduction.",
        category: "academic",
        target_audience: "3rd Year",
        priority: "Important",
        is_pinned: 1, // Pinned announcement
        created_by: sakibCrId,
      },
      {
        title: "Software Engineering Presentation Schedule",
        description: "The mid-semester project presentation schedule and preparation guidelines for CSE-3201 have been published. Each team will receive a 10-minute slot followed by 5 minutes of Q&A.",
        category: "academic",
        target_audience: "all",
        priority: "Normal",
        is_pinned: 0,
        created_by: sakibCrId,
      },
      {
        title: "Upcoming Operating Systems Class Test",
        description: "Students are reminded that Class Test 2 on Operating Systems is scheduled for Tuesday, November 10 during the regular lecture hour. Please review CPU scheduling, semaphores, and memory management.",
        category: "examination",
        target_audience: "3rd Year",
        priority: "Urgent",
        is_pinned: 0,
        created_by: sakibCrId,
      },
    ];

    for (const n of noticesToInsert) {
      await db.execute(
        `INSERT INTO notices (title, description, category, target_audience, priority, is_pinned, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          n.title,
          n.description,
          n.category,
          n.target_audience,
          n.priority,
          n.is_pinned,
          n.created_by,
        ]
      );
    }
    console.log("  ✓ Seeded 3 announcements (including 1 pinned notice)");

    // 8. Events
    await db.execute(
      "DELETE FROM events WHERE title IN ('CSE Batch Project Presentation', 'Programming Contest Preparation Session', 'Departmental Seminar on Emerging Technologies', 'Intra-Batch Table Tennis Tournament')"
    );

    const eventsToInsert = [
      {
        title: "CSE Batch Project Presentation",
        description: "Mid-semester project demonstration and architecture review for Software Engineering (CSE-3201). Faculty evaluators and external mentors will attend.",
        event_date: "2026-11-18 10:00:00",
        location: "Seminar Hall 402, Dept of CSE",
        department: "CSE",
        status: "approved",
        created_by: sakibCrId,
      },
      {
        title: "Programming Contest Preparation Session",
        description: "Weekly problem-solving workshop focusing on graph algorithms, segment trees, and speed coding techniques for upcoming collegiate programming contests.",
        event_date: "2026-11-12 15:30:00",
        location: "Computer Lab 3, Ground Floor",
        department: "CSE",
        status: "approved",
        created_by: sakibCrId,
      },
      {
        title: "Departmental Seminar on Emerging Technologies",
        description: "Special interactive seminar with industry speakers covering modern cloud architectures, agentic AI systems, and microservice resiliency.",
        event_date: "2026-11-25 11:00:00",
        location: "University Central Auditorium",
        department: "CSE",
        status: "approved",
        created_by: adminId,
      },
      {
        title: "Intra-Batch Table Tennis Tournament",
        description: "Friendly singles and doubles tournament for CSE 3rd Year batchmates to unwind after midterms.",
        event_date: "2026-11-28 16:00:00",
        location: "Student Recreation Center",
        department: "CSE",
        status: "pending", // Pending CR moderation demonstration
        created_by: arifId,
      },
    ];

    for (const e of eventsToInsert) {
      await db.execute(
        `INSERT INTO events (title, description, event_date, location, department, status, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          e.title,
          e.description,
          e.event_date,
          e.location,
          e.department,
          e.status,
          e.created_by,
        ]
      );
    }
    console.log("  ✓ Seeded 4 events (3 approved + 1 pending moderation)");

    // 9. Project Collaboration
    await db.execute(
      "DELETE FROM projects WHERE title IN ('CampusConnect', 'Smart Attendance System', 'StudySync')"
    );

    const projectsToInsert = [
      {
        title: "CampusConnect",
        description: "A student-focused platform for sharing university information, event schedules, and real-time academic updates across departments.",
        course_context: "Software Engineering (CSE-3201)",
        tech_stack: "React, TypeScript, Express, MySQL, Tailwind CSS",
        repo_url: "https://github.com/cse-batch2024/campus-connect",
        team_members: "Mustavi Tripto, Nusrat Jahan",
        department: "CSE",
        created_by: triptoId,
        members: [
          { userId: triptoId, role: "Project Lead" },
          { userId: nusratId, role: "UI/UX Designer" },
        ],
        pendingJoinRequestUser: fahimId, // Fahim requests to join
      },
      {
        title: "Smart Attendance System",
        description: "An automated attendance management system leveraging QR codes and facial verification to streamline classroom attendance tracking.",
        course_context: "Database Management Systems (CSE-3203)",
        tech_stack: "Python, OpenCV, Flask, PostgreSQL, React",
        repo_url: "https://github.com/cse-batch2024/smart-attendance",
        team_members: "Arif Hasan, Fahim Ahmed",
        department: "CSE",
        created_by: arifId,
        members: [
          { userId: arifId, role: "Project Lead" },
          { userId: fahimId, role: "Computer Vision & Backend" },
        ],
      },
      {
        title: "StudySync",
        description: "A collaborative academic resource-sharing platform with peer-to-peer note reviews, previous exam archives, and study groups.",
        course_context: "Software Engineering (CSE-3201)",
        tech_stack: "Next.js, Node.js, MongoDB, Tailwind CSS",
        repo_url: "https://github.com/cse-batch2024/study-sync",
        team_members: "Nusrat Jahan, Sakib Rahman",
        department: "CSE",
        created_by: nusratId,
        members: [
          { userId: nusratId, role: "Project Lead" },
          { userId: sakibCrId, role: "Backend & Cloud" },
        ],
        pendingInvitationUser: triptoId, // Nusrat invites Tripto
      },
    ];

    for (const p of projectsToInsert) {
      const [res] = await db.execute(
        `INSERT INTO projects (title, description, course_context, tech_stack, repo_url, team_members, department, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          p.title,
          p.description,
          p.course_context,
          p.tech_stack,
          p.repo_url,
          p.team_members,
          p.department,
          p.created_by,
        ]
      );
      const projectId = res.insertId;

      // Project members
      if (p.members) {
        for (const m of p.members) {
          await db.execute(
            `INSERT INTO project_members (project_id, user_id, role_in_project)
             VALUES (?, ?, ?)`,
            [projectId, m.userId, m.role]
          );
        }
      }

      // Incoming join request
      if (p.pendingJoinRequestUser) {
        await db.execute(
          `INSERT INTO project_requests (project_id, user_id, status, request_type)
           VALUES (?, ?, 'pending', 'join_request')`,
          [projectId, p.pendingJoinRequestUser]
        );
      }

      // Incoming invitation
      if (p.pendingInvitationUser) {
        await db.execute(
          `INSERT INTO project_requests (project_id, user_id, status, request_type)
           VALUES (?, ?, 'pending', 'invitation')`,
          [projectId, p.pendingInvitationUser]
        );
      }
    }
    console.log("  ✓ Seeded 3 collaborative projects with members, join requests, and team invitations");

    // 10. Academic Course Materials / Resources
    await db.execute(
      "DELETE FROM materials WHERE title IN ('CSE-3201 Lecture Notes: Agile & Scrum Framework', 'CSE-3203 Lab Manual: Schema Normalization & BCNF', 'CSE-3205 Lecture Slides: IP Addressing & Subnetting', 'CSE-3207 Question Bank: Previous Midterm Exam Solutions', 'CSE-3209 Lecture Notes: RISC vs CISC Architecture Summary')"
    );

    const materialsToInsert = [
      {
        title: "CSE-3201 Lecture Notes: Agile & Scrum Framework",
        course_code: "CSE-3201",
        category: "Lecture Notes",
        file_url: "https://example.com/materials/cse3201-agile-scrum.pdf",
        file_path: "/uploads/cse3201-agile-scrum.pdf",
        status: "approved",
        uploaded_by: sakibCrId,
        reviewed_by: sakibCrId,
        reviewed_at: new Date(),
      },
      {
        title: "CSE-3203 Lab Manual: Schema Normalization & BCNF",
        course_code: "CSE-3203",
        category: "Lab Manual",
        file_url: "https://example.com/materials/cse3203-normalization-guide.pdf",
        file_path: "/uploads/cse3203-normalization-guide.pdf",
        status: "approved",
        uploaded_by: sakibCrId,
        reviewed_by: sakibCrId,
        reviewed_at: new Date(),
      },
      {
        title: "CSE-3205 Lecture Slides: IP Addressing & Subnetting",
        course_code: "CSE-3205",
        category: "Slides",
        file_url: "https://example.com/materials/cse3205-ip-subnetting.pdf",
        file_path: "/uploads/cse3205-ip-subnetting.pdf",
        status: "approved",
        uploaded_by: fahimId,
        reviewed_by: sakibCrId,
        reviewed_at: new Date(),
      },
      {
        title: "CSE-3207 Question Bank: Previous Midterm Exam Solutions",
        course_code: "CSE-3207",
        category: "Question Bank",
        file_url: "https://example.com/materials/cse3207-midterm-solutions.pdf",
        file_path: "/uploads/cse3207-midterm-solutions.pdf",
        status: "approved",
        uploaded_by: triptoId,
        reviewed_by: sakibCrId,
        reviewed_at: new Date(),
      },
      {
        title: "CSE-3209 Lecture Notes: RISC vs CISC Architecture Summary",
        course_code: "CSE-3209",
        category: "Lecture Notes",
        file_url: "https://example.com/materials/cse3209-risc-cisc-summary.pdf",
        file_path: "/uploads/cse3209-risc-cisc-summary.pdf",
        status: "pending", // Pending CR moderation demonstration
        uploaded_by: arifId,
        reviewed_by: null,
        reviewed_at: null,
      },
    ];

    for (const m of materialsToInsert) {
      await db.execute(
        `INSERT INTO materials (title, course_code, category, file_url, file_path, status, uploaded_by, reviewed_by, reviewed_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          m.title,
          m.course_code,
          m.category,
          m.file_url,
          m.file_path,
          m.status,
          m.uploaded_by,
          m.reviewed_by,
          m.reviewed_at,
        ]
      );
    }
    console.log("  ✓ Seeded 5 course resources (4 approved + 1 pending moderation)");

    // 11. Notifications
    // Clean old demo notifications
    await db.execute(
      "DELETE FROM notifications WHERE user_id IN (?, ?, ?, ?, ?, ?)",
      [triptoId, arifId, nusratId, fahimId, sakibCrId, adminId]
    );

    const notificationsToInsert = [
      {
        userId: triptoId,
        type: "announcement",
        title: "New Announcement: Database Lab Submission Deadline",
        message: "CR Sakib Rahman posted an important announcement regarding Database Management Systems lab reports.",
        relatedEntityType: "notice",
        relatedEntityId: null,
        isRead: 0,
      },
      {
        userId: triptoId,
        type: "task",
        title: "Task Due Soon: Database Design Assignment",
        message: "Database Design Assignment is due in 4 days (Nov 8, 11:59 PM).",
        relatedEntityType: "task",
        relatedEntityId: null,
        isRead: 0,
      },
      {
        userId: triptoId,
        type: "project_request",
        title: "Project Join Request Received",
        message: "Fahim Ahmed requested to join your project CampusConnect.",
        relatedEntityType: "project",
        relatedEntityId: null,
        isRead: 0,
      },
      {
        userId: triptoId,
        type: "project_request",
        title: "Project Invitation Received",
        message: "Nusrat Jahan invited you to collaborate on StudySync.",
        relatedEntityType: "project",
        relatedEntityId: null,
        isRead: 0,
      },
      {
        userId: triptoId,
        type: "event",
        title: "Upcoming Event: CSE Batch Project Presentation",
        message: "CSE Batch Project Presentation will take place on November 18 at 10:00 AM.",
        relatedEntityType: "event",
        relatedEntityId: null,
        isRead: 1,
      },
      // Notifications for CR
      {
        userId: sakibCrId,
        type: "moderation",
        title: "New Pending Submissions in Moderation Queue",
        message: "There are pending tasks, events, and materials submitted by students awaiting your review.",
        relatedEntityType: "moderation",
        relatedEntityId: null,
        isRead: 0,
      },
    ];

    for (const notif of notificationsToInsert) {
      await db.execute(
        `INSERT INTO notifications (user_id, type, title, message, related_entity_type, related_entity_id, is_read)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          notif.userId,
          notif.type,
          notif.title,
          notif.message,
          notif.relatedEntityType,
          notif.relatedEntityId,
          notif.isRead,
        ]
      );
    }
    console.log("  ✓ Seeded realistic notifications for demo accounts");

    console.log("\n✨ Demo data seeding completed successfully!");
    console.log("==================================================================");
    console.log("DEMO USER CREDENTIALS (All accounts use password: BatchHub@123)");
    console.log("------------------------------------------------------------------");
    console.log("1. Student (Lead):  tripto.demo@batchhub.test   | Role: student");
    console.log("2. Student:         arif.demo@batchhub.test     | Role: student");
    console.log("3. Student:         nusrat.demo@batchhub.test   | Role: student");
    console.log("4. Student:         fahim.demo@batchhub.test    | Role: student");
    console.log("5. Class Rep (CR):  sakib.cr@batchhub.test      | Role: cr");
    console.log("6. Administrator:   admin.demo@batchhub.test    | Role: admin");
    console.log("==================================================================\n");

    process.exit(0);
  } catch (err) {
    console.error("❌ Demo data seeding failed:", err);
    process.exit(1);
  }
}

seedDemoData();
