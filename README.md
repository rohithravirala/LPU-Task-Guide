# LPU-Uni-Path

**Unified Student Task Navigation and Guidance Platform**
_One University. Multiple Portals. One Guided Path._

LPU-Uni-Path helps students find the right university service for a task, follow
clear step-by-step guidance, and always know what to do next. It is a guidance layer:
it does not replace UMS, LPU Touch, LPU Live or any department, and it never claims
that a university transaction has happened.

```
Task Discovery → Guided Journey → Correct Service → Progress Tracking → Help & Support
```

## Status

| Module | Owner | State |
| --- | --- | --- |
| Shared foundation: auth (httpOnly JWT), roles, layout, navigation, API client, DB, CORS | Shared | ✅ built |
| Module 1: Task Catalogue (landing, dashboard, catalogue, search, filters, details, popular, recent, admin task CRUD) | Rohith | ✅ built |
| Module 2.1: Task Journey (journey rail, steps, progress strip, checklist, prev/next, service info, open portal) | Rohith | ✅ built |
| Module 2.2: Progress API, My Tasks, progress dashboard | Harshith | ⏳ contract ready (`docs/api-and-routes.md`) |
| Module 3: Help centre, FAQs, troubleshooting, tickets, notices | Harshith | ⏳ planned |

Until Module 2.2 ships, journey progress is saved **on the student's device** and the
UI says so. Set `VITE_PROGRESS_API_ENABLED=true` once `/api/progress` exists.

## Tech stack

- **frontend/**: React 19, Vite 8, React Router 7, Tailwind CSS 4, axios, react-hook-form, lucide-react
- **backend/**: Next.js 16 App Router (API route handlers only), Mongoose 9, zod, bcryptjs, jsonwebtoken
- **Database**: MongoDB (local `mongod` or MongoDB Atlas)

## Getting started

Requirements: Node.js 20.9 or newer, and a MongoDB connection string.

### 1. Database (MongoDB Atlas)

1. Create a free cluster at [cloud.mongodb.com](https://cloud.mongodb.com).
2. **Database Access** → add a database user (username + password, role "Read and write to any database").
3. **Network Access** → **Add IP Address** → add your current IP.
4. Your cluster → **Connect** → **Drivers** → copy the `mongodb+srv://…` string and replace
   `<db_password>` with the user's password (URL-encode special characters, e.g. `@` → `%40`).

The database name can be left out; the API uses `lpu-uni-path` (`MONGODB_DB_NAME`).

### 2. Backend (API on http://localhost:3000)

```bash
cd backend
npm install
cp .env.example .env.local     # then fill in MONGODB_URI, JWT_SECRET and the SEED_* passwords
npm run db:check               # confirms the API can reach MongoDB (changes nothing)
npm run seed                   # sample categories, services, tasks + admin/demo accounts
npm run dev
```

Generate a JWT secret with:
`node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`

`npm run db:check` explains common problems (wrong password, IP not allowed, bad URI).
While the server runs, http://localhost:3000/api/db-test shows the connection state.

### 3. Frontend (app on http://localhost:5173)

```bash
cd frontend
npm install
cp .env.example .env           # optional: defaults already point at http://localhost:3000/api
npm run dev
```

Sign in with the `SEED_STUDENT_*` or `SEED_ADMIN_*` account from `backend/.env.local`,
or register a new student account. Admin accounts can only be created by the seed
script (registration always creates students).

## Scripts

| Where | Command | What it does |
| --- | --- | --- |
| backend | `npm run dev` | API in development mode |
| backend | `npm run build && npm start` | production build and server |
| backend | `npm run db:check` | tests the MongoDB connection from `.env.local` |
| backend | `npm run seed` | seeds an empty catalogue (`-- --reset` replaces existing sample content) |
| backend | `npm run lint` | ESLint |
| frontend | `npm run dev` | Vite dev server (port 5173, strict) |
| frontend | `npm run build` | production bundle in `dist/` |
| frontend | `npm run lint` | ESLint |

## Sample content

Every seeded task, step and service is marked **Unverified**. The guidance is
deliberately generic: no official URLs, policies, deadlines or fee amounts. Service
links appear only after an admin marks the service as verified and adds its official URL.

## Documentation

- [Product understanding & architecture](docs/architecture.md)
- [Data model](docs/data-model.md)
- [Frontend routes & API contracts](docs/api-and-routes.md)
- [Design system](docs/design-system.md)
- [Delivery plan & team responsibilities](docs/team-plan.md)
