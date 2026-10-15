# CLAUDE.md — Sports IQ

Sports analytics site for St. Andrew's School, Turi: a public read-only site plus a `/dashboard` for admins and coaches.

## Project notes

- **Docs are the source of truth** (all approved): `docs/00-design-inventory.md` (pages, decisions), `docs/01-architecture.md`, `docs/02-database.md`, `docs/03-api.md`, and **`docs/openapi.yaml` — the API contract** (OpenAPI 3.1). Change the doc first, then the code, then tell the user.
- **Stack:** Node 24 + Express 5 + Mongoose (`server/`), React 19 + Vite + CSS Modules (`client/`), npm workspaces.
- **Commands (repo root):** `npm run db` (local MongoDB, if none installed) · `npm run seed` · `npm run dev` (API :3000 + web :5173) · `npm test` · `npm run lint` · `npm run build` · `npm start`.
- **Request pipeline:** `authenticate` → `requireAuth` (all writes + staff-only reads, mounted once) → `express-openapi-validator` (reads `docs/openapi.yaml`; validates responses in tests) → routes → controllers → services → models. Express 5 forwards async errors, so there is no hand-written async wrapper.
- **Authorization:** only `server/src/auth/policy.js`, called from services.
- **Designs:** `designs/stitch_sports_iq_analytics_platform/` — chosen `screen.png` per page is listed in `docs/00-design-inventory.md` §1.1. Tokens come from `turi_heritage_performance/DESIGN.md`, except headings use **Poppins** and body/labels **Montserrat**.
- `client/src/lib/` holds pure helpers (dates in EAT, image resize, initials) — agreed addition to the folder rules below.

## Engineering rules

### General
- **Minimal code.** Write the least code that meets the requirement. Don't add speculative features, config options or abstractions "for later".
- **Don't repeat yourself.** Before you write anything, search for an existing helper, hook, component or style and reuse it. If you're about to write the same logic, markup or style a second time, extract it. Duplication is OK only when the two copies will change for different reasons. In that case, add a one-line comment saying why.
- **Small units.** Each file, function and component has one job. Use names that say what it does.
- Leave no dead code, commented-out code, unused imports or unused dependencies.
- Comments explain *why*, not *what*.
- Don't add a dependency for something a few lines can do. Don't hand-write a lot of code that a standard, well-known library already does. Justify every new dependency in the architecture doc.
- Don't change the contract, schema or architecture silently. Update the doc first, then tell me.
- If the design or the requirements are unclear, ask. Don't invent.

### Backend (Express + Mongoose)
- Routes only map URLs to controllers, plus auth middleware.
- Controllers only translate between HTTP and services. They never call the database.
- Services hold the business logic. They never touch `req` or `res`.
- Models hold the schemas.
- Use one error-handling middleware and one async wrapper. Throw typed errors (`NotFoundError`, `ValidationError`, `ForbiddenError`, …) instead of building error responses in each controller.
- Validate all input at the edge, using the shared request schemas.
- **Authorization goes through the one policy.** Never write role or team checks inline in controllers or services. Never trust a role or team ID sent by the client. Always derive them from the logged-in user.
- Never return password hashes or other secrets in a response.
- Read configuration only through a single `config` module that loads env vars.
- Put stats in aggregation pipelines, inside the service that owns them. Don't loop over documents in JavaScript.

### Frontend (React + CSS)
- **Keep components small:** one component per file, one job each. If a component goes past about 80 lines or takes on a second concern, split it.
- Pages only compose components and hooks. Folders:
  - `pages/public/` and `pages/dashboard/` for pages
  - `components/` for reusable UI, shared by both
  - `hooks/` for data and behavior
  - `api/` for the one API client
- **Build the primitives first,** from DESIGN.md: `Card` (with a top-border variant), `StatCard`, `DataTable`, `Tabs`, `Badge`/`FormPill`, `Avatar`, `Button`, `Icon` (Material Symbols), `PageHeader`, `Scoreboard`, `Sidebar` and `TopBar`. For the dashboard, add form primitives: `FormField`, `TextInput`, `Select`, `NumberInput`, `DateTimeInput`, `ConfirmDialog` and `Toast`. Compose pages from them. Before you create a new component, check whether an existing one could take a new prop instead.
- **The dashboard reuses public components.** For example, the roster editor shows player cards with the same component as the public roster. Most dashboard list screens are the same pattern (table, filters, add/edit form, delete with confirm), so build that pattern once and configure it per resource. Don't hand-build each screen.
- Show or hide dashboard actions using the logged-in user's permissions from `/auth/me`. That's only for convenience: the server still enforces every permission.
- Components never call `fetch`. They use hooks, and the hooks use the API client.
- **Styling:**
  - `styles/tokens.css` defines every color, type style, spacing value and radius from DESIGN.md as CSS custom properties.
  - Each component has its own CSS Module.
  - Never hardcode a color, font size or spacing value. Use a token.
  - No inline styles, except for values computed at runtime.
- Keep shareable view state in the URL: sport, team, season and tab.
- Make it responsive as DESIGN.md specifies: 64px desktop margins, 16px mobile margins, and a sidebar that collapses on mobile. Match result entry must work on a phone, since coaches may enter results at the pitch.
- Make it accessible: semantic HTML, labelled controls, keyboard navigation and sufficient contrast.

### Testing and definition of done
- Test services and API endpoints with Vitest or Jest plus Supertest, against an in-memory MongoDB. Test behavior, not implementation details.
- **Every write endpoint gets permission tests** for each column of the permission matrix: anonymous (401), coach on another team (403), coach on their own team (allowed), and admin (allowed).
- A slice is **done** when:
  - tests and lint pass
  - responses match `openapi.yaml`
  - the page matches its chosen `screen.png` (public pages) or the layout I approved (dashboard screens)
  - the browser console shows no errors
