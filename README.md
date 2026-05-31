# 📚 Study Calendar

A full-stack study productivity app for students to organize exams, track study sessions, manage tasks, and stay motivated — with built-in Pomodoro timer, analytics, and end-to-end encrypted friend messaging.

Built with **React 19**, **Convex** (real-time backend), **TypeScript**, and **Vite**.

---

## Features

| Feature | Description |
|---|---|
| **Dashboard** | At-a-glance overview: upcoming exams, today's tasks & events, daily log, study streak, weekly time chart |
| **Calendar** | Visual calendar with events, study sessions, and color-coded subjects |
| **Exams** | Track exams with dates, coefficients, and grades |
| **Tasks** | Daily and general to-do items with priority levels (low/medium/high) |
| **Daily Log** | Log study time per subject with duration tracking |
| **Pomodoro Timer** | Built-in work/break timer with session logging |
| **Subjects** | Color-coded course management |
| **Analytics** | Study statistics, donut charts, line charts, achievements/badges system |
| **Friends & Chat** | Friend system with **end-to-end encrypted** messaging (RSA-OAEP 2048-bit) |
| **Theme Customization** | Dark/light mode with customizable accent colors, backgrounds, and UI variables |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript 6, Vite 8 |
| **Backend** | Convex (real-time database + serverless functions) |
| **Auth** | Convex Auth (built-in provider) |
| **Encryption** | Web Crypto API (RSA-OAEP, SHA-256) |
| **Styling** | Custom CSS with CSS custom properties theme system |
| **Utilities** | date-fns, jose |

---

## Getting Started

### Prerequisites

- Node.js >= 18
- pnpm
- A Convex account + deployment

### Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Set up environment variables
cp .env.local.example .env.local
# Edit .env.local and add your Convex deployment URL:
# VITE_CONVEX_URL=https://your-project.convex.cloud

# 3. Start the Convex dev server (in one terminal)
npx convex dev

# 4. Start the Vite dev server (in another terminal)
pnpm dev
```

The app will be available at `http://localhost:5173`.

### Build for Production

```bash
pnpm build
```

This runs `convex deploy`, TypeScript type-checking, and Vite production build in sequence.

---

## Project Structure

```
study-calendar/
├── convex/                  # Convex backend (serverless functions + schema)
│   ├── auth.config.ts       # Auth provider config
│   ├── auth.ts              # Auth mutation handlers
│   ├── dailyLogs.ts         # Daily study log queries/mutations
│   ├── events.ts            # Calendar event queries/mutations
│   ├── exams.ts             # Exam queries/mutations
│   ├── friends.ts           # Friend system + E2E encrypted chat
│   ├── http.ts              # HTTP action handlers
│   ├── schema.ts            # Database schema (all tables)
│   ├── subjects.ts          # Subject queries/mutations
│   └── tasks.ts             # Task queries/mutations
├── src/
│   ├── components/
│   │   ├── auth/            # Sign-in component
│   │   ├── layout/          # Sidebar navigation
│   │   └── ui/              # Shared UI components (Modal, SubjectBadge, etc.)
│   ├── pages/
│   │   ├── AnalyticsView.tsx    # Stats, charts, achievements
│   │   ├── CalendarView.tsx     # Calendar with events
│   │   ├── DailyLogView.tsx     # Daily study logging
│   │   ├── Dashboard.tsx        # Home overview
│   │   ├── ExamsView.tsx        # Exam management
│   │   ├── FriendsView.tsx      # Friends + encrypted chat
│   │   ├── PomodoroView.tsx     # Pomodoro timer
│   │   ├── SettingsView.tsx     # Theme + customization
│   │   ├── SubjectsView.tsx     # Subject management
│   │   └── TasksView.tsx        # Task management
│   ├── utils/
│   │   ├── colorUtils.ts    # Theme customization utilities
│   │   ├── crypto.ts        # RSA-OAEP end-to-end encryption
│   │   └── statsUtils.ts    # Streak & achievement calculations
│   ├── App.tsx              # Root app + global state
│   ├── main.tsx             # Entry point + Convex client setup
│   └── index.css            # Complete theme system with CSS variables
├── index.html
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## Database Schema

| Table | Purpose |
|---|---|
| `subjects` | Color-coded courses/subjects |
| `exams` | Exams with dates, coefficients, grades |
| `dailyLogs` | Daily study session logs with duration |
| `tasks` | To-do items (daily + general) with priorities |
| `events` | Time-blocked calendar events |
| `userProfiles` | User display names + E2E public keys |
| `friendships` | Friend connections with pending/accepted status |
| `messages` | End-to-end encrypted chat messages |
| `blocks` | User block list |

---

## Key Features in Detail

### 🎨 Theme System
Fully customizable via CSS custom properties. Dark mode default with light mode toggle. Users can customize accent colors, backgrounds, text colors, and borders — all persisted across sessions.

### 🔒 End-to-End Encryption
Friend chat uses RSA-OAEP 2048-bit keys generated via the Web Crypto API. Public keys are stored in user profiles; messages are encrypted client-side before being stored in Convex.

### 📊 Analytics & Achievements
Tracks total study hours, sessions completed, task completion rates, and study streaks. Awards badges/achievements for milestones like "First Log", "Centurion" (100 sessions), "Marathon" (7-day streak), etc.

### 🍅 Pomodoro Timer
Built-in Pomodoro technique timer with configurable work/break durations, visual progress ring, and automatic study session logging on completion.

---

## License

Private project.
