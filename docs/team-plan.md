# Delivery Plan & Responsibility Map

## 8. Development phases

| # | Phase | Output | Status |
| --- | --- | --- | --- |
| 1 | Understand & plan | `docs/` (this folder) | done |
| 2 | Project setup | Vite + Tailwind 4, Next API, Mongo connection, env examples, git ignores | done |
| 3 | Design system | tokens, typography, UI primitives, layouts, navigation | done |
| 4 | Authentication | register / login / logout / me, httpOnly cookie, ProtectedRoute, roles | done |
| 5 | Module 1 — Task Catalogue | catalogue, search, filters, details, popular, recent, dashboard, task CRUD | done |
| 6 | Module 2 — Journey engine | 2.1 journey rail, steps, services, checklist (done) · 2.2 progress API + My Tasks (Harshith) | 2.1 done |
| 7 | Module 3 — Help | FAQs, troubleshooting, tickets, notices, PDF viewer | Harshith |
| 8 | Admin | tasks + steps (done) · categories, services, FAQs, notices, tickets UI | partly done |
| 9 | Integration | flip `VITE_PROGRESS_API_ENABLED`, enable nav items, embed FAQs on task pages | pending |
| 10 | Polish | a11y pass, performance, docs | ongoing |

## 9. Two-developer responsibility map

| Area | Rohith (Dev 1) | Harshith (Dev 2) |
| --- | --- | --- |
| Module 1 Task Catalogue | Landing, dashboard task sections, catalogue, search, filters, cards, details, popular, recent · Task/Category models + APIs | — |
| Module 2 Journey | Part 1: journey page, rail, steps, progress strip, checklist, prev/next, service info, open-portal · TaskStep/Service models + journey/service APIs | Part 2: My Tasks, active/completed/pending, continue journey, progress dashboard · Progress model + APIs |
| Module 3 Help | — | Help centre, FAQs, troubleshooting, tickets, notices, PDF viewer, admin help dashboard · FAQ/SupportTicket/Notice models + APIs |
| Shared | Auth, roles, navbar/sidebar, DB connection, API envelope, error handling, contracts (`docs/api-and-routes.md`), testing, deployment, docs | same |

### Rohith's task map (Tasks 1–22)

| Task | Scope | Key files |
| --- | --- | --- |
| 1 | Setup, landing, layout, auth wiring | `LandingPage`, `Navbar`, `Sidebar`, `Footer`, `ProtectedRoute`, `AuthContext`, `StudentLayout`, `AppRoutes`, `api.js`, `lib/mongodb.js`, `authMiddleware.js` |
| 2 | Task model | `models/Task.js`, `api/db-test` |
| 3 | Category model + API | `models/Category.js`, `categories` route/controller/service |
| 4 | Create task | `TaskForm`, `CreateTask`, `POST /tasks` |
| 5 | List tasks | `TaskList`, `TaskCatalogue`, `useTasks`, `GET /tasks` |
| 6 | Task card | `TaskCard` |
| 7 | Task details | `TaskInfo`, `TaskDetails`, `GET /tasks/:id` |
| 8 | Search | `TaskSearch`, `useTaskSearch`, `GET /tasks/search` |
| 9 | Category filters | `TaskFilters`, `useTaskFilters` |
| 10 | Popular tasks | `PopularTasks`, `usePopularTasks`, `GET /tasks/popular` |
| 11 | Recently accessed | `RecentTasks`, `useRecentTasks`, `TaskView` model, `GET /tasks/recent` |
| 12 | Dashboard | `Dashboard`, `DashboardHeader`, `TaskStatistics`, `GET /dashboard` |
| 13 | Edit / delete task | `EditTask`, `DeleteTaskModal`, `ManageTasks`, `PUT/DELETE /tasks/:id` |
| 14 | TaskStep model | `models/TaskStep.js` |
| 15 | Service model + list | `models/Service.js`, `GET /services` |
| 16 | Journey retrieval | `TaskJourney`, `JourneyHeader`, `useJourney`, `GET /journeys/:taskId` |
| 17 | Ordered steps | `JourneyStepList` (rail), `JourneyStep` |
| 18 | Progress strip | `JourneyProgress` |
| 19 | Interactive checklist | `JourneyChecklist` |
| 20 | Previous / next | `JourneyNavigation` |
| 21 | Service information | `ServiceInfo`, `GET /services/:id` |
| 22 | Open portal | `OpenPortalButton` |

## Working without conflicts

1. **Contracts first.** `docs/data-model.md` and `docs/api-and-routes.md` are the
   source of truth. Change them in a small PR that both developers review before
   changing code.
2. **Own your folders.** Rohith: `modules/taskCatalogue`, `modules/taskJourney`,
   backend `tasks|categories|journeys|services|dashboard`. Harshith: `modules/progress`,
   `modules/studentHelp`, backend `progress|faqs|support|notices`. Shared files
   (`AppRoutes.jsx`, `config/navigation.js`, `authMiddleware.js`, `apiHandler.js`,
   `index.css`) change only through short, reviewed PRs.
3. **Branching.** `master` stays deployable. Feature branches named `r/<task>` and
   `h/<task>`, one task per PR, squash-merge.
4. **Reuse the backend pattern.** A new endpoint is `route.js` →
   `apiHandler(controller, { auth | roles })` → service → model, with a zod validator.
5. **Seed data is sample data.** Anything not verified against an official source stays
   `verificationStatus: 'unverified'`.
