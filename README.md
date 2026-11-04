# BatchHub — Centralized Academic Management & Collaboration Platform

BatchHub is a modern, high-performance academic management and student collaboration platform designed specifically for university cohorts.

---

## 🚀 Architecture & Port Configuration

| Service | Technology | Port / URL | Description |
| :--- | :--- | :--- | :--- |
| **Main Application** | React 19 + TypeScript + Vite + Tailwind v4 | `http://localhost:3000` | Primary frontend application with Midnight Campus theme |
| **Backend API** | Node.js + Express + MySQL | `http://localhost:5000/api` | REST API with JWT authentication & RBAC |

---

## ⚡ Quick Start (Running the Project)

### 1. Install Dependencies
```bash
# Install root orchestration tools
npm install

# Install client dependencies
cd client-react && npm install && cd ..

# Install server dependencies
cd server && npm install && cd ..
```

### 2. Run the Full Application (Frontend + Backend)
```bash
npm run dev
```
* **Frontend:** Starts Vite at `http://localhost:3000` with hot module replacement and reverse proxy to Express.
* **Backend:** Starts Express at `http://localhost:5000` connected to MySQL.

---

## 🛠️ Individual Commands & Workflows

### Development
* `npm run dev` — Starts both backend API (`:5000`) and React frontend (`:3000`) concurrently.
* `npm run client` — Starts only the React development server at `http://localhost:3000`.
* `npm run server` — Starts only the Express API backend at `http://localhost:5000`.

### Production & Verification
* `npm run build` — Compiles TypeScript and creates optimized production bundles in `client-react/dist`.
* `npm run preview` — Serves the production build on `http://localhost:3000` with API proxying and SPA fallback.
* `npm test` — Executes the complete automated test suite (82 integration, auth, and security tests).

---

## 🎨 Visual Identity — Midnight Campus
* **Canvas:** `#0B1316`
* **Card Surface:** `#15242A`
* **Elevated Surface:** `#1B2E36`
* **Inset Fields:** `#0E171B`
* **Structural Borders:** `#1F353C`
* **Primary Emerald Accent:** `#00D084` (Hover: `#00B875`)
* **Status Badges:** Red (`#F87171`), Amber (`#FBBF24`), Blue (`#38BDF8`), Purple (`#A78BFA`)

---

## 🔐 Key Features
1. **Academic Flight Deck:** Real-time class schedule routines, course deadlines, and cohort event calendar.
2. **Tasks & Deadlines:** Individual student completion tracking (`task_completions`), private student submission queues, and CR/Admin moderation triage.
3. **Campus Events & Schedules:** Interactive calendar with day filtering and suggestion workflows.
4. **Cohort Bulletins:** Pinned announcements, priority tagging, and role-restricted publishing.
5. **Project Collaboration:** Directory with tech stack badges, join requests, and member rosters.
6. **Academic Resources:** Study materials repository with notes, lecture slides, books, and exam question banks.
7. **Members Directory:** Student search by skills, student ID, batch, and direct project invitations.
8. **CR / Admin Panel:** Gated cohort leadership suite for approving peer submissions, adding timetable slots, and enrolling semester curriculum courses.

