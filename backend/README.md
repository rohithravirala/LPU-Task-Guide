# LPU-Uni-Path · backend

Next.js App Router used **only** as a JSON API. See the [root README](../README.md) for
setup and [API contracts](../docs/api-and-routes.md) for endpoints.

Request flow: `src/app/api/**/route.js` → `lib/apiHandler.js` (connection, auth, roles,
errors) → `controllers/` → `services/` → `models/`. Validation lives in `validators/` (zod).

Files imported by the seed script (`models/`, `lib/mongodb.js`, `utils/`, `seed/`) run in
plain Node, so they use relative imports with explicit `.js` extensions.
