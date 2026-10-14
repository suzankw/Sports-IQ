# 03 — API Design

**Status:** Approved 2026-10-14 · **Phase:** 3 · **Contract:** [openapi.yaml](openapi.yaml) (OpenAPI 3.1) · **Builds on:** [01](01-architecture.md), [02](02-database.md)

`openapi.yaml` is the contract. This doc explains it: conventions, every endpoint, examples and the permission matrix. If implementation needs a change, the YAML changes first and I tell you.

Checked on 2026-10-14: Redocly lint passes, and all 57 operations compile in `express-openapi-validator` 5.6 with request **and** response validation on. Test calls showed it rejects unknown fields (e.g. a client-sent `role`), bad formats and negative stats, and catches a leaked `passwordHash` in a response. The complete examples below (`Me`, `Standings`, the full `Match`, and the result-entry request) were validated against the contract too.

---

## 1. Conventions

### 1.1 Resources

| Rule | Detail |
|---|---|
| Base | `/api/v1` |
| Names | Plural nouns, kebab-case: `/team-seasons`, `/league-results`. Nested at most one level: `/matches/{id}/result`, `/team-seasons/{id}/stats` |
| One set of routes | The public site and the dashboard read the same routes. Writes live on those routes and need the session cookie. There is no `/admin` API |
| Addressing | By `id` (ObjectId), except sports, which use their slug (`/sports/football`) because page URLs do |
| Shaped around pages | One call per page or form: `GET /sports/{sport}/overview`, `GET /matches/{id}`, `GET /team-seasons/{id}` (roster), `GET /team-seasons/{id}/stats`, `GET /competitions/{id}/standings`. Whole-form saves: `PUT /matches/{id}/result`, `PUT /team-seasons/{id}/squad` |
| Small lists | Seasons, schools, competitions, teams, players, users, league results and inductees have no `GET /{id}`: list rows are already the full resource, and the edit forms use them |

### 1.2 Success and error shapes

```json
{ "data": { "id": "6650a1f0c0a8e1a1b2c3d470", "…": "…" } }
{ "data": [ { "…": "…" } ], "meta": { "page": 1, "pageSize": 50, "total": 123 } }
{ "error": { "code": "VALIDATION_ERROR", "message": "The request is invalid", "details": [ { "path": "/body/members/3/number", "message": "Number 9 is already taken by Otieno Kariuki" } ] } }
```

| Status | When | `code` |
|---|---|---|
| 200 | Read, update, whole-form save, login, password change | — |
| 201 | Created (returns the new resource) | — |
| 204 | Delete, logout, admin password reset | — |
| 400 | Doesn't match the contract, or breaks a domain rule | `VALIDATION_ERROR` |
| 401 | No session, expired or revoked (every write, `mine=true`, `/users`) | `UNAUTHENTICATED` |
| 403 | The policy says no / temporary password not changed yet | `FORBIDDEN` / `PASSWORD_CHANGE_REQUIRED` |
| 404 | Missing | `NOT_FOUND` |
| 409 | Duplicate, still in use, or stale `version` | `CONFLICT` |
| 413 / 415 | Upload over 2 MB / not JPEG, PNG or WebP | `PAYLOAD_TOO_LARGE` / `UNSUPPORTED_MEDIA_TYPE` |
| 429 | Too many sign-in attempts | `RATE_LIMITED` |
| 500 | Unexpected (logged; no stack in the response) | `INTERNAL_ERROR` |

Every response has an `X-Request-Id` header.

### 1.3 Lists: pagination, sorting, filtering

| Rule | Detail |
|---|---|
| Pagination | Every list: `page` (default 1), `pageSize` (default 50, max 200). `meta.total` counts all matches |
| Sorting | `sort=field` or `sort=-field` where a list offers it (`matches`: `kickoffAt`; `players`: `lastName`; `league-results`: `playedAt`). Otherwise a fixed order, stated per endpoint |
| Filters from page URLs | Slugs: `?sport=football&team=first-xi&season=2026-2027`. `team` needs `sport`. Missing `season` = the current season |
| Other filters | Ids: `teamSeason`, `competition`. Booleans: `mine`, `published`, `home`. Enums: `status`, `view`, `type`. Month: `month=2026-10` (EAT) |
| Request bodies | Always ids, never slugs |

### 1.4 Validation, dates, versions, drafts

| Topic | Rule |
|---|---|
| Validation | One schema per request in `openapi.yaml`, enforced at runtime. Every object has `additionalProperties: false`, so unknown fields (a client-sent `role`, `createdBy`, …) are a 400. Domain rules (stat keys exist for the sport, unique shirt numbers, …) run in services and use the same error shape |
| Responses | Validated against the same file in tests. A field not in the contract fails the test |
| Dates | ISO 8601 in UTC (`2026-10-10T12:00:00.000Z`). The client shows EAT. Dashboard inputs are EAT, converted by the client |
| Versions | `sports`, `team-seasons`, `matches` return `version`. Their updates must send it back; a stale one gives 409 |
| Drafts | A match result is a draft until `published: true`. Public callers (and coaches of other teams) get the fixture, `status` and `score` only (Q6). Lists only ever contain those public fields |
| Identity | Never taken from the body or query. Always from the cookie (`siq_session`) |

---

## 2. Endpoints

**Who:** P = public · S = any signed-in staff · C = coach of that team-season · A = admin. Common errors (400 for a bad request, 401 for anonymous writes, 403 for policy, 404 for a missing id) apply everywhere and aren't repeated below.

### 2.1 Auth

| Method & path | Used by | Who | Body → success | Notable errors |
|---|---|---|---|---|
| `POST /auth/login` | Login page | P | `{ email, password }` → 200 `Me` + cookie | 401 (same message for every failure), 429 |
| `POST /auth/logout` | Avatar menu | S | — → 204, cookie cleared | 401 |
| `GET /auth/me` | Every page, guards, menus | P | — → 200 `Me`, or `{ "data": null }` when not signed in | — |
| `PATCH /auth/me` | D17 My account | S | `{ name?, title?, photoUrl? }` → 200 `Me` | — |
| `POST /auth/password` | D17, forced change | S (even with a temporary password) | `{ currentPassword, newPassword }` → 200 `Me` + new cookie | 400 wrong current password |

```json
// 200 GET /auth/me (a coach)
{ "data": {
  "user": { "id": "6650a1f0c0a8e1a1b2c3d4a2", "email": "john.smith@turi.test", "name": "John Smith", "title": "Mr.", "photoUrl": null, "role": "coach", "mustChangePassword": false },
  "permissions": {
    "screens": ["home", "account", "players", "rosters", "fixtures", "results"],
    "teamSeasons": [ { "id": "6650a1f0c0a8e1a1b2c3d450", "role": "head",
      "sport": { "id": "6650a1f0c0a8e1a1b2c3d401", "slug": "football", "name": "Football", "icon": "sports_soccer" },
      "team": { "id": "6650a1f0c0a8e1a1b2c3d440", "slug": "first-xi", "name": "First XI" },
      "season": { "id": "6650a1f0c0a8e1a1b2c3d410", "slug": "2026-2027", "label": "2026/2027" } } ]
  } } }
```

### 2.2 Sports

| Method & path | Used by | Who | Params / body → success | Notable errors |
|---|---|---|---|---|
| `GET /sports` | Sidebar, D3 | P | page → 200 `[SportSummary]` by `order` | — |
| `POST /sports` | D3 | A | `{ slug, name, icon, order }` → 201 `Sport` (`comingSoon`) | 409 slug taken |
| `GET /sports/{sport}` | D3/D4 forms; definitions for any page that needs them | P | — → 200 `Sport` | 404 |
| `PATCH /sports/{sport}` | D3 definitions, D4 page content | A | `{ version, …any fields }` → 200 `Sport` | 400 a used stat key removed or renamed; 409 stale version |
| `GET /sports/{sport}/overview` | **Overview page** | P | — → 200 `{ sport, upcoming[≤4], topScorers[≤4], standings }` | 404 |

```json
// 200 GET /sports/football/overview (lists shortened)
{ "data": {
  "sport": { "id": "6650a1f0c0a8e1a1b2c3d401", "slug": "football", "name": "Football", "icon": "sports_soccer", "order": 1, "status": "active",
    "periods": { "count": 2, "minutes": 45 }, "scoreDetail": "events", "scoringStat": "goals", "standingsPoints": { "win": 3, "draw": 1, "loss": 0 },
    "positions": [], "formations": [], "teamStats": [], "playerStats": [], "leaderboards": [], "kpis": { "cleanSheets": true, "teamStat": "possession" },
    "content": { "hero": { "eyebrow": "High Altitude Advantage", "title": "Football IQ", "text": "At 8,200ft above sea level…", "imageUrl": null } },
    "version": 4, "updatedAt": "2026-09-01T07:00:00.000Z", "updatedBy": null },
  "upcoming": [ { "id": "6650a1f0c0a8e1a1b2c3d471", "kickoffAt": "2026-10-24T11:30:00.000Z", "homeAway": "home", "status": "upcoming", "score": null, "published": false,
    "team": { "id": "6650a1f0c0a8e1a1b2c3d440", "slug": "first-xi", "name": "First XI" }, "opponent": { "id": "6650a1f0c0a8e1a1b2c3d421", "name": "Peponi School", "shortName": "Peponi", "crestUrl": null }, "…": "…" } ],
  "topScorers": [ { "rank": 1, "player": { "id": "6650a1f0c0a8e1a1b2c3d460", "firstName": "Otieno", "lastName": "Kariuki", "shortName": "O. Kariuki", "photoUrl": null }, "position": "FW", "appearances": 9, "value": 12 } ],
  "standings": { "competition": { "id": "6650a1f0c0a8e1a1b2c3d430", "name": "KISL Premier Division", "shortName": "KISL", "type": "league" },
    "team": { "id": "6650a1f0c0a8e1a1b2c3d440", "slug": "first-xi", "name": "First XI" }, "rows": [ { "position": 1, "…": "see §2.5" } ] }
} }
```

### 2.3 Seasons, schools, competitions, teams (admin setup)

| Method & path | Used by | Who | Params / body → success | Notable errors |
|---|---|---|---|---|
| `GET /seasons` | Season selects, D5 | P | page → 200 `[Season]` newest first | — |
| `POST /seasons` | D5 | A | `{ slug, label, startDate, endDate, isCurrent? }` → 201 | 409 slug taken |
| `PATCH /seasons/{id}` | D5 | A | `{ label?, startDate?, endDate?, isCurrent?: true }` → 200 | 400 end before start |
| `DELETE /seasons/{id}` | D5 | A | → 204 | 409 in use |
| `GET /schools` | Shell crest (`home=true`), pickers, D8 | P | `home?` → 200 `[School]` by name | — |
| `POST /schools` | D8 | A | `{ name, shortName, crestUrl? }` → 201 | 409 name taken |
| `PATCH /schools/{id}` | D8 (Turi too) | A | `{ name?, shortName?, crestUrl? }` → 200 | 409 name taken |
| `DELETE /schools/{id}` | D8 | A | → 204 | 409 Turi, or in use |
| `GET /competitions` | Pickers, D7 | P | `sport?`, `type?` → 200 `[Competition]` | — |
| `POST /competitions` | D7 | A | `{ sport, name, shortName, type }` → 201 | 409 name taken for the sport |
| `PATCH /competitions/{id}` | D7 | A | `{ name?, shortName?, type? }` → 200 | 409 |
| `DELETE /competitions/{id}` | D7 | A | → 204 | 409 in use |
| `GET /teams` | D6, pickers | P | `sport?` → 200 `[Team]` by sport, order | — |
| `POST /teams` | D6 | A | `{ sport, slug, name, ageGroup, gender, order? }` → 201 | 409 slug taken for the sport |
| `PATCH /teams/{id}` | D6 | A | `{ name?, ageGroup?, gender?, order? }` → 200 | — |
| `DELETE /teams/{id}` | D6 | A | → 204 | 409 has team-seasons |

```json
// POST /seasons  →  201
{ "slug": "2027-2028", "label": "2027/2028", "startDate": "2027-08-31T21:00:00.000Z", "endDate": "2028-07-31T20:59:59.000Z" }
{ "data": { "id": "6650a1f0c0a8e1a1b2c3d411", "slug": "2027-2028", "label": "2027/2028", "startDate": "2027-08-31T21:00:00.000Z", "endDate": "2028-07-31T20:59:59.000Z",
  "isCurrent": false, "updatedAt": "2026-10-14T08:00:00.000Z", "updatedBy": { "id": "6650a1f0c0a8e1a1b2c3d4a1", "name": "Grace Wanjiru", "title": "Mrs.", "photoUrl": null } } }

// 200 GET /schools?home=false (one row)
{ "id": "6650a1f0c0a8e1a1b2c3d421", "name": "Peponi School", "shortName": "Peponi", "crestUrl": null, "isHome": false, "updatedAt": "…", "updatedBy": null }

// 200 GET /teams?sport=football (one row)
{ "id": "6650a1f0c0a8e1a1b2c3d440", "sport": { "id": "…d401", "slug": "football", "name": "Football", "icon": "sports_soccer" },
  "slug": "first-xi", "name": "First XI", "ageGroup": "Open", "gender": "boys", "order": 1, "updatedAt": "…", "updatedBy": null }
```

### 2.4 Team-seasons (rosters and season stats)

| Method & path | Used by | Who | Params / body → success | Notable errors |
|---|---|---|---|---|
| `GET /team-seasons` | Team tabs/selects on Roster, Season Stats, League Table; URL → id; D6/D9/D12 pickers | P (`mine` needs S) | `sport`, `team`, `season`, `mine` → 200 `[TeamSeasonSummary]` by team order | 400 `team` without `sport` |
| `POST /team-seasons` | D6 season setup | A | `{ team, season, leagueCompetition?, seasonQuote?, copyFrom? }` → 201 `TeamSeason` | 409 already entered |
| `GET /team-seasons/{id}` | **Roster page**, D12 | P | — → 200 `TeamSeason` (squad, coaches, analytics, gallery) | — |
| `PATCH /team-seasons/{id}` | D6 | A | `{ version, leagueCompetition?, seasonQuote? }` → 200 | 400 not a league of this sport; 409 stale |
| `DELETE /team-seasons/{id}` | D6 | A | → 204 | 409 has matches or coaches |
| `PUT /team-seasons/{id}/squad` | **D12 Roster editor** | C, A | `{ version, members, captain, depthChart }` → 200 `TeamSeason` | 400 duplicate number, unknown position, captain not a member; 409 stale |
| `GET /team-seasons/{id}/stats` | **Season Stats page** (all 4 tabs) | P | — → 200 `SeasonStats` | — |

```json
// 200 GET /team-seasons/{id}  (Roster page; lists shortened)
{ "data": {
  "id": "6650a1f0c0a8e1a1b2c3d450",
  "sport": { "id": "…d401", "slug": "football", "name": "Football", "icon": "sports_soccer" },
  "team": { "id": "…d440", "slug": "first-xi", "name": "First XI" },
  "season": { "id": "…d410", "slug": "2026-2027", "label": "2026/2027" },
  "leagueCompetition": { "id": "…d430", "name": "KISL Premier Division", "shortName": "KISL", "type": "league" },
  "seasonQuote": { "text": "Discipline, teamwork, and an unwavering commitment to excellence…", "attribution": "Director of Athletics" },
  "members": [ { "player": { "id": "…d460", "firstName": "Otieno", "lastName": "Kariuki", "shortName": "O. Kariuki", "photoUrl": null }, "number": 9, "position": "FW" } ],
  "captain": { "id": "…d461", "firstName": "Daniel", "lastName": "Ochieng", "shortName": "D. Ochieng", "photoUrl": null },
  "depthChart": [],
  "staff": [ { "user": { "id": "…d4a2", "name": "John Smith", "title": "Mr.", "photoUrl": null }, "role": "head" } ],
  "analytics": {
    "playerCount": 18, "gender": { "female": 0, "male": 18 },
    "comparison": [ { "metric": "girls", "current": 0, "previous": 0 }, { "metric": "new", "current": 5, "previous": 7 }, { "metric": "returning", "current": 13, "previous": 11 } ],
    "academy": [ { "team": { "id": "…d440", "slug": "first-xi", "name": "First XI" }, "playerCount": 18, "share": 25 } ] },
  "gallery": [],
  "version": 6, "updatedAt": "2026-10-02T09:12:00.000Z", "updatedBy": { "id": "…d4a2", "name": "John Smith", "title": "Mr.", "photoUrl": null }
} }

// PUT /team-seasons/{id}/squad  (request)
{ "version": 6,
  "members": [ { "player": "6650a1f0c0a8e1a1b2c3d460", "number": 9, "position": "FW" }, { "player": "6650a1f0c0a8e1a1b2c3d461", "number": 5, "position": "DF" } ],
  "captain": "6650a1f0c0a8e1a1b2c3d461",
  "depthChart": [] }

// 200 GET /team-seasons/{id}/stats  (lists shortened)
{ "data": {
  "teamSeason": { "id": "…d450", "sport": { "…": "…" }, "team": { "…": "…" }, "season": { "…": "…" }, "memberCount": 18, "leagueCompetition": { "…": "…" } },
  "kpis": { "played": 9, "won": 7, "drawn": 1, "lost": 1, "winRate": 77.8, "winRateChange": 5.3, "scored": 24, "conceded": 8, "cleanSheets": 4,
    "teamStat": { "key": "possession", "label": "Possession", "value": 61.4 } },
  "form": [ { "match": "…d470", "kickoffAt": "2026-10-10T12:00:00.000Z", "opponent": { "id": "…d421", "name": "Peponi School", "shortName": "Peponi", "crestUrl": null }, "goalDifference": 2, "teamStat": 55 } ],
  "leaderboards": [ { "key": "scorers", "label": "Top Scorers", "icon": "sports_soccer", "group": "attack",
    "rows": [ { "rank": 1, "player": { "id": "…d460", "firstName": "Otieno", "lastName": "Kariuki", "shortName": "O. Kariuki", "photoUrl": null }, "position": "FW", "appearances": 9, "value": 12 } ] } ],
  "records": [ { "key": "scoringPeak", "value": 6, "match": { "id": "…d472", "kickoffAt": "2026-09-26T12:00:00.000Z", "opponent": { "…": "…" }, "score": { "turi": 6, "opponent": 1 } } } ],
  "quote": { "text": "Discipline, teamwork…", "attribution": "Director of Athletics" }
} }
```

### 2.5 League tables and other schools' results

| Method & path | Used by | Who | Params / body → success | Notable errors |
|---|---|---|---|---|
| `GET /competitions/{id}/standings` | **League Table page**, Overview | P | `season?` → 200 `Standings` | — |
| `GET /league-results` | D15 | P | `competition`, `season`, sort, page → 200 `[LeagueResult]` | — |
| `POST /league-results` | D15 | A | `{ competition, season, playedAt, home: { school, score }, away: { school, score } }` → 201 | 400 Turi given, same school twice, competition not a league |
| `PATCH /league-results/{id}` | D15 | A | `{ playedAt?, home?, away? }` → 200 | 400 as above |
| `DELETE /league-results/{id}` | D15 | A | → 204 | — |

```json
// 200 GET /competitions/{id}/standings?season=2025-2026  (2 of 6 rows)
{ "data": {
  "competition": { "id": "…d430", "name": "KISL Premier Division", "shortName": "KISL", "type": "league" },
  "season": { "id": "…d409", "slug": "2025-2026", "label": "2025/2026" },
  "sport": { "id": "…d401", "slug": "football", "name": "Football", "icon": "sports_soccer" },
  "rows": [
    { "position": 1, "school": { "id": "…d420", "name": "St. Andrew's Turi", "shortName": "St. Andrew's Turi", "crestUrl": "/uploads/seed/turi-crest.png" }, "isHome": true,
      "played": 10, "won": 8, "drawn": 1, "lost": 1, "goalsFor": 24, "goalsAgainst": 8, "goalDifference": 16, "points": 25, "form": ["W", "W", "D", "W", "W"] },
    { "position": 2, "school": { "id": "…d421", "name": "Peponi School", "shortName": "Peponi", "crestUrl": null }, "isHome": false,
      "played": 10, "won": 6, "drawn": 3, "lost": 1, "goalsFor": 18, "goalsAgainst": 10, "goalDifference": 8, "points": 21, "form": ["D", "W", "W", "L", "W"] }
  ] } }
```

### 2.6 Players and users

| Method & path | Used by | Who | Params / body → success | Notable errors |
|---|---|---|---|---|
| `GET /players` | D11, D12 search | P | `search`, `teamSeason`, sort, page → 200 `[Player]` | — |
| `POST /players` | D11, D12 "new player" | S | `{ firstName, lastName, gender, photoUrl? }` → 201 | — |
| `PATCH /players/{id}` | D11 | C (player in my squad), A | `{ firstName?, lastName?, gender?, photoUrl? }` → 200 | — |
| `DELETE /players/{id}` | D11 | A | → 204 | 409 in a squad, match or Hall of Fame |
| `GET /users` | D9 | A | page → 200 `[User]` | — |
| `POST /users` | D9 + D10 | A | `{ email, name, title?, photoUrl?, role, temporaryPassword, assignments? }` → 201 | 409 email taken |
| `PATCH /users/{id}` | D9 + D10 | A | `{ email?, name?, title?, photoUrl?, role?, active?, assignments? }` → 200 | 409 email taken, or an admin disabling/demoting themselves |
| `POST /users/{id}/password-reset` | D9 | A | `{ temporaryPassword }` → 204 | — |

```json
// POST /users  (request)
{ "email": "amina.otieno@turi.test", "name": "Amina Otieno", "title": "Ms.", "role": "coach", "temporaryPassword": "correct-horse-battery",
  "assignments": [ { "teamSeason": "6650a1f0c0a8e1a1b2c3d455", "role": "head" } ] }

// 201
{ "data": { "id": "6650a1f0c0a8e1a1b2c3d4a6", "email": "amina.otieno@turi.test", "name": "Amina Otieno", "title": "Ms.", "photoUrl": null,
  "role": "coach", "active": true, "mustChangePassword": true,
  "assignments": [ { "role": "head", "teamSeason": { "id": "…d455", "sport": { "…": "…" }, "team": { "id": "…d445", "slug": "first-vii", "name": "First VII" }, "season": { "…": "…" } } } ],
  "updatedAt": "2026-10-14T08:00:00.000Z", "updatedBy": { "id": "…d4a1", "name": "Grace Wanjiru", "title": "Mrs.", "photoUrl": null } } }
```

### 2.7 Matches (schedule, match page, result entry)

| Method & path | Used by | Who | Params / body → success | Notable errors |
|---|---|---|---|---|
| `GET /matches` | **Schedule page** (list; live banner `status=live&pageSize=1`), D2 Home, D13 | P (`mine` needs S) | `sport`, `team`, `season`, `teamSeason`, `competition`, `status`, `view`, `month`, `published`, `mine`, sort, page → 200 `[MatchSummary]` | 400 `team` without `sport` |
| `POST /matches` | D13 | C, A | `{ teamSeason, competition, round?, opponent, homeAway, kickoffAt, venue? }` → 201 `Match` | 400 competition of another sport, opponent is Turi |
| `GET /matches/{id}` | **Match page** (3 tabs), D14 load | P | — → 200 `Match` (result fields omitted for drafts the caller can't see) | — |
| `PATCH /matches/{id}` | D13 | C, A | `{ version, …fixture fields }` → 200 `Match` | 403 moving to a team that isn't yours; 409 stale |
| `DELETE /matches/{id}` | D13 | C, A | → 204 | — |
| `PUT /matches/{id}/result` | **D14 Match result entry** | C, A | `MatchResultInput` → 200 `Match` | 400 player not in squad, wrong starters for the formation, unknown or event-sourced stat key, publish checks fail; 409 stale |

`view`: `upcoming` (upcoming or live, oldest first) · `completed` (newest first) · `awaitingResult` (kick-off passed, not completed). D2 drafts: `mine=true&status=completed&published=false`.

```json
// 200 GET /matches?sport=football&view=upcoming  (one row)
{ "data": [ {
  "id": "6650a1f0c0a8e1a1b2c3d471", "sport": { "id": "…d401", "slug": "football", "name": "Football", "icon": "sports_soccer" },
  "season": { "id": "…d410", "slug": "2026-2027", "label": "2026/2027" }, "teamSeason": "…d450", "team": { "id": "…d440", "slug": "first-xi", "name": "First XI" },
  "competition": { "id": "…d430", "name": "KISL Premier Division", "shortName": "KISL", "type": "league" }, "round": null,
  "opponent": { "id": "…d422", "name": "Brookhouse School", "shortName": "Brookhouse", "crestUrl": null },
  "homeAway": "away", "kickoffAt": "2026-10-28T12:00:00.000Z", "venue": "Brookhouse", "status": "upcoming", "score": null, "published": false } ],
  "meta": { "page": 1, "pageSize": 50, "total": 5 } }
```

```json
// PUT /matches/{id}/result  (football; lists shortened)
{ "version": 7, "status": "completed", "score": { "turi": 3, "opponent": 1 }, "periodScores": [],
  "events": [
    { "type": "goal", "side": "turi", "minute": 14, "player": "6650a1f0c0a8e1a1b2c3d460", "assist": "6650a1f0c0a8e1a1b2c3d462" },
    { "type": "goal", "side": "opponent", "minute": 81, "playerName": "D. Patel" },
    { "type": "sub", "side": "turi", "minute": 65, "player": "6650a1f0c0a8e1a1b2c3d468", "playerOff": "6650a1f0c0a8e1a1b2c3d463" },
    { "type": "yellow", "side": "turi", "minute": 52, "player": "6650a1f0c0a8e1a1b2c3d461" } ],
  "formation": "4-3-3",
  "lineup": [ { "player": "6650a1f0c0a8e1a1b2c3d460", "slot": "ST" }, { "player": "6650a1f0c0a8e1a1b2c3d468", "slot": null } ],
  "teamStats": { "turi": { "possession": 55, "shots": 14, "shotsOnTarget": 7, "corners": 6, "fouls": 11, "offsides": 2, "saves": 1 },
                 "opponent": { "possession": 45, "shots": 8, "shotsOnTarget": 3, "corners": 4, "fouls": 15, "yellowCards": 3, "redCards": 1, "offsides": 4, "saves": 8 } },
  "playerStats": [ { "player": "6650a1f0c0a8e1a1b2c3d460", "position": "FW", "stats": { "minutes": 90, "shots": 5, "shotsOnTarget": 3 } } ],
  "topPerformers": ["6650a1f0c0a8e1a1b2c3d460", "6650a1f0c0a8e1a1b2c3d462", "6650a1f0c0a8e1a1b2c3d461"],
  "report": { "text": "A resolute display of discipline and tactical superiority.", "attribution": "Director of Sport" },
  "heroPhotoUrl": null, "galleryUrls": [], "published": true }
```

The 200 response is the full `Match`, the same shape as `GET /matches/{id}`. Goals, assists and the Turi side's cards are filled in from `events`:

```json
{ "data": {
  "id": "6650a1f0c0a8e1a1b2c3d470", "teamSeason": "…d450", "round": "Regional Final", "homeAway": "home",
  "kickoffAt": "2026-10-10T12:00:00.000Z", "venue": "Turi Main Pitch", "status": "completed", "score": { "turi": 3, "opponent": 1 },
  "published": true, "publishedAt": "2026-10-10T16:20:00.000Z",
  "sport": { "id": "…d401", "slug": "football", "name": "Football", "icon": "sports_soccer", "periods": { "count": 2, "minutes": 45 }, "scoreDetail": "events",
    "positions": [ { "key": "FW", "name": "Forward", "headlineStats": ["goals", "shots"] } ], "formations": [ { "key": "4-3-3", "name": "4-3-3 Attacking", "slots": [ { "key": "ST", "position": "FW", "x": 50, "y": 80 } ] } ],
    "teamStats": [ { "key": "possession", "label": "Possession", "abbr": "Poss", "icon": "sports_soccer", "type": "percent", "ratio": null, "source": "manual", "aggregation": "avg" } ],
    "playerStats": [ { "key": "goals", "label": "Goals", "abbr": "G", "icon": null, "type": "count", "ratio": null, "source": "events", "aggregation": "sum" } ] },
  "season": { "id": "…d410", "slug": "2026-2027", "label": "2026/2027" }, "team": { "id": "…d440", "slug": "first-xi", "name": "First XI" },
  "competition": { "id": "…d431", "name": "Rift Valley Regionals", "shortName": "Regionals", "type": "cup" },
  "turi": { "id": "…d420", "name": "St. Andrew's Turi", "shortName": "St. Andrew's Turi", "crestUrl": "/uploads/seed/turi-crest.png" },
  "opponent": { "id": "…d421", "name": "Peponi School", "shortName": "Peponi", "crestUrl": null },
  "staff": [ { "user": { "id": "…d4a2", "name": "John Smith", "title": "Mr.", "photoUrl": null }, "role": "head" } ],
  "periodScores": [],
  "events": [ { "type": "goal", "side": "turi", "minute": 14, "ownGoal": false, "playerName": null, "playerOff": null,
    "player": { "id": "…d460", "firstName": "Otieno", "lastName": "Kariuki", "shortName": "O. Kariuki", "photoUrl": null },
    "assist": { "id": "…d462", "firstName": "James", "lastName": "Mwangi", "shortName": "J. Mwangi", "photoUrl": null } } ],
  "formation": "4-3-3",
  "lineup": [ { "player": { "id": "…d460", "firstName": "Otieno", "lastName": "Kariuki", "shortName": "O. Kariuki", "photoUrl": null }, "number": 9, "slot": "ST", "position": "FW" } ],
  "teamStats": { "turi": { "possession": 55, "shots": 14, "yellowCards": 1 }, "opponent": { "possession": 45, "shots": 8, "yellowCards": 3 } },
  "playerStats": [ { "player": { "id": "…d460", "firstName": "Otieno", "lastName": "Kariuki", "shortName": "O. Kariuki", "photoUrl": null }, "number": 9, "position": "FW",
    "stats": { "minutes": 90, "goals": 2, "assists": 0, "shots": 5, "shotsOnTarget": 3, "yellowCards": 0, "redCards": 0 } } ],
  "topPerformers": [ { "id": "…d460", "firstName": "Otieno", "lastName": "Kariuki", "shortName": "O. Kariuki", "photoUrl": null } ],
  "report": { "text": "A resolute display of discipline and tactical superiority.", "attribution": "Director of Sport" },
  "heroPhotoUrl": null, "galleryUrls": [],
  "version": 8, "updatedAt": "2026-10-10T16:20:00.000Z", "updatedBy": { "id": "…d4a2", "name": "John Smith", "title": "Mr.", "photoUrl": null }
} }
```

### 2.8 Hall of Fame and uploads

| Method & path | Used by | Who | Params / body → success | Notable errors |
|---|---|---|---|---|
| `GET /inductees` | Hall of Fame page, D16 | P | `sport?` → 200 `[Inductee]` by order | — |
| `POST /inductees` | D16 | A | `{ name, achievement, photoUrl?, sport?, years?, citation?, player?, order? }` → 201 | — |
| `PATCH /inductees/{id}` | D16 | A | any of the above → 200 | — |
| `DELETE /inductees/{id}` | D16 | A | → 204 | — |
| `POST /uploads` | Every photo field | S | multipart `file` → 201 `{ url }` | 413 over 2 MB, 415 not JPEG/PNG/WebP |

```json
// 201 POST /uploads
{ "data": { "url": "/uploads/2026/10/3f1c9a52-6a1e-4f7e-9c1d-2b8e5f0a7c11.jpg" } }
```

### 2.9 Calls per page

| Page / screen | Calls |
|---|---|
| Shell (every page) | `GET /sports` · `GET /schools?home=true` · `GET /seasons` · `GET /auth/me` |
| Overview | `GET /sports/{sport}/overview` |
| Schedule | `GET /team-seasons?sport&season` (team filter) · `GET /matches?sport&team&season&month&view` · `GET /matches?sport&status=live&pageSize=1` |
| Match page | `GET /matches/{id}` |
| Roster | `GET /team-seasons?sport&season` (tabs) · `GET /team-seasons/{id}` |
| Season Stats | `GET /team-seasons?sport&season` · `GET /team-seasons/{id}/stats` |
| League Table | `GET /team-seasons?sport&season` · `GET /competitions/{leagueCompetition}/standings?season` |
| D14 Match result | `GET /matches/{id}` · `GET /team-seasons/{teamSeason}` (squad) · `PUT /matches/{id}/result` |

---

## 3. Permission matrix

Every write endpoint. Each cell is the expected status. These four columns become the permission tests for each endpoint (kickoff testing rule). "Own team" means the team-season the resource belongs to is assigned to the coach.

| Endpoint | Anonymous | Coach, own team | Coach, other team | Admin |
|---|---|---|---|---|
| `POST /auth/login` | 200 | 200 | 200 | 200 |
| `POST /auth/logout` | 401 | 204 | 204 | 204 |
| `PATCH /auth/me` | 401 | 200 | 200 | 200 |
| `POST /auth/password` | 401 | 200 | 200 | 200 |
| `POST /sports` · `PATCH /sports/{sport}` | 401 | 403 | 403 | 201 · 200 |
| `POST` · `PATCH` · `DELETE /seasons` | 401 | 403 | 403 | 201 · 200 · 204 |
| `POST` · `PATCH` · `DELETE /schools` | 401 | 403 | 403 | 201 · 200 · 204 |
| `POST` · `PATCH` · `DELETE /competitions` | 401 | 403 | 403 | 201 · 200 · 204 |
| `POST` · `PATCH` · `DELETE /teams` | 401 | 403 | 403 | 201 · 200 · 204 |
| `POST` · `PATCH` · `DELETE /team-seasons` | 401 | 403 | 403 | 201 · 200 · 204 |
| `PUT /team-seasons/{id}/squad` | 401 | **200** | 403 | 200 |
| `POST /players` | 401 | 201 | 201 *(no team involved)* | 201 |
| `PATCH /players/{id}` | 401 | **200** (player in my squad) | 403 | 200 |
| `DELETE /players/{id}` | 401 | 403 | 403 | 204 |
| `POST` · `PATCH /users` · `POST /users/{id}/password-reset` | 401 | 403 | 403 | 201 · 200 · 204 |
| `POST /matches` | 401 | **201** | 403 | 201 |
| `PATCH /matches/{id}` | 401 | **200** (403 if moved to another team's season) | 403 | 200 |
| `DELETE /matches/{id}` | 401 | **204** | 403 | 204 |
| `PUT /matches/{id}/result` | 401 | **200** | 403 | 200 |
| `POST` · `PATCH` · `DELETE /league-results` | 401 | 403 | 403 | 201 · 200 · 204 |
| `POST` · `PATCH` · `DELETE /inductees` | 401 | 403 | 403 | 201 · 200 · 204 |
| `POST /uploads` | 401 | 201 | 201 *(no team involved)* | 201 |

Restricted reads, tested the same way: `GET /users` (401 / 403 / 403 / 200). `mine=true` on any list (401 when anonymous). `GET /matches/{id}` for a draft returns the full result only to the own-team coach and admins; anonymous callers and other coaches get the public fields.

Any signed-in user with `mustChangePassword: true` gets **403 `PASSWORD_CHANGE_REQUIRED`** on every write and staff-only read except `POST /auth/logout` and `POST /auth/password` (public reads and `GET /auth/me` still work).

---

## 4. Changes to earlier docs (please confirm)

| Change | Why |
|---|---|
| **`PATCH /auth/me`** added (alongside the `POST /auth/password` already agreed in Phase 1) | D17 My account: staff edit their own name, title and photo without needing admin rights on `/users` |
| `GET /auth/me` returns **`{ "data": null }`** for anonymous visitors instead of 401 (changed in Phase 4) | Browsers log every 401 as a console error, and the definition of done requires a clean console on public pages |
| Contract is **OpenAPI 3.1** (Phase 1 didn't say which) | 3.0 can't express "this reference or null", which almost every response needs. The validator supports 3.1 |
| Sports are addressed by **slug** in paths | Public page URLs carry the slug; no extra lookup needed |
| **No `GET /{id}`** for small admin resources | List rows already hold the full resource (minimal endpoints) |
| `copyFrom` on `POST /team-seasons` | The admin's main job is season setup; copying last season's squad saves re-entering returning players. Members only: the captain and depth chart start empty |
