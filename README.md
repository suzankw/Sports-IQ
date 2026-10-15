# Sports IQ

Sports analytics for St. Andrew's School, Turi — a public site (fixtures, results, squads, stats, league tables) and a staff dashboard at `/dashboard`.

## Run it locally

Needs Node 24+.

```bash
cp .env.example .env      # then set JWT_SECRET
npm install
npm run db                # local MongoDB (skip if you already have one at MONGODB_URI)
npm run seed              # demo data; sign-in details are in .env
npm run dev               # web on http://localhost:5173, API on :3000
```

Other commands: `npm test`, `npm run lint`, `npm run build` then `npm start` (serves the built site and the API on one port).

## Docs

Design inventory, architecture, database and API decisions live in [`docs/`](docs/). [`docs/openapi.yaml`](docs/openapi.yaml) is the API contract. Working rules for contributors (and AI agents) are in [`CLAUDE.md`](CLAUDE.md).
