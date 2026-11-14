# LPU-Uni-Path

**Unified Student Task Navigation and Guidance Platform**
_One University. Multiple Portals. One Guided Path._

A student logs in, picks a university task (for example *Pay an examination fine*),
follows its steps in order, sees which university service to use for each step, and
reads FAQs when something goes wrong. LPU-Uni-Path only **guides**: the real work
(payments, requests) always happens on the official university systems.

| Module | What the student gets |
| --- | --- |
| 1. Task Catalogue | Search and browse tasks by category |
| 2. Task Journey Engine | Ordered steps, the university service for each step, a "done" checklist |
| 3. Student Guidance & Help | FAQs with search, "when you are stuck" advice, list of university services |

## Tech stack

| Part | Technology | Why |
| --- | --- | --- |
| Frontend | React + Vite | Student interface |
| Styling | Tailwind CSS | Quick, consistent styling |
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
npm run seed                 # loads tasks, steps, services, FAQs and the demo student
npm run dev                  # http://localhost:3000
```

**2. Frontend** (second terminal)
```bash
cd frontend
npm install
cp .env.example .env         # VITE_API_URL=http://localhost:3000/api
npm run dev                  # http://localhost:5173
```

Open http://localhost:5173 and either **Sign up** with your own details, or sign in as the
demo student: registration number `12345678` and the `SEED_STUDENT_PASSWORD` from `backend/.env.local`.

### About sign up and sign in
The official UMS login cannot be used, because there is no official LPU login API or SSO
access. So students create an LPU-Uni-Path account (Sign up) and sign in with their
registration number and the password they created. The UMS password is **never** asked
for or stored; our own password is stored only as a bcrypt hash.

## API

All APIs except sign up and login need the header `Authorization: Bearer <token>`.
Every response looks like `{ success, message, data }`.

| Method | URL | Module | Returns |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | Sign up | `{ token, student }` |
| POST | `/api/auth/login` | Sign in | `{ token, student }` |
| GET | `/api/tasks?search=` | 1 | `{ tasks, categories }` (each task with step count and services used) |
| GET | `/api/journeys/:taskId` | 2 | `{ task, steps }` (each step with its service) |
| GET | `/api/services` | 2 / 3 | university services |
| GET | `/api/faqs?search=&taskId=` | 3 | FAQs |

## What every file does

### Backend (`backend/`)
| File | Purpose |
| --- | --- |
| `src/lib/mongodb.js` | Connects to MongoDB once and reuses the connection |
| `src/models/Student.js` | Student: name, registration number, password hash |
| `src/models/Task.js` | A task: title, category, description, requirements, search keywords |
| `src/models/TaskStep.js` | One step of a task: order, instructions, which service to use |
| `src/models/UniversityService.js` | UMS, LPU Touch, offices… with a link once it is verified |
| `src/models/FAQ.js` | Question + answer, optionally linked to a task |
| `src/middleware/authMiddleware.js` | Reads the token from the request and checks it |
| `src/controllers/authController.js` | Sign up (hashes the password) and sign in (checks it), both return a JWT |
| `src/controllers/taskController.js` | Task list with search; adds step count and services used to each task |
| `src/controllers/journeyController.js` | One task with its ordered steps and services |
| `src/controllers/helpController.js` | FAQs (search / per task) and university services |
| `src/app/api/**/route.js` | Each URL; only passes the request to its controller |
| `src/seed/seedData.js` | All sample content: services, tasks, steps, FAQs |
| `src/seed/seed.js` | Puts `seedData.js` into MongoDB and creates the demo student |
| `next.config.js` | CORS headers so the React app (port 5173) may call the API |

### Frontend (`frontend/src/`)
| File | Purpose |
| --- | --- |
| `main.jsx` | Starts React |
| `App.jsx` | All page addresses (routes); sends logged-out users to `/login` |
| `services/api.js` | Every backend call, plus saving/removing the login token |
| `components/Sidebar.jsx` | Left navigation (top bar on phones) |
| `components/Navbar.jsx` | Logged-in student and the Logout button |
| `components/AuthLayout.jsx` | Shared design of the Sign in and Sign up pages |
| `pages/Login.jsx` | Sign in: registration number + password |
| `pages/Signup.jsx` | Sign up: name, registration number, course, new password |
| `pages/Dashboard.jsx` | First page after login; shows the Task Catalogue |
| `modules/taskCatalogue/TaskList.jsx` | Search box and all tasks grouped by category |
| `modules/taskCatalogue/TaskCard.jsx` | One task in the grid |
| `modules/taskCatalogue/TaskDetails.jsx` | What a task involves, before starting it |
| `modules/taskJourney/JourneyPage.jsx` | Progress bar, "you are here", saves done steps in the browser |
| `modules/taskJourney/JourneySteps.jsx` | Ordered list of steps joined by a route line |
| `modules/taskJourney/StepCard.jsx` | One step: instructions, service, Mark as done |
| `modules/studentHelp/HelpPage.jsx` | Help page layout |
| `modules/studentHelp/FAQ.jsx` | FAQ list with search; reused on the journey page for that task |
| `modules/studentHelp/HelpGuidance.jsx` | "When you are stuck" advice and the list of services |
| `index.css` | Colours and the font (Plus Jakarta Sans) for Tailwind |

## Changing the content
Edit `backend/src/seed/seedData.js` and run `npm run seed` again. Only add an official
`url` to a service after checking that it is the correct university link.

## Not included (on purpose)
No UMS replacement, no payments, no access to private university systems, no chatbot,
no large admin system. The step "done" checklist is the student's own tracker and does
not tell the university anything.

The earlier, larger version is kept on the `full-version` git branch.
