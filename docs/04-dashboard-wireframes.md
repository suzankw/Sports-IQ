# 04 — Dashboard Wireframes

**Status:** Followed as written (the user chose straight-through Phase 4, 2026-10-14) · **Covers:** D1–D17 from [00 §4](00-design-inventory.md) (D18 dropped, Q29)

None of these screens have Stitch designs. They reuse the public design system and components; this doc fixes their layout so the build has one reference. Desktop first unless noted; **D14 is phone-first**.

## Shared patterns

| Pattern | Layout | Used by |
|---|---|---|
| **Dashboard shell** | Same navy 256px `Sidebar` (crest + "Staff dashboard"), menu filtered by `permissions.screens`. Same 64px `TopBar`: page title on the left, "View public site" and the avatar menu on the right. Mobile: sidebar becomes the drawer | all |
| **Avatar menu** | Top-right button (photo or initials). Popover: name, email, role badge, *Manage your account*, *Dashboard* or *View public site*, *Sign out*. Esc and outside-click close it | public + dashboard |
| **ResourceScreen** | `PageHeader` (title, short help text, **+ Add** button) → filter row (selects) → `DataTable` with an Actions column (Edit, Delete) → add/edit form in a **dialog** → delete via `ConfirmDialog` → `Toast` on success; server `details[]` map onto form fields | D5–D9, D11, D15, D16 |
| **Forms** | One column, labelled fields (`FormField` + `TextInput` / `Select` / `NumberInput` / `DateTimeInput`), primary action bottom-right, Cancel beside it. Errors under the field and a summary at the top | all forms |
| **Photo field** | Avatar preview + "Upload photo" (file input). The browser resizes, `POST /uploads`, the URL goes into the form | players, users, schools, inductees, match photos, sport content |
| **Empty / loading / error** | `QueryState` | all |

```
┌──────────┬───────────────────────────────────────────────────────────┐
│  CREST   │ Fixtures                          View public site  (AV) │  ← TopBar
│ Staff    ├───────────────────────────────────────────────────────────┤
│ dashboard│ Fixtures                                       [+ Add]    │  ← PageHeader
│          │ Team [First XI ▾]  View [Upcoming ▾]                      │  ← filters
│ ▌Home    │ ┌───────────────────────────────────────────────────────┐ │
│  Fixtures│ │ Date      Matchup            Comp   Status   Actions  │ │  ← DataTable
│  Rosters │ │ Sat 24 Oct Turi v Brookhouse KISL   Upcoming Edit Del │ │
│  Players │ └───────────────────────────────────────────────────────┘ │
│ ─ Admin ─│                                                           │
│  Sports  │                                                           │
│  …       │                                                           │
└──────────┴───────────────────────────────────────────────────────────┘
```

## Screens

| # | Screen | Who | Layout |
|---|---|---|---|
| D1 | **Sign in** `/login` | — | Centred card on cream: crest, "Staff sign in", Email, Password, **Sign in** (full width). Error banner for wrong details / rate limit. Small "Back to the public site" link. Redirects to `next` or `/dashboard` |
| D2 | **Home** `/dashboard` | both | Greeting ("Good afternoon, Mr. John Smith"). Three cards: **Waiting for a result** (`view=awaitingResult`, each row → result entry), **Drafts** (completed, unpublished → result entry), **My teams** (team-season chips → roster editor). Admins see the same for all teams |
| D17 | **My account** `/dashboard/account` | both | Two cards: *Profile* (photo, title, name → Save) and *Password* (current, new, confirm → Change password). With a temporary password, only the Password card shows, with a banner "Choose a new password to continue" |
| D3 | **Sports** `/dashboard/sports` | admin | List of sports (name, status, order) → Edit opens `/dashboard/sports/:sport` with tabs **Definition** and **Page content** (D4). Definition: basic fields (name, icon, order, status, periods, score detail, scoring stat, points for W/D/L, KPI settings) then **list editors** (rows of inputs, add/remove) for Positions, Team stats, Player stats, Leaderboards, Formations (each with its slots: key, position, x, y). Definition and Page content are one form with one sticky **Save sport** (PATCH with `version`); a tab with errors is marked •; 409 shows "someone else saved" with **Reload**. Key lists (headline stats, leaderboard stats) are typed as comma-separated keys; icons are picked from the app's icon list. New sports: name, icon, order (slug from the name, starts *coming soon*) |
| D4 | **Sport page content** (tab of D3) | admin | Hero (eyebrow, title, text, image), History (text, image), list editors for Facts, Benefits, Videos, Pathways; Approach (two text areas). Preview link opens the public overview |
| D5 | **Seasons** | admin | ResourceScreen: label, slug, start, end, current (badge). Form: label (e.g. 2027/2028 — the slug is made from it), start date, end date, "Make this the current season". The current season has no Delete |
| D6 | **Teams** | admin | Two cards. **Teams** ResourceScreen (sport filter): name, sport, age group, gender, order (slug made from the name on create; sport and slug fixed after). **Teams in season** (season select): each team with ✓ entered / *Enter in season* button → dialog (league competition, season quote, "Copy squad from last season"); entered rows have Edit (league, quote) and Remove |
| D7 | **Competitions** | admin | ResourceScreen (sport filter): name, short name, type badge |
| D8 | **Schools** | admin | ResourceScreen: crest, name, short name, "Home" badge for Turi (no delete). Form: name, short name, crest upload |
| D9/D10 | **Users** | admin | ResourceScreen: avatar, name, email, role badge, status (Active/Disabled), teams. Form: title, name, email, role, active, photo, **Assignments** list editor (team-season select + Head/Assistant). New user: temporary password field. Row action **Reset password** → dialog with a temporary password |
| D11 | **Players** | both | ResourceScreen with search; coaches see players in their squads (team filter = their team-seasons); only admins delete. Form: first name, last name, gender, photo |
| D12 | **Roster editor** `/dashboard/rosters?teamSeason=` | both | Team-season select (coach: own only, current season first). Squad rows: photo, name, **number** (number input), **position** (select), captain (radio), remove (×) — a table on desktop, two lines per player on phones. "Add player": search existing players, or *New player* (inline mini form). Depth chart (basketball/netball): per position an ordered list of select boxes. One **Save squad** (PUT, version). Preview cards reuse `PlayerCard` styles |
| D13 | **Fixtures** | both | ResourceScreen: team filter (coach: own), view (upcoming / waiting for a result / played / all). Columns: date, matchup (`Matchup`) + team, competition · round, status (Upcoming / Live / Draft / Published). Actions: **Result** (→ D14), Edit, Delete. Form: team-season, competition, round, opponent, home/away, kick-off (EAT), venue |
| D14 | **Match result entry** `/dashboard/fixtures/:id/result` | both | **Phone-first.** See below |
| D15 | **Other league results** | admin | ResourceScreen: competition + season filters; columns: date, home school + score, away school + score. Form: competition (leagues only), season, date, home school, home score, away school, away score |
| D16 | **Hall of Fame** | admin | ResourceScreen: photo, name, sport, years, achievement, order. Public page `/hall-of-fame`: sport filter + grid of inductee cards (photo or initials, name, years, sport badge, achievement, citation) |

## D14 — Match result entry (phone-first)

The screen coaches use after every match, often at the pitch. Goals: few taps, big targets (≥ 44px), one save, works at 375px.

```
┌───────────────────────────────┐
│ ← Fixtures   First XI v Peponi│  sticky header: match, status pill
│ Sat 24 Oct · KISL   [DRAFT]   │
├───────────────────────────────┤
│ 1 SCORE                       │  big steppers
│   Turi   [−]  3  [+]          │
│   Peponi [−]  1  [+]          │
│   Status (Upcoming|Live|Full) │  segmented
├───────────────────────────────┤
│ 2 LINEUP ▸  Formation [4-3-3▾]│  each slot: position + player select
│   GK [Kimani ▾] … bench: chips│  bench = tap to toggle
├───────────────────────────────┤
│ 3 EVENTS ▸ (football)         │  "+ Goal  + Card  + Sub" buttons → row:
│   Goal 14' O. Kariuki (A: …)  │  minute, player, assist / playerOff, × remove
│   QUARTERS ▸ (basketball/netb)│  4 rows × Turi/Opp number inputs
├───────────────────────────────┤
│ 4 TEAM STATS ▸                │  per stat: label, Turi [n], Opp [n]
├───────────────────────────────┤
│ 5 PLAYER STATS ▸              │  one card per player who appeared:
│   9 O. Kariuki  FW            │  manual stat number inputs in a 2–3 col grid
│   Min [90] Sh [5] SOT [3] …   │  (event stats shown read-only)
├───────────────────────────────┤
│ 6 REPORT & PHOTOS ▸           │  top performers (up to 3 selects),
│                               │  quote + attribution, hero photo, gallery
├───────────────────────────────┤
│ [ Save draft ]  [ Publish ]   │  sticky footer; Publish runs strict checks
└───────────────────────────────┘
```

- Sections are `<details>` accordions (Score open by default) so a coach can enter just the score quickly and come back later.
- Players who appeared = starters + bench players who came on (subs) + anyone given stats; the player-stats section lists them automatically from the lineup.
- Save sends the whole result (`PUT /matches/{id}/result` with `version`). Server `details[].path` (e.g. `/body/events/2/minute`) becomes a sentence in the save bar ("9 · O. Kariuki · minutes: At most 130") and the matching section opens with a **Check** badge.
- Footer buttons: a draft has **Save draft** / **Publish**; a published result has **Unpublish** / **Save**.
- On desktop the same sections sit in a two-column grid (score + lineup left, events + stats right).
