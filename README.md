# LPU Task Guide

**One university. Multiple portals. One guided path.**

LPU Task Guide puts every student task from LPU's five portals in one place. Find a task, see exactly where it is inside its portal, follow the steps, and open the portal in one click.

🔗 **Live app:** https://lpu-task-guide.vercel.app (press **Try demo** to sign in)

> The app only guides. Payments, requests and tests always happen on the official LPU portals, and it never asks for your UMS password.

---

## What it does

| Module | What the student gets |
| --- | --- |
| **Task Catalogue** | Every task in one list, with search, portal tabs, quick links and an **Open** button |
| **Task Journey** | Step-by-step guide for each task, with a "done" checklist |
| **Student Help** | Searchable FAQs, "when you are stuck" advice, and every portal and office with its link |

Also:
- Each task shows its menu path, for example *UMS › Academics › Examination System › Academic Result*.
- **Your updates** shows alerts for attendance, deadlines, fees and marks (sample data).
- Anyone can browse all tasks without signing in at `/explore`.

## Portals covered

| Portal | Used for |
| --- | --- |
| [UMS](https://ums.lpu.in/lpuums/StudentDashboard.aspx) | Attendance, exams, fees, hostel, placements, requests |
| [LPU Live](https://lpulive.lpu.in) | Course groups, chats, announcements |
| [CodeTantra](https://myclass.lpu.in) | Online tests and coding labs |
| [NeoColab](https://lpucolab438.examly.io) | Coding practice and PEP tests |
| [LPU Touch](https://play.google.com/store/apps/details?id=ums.lovely.university) | UMS on your phone |

## Tech stack

| Part | Technology |
| --- | --- |
| Frontend | React, Vite, Tailwind CSS |
| Backend | Next.js API routes |
| Data | JavaScript files in `backend/src/data/` (no database) |
| Login | JWT and bcrypt |
| Hosting | Vercel |

## Run it locally

You need **Node.js 20.19 or newer**.

**1. Backend** (runs on http://localhost:3000)
```bash
cd backend
npm install
cp .env.example .env.local   # then set JWT_SECRET
npm run dev
```

**2. Frontend** (runs on http://localhost:5173, in a second terminal)
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:5173 and press **Try demo**.

## Deployment

The repo is deployed as two Vercel projects:

| Project | Root folder | Address |
| --- | --- | --- |
| Frontend | `frontend` | https://lpu-task-guide.vercel.app |
| Backend | `backend` | https://lpu-task-guide-backend.vercel.app |

- **Backend:** set the `JWT_SECRET` environment variable.
- **Frontend:** nothing to set. `frontend/vercel.json` forwards `/api/*` to the backend, so no CORS setup is needed.

## API

Every response looks like `{ success, message, data }`. Endpoints that need login expect the header `Authorization: Bearer <token>`.

| Method | Endpoint | Login needed | Returns |
| --- | --- | --- | --- |
| POST | `/api/auth/login` | No | Token and student details |
| POST | `/api/auth/demo` | No | Token for the demo account |
| GET | `/api/tasks?search=` | No | Tasks, categories and portals |
| GET | `/api/updates` | Yes | Sample updates |
| GET | `/api/journeys/:taskId` | Yes | A task and its steps |
| GET | `/api/services` | Yes | Portals and offices |
| GET | `/api/faqs?search=&taskId=` | Yes | FAQs |

## Project structure

```
backend/
  src/app/api/        API routes, one folder per endpoint
  src/controllers/    Logic behind each endpoint
  src/data/           All tasks, FAQs, updates and accounts
  src/lib/            Builds each task's Open link
  src/middleware/     Checks the login token

frontend/
  src/pages/          Login, Dashboard, Explore, Portals
  src/modules/        Task Catalogue, Task Journey, Student Help
  src/components/     Header, side menu, cards and other shared parts
  src/services/api.js All calls to the backend
```

## Editing content

**Tasks, FAQs and updates** are in `backend/src/data/content.js`. To add a task, give it a portal and a menu path:

```js
ums(['Administrative', 'Residential Services', 'Hostel Booking'], { title, category, summary, howTo })
```

Steps are built from the menu path automatically. Add `isPopular: true` and a `shortTitle` to show the task under Quick links.

**Accounts** are in `backend/src/data/students.js`: five test students (`12400001` to `12400005`) and the demo account. Passwords are stored only as bcrypt hashes. To make a new hash:

```bash
cd backend
node -e "console.log(require('bcryptjs').hashSync('NEW-PASSWORD', 10))"
```

## Good to know

- **Why sample updates?** LPU has no public API, and unofficial ones need your UMS password. So "Your updates" uses sample data, while the tasks, menu paths and links are real.
- **Direct links:** UMS page addresses aren't published, so most UMS tasks open the UMS dashboard and show the menu path. Hostel leave, course syllabus and LPU Live chat open their exact pages.
- **Design:** follows the official portals, with the Outfit font, LPU orange, UMS blue and the LPU seal.
- **Not included:** payments, a UMS replacement, a chatbot, or access to private university systems.
