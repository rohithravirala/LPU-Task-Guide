# LPU-Uni-Path — Product Understanding & Architecture

> One University. Multiple Portals. One Guided Path.

## 1. What we are building (and what we are not)

Students already have UMS, LPU Touch, LPU Live, departments and help desks. The
services exist; the hard part is knowing **where to start, which service to use,
what to prepare, and what to do next**. LPU-Uni-Path is a *guidance layer* on top of
those services:

```
Task Discovery  →  Guided Journey  →  Correct Service  →  Progress Tracking  →  Help & Support
 (Module 1)          (Module 2.1)       (Module 2.1)        (Module 2.2)          (Module 3)
```

Every screen must help a student answer one of these questions:

1. What do I want to do?            → Task Catalogue, search
2. Which university service?         → Service Identifier on tasks and steps
3. What do I need before starting?   → Task Reference (requirements, prerequisites)
4. What steps should I follow?       → Journey Rail
5. Which step am I on?               → "You are here" marker + Progress Strip
6. What if something goes wrong?     → Troubleshooting / FAQs (Module 3)
7. Where can I get more help?        → Help Centre / Support tickets (Module 3)

**Non-goals / hard rules**

- We never replace or impersonate a university portal, and never claim a university
  transaction succeeded. Progress = the student's own checklist.
- We never invent official URLs, policies, deadlines, fees, or notices. Every task and
  service carries a `verificationStatus`; links are shown only when `verified`.
  Unverified items render "Official link to be verified".
- All content (tasks, steps, services, FAQs, notices) is data in MongoDB, managed by
  admins — never hard-coded in pages.

## 2. Technical architecture

Two independent applications in one repository:

```
┌──────────────────────────┐   HTTPS + JSON (axios, withCredentials)   ┌───────────────────────────┐
│ frontend/  React + Vite  │ ────────────────────────────────────────▶ │ backend/  Next.js (API)   │
│ React Router, Tailwind 4 │ ◀──────── { success, message, data } ──── │ App Router route handlers │
│ AuthContext, module hooks│        httpOnly JWT cookie (lpu token)    │ controllers → services    │
└──────────────────────────┘                                           │ Mongoose models           │
         :5173                                                         └─────────────┬─────────────┘
                                                                                     │ mongoose
                                                                               ┌─────▼─────┐
                                                                               │ MongoDB   │
                                                                               └───────────┘
```

| Concern | Decision |
| --- | --- |
| Frontend | React 19 + Vite 8, React Router 7, Tailwind CSS 4 (`@theme` tokens), axios, lucide-react, react-hook-form, react-hot-toast, date-fns |
| Backend | Next.js 16 App Router, **route handlers only** (no UI). Cache Components is on, so every handler calls `connection()` and always runs per request |
| Database | MongoDB via Mongoose 9, cached connection in `lib/mongodb.js` |
| Validation | `zod` schemas in `backend/src/validators` (server is the source of truth); react-hook-form rules on the client for fast feedback |
| Auth | bcrypt (`bcryptjs`) password hashes, JWT (HS256) stored in an **httpOnly cookie**. The server never trusts a user id sent by the client |
| CORS | `backend/src/proxy.js` (Next 16 "proxy", formerly middleware) answers preflight and allow-lists origins from `CLIENT_ORIGINS`. Mutating requests from a non-allowed `Origin` are rejected (CSRF guard) |
| Layering | `route.js` (thin) → `controllers/` (parse + validate request) → `services/` (business rules, DB) → `models/` |
| Responses | `{ success: true, message, data, meta? }` / `{ success: false, message, errors? }` from `utils/apiResponse.js` |
| Errors | `ApiError` + one central mapper in `lib/apiHandler.js` (zod → 400, CastError → 400, duplicate key → 409, DB down → 503) |

### Request lifecycle (backend)

```
proxy.js (CORS) → route.js → apiHandler(controller, { auth | roles })
                               ├─ await connection()        // request-time only
                               ├─ await connectDB()         // cached
                               ├─ authenticate(request)     // cookie → JWT → User lookup
                               ├─ role / origin checks
                               └─ controller({ request, params, user }) → service → model
```

## 3. Folder structure

Paths follow the team's agreed layout (`frontend/` + `backend/`). Items marked ★ were
added on top of the original task plan because the app cannot work without them.

```
LPU-Uni-Path/
├── docs/                         architecture, data model, API, design system, team plan
├── README.md
├── frontend/
│   ├── index.html                fonts, meta
│   ├── vite.config.js            React + Tailwind plugins
│   ├── .env.example              VITE_API_BASE_URL, VITE_PROGRESS_API_ENABLED
│   └── src/
│       ├── main.jsx, App.jsx, index.css   (design tokens live in index.css @theme)
│       ├── components/           Navbar, Sidebar, Footer, Loader, ProtectedRoute
│       │   └── ui/ ★             Button, Field, Tag, Modal, StatusMessage, SectionHeader, CategoryIcon, Wordmark
│       ├── config/navigation.js ★ sidebar IA with module ownership (+ `ready` flags)
│       ├── context/AuthContext.jsx
│       ├── hooks/ ★              useApiQuery, useDebouncedValue, useDocumentTitle
│       ├── layouts/              StudentLayout, PublicLayout ★, AuthLayout ★
│       ├── pages/ ★              LoginPage, RegisterPage, NotFoundPage (shared)
│       ├── routes/AppRoutes.jsx
│       ├── services/api.js       axios instance + error normalisation
│       ├── utils/formatDate.js   dates, relative time, durations
│       └── modules/
│           ├── taskCatalogue/    MODULE 1 — components/ pages/ services/ hooks/
│           ├── taskJourney/      MODULE 2.1 — components/ pages/ services/ hooks/
│           ├── progress/         MODULE 2.2 (Harshith) — reserved
│           └── studentHelp/      MODULE 3 (Harshith) — reserved
└── backend/
    ├── .env.example
    └── src/
        ├── proxy.js ★            CORS + preflight
        ├── app/api/              route.js files only (see api-and-routes.md)
        ├── controllers/          request parsing + response shaping
        ├── services/             business logic
        ├── models/               User ★, Category, Task, TaskStep, Service, TaskView ★
        ├── validators/ ★         zod schemas
        ├── middleware/authMiddleware.js
        ├── lib/                  mongodb.js, apiHandler.js ★, jwt.js ★, cors.js ★
        ├── utils/                apiResponse.js, slugify.js ★, search.js ★
        └── seed/ ★               seed.js + sample data (clearly marked unverified)
```

Module boundaries: a module may import shared code (`components/`, `hooks/`,
`services/api.js`, `context/`) and another module's **services or hooks**, but not
another module's internal components. Shared UI goes in `components/ui`.
