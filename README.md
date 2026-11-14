# LPU Task Guide

**Unified Student Task Navigation and Guidance Platform**
_One University. Multiple Portals. One Guided Path._

A student signs in and sees every task from the five LPU portals in one list:
**UMS, LPU Live, CodeTantra, NeoColab and LPU Touch**. Each task shows where it is inside
its portal (for example *UMS › Academics › Examination System › Academic Result*).
**Open** takes the student straight to that portal, and **Steps** shows a step-by-step
guide with FAQs. LPU Task Guide only **guides**: the real work (payments, requests,
tests) always happens on the official university systems.

Visitors can browse every task **without signing in** (`/explore`, linked from the Sign in
page). Signing in adds the step-by-step guides, FAQs and the "Your updates" column.

| Module | What the student gets |
| --- | --- |
| 1. Task Catalogue | Every task from every portal: search, portal tabs, quick links, an Open button that redirects to the portal, and "Your updates" |
| 2. Task Journey Engine | Ordered steps, the portal or office for each step, a "done" checklist |
| 3. Student Guidance & Help | FAQs with search, "when you are stuck" advice, every portal and office with its link |

## No database, hard-coded data
This version (branch `no-mongodb`) has **no database**. All content is hard-coded in
`backend/src/data/` and kept small on purpose: 30 tasks over 5 portals, 12 FAQs and 7
sample updates. The version with MongoDB is on the `minimal-3-modules` branch.

**Why no UMS API?** LPU has no official public API. The unofficial ones log in with a
student's real UMS password and copy data from the UMS pages; this app promises never to ask
for the UMS password, so it does not use them. "Your updates" therefore shows **sample
data** (an attendance alert, assignment and test deadlines, a fee instalment, LPU Live
messages, new CA marks) to show what the app would do with an official API. Each update
links to its real task. The tasks, menu paths and Open links are real.

**Accounts:** there is no sign-up. `backend/src/data/students.js` has five student accounts
(registration numbers `12400001` to `12400005`) and the demo account, each with only a
bcrypt hash of its password. To test the app, press **Try demo** next to
**Sign in**: it signs in as the demo account (`isDemo: true`) in one click, without showing
or typing its password.

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
and put it in that task's `url` in `backend/src/data/content.js`. You can check an address
without logging in: a real UMS page redirects to `LoginNew.aspx`, a wrong one gives 404.

## Design
The look follows the official LPU portals, so it feels familiar:
- **Font:** Outfit (the font of LPU Live).
- **Colours:** LPU orange (`#EA580B` from LPU Live, `#F68121` from UMS), the UMS blue link buttons (`#1779BA`) and the LPU Live dark navy for the sign-in page.
- **Logo:** the LPU seal (`frontend/src/assets/lpu-seal.svg`), cut as a vector from the logo on lpu.in, so it stays sharp at every size. It is also the browser-tab icon (`frontend/public/favicon.svg`, with `favicon-32.png` and `apple-touch-icon.png` for browsers and phones that need PNG).
- **Layout:** like the UMS dashboard: header with the student's details, an orange side menu, tasks on the left and "Your updates" as a column on the right, cards with an orange label on the top border. Every section scrolls on its own. The sign-in page is an LPU Live-style split card whose left side explains what the app does and which portals it connects.

## Tech stack

| Part | Technology | Why |
| --- | --- | --- |
| Frontend | React + Vite | Student interface |
| Styling | Tailwind CSS (colours and font in `index.css`) | Quick, consistent styling |
| Backend | Next.js API routes | APIs and business logic |
| Data | Hard-coded JavaScript files (`backend/src/data/`) | Small, fixed content; no database to set up |
| API connection | Axios | React calls the Next.js API |
| Authentication | JWT + bcrypt | Login token; passwords stored only as hashes |

```
React (port 5173)  --axios + token-->  Next.js API (port 3000)  -->  src/data/ (in memory)
```

## How to run

**1. Backend**
```bash
cd backend
npm install
cp .env.example .env.local   # fill in JWT_SECRET
npm run dev                  # http://localhost:3000
```

**2. Frontend** (second terminal)
```bash
cd frontend
npm install
cp .env.example .env         # VITE_API_URL=http://localhost:3000/api
npm run dev                  # http://localhost:5173
```

Open http://localhost:5173 and sign in with the login you were given, or press **Try demo**.
To look around without signing in, open http://localhost:5173/explore.

The official UMS login cannot be used, because there is no official LPU login API or SSO
access. The UMS password is **never** asked for or stored.

## API

All APIs except login, demo login and the task list need the header `Authorization: Bearer <token>`.
Every response looks like `{ success, message, data }`.

| Method | URL | Module | Returns |
| --- | --- | --- | --- |
| POST | `/api/auth/login` | Sign in | `{ token, student }` |
| POST | `/api/auth/demo` | Try demo | `{ token, student }` for the demo account (no password) |
| GET | `/api/tasks?search=` | 1 (public) | `{ tasks, categories, portals }` (each task with its portal, menu path, `openUrl`, step count and services used) |
| GET | `/api/updates` | 1 | `{ updates }`: sample updates, each with its task |
| GET | `/api/journeys/:taskId` | 2 | `{ task, steps }` (task with its portal and `openUrl`; each step with its service and link) |
| GET | `/api/services` | 2 / 3 | portals first, then offices |
| GET | `/api/faqs?search=&taskId=` | 3 | FAQs |

A task id is made from its title, e.g. `apply-for-hostel-leave`.

## What every file does

### Backend (`backend/`)
| File | Purpose |
| --- | --- |
| `src/data/content.js` | All content: portals, offices, tasks with menu paths, FAQs, sample updates |
| `src/data/students.js` | Accounts that can sign in (password stored only as a bcrypt hash) |
| `src/data/store.js` | Builds the data once: ids, steps from menu paths, links between names; stops with a clear error on a typo |
| `src/lib/openUrl.js` | The link of a task's "Open" button: its exact page, else its portal |
| `src/middleware/authMiddleware.js` | Reads the token from the request and checks it |
| `src/controllers/authController.js` | Sign in (checks the password hash) and Try demo (the demo account); both return a JWT |
| `src/controllers/taskController.js` | Task list with search (also by portal name and menu path); adds portal, Open link, step count |
| `src/controllers/journeyController.js` | One task with its ordered steps; each step gets the right Open link |
| `src/controllers/helpController.js` | FAQs (search / per task) and university services |
| `src/controllers/updateController.js` | Sample updates with dates counted from today |
| `src/app/api/**/route.js` | Each URL; only passes the request to its controller |
| `next.config.js` | CORS headers so the React app (port 5173) may call the API |

### Frontend (`frontend/src/`)
| File | Purpose |
| --- | --- |
| `main.jsx` | Starts React |
| `App.jsx` | All page addresses (routes); sends logged-out users to `/login` |
| `services/api.js` | Every backend call, plus saving/removing the login token |
| `components/Sidebar.jsx` | Orange UMS-style side menu: Tasks, Portals, Help (bottom bar on phones) |
| `components/Navbar.jsx` | UMS-style header: logo, logged-in student, Logout |
| `components/Brand.jsx` | LPU seal + "LPU Task Guide" wordmark for the top bars |
| `components/AuthLayout.jsx` | LPU Live-style sign-in card; the left side says what the app does and which portals it connects |
| `components/AuthInput.jsx` | Dark form fields (with show/hide password) and error box for the sign-in page |
| `components/TabCard.jsx` | UMS dashboard card with the orange label on its top border |
| `components/PortalMark.jsx` | Coloured badge with the portal's short name (UMS, Live, CT, Neo, Touch) |
| `components/MenuTrail.jsx` | Where to click: UMS › Academics › Examination System › Academic Result |
| `lib/portal.js` | Open-button text, address helpers and one icon per category |
| `lib/navigation.js` | Safe "go back to this page after signing in" address |
| `pages/Login.jsx` | Sign in: registration number + password, and the Try demo button |
| `pages/Dashboard.jsx` | First page after login: tasks on the left, "Your updates" on the right |
| `pages/Explore.jsx` | Public task list: every task without signing in |
| `pages/Portals.jsx` | The five portals: what each is for, official address, Open button, task count |
| `modules/taskCatalogue/TaskList.jsx` | Quick links (short names), live search, portal tabs, and tasks grouped by category in scrolling cards |
| `modules/taskCatalogue/YourUpdates.jsx` | "Your updates" column (sample data), scrolls on its own |
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
Edit `backend/src/data/content.js`; `npm run dev` reloads it. Only add an official `url`
after checking that it is the correct university link.

To add a task, give it a `portal` and its `menuPath`, for example
`ums(['Administrative', 'Residential Services', 'Hostel Booking'], { title, category, summary, howTo })`.
Its steps are built by themselves: *Open UMS → Go to Administrative › Residential Services →
Open “Hostel Booking”*. Write `steps` by hand only when a task needs an office or several portals.
Add `isPopular: true` and a `shortTitle` to show it under Quick links.

To add an account or change a password, put a new bcrypt hash in `students.js`:
`node -e "console.log(require('bcryptjs').hashSync('NEW-PASSWORD', 10))"` (run in `backend/`).

## Not included (on purpose)
No UMS replacement, no payments, no access to private university systems, no chatbot,
no large admin system. The step "done" checklist is the student's own tracker and does
not tell the university anything.

The earlier, larger version is kept on the `full-version` git branch.
