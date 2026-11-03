# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Undergraduate University Students:** Cohort peers seeking a unified view of deadlines, class notices, syllabus resources, peer project partners, and campus events.
- **Class Representatives (CRs):** Elected/designated cohort leads responsible for relaying faculty updates, approving student-submitted study resources, screening cohort tasks/events, and broadcasting urgent academic announcements.
- **System Administrators:** Department or academic moderators overseeing user roles, account moderation, and platform stability.

## Product Purpose

BatchHub is a centralized academic management and collaboration platform tailored specifically for university batch cohorts. It eliminates fragmented communication (WhatsApp groups, scattered Google Drive links, lost email threads) by unifying academic announcements, crowd-sourced yet peer-reviewed study resources, course task tracking, team formation for academic projects, and batch events under one coherent workspace.

## Positioning

Unlike generic productivity apps (Notion, Trello) or bureaucratic university ERPs/LMSs (Moodle, Canvas), BatchHub is built around the **CR-moderated peer workflow**: students actively contribute tasks, events, and study materials, while trusted Class Representatives maintain signal quality and prevent noise through lightweight approval gates.

## Operating Context

- **Academic Cadence:** Semesters, assignment deadlines, lab submissions, exam schedules, and department events.
- **Daily Routine:** Students check daily active tasks, urgent pinned notices from CRs, and peer-recommended course notes before exams.
- **Collaboration Rituals:** Team project partner discovery and recruitment via the Student Directory, and project join requests/invitations.
- **Environments:** Desktop web browsers and laptop screens used in lecture halls, dorms, and campus libraries.

## Capabilities and Constraints

- **Stack Constraints:** Vanilla JavaScript (ES6 Modules), HTML5, CSS3 on frontend; Node.js + Express.js REST API on backend; MySQL (`mysql2`) relational database. Strictly no React or SPA framework migration.
- **Security & Authorization:** Server-enforced role authorization (`student`, `cr`, `admin`). Strict protection against privilege escalation during public registration. Parameterized SQL queries preventing injection.
- **Cross-Module Features:**
  - Real-time notification center (announcements, invites, approvals).
  - Global debounced cross-module search with sanitized public outputs.
  - Multi-status task management with individual student completion tracking (`task_completions`).
  - Project team rosters with dual-direction requests (join requests & owner invitations).
  - Pinned announcement board with priority escalation (`Normal`, `Important`, `Urgent`).

## Brand Commitments

- **Brand Name:** BatchHub
- **Aesthetic Identity:** Dark Emerald SaaS design language (`#0B1418` dark background, `#2EE59D` primary emerald, `#111D22` card containers, `#1A2F37` borders).
- **Typography:** Inter sans-serif clean visual hierarchy.
- **Tone:** Professional, focused, academic yet modern. High scanability, minimal decoration, restrained emerald accents.

## Evidence on Hand

- Fully functional MySQL schema and migration files (`database/schema.sql`, `database/migrations/`).
- 51 passing backend and security automated test cases (`server/test/security_and_auth.test.js`, `server/test/phase2_features.test.js`).
- Working frontend client (`client/`) with modular views and components served on port 3000.

## Product Principles

1. **Signal Over Noise:** Academic deadlines and critical notices take priority; unverified submissions are gated by CR moderation.
2. **True Cohort Collaboration:** Empower students to share resources and form project teams without relying on faculty to post everything.
3. **Frictionless Task Tracking:** Per-student task completions keep personal progress isolated while keeping shared tasks visible to the batch.
4. **Architectural Integrity:** Clean vanilla web standards with robust relational persistence and zero unnecessary framework bloat.

## Accessibility & Inclusion

- Keyboard navigability across all global menus, modals, and interactive dropdowns.
- High-contrast text on dark emerald surfaces meeting standard readability guidelines.
- Clear contextual empty states and explicit error/success feedback for all form actions.

