# LPU Task Guide

**Unified Student Task Navigation and Guidance Platform**
_One University. Multiple Portals. One Guided Path._

A student logs in and sees every task from the five LPU portals in one list:
**UMS, LPU Live, CodeTantra, NeoColab and LPU Touch**. Each task shows where it is inside
its portal (for example *UMS › Academics › Examination System › Academic Result*).
**Open** takes the student straight to that portal, and **Steps** shows a step-by-step
guide with FAQs. LPU Task Guide only **guides**: the real work (payments, requests,
tests) always happens on the official university systems.

Visitors can browse every task **without signing in** (`/explore`, also previewed on the
Sign in and Sign up pages). Signing in adds the step-by-step guides, FAQs and, for the demo
account, sample updates.

## Demo account (for evaluation)
| Registration number | Password |
| --- | --- |
| `12345678` | `Demo@2026` |

The login is shown on the Sign in page with a **Fill in the demo login** button.
LPU has no public API (no API key we could use), so the demo account shows a
**Your updates** panel with **sample data**: an attendance alert, assignment and test
deadlines, a fee instalment, LPU Live messages and new CA marks. It shows what the app would
do with an official API. Each update links to its real task, and a strip at the top says
that it is demo data. The tasks, menu paths and Open links are real. Other accounts see no
updates. The demo account is created by `npm run seed` (defined in `backend/src/seed/seedData.js`).

| Module | What the student gets |
| --- | --- |
| 1. Task Catalogue | Every task from every portal: search, portal tabs, quick links, and an Open button that redirects to the portal |
| 2. Task Journey Engine | Ordered steps, the portal or office for each step, a "done" checklist |
| 3. Student Guidance & Help | FAQs with search, "when you are stuck" advice, every portal and office with its link |

### The portals and their links
| Portal | Link used by "Open" | What it is for |
| --- | --- | --- |
| UMS | `https://ums.lpu.in/lpuums/StudentDashboard.aspx` | Attendance, exams, fees, hostel, placements, requests |
| LPU Live | `https://lpulive.lpu.in` (chat tasks: `/chat`) | Course groups, personal chats, announcements |
| CodeTantra | `https://myclass.lpu.in` (MyClass, log in with UMS details) | Online tests, coding labs |
| NeoColab | `https://lpucolab438.examly.io` (LPU Colab by iamneo) | Coding practice, PEP tests |
| LPU Touch | Google Play + App Store pages | UMS on the phone |

Tasks whose exact page is known open that page directly: *Apply for hostel leave*
(`frmStudentHostelLeaveApplicationTermWise.aspx`), *See a course syllabus*
(`frmAcademicSyllabusReport.aspx`) and the LPU Live chat tasks (`/chat`). UMS page addresses
are not published, so the other UMS tasks open the UMS dashboard and show the exact menu path
to follow. If you are not logged in to UMS, UMS first shows its login page.

To add another direct link: log in to UMS, open the page from the menu, copy the address
and put it in that task's `url` in `seedData.js`, then run `npm run seed`. You can check an
address without logging in: a real UMS page redirects to `LoginNew.aspx`, a wrong one gives 404.

## Design
The look follows the official LPU portals, so it feels familiar:
- **Font:** Outfit (the font of LPU Live).
- **Colours:** LPU orange (`#EA580B` from LPU Live, `#F68121` from UMS), the UMS blue link buttons (`#1779BA`) and the LPU Live dark navy for the sign-in page.
- **Logo:** the LPU seal (`frontend/src/assets/lpu-seal.svg`), cut as a vector from the logo on lpu.in, so it stays sharp at every size.
- **Layout:** UMS-style header with the student's details, an orange side menu, and cards with an orange label on the top border; an LPU Live-style split sign-in card.

## Tech stack

| Part | Technology | Why |
| --- | --- | --- |
| Frontend | React + Vite | Student interface |
| Styling | Tailwind CSS (colours and font in `index.css`) | Quick, consistent styling |
| Backend | Next.js API routes | APIs and business logic |
| Database | MongoDB Atlas + Mongoose | Stores students, tasks, steps, services, FAQs |
| API connection | Axios | React calls the Next.js API |
| Authentication | JWT + bcrypt | Login token; passwords stored only as hashes |

```
React (port 5173)  --axios + token-->  Next.js API (port 3000)  --mongoose-->  MongoDB Atlas
```

## How to run

**1. Backend**
```bash
cd backend
npm install
cp .env.example .env.local   # fill in MONGODB_URI, JWT_SECRET, SEED_STUDENT_PASSWORD
npm run seed                 # loads tasks, steps, services, FAQs, demo updates and the demo account
npm run dev                  # http://localhost:3000
```

**2. Frontend** (second terminal)
```bash
cd frontend
npm install
cp .env.example .env         # VITE_API_URL=http://localhost:3000/api
npm run dev                  # http://localhost:5173
```

Open http://localhost:5173 and either **Sign up** with your own details, or sign in with the
demo account `12345678` / `Demo@2026`. To look around without an account, open
http://localhost:5173/explore.

### About sign up and sign in
The official UMS login cannot be used, because there is no official LPU login API or SSO
access. So students create an LPU Task Guide account (Sign up) and sign in with their
registration number and the password they created. The UMS password is **never** asked
for or stored; our own password is stored only as a bcrypt hash.

## API

All APIs except sign up, login and the task list need the header `Authorization: Bearer <token>`.
Every response looks like `{ success, message, data }`.

| Method | URL | Module | Returns |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | Sign up | `{ token, student }` |
| POST | `/api/auth/login` | Sign in | `{ token, student }` |
| GET | `/api/tasks?search=` | 1 (public) | `{ tasks, categories, portals }` (each task with its portal, menu path, `openUrl`, step count and services used) |
| GET | `/api/updates` | 1 | `{ isDemo, updates }`: sample updates for the demo account, empty for everyone else |
| GET | `/api/journeys/:taskId` | 2 | `{ task, steps }` (task with its portal and `openUrl`; each step with its service and link) |
| GET | `/api/services` | 2 / 3 | portals first, then offices |
| GET | `/api/faqs?search=&taskId=` | 3 | FAQs |

## What every file does

### Backend (`backend/`)
| File | Purpose |
| --- | --- |
| `src/lib/mongodb.js` | Connects to MongoDB once and reuses the connection |
| `src/lib/defineModel.js` | Registers a model; in development it replaces the old one so schema edits apply without restarting `next dev` |
| `src/lib/openUrl.js` | The link of a task's "Open" button: its exact page, else its portal |
| `src/models/Student.js` | Student: name, registration number, password hash, `isDemo` for the demo account |
| `src/models/Task.js` | A task: title, category, description, requirements, keywords, its portal, menu path and optional exact link |
| `src/models/TaskStep.js` | One step of a task: order, instructions, which service to use |
| `src/models/UniversityService.js` | Portals (UMS, LPU Live, CodeTantra, NeoColab, LPU Touch) and offices, with checked links |
| `src/models/FAQ.js` | Question + answer, optionally linked to a task |
| `src/models/DemoUpdate.js` | One sample update for the demo account, linked to a task; dates are stored as "days from today" |
| `src/middleware/authMiddleware.js` | Reads the token from the request and checks it |
| `src/controllers/authController.js` | Sign up (hashes the password) and sign in (checks it), both return a JWT |
| `src/controllers/taskController.js` | Task list with search (also by portal name and menu path); adds portal, Open link, step count |
| `src/controllers/journeyController.js` | One task with its ordered steps; each step gets the right Open link |
| `src/controllers/helpController.js` | FAQs (search / per task) and university services |
| `src/controllers/updateController.js` | Sample updates, only for the demo account |
| `src/app/api/**/route.js` | Each URL; only passes the request to its controller |
| `src/seed/seedData.js` | All sample content: portals, offices, tasks with menu paths, FAQs |
| `src/seed/seed.js` | Puts `seedData.js` into MongoDB, builds steps from menu paths, creates the demo account and its updates |
| `next.config.js` | CORS headers so the React app (port 5173) may call the API |

### Frontend (`frontend/src/`)
| File | Purpose |
| --- | --- |
| `main.jsx` | Starts React |
| `App.jsx` | All page addresses (routes); sends logged-out users to `/login` |
| `services/api.js` | Every backend call, plus saving/removing the login token |
| `components/Sidebar.jsx` | Orange UMS-style side menu: Tasks, Portals, Help (bottom bar on phones) |
| `components/Navbar.jsx` | UMS-style header: logo, logged-in student, Logout |
| `components/AuthLayout.jsx` | LPU Live-style split card shared by Sign in and Sign up; its left side previews every portal with live task counts |
| `components/Brand.jsx` | LPU seal + "LPU Task Guide" wordmark for the top bars |
| `components/AuthInput.jsx` | Dark form fields (with show/hide password), error box and divider for the sign-in pages |
| `components/TabCard.jsx` | UMS dashboard card with the orange label on its top border |
| `components/PortalMark.jsx` | Coloured badge with the portal's short name (UMS, Live, CT, Neo, Touch) |
| `components/MenuTrail.jsx` | Where to click: UMS › Academics › Examination System › Academic Result |
| `lib/portal.js` | Open-button text, address helpers and one icon per category |
| `lib/demo.js` | The demo login shown on the Sign in page (must match `seedData.js`) |
| `lib/navigation.js` | Safe "go back to this page after signing in" address |
| `pages/Login.jsx` | Sign in: registration number + password |
| `pages/Signup.jsx` | Sign up: name, registration number, course, new password |
| `pages/Dashboard.jsx` | First page after login; shows the Task Catalogue |
| `pages/Explore.jsx` | Public task list: every task without signing in |
| `pages/Portals.jsx` | The five portals: what each is for, official address, Open button, task count |
| `modules/taskCatalogue/TaskList.jsx` | Quick links, live search, portal tabs, and all tasks grouped by category |
| `modules/taskCatalogue/DemoUpdates.jsx` | "Your updates" panel (demo data) on the dashboard |
| `modules/taskCatalogue/TaskCard.jsx` | One task row: portal badge, menu path, Steps and Open (redirects to the portal) |
| `modules/taskCatalogue/TaskDetails.jsx` | Where to find a task, a big Open button, what to keep ready, the steps |
| `modules/taskJourney/JourneyPage.jsx` | Progress bar, "you are here", saves done steps in the browser |
| `modules/taskJourney/JourneySteps.jsx` | Ordered list of steps |
| `modules/taskJourney/StepCard.jsx` | One step: instructions, Open button or the office to visit, Mark as done |
| `modules/studentHelp/HelpPage.jsx` | Help page layout |
| `modules/studentHelp/FAQ.jsx` | FAQ list with search; reused on the journey page for that task |
| `modules/studentHelp/HelpGuidance.jsx` | "When you are stuck" advice and every portal and office |
| `index.css` | Colours (from UMS and LPU Live) and the font (Outfit) for Tailwind |

## Changing the content
Edit `backend/src/seed/seedData.js` and run `npm run seed` again. Only add an official
`url` after checking that it is the correct university link.

To add a task, give it a `portal` and its `menuPath`, for example
`ums(['Administrative', 'Residential Services', 'Hostel Booking'], { title, category, summary, howTo })`.
The seed then builds its steps by itself: *Open UMS → Go to Administrative › Residential Services →
Open “Hostel Booking”*. Write `steps` by hand only when a task needs an office or several portals.

## Not included (on purpose)
No UMS replacement, no payments, no access to private university systems, no chatbot,
no large admin system. The step "done" checklist is the student's own tracker and does
not tell the university anything.

The earlier, larger version is kept on the `full-version` git branch.
