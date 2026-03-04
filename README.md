# CreatiAI ✦

> **AI Creative Intelligence Platform** — a collaborative canvas where human creativity and AI co-create together.

[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

---

## Overview

CreatiAI is a full-stack creative platform combining a **ReactFlow-based visual canvas** with **real-time AI co-creation** (Anthropic Claude Sonnet via SSE streaming), **collaborative editing** via Socket.IO, and a full **admin dashboard**. Users build creative projects as interconnected node graphs, with an always-present AI co-creator that _thinks with them_, not for them.

**[→ Try the demo instantly — no signup, no backend required](#demo-mode)**

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 18 | UI framework |
| TypeScript | strict | Type safety |
| Vite | 5 | Build tool + HMR |
| Tailwind CSS | 3 | Styling (glassmorphic design system) |
| ReactFlow | 11 | Visual canvas |
| Framer Motion | 11 | Animations |
| Zustand | 4 | Client state management |
| TanStack Query | 5 | Server state + caching |
| Socket.IO client | 4 | Real-time collaboration |
| React Router | 6 | Routing |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Express | 4 | HTTP server |
| TypeScript | strict | Type safety |
| Socket.IO | 4 | WebSocket collaboration |
| Anthropic SDK | latest | Claude Sonnet SSE streaming |
| MongoDB + Mongoose | 8 | Data persistence |
| JWT | — | Auth (access 15min + refresh 7d) |
| Zod | 3 | Request validation |
| bcryptjs | — | Password hashing |

---

## Project Structure

```
CreatiAI/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx        # Public marketing page
│   │   │   ├── OnboardingPage.tsx     # First-run creativity profile setup
│   │   │   ├── auth/                  # Login, Signup, Forgot/Reset password
│   │   │   ├── workspace/             # Canvas, Export, Collaborate, Versions, Replay
│   │   │   ├── profile/               # Profile, Preferences, Learning
│   │   │   ├── admin/                 # Dashboard, Users, Analytics,
│   │   │   │                          #   Governance, Flags, Audit, Billing
│   │   │   └── errors/                # 404
│   │   ├── components/
│   │   │   ├── ai/                    # AICoCreatorPanel, AIResponseCard
│   │   │   ├── canvas/                # CanvasTopBar, toolbar, custom nodes
│   │   │   ├── layout/                # AppShell, Sidebar
│   │   │   └── ui/                    # Button, Input, ConfidenceBadge, CommandPalette
│   │   ├── stores/                    # Zustand: user, canvas, ai, collab, ui, notifications
│   │   ├── lib/
│   │   │   ├── api.ts                 # Axios client with JWT interceptors
│   │   │   └── demoData.ts            # Demo mode mock data + API interceptor
│   │   ├── hooks/                     # useSocket, useKeyboardShortcuts
│   │   ├── types/                     # Shared TypeScript interfaces
│   │   └── styles/                    # globals.css — full CSS design system
│   ├── .env.example
│   ├── vite.config.ts
│   └── package.json
│
└── backend/
    ├── src/
    │   ├── server.ts                  # Express + Socket.IO entry point
    │   ├── routes/
    │   │   ├── auth.ts                # Register, login, refresh, logout
    │   │   ├── projects.ts            # CRUD + canvas save/load + versions
    │   │   ├── ai.ts                  # SSE streaming AI endpoint
    │   │   ├── library.ts             # Asset library
    │   │   ├── explore.ts             # Public community explore
    │   │   ├── share.ts               # Public share links
    │   │   └── admin.ts               # Admin-only endpoints
    │   └── middleware/
    │       ├── auth.ts                # JWT verify + requireAuth
    │       └── admin.ts               # requireAdmin role guard
    ├── .env.example
    ├── tsconfig.json
    └── package.json
```

---

## Demo Mode

**No backend or database needed.** Click **"Try Demo"** on the landing page or login screen to instantly explore the full app with a seeded admin account and mock data.

| | |
|---|---|
| **Name** | Alex Demo |
| **Role** | Admin |
| **Plan** | Pro |

Everything works in demo mode:
- ✅ Workspace with 5 pre-seeded projects
- ✅ Creative canvas with sample nodes
- ✅ Full admin dashboard — users, analytics, billing, flags, governance, audit
- ✅ Profile, preferences, library, explore, notifications
- ✅ Gold **"✦ Demo Mode"** badge shown in the bottom-left corner
- ℹ️ AI streaming requires a real backend + Anthropic API key

---

## Quick Start

### 1. Clone & install

```bash
git clone https://github.com/YOUR_USERNAME/CreatiAI.git
cd CreatiAI

cd frontend && npm install
cd ../backend && npm install
```

### 2. Configure environment variables

```bash
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env
```

Edit `backend/.env`:
```bash
ANTHROPIC_API_KEY=sk-ant-...          # https://console.anthropic.com
MONGODB_URI=mongodb://localhost:27017/creatiai
JWT_ACCESS_SECRET=$(openssl rand -base64 48)
JWT_REFRESH_SECRET=$(openssl rand -base64 48)
```

### 3. Start MongoDB

```bash
brew services start mongodb-community
# or: mongod --dbpath /usr/local/var/mongodb
```

### 4. Run dev servers

```bash
# Terminal 1 — Backend  →  http://localhost:4000
cd backend && npm run dev

# Terminal 2 — Frontend →  http://localhost:5173
cd frontend && npm run dev
```

### No backend? Use Demo Mode

Visit `http://localhost:5173` → click **"Try Demo"**

---

## Key Features

| Feature | Description |
|---|---|
| **AI Co-Creator** | SSE-streaming Claude Sonnet with confidence levels, self-critique, and alternative paths |
| **Creative Canvas** | ReactFlow canvas with text, image, sketch, AI-generated, and group nodes |
| **What-If Mode** | Branch canvas state and explore counterfactual AI responses |
| **Real-time Collab** | Socket.IO cursor tracking, node sync, and live presence |
| **Session Replay** | Full playback of canvas editing sessions |
| **Version History** | Auto-versioning + named checkpoints with restore |
| **Learning Model** | Per-user AI personality adaptation across sessions |
| **Export** | PNG, SVG, PDF, JSON, and Markdown |
| **Admin Panel** | Users, analytics, AI governance, feature flags, audit log, billing |
| **Command Palette** | ⌘K global command palette |
| **Demo Mode** | Full app preview with mock data — no backend needed |

---

## Design System

Custom dark-mode glassmorphic system defined in `frontend/src/styles/globals.css`.

| Token | Value | Usage |
|---|---|---|
| `--bg-page` | `#080910` | Page background |
| `--purple` | `#7b61ff` | Primary brand |
| `--cyan` | `#00d4ff` | Accent / links |
| `--gold` | `#ffd700` | Premium / demo |
| `--success` | `#10b981` | Positive states |
| `--error` | `#ef4444` | Destructive states |
| Font display | Syne | Headings |
| Font body | DM Sans | Body text |
| Font mono | JetBrains Mono | Code / labels |

---

## API Reference

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | — | Register new user |
| `POST` | `/api/auth/login` | — | Login → JWT pair |
| `POST` | `/api/auth/refresh` | — | Refresh access token |
| `POST` | `/api/auth/logout` | ✓ | Invalidate refresh token |
| `GET` | `/api/auth/me` | ✓ | Current user profile |
| `GET` | `/api/projects` | ✓ | List projects |
| `POST` | `/api/projects` | ✓ | Create project |
| `GET` | `/api/projects/:id` | ✓ | Get project + canvas |
| `PUT` | `/api/projects/:id` | ✓ | Save canvas state |
| `DELETE` | `/api/projects/:id` | ✓ | Delete project |
| `POST` | `/api/ai/think` | ✓ | **SSE streaming AI** |
| `POST` | `/api/ai/what-if` | ✓ | Branch exploration |
| `GET` | `/api/share/:token` | — | Public share view |
| `GET` | `/api/explore` | ✓ | Community projects |
| `GET` | `/api/library` | ✓ | Asset library |
| `GET` | `/api/admin/stats` | 🔴 Admin | Platform stats |
| `GET` | `/api/admin/users` | 🔴 Admin | User management |

### AI Streaming

`POST /api/ai/think` → Server-Sent Events:

```
data: {"type":"token","token":"Here"}
data: {"type":"token","token":" is"}
data: {"type":"done","text":"Full response...","confidenceLevel":0.87,"usage":{"inputTokens":120,"outputTokens":248}}
data: [DONE]
```

---

## Scripts

### Frontend (`cd frontend`)
```bash
npm run dev      # Dev server → http://localhost:5173
npm run build    # Production build → dist/
npm run preview  # Preview production build
```

### Backend (`cd backend`)
```bash
npm run dev      # ts-node-dev with hot reload
npm run build    # Compile TypeScript → dist/
npm start        # Run dist/server.js
npm run lint     # ESLint
```

---

## Contributing

1. Fork the repo
2. Create a branch: `git checkout -b feat/your-feature`
3. Commit: `git commit -m 'feat: your feature'`
4. Push: `git push origin feat/your-feature`
5. Open a Pull Request

---

## License

[MIT](./LICENSE) © 2026 CreatiAI

CreatiAI is a full-stack platform combining a ReactFlow-based visual canvas with real-time AI co-creation (Claude Sonnet), collaborative editing via Socket.IO, and a comprehensive admin system. Users build creative projects as interconnected node graphs, with an always-present AI co-creator that thinks with them, not for them.

---

## Tech Stack

### Frontend
- **React 18** + **TypeScript** (strict)
- **Vite 5** for builds + HMR
- **Tailwind CSS 3** for styling
- **ReactFlow 11** for the canvas
- **Framer Motion 11** for animations
- **Zustand 4** for state management
- **React Query v5** (`@tanstack/react-query`) for server state
- **Socket.IO client 4** for real-time collaboration
- **React Router v6** for routing

### Backend
- **Express 4** + **TypeScript**
- **Socket.IO 4** for WebSocket collaboration
- **Anthropic Claude** (`claude-sonnet-4-5`) via SSE streaming
- **MongoDB** + **Mongoose** for data persistence
- **JWT** (access 15min + refresh 7d) for auth
- **Zod** for request validation

---

## Project Structure

```
CreatiAI/
├── frontend/              # Vite + React app
│   ├── src/
│   │   ├── pages/         # All routes/pages
│   │   │   ├── auth/      # Login, Signup, Forgot/Reset password
│   │   │   ├── workspace/ # Canvas, Export, Collaborate, Versions, Replay
│   │   │   ├── profile/   # Profile, Preferences, Learning
│   │   │   ├── admin/     # Admin layout + all admin pages
│   │   │   └── errors/    # 404
│   │   ├── components/
│   │   │   ├── ai/        # AICoCreatorPanel, AIResponseCard
│   │   │   ├── canvas/    # CanvasTopBar, CanvasToolbar, nodes, etc.
│   │   │   └── ui/        # Button, Input, ConfidenceBadge, CommandPalette
│   │   ├── stores/        # Zustand stores (user, canvas, ai, collab, ui, notifications)
│   │   ├── lib/           # Axios API client
│   │   ├── hooks/         # useSocket, useKeyboardShortcuts
│   │   ├── types/         # TypeScript types
│   │   └── styles/        # globals.css (full design system)
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
│
└── backend/               # Express + Socket.IO server
    ├── src/
    │   ├── server.ts      # Entry point
    │   ├── routes/        # auth, projects, ai, library, explore, share, admin
    │   └── middleware/    # auth (JWT), admin (role guard)
    ├── tsconfig.json
    └── package.json
```

---

## Quick Start

### 1. Clone + install dependencies

```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

### 2. Configure environment variables

```bash
# Frontend
cp frontend/.env.example frontend/.env

# Backend
cp backend/.env.example backend/.env
# Edit backend/.env:
#   ANTHROPIC_API_KEY=sk-ant-...
#   MONGODB_URI=mongodb://localhost:27017/creatiai
#   JWT_ACCESS_SECRET=<32+ char secret>
#   JWT_REFRESH_SECRET=<32+ char secret>
```

### 3. Start MongoDB (local)

```bash
mongod --dbpath /usr/local/var/mongodb
# Or with Homebrew:
brew services start mongodb-community
```

### 4. Run dev servers

```bash
# Terminal 1 — Backend
cd backend
npm run dev
# Runs on http://localhost:4000

# Terminal 2 — Frontend
cd frontend
npm run dev
# Runs on http://localhost:3000
```

---

## Key Features

| Feature | Description |
|---|---|
| **AI Co-Creator** | Streaming Claude Sonnet responses with confidence levels, self-critique, and alternatives |
| **Creative Canvas** | ReactFlow-based canvas with text, image, sketch, AI-generated, and group nodes |
| **What-If Mode** | Branch canvas state and explore counterfactual AI responses |
| **Real-time Collab** | Socket.IO cursor tracking, node sync, and presence |
| **Session Replay** | Playback of canvas editing sessions |
| **Version History** | Auto-versioning + named checkpoints with restore |
| **Learning Model** | Per-user AI personality adaptation tracking |
| **Export** | PNG, SVG, PDF, JSON, and Markdown export |
| **Admin Panel** | Full admin suite: users, analytics, governance, feature flags, audit, billing |
| **Command Palette** | ⌘K global command palette |

---

## Design System

| Token | Value |
|---|---|
| `--bg-page` | `#080910` |
| `--purple` | `#7b61ff` |
| `--cyan` | `#00d4ff` |
| `--gold` | `#ffd700` |
| Font display | Syne |
| Font body | DM Sans |
| Font mono | JetBrains Mono |

---

## API Overview

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Register |
| POST | `/api/auth/login` | — | Login |
| POST | `/api/auth/refresh` | — | Refresh tokens |
| GET | `/api/auth/me` | ✓ | Get current user |
| GET | `/api/projects` | ✓ | List projects |
| POST | `/api/projects` | ✓ | Create project |
| PUT | `/api/projects/:id` | ✓ | Save canvas |
| POST | `/api/ai/think` | ✓ | **SSE streaming AI** |
| POST | `/api/ai/what-if` | ✓ | Branch exploration |
| GET | `/api/share/:token` | — | Public share view |
| GET | `/api/explore` | ✓ | Community explore |
| GET | `/api/library` | ✓ | Asset library |
| GET | `/api/admin/stats` | Admin | Platform stats |
| GET | `/api/admin/users` | Admin | User management |

---

## AI Streaming

The AI endpoint (`POST /api/ai/think`) returns SSE events:

```
data: {"type": "token", "token": "..."}
data: {"type": "done", "text": "...", "confidenceLevel": 0.82, "usage": {...}}
data: [DONE]
```

The frontend `aiStore` connects via `fetch()` + `ReadableStream` to consume these events and update the canvas in real-time.

---

## License

MIT
