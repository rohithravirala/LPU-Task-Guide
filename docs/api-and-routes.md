# Frontend Routes & Backend API Contracts

## 5. Frontend routes

| Path | Page | Access | Owner | Status |
| --- | --- | --- | --- | --- |
| `/` | Landing | public | R | built |
| `/login`, `/register` | Auth | guests | S | built |
| `/dashboard` | Student dashboard | student, admin | R (task sections) + H (journey/notice widgets) | built (task sections) |
| `/tasks` | Task catalogue (index view) | signed in | R | built |
| `/tasks?q=…&category=…&sort=…` | Search results / filtered catalogue | signed in | R | built |
| `/tasks/:slug` | Task details | signed in | R | built |
| `/tasks/:slug/journey` | Task journey | signed in | R | built |
| `/admin/tasks` | Manage tasks | admin | R | built |
| `/admin/tasks/new`, `/admin/tasks/:id/edit` | Create / edit task (with steps) | admin | R | built |
| `/my-tasks` | My tasks (active / completed / pending) | signed in | H | planned |
| `/progress` | Progress overview | signed in | H | planned |
| `/help`, `/help/faqs`, `/help/faqs/:id`, `/help/troubleshooting` | Help centre | signed in | H | planned |
| `/notices`, `/notices/:id` | Notices + PDF viewer | signed in | H | planned |
| `/support`, `/support/new`, `/support/:id` | Support tickets | signed in | H | planned |
| `/profile`, `/settings` | Profile, settings | signed in | S | planned |
| `/admin`, `/admin/categories`, `/admin/services`, `/admin/faqs`, `/admin/notices`, `/admin/support` | Admin | admin | S / H | planned |

Planned sidebar entries already exist in `frontend/src/config/navigation.js` with
`ready: false`. Flip the flag when the page lands; nothing else needs to change.

## 6. Backend API

Base URL: `http://localhost:3000/api`. All responses use:

```json
{ "success": true,  "message": "Tasks retrieved successfully", "data": [], "meta": { "page": 1, "limit": 24, "total": 18, "totalPages": 1 } }
{ "success": false, "message": "Please check the highlighted fields", "errors": { "steps.0.title": "Step title is required" } }
```

Auth levels: **public** (no cookie needed; admins with a cookie get extra data),
**auth** (any signed-in user), **admin**.

### Health
| Method | Path | Access | Notes |
| --- | --- | --- | --- |
| GET | `/db-test` | public | DB connection state |

### Auth (shared)
| Method | Path | Access | Body / Notes |
| --- | --- | --- | --- |
| POST | `/auth/register` | public | `{ name, email, password, registrationNumber? }` → 201, sets cookie. Role is always `student` |
| POST | `/auth/login` | public | `{ email, password }` → sets cookie. Generic error on bad credentials |
| POST | `/auth/logout` | public | clears cookie |
| GET | `/auth/me` | auth | current user |

### Tasks (R)
| Method | Path | Access | Notes |
| --- | --- | --- | --- |
| GET | `/tasks` | public | `?category=<slug\|id>&sort=recommended\|popular\|title\|updated&featured=true&page&limit(≤100)`; admins may add `includeInactive=true` |
| GET | `/tasks/search` | public | `?q=&category=&limit(≤50)` ranked search over title, keywords, summary, description, category, plus related terms. `data = { items, total, query, relatedTerms, matchedCategories }` |
| GET | `/tasks/popular` | public | `?limit` tasks opened by the most distinct students |
| GET | `/tasks/recent` | auth | `?limit` current student's recently opened tasks `[{ task, lastViewedAt, viewCount }]` |
| GET | `/tasks/:id` | public | id **or** slug. `data = { task, steps (outline), services, related }`. Records a view for students |
| POST | `/tasks` | admin | task fields + `steps[]` (≥ 1) |
| PUT | `/tasks/:id` | admin | partial task fields; when `steps[]` is sent it is the full ordered list. Steps with `_id` are updated in place, new ones created, missing ones removed |
| DELETE | `/tasks/:id` | admin | deletes task, its steps and views |

Task payload (`POST`/`PUT`):

```json
{
  "title": "Check your attendance", "summary": "…", "description": "…", "purpose": "…",
  "categoryId": "<id>", "primaryServiceId": "<id|null>",
  "requirements": ["…"], "importantNotes": ["…"], "keywords": ["attendance", "absent"],
  "estimatedDuration": 10, "verificationStatus": "unverified", "isFeatured": false, "isActive": true,
  "steps": [{ "_id": "<existing id, optional>", "title": "…", "description": "…", "instructions": ["…"],
              "serviceId": "<id|null>", "isRequired": true, "prerequisites": [], "additionalNotes": "", "checklist": ["…"] }]
}
```

### Categories (R)
| Method | Path | Access | Notes |
| --- | --- | --- | --- |
| GET | `/categories` | public | active categories with `taskCount`; admins: `includeInactive=true` |
| POST | `/categories` | admin | `{ name, code, description?, icon?, order?, isActive? }` |
| PUT | `/categories/:id` | admin | partial update |
| DELETE | `/categories/:id` | admin | 409 while tasks still use the category |

### Journeys & services (R)
| Method | Path | Access | Notes |
| --- | --- | --- | --- |
| GET | `/journeys/:taskId` | public | id or slug. `data = { task, steps (ordered, service populated), services, summary: { totalSteps, requiredSteps, optionalSteps } }`. Records a view for students |
| GET | `/services` | public | active services |
| GET | `/services/:id` | public | service + `usedIn` (active tasks that reference it) |

### Dashboard (R)
| Method | Path | Access | Notes |
| --- | --- | --- | --- |
| GET | `/dashboard` | auth | `{ stats: { tasks, categories, services, verifiedServices, tasksExplored, lastActivityAt }, featured }` |

### Progress (H) — shared contract consumed by the Journey page
The journey page already speaks this contract (`frontend/src/modules/taskJourney/services/journeyProgress.js`).
Until Module 2.2 ships it, progress is kept **on the student's device** and the UI says
so. Set `VITE_PROGRESS_API_ENABLED=true` once these endpoints exist.

| Method | Path | Body / Response |
| --- | --- | --- |
| POST | `/progress` | `{ taskId }` → 201 (or 200 if it exists) `data = Progress`. Starts a journey for `request.user` |
| GET | `/progress` | `?status=` → current student's progress list (task populated) |
| GET | `/progress/:taskId` | → 200 `data = Progress \| null` (`null` = not started; **not** 404) |
| PATCH | `/progress/:id` | `{ completedSteps: [stepId], currentStepId }` → updated Progress. Server checks ownership, checks that steps belong to the task, recomputes `status` and `completedAt`, and touches `lastAccessedAt` |

`Progress` JSON: `{ _id, taskId, completedSteps: [id], currentStepId, status, startedAt, lastAccessedAt, completedAt }`.

How the journey page uses it: it loads `GET /progress/:taskId` on open; on the
first step change it calls `POST /progress`, then sends the **full** ordered list of
completed step ids with `PATCH` after every change (saves are serialised, so the
last write always wins). `currentStepId` is the first required step not yet done.
Module 2.2 may also create records earlier (e.g. for a "Not started" list).

### FAQ, Support, Notices (H)
As defined in the master specification (`/faqs`, `/support`, `/notices`). Use the same
response envelope, `apiHandler` wrapper, and `{ roles: ['admin'] }` for admin writes.
Recommended filters so Module 1 pages can embed help: `GET /faqs?taskId=<id>`,
`GET /notices?taskId=<id>`.
