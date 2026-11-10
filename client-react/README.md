# BatchHub — React Frontend Application

This directory contains the primary frontend client for **BatchHub**, built with **React 19**, **TypeScript**, **Vite**, and **Tailwind CSS v4**.

---

## 🛠️ Technology Stack

- **Framework:** React 19 (`react`, `react-dom`)
- **Language:** TypeScript 5.x
- **Build Tool:** Vite 6.x
- **Styling:** Tailwind CSS v4 (`@tailwindcss/vite`) with custom Midnight Campus theme tokens
- **Routing:** React Router v7 (`react-router-dom`)
- **Server State & Caching:** TanStack Query v5 (`@tanstack/react-query`)
- **Client State:** Zustand v5 (`zustand`)
- **Icons:** Lucide React (`lucide-react`)
- **Animations:** Motion (`motion`)

---

## 🚀 Development & Build Scripts

```bash
# Run local Vite development server with HMR on port 3000
npm run dev

# Compile TypeScript and generate optimized production bundle in dist/
npm run build

# Preview the production build locally
npm run preview

# Run Oxlint checks
npm run lint
```

---

## 📁 Source Code Structure

```
client-react/src/
├── components/          # Reusable UI & Layout Components
│   ├── layout/          # AppLayout, Topbar, Sidebar, CommandPalette, ProtectedRoute
│   └── ui/              # Button, Card, Badge, Modal, Toast, Input, Tabs, etc.
├── services/            # Axios API client with JWT interceptor & auth service
├── stores/              # Zustand global client stores (useAuthStore)
├── types/               # TypeScript interfaces & domain types
├── views/               # Route views / pages
│   ├── announcements/   # Cohort Bulletins with pinned notices
│   ├── auth/            # Login and Register pages
│   ├── cr-panel/        # Class Rep & Admin moderation suites
│   ├── dashboard/       # Primary Academic Flight Deck
│   ├── events/          # Campus Events & interactive calendar
│   ├── members/         # Student directory with search & filters
│   ├── profile/         # User profile & account preferences
│   ├── projects/        # Project collaboration & team discovery
│   ├── resources/       # Study materials repository
│   └── tasks/           # Tasks, deadlines & completion tracking
├── App.tsx              # Application route tree & providers
├── index.css            # Midnight Campus theme tokens & Tailwind imports
└── main.tsx             # React DOM entrypoint
```
