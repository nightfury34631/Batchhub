# Product Specification — BatchHub

<!-- impeccable:product-schema 1 -->

## Platform

Web Application (Responsive Desktop & Laptop First, with Mobile Viewport Support)

## Users

- **Undergraduate University Students:** Cohort peers seeking a unified view of deadlines, class notices, syllabus resources, peer project partners, and campus events.
- **Class Representatives (CRs):** Elected/designated cohort leads responsible for relaying faculty updates, approving student-submitted study resources, screening cohort tasks/events, and broadcasting urgent academic announcements.
- **System Administrators:** Department or academic moderators overseeing user roles, account moderation, and platform stability.

## Product Purpose

BatchHub is a centralized academic management and collaboration platform tailored specifically for university batch cohorts. It eliminates fragmented communication (WhatsApp groups, scattered Google Drive links, lost email threads) by unifying academic announcements, crowd-sourced yet peer-reviewed study resources, course task tracking, team formation for academic projects, and batch events under one coherent, high-signal workspace.

## Positioning

Unlike generic productivity apps (Notion, Trello) or bureaucratic university ERPs/LMSs (Moodle, Canvas), BatchHub is built around the **CR-moderated peer workflow**: students actively contribute tasks, events, and study materials, while trusted Class Representatives maintain signal quality and prevent noise through lightweight approval gates.

## Operating Context

- **Academic Cadence:** Semesters, assignment deadlines, lab submissions, exam schedules, and department events.
- **Daily Routine:** Students check daily active tasks, upcoming class schedules, urgent pinned notices from CRs, and peer-recommended course notes before exams.
- **Collaboration Rituals:** Team project partner discovery and recruitment via the Student Directory, and project join requests/invitations.
- **Environments:** Modern web browsers across lecture halls, dorms, and campus computer labs.

## Technology Stack & Architecture

### Frontend
- **Framework:** React 19 (`react`, `react-dom`)
- **Language:** TypeScript
- **Tooling & Bundler:** Vite
- **Styling:** Tailwind CSS v4 (`@tailwindcss/vite`) with custom Midnight Campus design tokens
- **Routing:** React Router v7 (`react-router-dom`) with client-side SPA routing and route guards
- **State Management & Caching:**
  - **Server State:** TanStack Query v5 (`@tanstack/react-query`) for asynchronous query caching, deduplication, and optimistic mutations
  - **Client State:** Zustand v5 (`zustand`) for persistent authentication state and active user context
- **Icons & UI:** Lucide React (`lucide-react`)
- **Motion:** Motion (`motion`)

### Backend
- **Runtime:** Node.js (v24 LTS)
- **Framework:** Express.js REST API
- **Architecture:** Layered MVC architecture (Routes → Middleware → Controllers → Database)
- **CORS & Middleware:** Configured CORS allowlist, JSON body parser, centralized error handler

### Database
- **Engine:** MySQL (MariaDB / MySQL 8.x)
- **Driver:** `mysql2` with promise-based connection pooling
- **Data Integrity:** Foreign key constraints, atomic transactions for multi-step operations, performance indexes, and uniqueness constraints on routine slots and course registrations

### Authentication & Authorization
- **Authentication:** JSON Web Tokens (JWT) signed with SHA-256 and transmitted via HTTP `Authorization: Bearer <token>` headers
- **Password Security:** Salted and hashed passwords via `bcryptjs` (cost factor 10)
- **Authorization:** Role-Based Access Control (RBAC) supporting three discrete tiers:
  - `student`: Standard cohort member with task completion tracking, resource submission, and project collaboration capabilities
  - `cr`: Class Representative with announcement publishing, peer task/event/resource moderation, and routine timetable management
  - `admin`: System Administrator with full moderation privileges and administrative access control
- **Rate Limiting:** Sliding-window rate limiter on authentication endpoints preventing credential stuffing
- **SQL Injection Prevention:** Parameterized SQL queries on all database operations

## Core Capabilities & Features

1. **Academic Flight Deck (Dashboard):**
   - Dynamic top metric cards (active tasks, completed assignments, overdue tasks).
   - Real-time Next Class indicator calculated dynamically from weekly routine timetable records.
   - Dynamic monthly academic calendar linked to real event and task due dates.
   - Pinned announcement banners for urgent cohort notices.

2. **Tasks & Deadlines:**
   - Multi-priority task catalog (`High`, `Medium`, `Low`) categorized by course code.
   - Individual student completion tracking via dedicated `task_completions` records (keeping student progress isolated while sharing task descriptions).
   - Student submission workflow allowing students to propose tasks for CR review.

3. **Cohort Bulletins & Announcements:**
   - Pinned announcements with priority badges (`Normal`, `Important`, `Urgent`).
   - Role-gated publishing restricted strictly to Class Representatives and Administrators.

4. **Campus Events & Schedules:**
   - Upcoming and past event timeline with venue, date, and organizer metadata.
   - Student proposal queue with CR moderation gate.

5. **Project Collaboration:**
   - Team project catalog with tech stack tags, repository links, and member rosters.
   - Bidirectional collaboration workflows: student join requests and project owner team invitations.

6. **Academic Resources (Study Materials):**
   - Categorized study materials repository (Lecture Notes, Lab Manuals, Slides, Question Banks).
   - CR review lifecycle with moderation status history (`pending`, `approved`, `rejected`) and reviewer feedback.

7. **Members Directory & Global Search:**
   - Student cohort directory searchable by name, student ID, department, batch, and skills.
   - Privacy protection: ordinary student email addresses are protected across batches while CR/Admin contact information remains accessible.
   - Debounced global search across announcements, tasks, events, and projects.

8. **In-App Notification Center:**
   - Notifications for announcements, task deadlines, project requests, and moderation alerts.
   - Deduplication protection preventing duplicate unread notices for the same entity within active intervals.

9. **CR / Admin Leadership Suite:**
   - Dedicated moderation panel (`/cr-panel`) for triaging student-submitted tasks, events, and study materials.
   - Academic management: registering semester courses and creating timetable slots with conflict prevention.

## Brand Identity & Design System

- **Brand Name:** BatchHub
- **Aesthetic Identity:** Midnight Campus design language (`#0B1316` canvas background, `#00D084` primary emerald accent, `#15242A` card surface, `#1B2E36` elevated containers, `#1F353C` structural borders).
- **Typography:** Inter / system sans-serif font stack with tabular numerical figures for dates and metrics.
- **Tone:** Professional, high-contrast, focused, academic yet modern.

## Evidence on Hand & Verification

- **Relational Schema:** Comprehensive MySQL schema and 4 versioned migration files in `database/`.
- **Automated Verification:** 164 automated tests passing with 100% success rate across 9 test suites (`npm test`).
- **Production Build:** Optimized Vite React 19 SPA build (`npm run build`).
- **Demonstration Dataset:** One-command reproducible demo seeder (`npm run seed:demo`).

## Product Principles

1. **Signal Over Noise:** Academic deadlines and critical notices take priority; unverified submissions are screened by CR moderation.
2. **True Cohort Collaboration:** Empower students to share resources and discover project partners.
3. **Frictionless Task Tracking:** Per-student task completions keep personal progress isolated while keeping shared tasks visible to the batch.
4. **Architectural Integrity:** Modern React 19 Single Page Application backed by a secure, transaction-safe Express and MySQL REST API.
