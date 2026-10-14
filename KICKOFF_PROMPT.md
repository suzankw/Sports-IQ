# Sports IQ — Project Kickoff

You are building **Sports IQ**, a sports analytics platform for St. Andrew's School, Turi. It shows teams, rosters, fixtures, match statistics, player statistics, season leaderboards and league tables for several sports. Football, basketball and netball have designs. Rugby, hockey and cricket only appear in the navigation.

The product has two parts:
- **Public site.** Read-only, no login. These are the pages in the designs.
- **Dashboard** at `/dashboard`. Requires login. It's one dashboard with two roles:

| Role | Can manage | Main jobs |
|---|---|---|
| **Admin** (e.g. Director of Sport) | Everything: sports and their stat definitions, seasons, teams, competitions, opponent schools, users, coach-to-team assignments, Hall of Fame | Set up each season, add coaches |
| **Coach** | Only the teams they're assigned to | Update the roster (players, numbers, positions, captain), add fixtures, enter match results (score, events, lineup, subs, player stats, match report) |

Coaches see the same screens and forms as admins, filtered to their teams. Don't build two separate dashboards.

**Stack (fixed):** Node.js + Express · MongoDB (Mongoose) · React (Vite) · plain CSS (CSS Modules + global design tokens). No Tailwind, no UI component kits.

**Designs:** a Google Stitch export in `designs/stitch_sports_iq_analytics_platform/`. It covers the public site only. The dashboard has no designs.

## How we work

We work in phases. **At the end of each phase, write its document, then stop and wait for my approval before you start the next phase.** Don't write application code before Phase 4. Keep the docs short: use tables and lists rather than prose, and use Mermaid for diagrams.

---

## Phase 0 — Understand the designs → `docs/00-design-inventory.md`

What's in the export:
- **36 page mockups.** Each one is a folder with `code.html` and `screen.png`. Many are versions of the same page:
  - roster: 6 versions (`first_xi_roster_*`)
  - match statistics: 9 versions (`match_statistics_*`)
  - season statistics: 8 versions (`season_statistics_*`, `scoring_statistics_*`)
  - player statistics: 4 versions
  - schedule: 3 versions, one each for football, basketball and netball
  - league table: 2 versions
  - sport overview: 4 versions (football, basketball, netball)
- **26 image-only folders** (`professional_portrait_of_…`, `a_professional_sports_broadcast_lineup_graphic…`). These are player and coach photos to use as seed images.
- **2 design systems:** `turi_heritage_performance/DESIGN.md` ("Elite Athletics Collegiate") and `turi_heritage/DESIGN.md`. Their typography and some colors differ.
- The mockups load Tailwind from a CDN. Read the Tailwind classes as a spec. Don't copy them into the project.

Deliver:
1. **Page map.** Group the mockups into pages. For each page, choose the version to follow. Judge by `screen.png`, not only the HTML. Note anything worth borrowing from the other versions.
2. **Data inventory.** List every entity and field shown in the UI. For example: scorers with minutes, formation and lineup, substitutions with minutes, possession and shots, the W/D/L form guide, new vs. returning players, and the academy distribution.
3. **Actions.** List every user action: team, season and month filters, tabs, search, Export PDF, Share Report, Add Team, View Full Squad, and so on.
4. **Dashboard screen list.** Work backwards from the data inventory. Every field on a public page must be editable from some dashboard screen. For each screen, list who uses it (admin, coach or both), the data it edits and the public pages that data feeds.
5. **Gaps and inconsistencies:**
   - pages in the navigation that have no design: Hall of Fame, Profile, Settings, Live Scores
   - no login or dashboard designs (covered by item 4)
   - the list of sports differs between screens
   - stats and positions differ by sport
6. **Questions for me.** Include at least these:
   - Which DESIGN.md is the source of truth? *(Default: `turi_heritage_performance`.)*
   - Is it for Turi only, or for several schools?
   - JavaScript or TypeScript? *(Default: JavaScript with ES modules.)*
   - How do coaches get accounts? *(Default: an admin creates them and sets a temporary password. No self sign-up.)*
   - Is password reset by email needed in v1? *(Default: no. An admin resets passwords.)*
   - Should match results go live as soon as they're saved, or stay as a draft until published? *(Default: draft, then the coach publishes.)*

---

## Phase 1 — System design & architecture → `docs/01-architecture.md`

- **Context:** the three kinds of user (public visitor, coach, admin), their main use cases, and what each one reads and writes.
- **High-level diagram:** client, API, database, and file storage for photos.
- **Repo layout:** a monorepo with `client/`, `server/`, `docs/` and `designs/`.
- **Backend layering:** routes → controllers → services → models. Show where validation, authentication, authorization and error handling live.
- **Auth:**
  - How login works and where the session lives. *(Default: a JWT in an httpOnly cookie, with `login`, `logout` and `me` endpoints.)*
  - How passwords are hashed.
  - **Authorization in one place.** A single policy decides whether a user can do an action on a resource. Admins can do everything. Coaches can only write to resources that belong to their assigned teams.
- **Frontend architecture:**
  - Route map: every public page from Phase 0 mapped to a URL, plus every dashboard screen under `/dashboard`.
  - Public layout shell from DESIGN.md: a 256px sidebar plus a 64px top bar.
  - Dashboard layout shell: same design system, its own navigation. Coaches only see the menu items they're allowed to use.
  - Route guards: anonymous users who open `/dashboard` are sent to login, and coaches who open admin-only screens are blocked.
  - Data-fetching approach.
  - Keep the current sport, team, season and tab in the URL so every view can be shared and bookmarked.
- **Cross-cutting concerns:** config and environment variables, logging, error format, photo uploads, and how PDF export and sharing work.
- **Decisions:** write a short ADR for each key decision: the decision, the alternatives and the reason. Justify every library here before you add it.

---

## Phase 2 — Database design → `docs/02-database.md`

- For each collection, list every field with its type, whether it's required, its default and its indexes, and give an example document.
- For each relationship, decide whether to embed or reference, and explain why based on the queries the pages actually run.
- The design must handle these cases well:
  - **Sports with different stats.** Football tracks goals, assists, clearances and saves. Netball and basketball use different stats and positions. Don't create a schema per sport. My preference: a `Sport` definition that lists positions and stat definitions (key, label, abbreviation, aggregation), with match and player stats stored as key→value maps that are validated against it. If you disagree, argue your case.
  - **Teams by sport, level and season.** Examples: First XI, Second XI, U16, U19 Boys, U15 Girls. A player can be in different squads in different seasons, so jersey number, position and captaincy belong to the season, not the player.
  - **Matches.** Store home/away, the opponent (another school), venue, competition (KAISSO, IAPS, Friendlies, regional finals), status (upcoming, live or completed), score, events (goals with minutes, cards, substitutions), formation and lineup, team stats, per-player stats, staff and a match report quote.
  - **Users.** Store name, email, password hash, role (`admin` or `coach`) and active/disabled status. Decide where coach-to-team assignments live: on the user, on the team, or in their own collection. Explain the choice. A coach account and the coach shown on the public roster ("Head Coach Mr. J. Smith") should be linked, not stored twice.
  - **Draft vs. published.** Public endpoints only return published match results.
  - **Audit.** Every document that coaches or admins can edit records who changed it last and when.
  - **Derived data.** This covers league standings (P W D L GF GA GD Pts, form), season leaderboards (top scorers, assists, defensive leaders) and roster analytics (new vs. returning players, gender split, academy distribution). *Default:* compute these with aggregation pipelines and don't store them. If you cache any of them, explain how the cache stays correct after a coach edits a result.
- **Query table:** for every public page and dashboard screen, list the queries it runs and the index that serves each one.
- **Seed plan:** realistic data that matches the mockups (names, schools, scores, seasons), using the portrait images. Include one admin and a few coaches assigned to different teams. Put their seed credentials in `.env.example`, not in the docs.

---

## Phase 3 — API design → `docs/03-api.md` + `docs/openapi.yaml`

- Use REST under `/api/v1`. Use plural nouns, and nest resources at most one level deep.
- **One set of resource routes for everything.** The public site and the dashboard read from the same routes. Writes (`POST`, `PATCH`, `DELETE`) live on those same routes and require auth. Don't create a parallel `/admin` API that repeats the reads.
- Auth endpoints: `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`.
- For **every endpoint**, document:
  - method and path
  - purpose, and which page or dashboard screen uses it
  - who can call it: public, coach (own teams only) or admin
  - path and query parameters
  - request body
  - response body, with example JSON
  - error cases, including 401 and 403
- **Permission matrix:** one table covering every write endpoint, with a column each for anonymous, coach on their own team, coach on another team, and admin.
- Define these conventions once and use them everywhere:
  - Success shape, and an error shape of `{ "error": { "code", "message", "details" } }`, plus which status codes to use.
  - Pagination, sorting and filtering, e.g. `?sport=football&team=first-xi&season=2023-2024`.
  - One validation schema per request. Where possible, the same schema validates the request at runtime and feeds the OpenAPI doc.
  - Dates are ISO 8601 in UTC. The client displays them in EAT.
- Shape responses around pages. For example, match detail returns everything the match page needs in one call. Match result entry saves the whole result (score, events, lineup, player stats) in one request. Don't create one endpoint per widget, though.
- **`openapi.yaml` is the contract.** Server and client both follow it. If implementation needs a change to it, update the contract first and tell me.

---

## Phase 4 — Implementation

Build in this order:
1. Repo setup, and write `CLAUDE.md` from the rules below.
2. `tokens.css` generated from DESIGN.md, the public layout, and the UI primitives.
3. Seed script.
4. **Public site.** Vertical slices, each one the API plus its page, built one at a time: Match Statistics → Roster → Schedule → League Table → Player Statistics → Season Statistics → Sport Overview. After each slice, run it, compare it with the chosen `screen.png`, show me the result, and only then continue.
5. **Auth and dashboard shell.** Login page, auth endpoints, the authorization policy, route guards and the dashboard layout.
6. **Dashboard.** Vertical slices again: Season setup (seasons, teams, competitions, opponents) → Users and coach assignments → Roster management → Fixtures → Match result entry → Hall of Fame. Before you build any dashboard screen, show me a quick wireframe or describe its layout, and wait for my OK, because none of these screens have designs. Match result entry matters most: it's the screen coaches use after every match, so it has to be fast to fill in.

---

## Engineering rules

In Phase 4, copy this section into `CLAUDE.md` so every session and sub-agent follows it.

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
