# Coding Progress Platform

A personal coding-progress platform for tracking solved problems, surfacing analytics, and recommending what to solve next.

## Stack

- Frontend: React + TypeScript + Vite
- Backend: Express + TypeScript
- Database: PostgreSQL
- Charts: Recharts

## Workspace

```text
apps/
  api/   Express API
  web/   React frontend
```

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   npm install --workspace apps/api
   npm install --workspace apps/web
   ```

2. Start PostgreSQL with Docker:

   ```bash
   docker compose up -d
   ```

3. Apply the schema from [apps/api/src/db/schema.sql](/C:/Users/goeln/OneDrive/Documents/LeetcodeAnalysis/apps/api/src/db/schema.sql).

4. Start the apps:

   ```bash
   npm run dev:api
   npm run dev:web
   ```

