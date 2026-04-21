# Pain Wiki

A Vercel-friendly **Next.js + TypeScript** app that turns community wisdom into a searchable “thought map” of topic nodes.

## Features (MVP)

- Center **search node** that filters submissions
- Topic nodes that filter the feed:
  - communication styles
  - building confidence
  - impact/initiative
  - academics
  - family
  - building trust
  - leadership
  - hard decisions
  - public speaking
- **Sort** by Recent or Likes
- **Like** feature
- **Submit** wisdom with **auto-recommended tags** (editable)
- Starter dataset in `src/data/seedSubmissions.json`

## Run locally

```powershell
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Notes on storage (important)

This app uses **Vercel Postgres**:

- On first request, it auto-creates tables (if missing) and inserts seed submissions from `src/data/seedSubmissions.json` **only when the DB is empty**.
- Submissions and like counts are shared across all users.

### Setup (Vercel)

- Create a Postgres database in Vercel for this project
- Ensure the `POSTGRES_URL` environment variable is available (Vercel provides it automatically once connected)

### Setup (local dev)

If you use the Vercel CLI, pull env vars:

```powershell
vercel env pull .env.local
npm run dev
```

