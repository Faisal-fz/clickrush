# ClickRush

A click-speed game built with Next.js. Sign up, pick Classic (60s) or Quick (30s), click as fast as you can, and compete on global, daily, and weekly leaderboards.

## Features

- User authentication (signup, signin, JWT cookie session)
- Two game modes: Classic and Quick
- Real-time countdown and timer during play
- Profile with per-mode stats and game history
- Leaderboards filtered by period and mode

## Prerequisites

- Node.js 20+
- PostgreSQL database
- Environment variables:

```env
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
```

## Setup

```bash
npm install
npx prisma migrate deploy
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run tests in watch mode |
| `npm run test:run` | Run tests once |

## Architecture

```
app/           Pages and API route handlers
components/    React UI (game, auth, shared)
hooks/         Client hooks (e.g. useGameSession)
lib/           Shared utilities, API clients, auth
schema/        Zod validation schemas
services/      Business logic (game, auth, profile, leaderboard)
prisma/        Database schema and migrations
proxy.ts       API auth proxy (JWT → x-user-id header)
```

### Request flow

1. Browser calls `/api/*` with the `accessToken` cookie.
2. [`proxy.ts`](proxy.ts) verifies the JWT and injects `x-user-id` on protected routes (`/api/game`, `/api/profile`).
3. API routes validate input, call a service, and return JSON.
4. Client libs ([`lib/api-client.ts`](lib/api-client.ts), [`lib/auth-client.ts`](lib/auth-client.ts)) parse responses into `{ ok, data }` or `{ ok, error }` results.

### Folder conventions

- **Routes** stay thin: auth check, Zod validation, delegate to services.
- **Services** own business rules and database access via Prisma.
- **Schemas** define shared validation between client forms and API routes.
- **Components** are presentational; game orchestration lives in `hooks/useGameSession.ts`.

## API overview

| Endpoint | Auth | Description |
|----------|------|-------------|
| `POST /api/auth/signup` | No | Create account |
| `POST /api/auth/signin` | No | Sign in (sets cookie) |
| `POST /api/auth/signout` | No | Clear cookie |
| `POST /api/game/start` | Yes | Start a game (`{ mode }`) |
| `POST /api/game/finish` | Yes | Finish game (`{ gameId, score }`) |
| `GET /api/profile` | Yes | User profile and stats |
| `GET /api/profile/games` | Yes | Recent game history |
| `GET /api/leaderboard` | No | Leaderboard (`?type=global&mode=classic`) |

## Testing

Tests use Vitest. Schema tests validate Zod rules; service tests mock Prisma.

```bash
npm run test:run
```

## Tech stack

- Next.js 16, React 19
- Prisma 7 + PostgreSQL
- Zod, bcrypt, JWT
- Tailwind CSS 4, Framer Motion
