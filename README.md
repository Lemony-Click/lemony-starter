# Lemony Starter

A full-stack monorepo starter with **Bun**, **tRPC**, **Prisma**, **React**, and **shadcn/ui**. Includes a working notes app as a reference implementation.

## Stack

| Layer     | Technology                                    |
| --------- | --------------------------------------------- |
| Runtime   | [Bun](https://bun.sh)                         |
| Monorepo  | [Turborepo](https://turbo.build)              |
| Linting   | [Biome](https://biomejs.dev)                  |
| Database  | PostgreSQL + [Prisma](https://prisma.io) ORM  |
| API       | [tRPC v11](https://trpc.io) (HTTP standalone) |
| Frontend  | React 19 + Vite + Tailwind CSS v4             |
| UI        | [shadcn/ui](https://ui.shadcn.com)            |

## Structure

```
apps/
  server/          – tRPC HTTP API server (Bun, port 3000)
  web/             – Vite + React frontend (port 5173)
packages/
  db/              – Prisma schema, generated client, PrismaClient singleton
  services/        – Business logic (noteService, tagService); depends on db
  trpc/
    server/        – appRouter, routers, tRPC context; depends on services
    client/        – Vanilla tRPC client factory for non-React consumers
  ui/              – Shared shadcn/ui components, Tailwind CSS base styles
```

### Data flow

```
web (React)
  └─ @workspace/trpc/client  (tRPC react-query hooks)
       └─ HTTP → apps/server
                    └─ @workspace/trpc/server  (appRouter + routers)
                         └─ @workspace/services  (business logic)
                              └─ @workspace/db  (Prisma client)
                                   └─ PostgreSQL
```

## Getting started

### Prerequisites

- [Bun](https://bun.sh) ≥ 1.2
- [Docker](https://docs.docker.com/get-docker/) (for the dev database)

### 1. Start the dev database

```bash
docker compose -f docker-compose.dev.yaml up -d
```

This starts a PostgreSQL container on `localhost:5432` with user `postgres`, password `postgres`, and database `lemony`.

### 2. Set up environment variables

```bash
cp .env.example .env
```

The default values in `.env.example` match the dev Docker container and require no changes for local development.

Key variables:

| Variable         | Default                                          | Description                        |
| ---------------- | ------------------------------------------------ | ---------------------------------- |
| `DATABASE_URL`   | `postgresql://postgres:postgres@localhost:5432/lemony` | Prisma connection string     |
| `PORT`           | `3000`                                           | API server port                    |
| `CORS_ORIGIN`    | `http://localhost:5173`                          | Allowed origin for CORS            |
| `VITE_SERVER_URL`| `http://localhost:3000`                          | API URL used by the web app        |

> **Note:** `packages/db` loads `DATABASE_URL` via `dotenv/config`. The server and web apps read it from the process environment (or a `.env` file at the workspace root).

### 3. Install dependencies

```bash
bun install
```

### 4. Push schema to the database & generate Prisma client

```bash
cd packages/db
bunx prisma db push      # sync schema to the dev database
bunx prisma generate     # regenerate the type-safe client
```

`prisma db push` is the recommended workflow for local development — it applies the current schema directly without creating migration files. Use `prisma migrate dev` when you want to track schema changes as versioned migrations (see [Migrations](#migrations)).

### 5. Start dev servers

```bash
bun run dev
```

Turborepo starts both `apps/server` and `apps/web` in parallel with hot-reload.

| Service | URL                       |
| ------- | ------------------------- |
| API     | http://localhost:3000     |
| Web app | http://localhost:5173     |

---

## Production deployment

The production Docker Compose file builds the server into a minimal binary and runs Prisma migrations automatically before the server starts.

```bash
POSTGRES_PASSWORD=<your-secret> docker compose up --build
```

Services started:

1. **postgres** — PostgreSQL database
2. **migrate** — one-shot container that runs `prisma migrate deploy`
3. **server** — compiled API server (starts after migrate completes)

> The web app is not containerised by default. Deploy it to a static host (Vercel, Cloudflare Pages, etc.) and point `VITE_SERVER_URL` at your production server URL at build time.

---

## Migrations

For schema changes that need to be tracked and deployed safely in production, use Prisma's migration workflow instead of `db push`:

```bash
cd packages/db

# Create and apply a new migration
bunx prisma migrate dev --name <describe-your-change>

# Apply pending migrations in CI / production (no interactive prompt)
bunx prisma migrate deploy
```

---

## Adding UI components

Components live in `packages/ui/src/components` and are shared across all apps.

```bash
cd packages/ui
bunx shadcn@latest add <component-name>
```

Import anywhere in the monorepo:

```tsx
import { Button } from "@workspace/ui/components/button"
```

---

## Extending the API

Follow these steps to add a new domain (e.g. `Post`):

### 1. Add the Prisma model

Edit `packages/db/schema.prisma`, then sync and regenerate:

```bash
cd packages/db
bunx prisma db push
bunx prisma generate
```

### 2. Create a service

Create `packages/services/src/postService.ts`:

```ts
import { prisma } from "@workspace/db";

export const postService = {
  async list() {
    return prisma.post.findMany({ orderBy: { createdAt: "desc" } });
  },
  // create, update, delete ...
};
```

Export it from `packages/services/src/index.ts`:

```ts
export { postService } from "./postService";
```

### 3. Create a tRPC router

Create `packages/trpc/server/routers/post.ts`:

```ts
import { z } from "zod";
import { publicProcedure, router } from "../trpc";
import { postService } from "@workspace/services";

export const postRouter = router({
  list: publicProcedure.query(() => postService.list()),
  // ...
});
```

### 4. Register the router

Add it to `packages/trpc/server/appRouter.ts`:

```ts
import { postRouter } from "./routers/post";

export const appRouter = router({
  note: noteRouter,
  tag: tagRouter,
  post: postRouter, // ← add this
});
```

The new procedures are immediately available in the frontend via the typed `trpc` client with full autocompletion.

---

## Environment & authentication

The tRPC `Context` (`packages/trpc/server/trpc.ts`) is intentionally empty in the starter. To add authentication:

1. Populate `Context` with your session/user data (e.g. from a JWT or cookie)
2. Pass the context factory to `createHTTPServer` in `apps/server/src/index.ts`
3. Guard procedures using a `protectedProcedure` middleware that checks `ctx`

---

## Useful commands

| Command                         | Description                                  |
| ------------------------------- | -------------------------------------------- |
| `bun run dev`                   | Start all dev servers                        |
| `bun run build`                 | Build all packages and apps                  |
| `bun run typecheck`             | Type-check the entire monorepo               |
| `bun run lint`                  | Lint the entire monorepo                     |
| `bun run format`                | Format with Biome                            |
| `bun run check`                 | Lint + format + sort imports (Biome)         |
| `cd packages/db && bunx prisma db push` | Sync schema (dev)                  |
| `cd packages/db && bunx prisma migrate dev --name <n>` | Create a migration  |
| `cd packages/ui && bunx shadcn@latest add <c>` | Add a shadcn/ui component   |

