# Jayga Lagbe — Backend

NestJS + Prisma + PostgreSQL API. Single source of truth for both frontends:
the public Next.js site (`../web`) and the admin console (`../admin`) talk to
this and nothing else.

## Getting started

```bash
npm install
cp /dev/null .env          # then fill it in — see Environment below
npm run prisma:migrate
npm run prisma:seed
npm run start:dev
```

The API listens on `PORT` (5000 by default). Interactive API docs are at
http://localhost:5000/docs.

The seed creates three sign-ins, all with password `password123`:

| Account                       | Role       |
| ----------------------------- | ---------- |
| `admin@jaygalagbe.com`        | Admin      |
| `advertiser@jaygalagbe.com`   | Advertiser |
| `customer@jaygalagbe.com`     | Customer   |

It also generates ~80 listings across both sectors, a spread of users, six
months of boost payments and a batch of reports, so the admin console's
search, filters and paging have something real to work against.

## Environment

Create `.env` in this folder. It is git-ignored and must stay that way — none
of these values belong in the repository.

| Variable                    | Required | What it is                                                        |
| --------------------------- | -------- | ----------------------------------------------------------------- |
| `DATABASE_URL`              | yes      | PostgreSQL connection string                                       |
| `JWT_SECRET`                | yes      | Signing secret for access tokens                                   |
| `JWT_EXPIRES_IN`            | no       | Token lifetime, e.g. `7d`                                          |
| `PORT`                      | no       | HTTP port (default `5000`)                                         |
| `CORS_ORIGINS`              | in prod  | Comma-separated allowed origins (default in dev: web `:3000`, admin `:5173`) |
| `ENABLE_SWAGGER`            | no       | `true` to serve `/docs` in production; off by default               |
| `PAYSTATION_BASE_URL`       | yes      | `https://sandbox.paystation.com.bd` or `https://api.paystation.com.bd` |
| `PAYSTATION_MERCHANT_ID`    | yes      | PayStation merchant id                                             |
| `PAYSTATION_PASSWORD`       | yes      | PayStation merchant password                                       |
| `PAYSTATION_CALLBACK_URL`   | yes      | Where PayStation returns the buyer — this API's public URL + `/payments/callback` |
| `AWS_BUCKET_NAME`           | yes      | S3 bucket for ad photos — every key sits under `jayga-lagbe/`      |
| `AWS_BUCKET_REGION`         | yes      | Bucket region                                                      |
| `AWS_ACCESS_KEY_ID`         | yes      | IAM key allowed to `PutObject`/`DeleteObject` under the prefix     |
| `AWS_SECRET_ACCESS_KEY`     | yes      | IAM secret                                                         |
| `AWS_CLOUDFRONT_DOMAIN`     | no       | CDN host in front of the bucket; public URLs fall back to S3       |
| `SMTP_HOST`                 | no       | Outbound mail host — email notifications are skipped if unset      |
| `SMTP_PORT`                 | no       | Outbound mail port                                                 |
| `SMTP_USER`                 | no       | Mail username                                                      |
| `SMTP_PASSWORD`             | no       | Mail password                                                      |
| `EMAIL_FROM`                | no       | From address on notification emails                                |

## Deploying to Render

`render.yaml` at the repository root describes this service and its database.
In the Render dashboard choose **New → Blueprint**, point it at this repo, and
Render will prompt for every secret; nothing sensitive lives in the file.

What it sets up:

- **`jaygalagbe-api`** — this service, built from `backend/` with
  `npm ci && npm run build:deploy && npm run migrate:deploy`, started with
  `npm run start:prod`, health-checked at `/health`.

Postgres is **not** provisioned by Render: the database lives on Neon, so
`DATABASE_URL` is pasted in as a secret. Use Neon's *pooled* connection string
— a web service opens far more connections than one Postgres instance is happy
with. `JWT_SECRET` must match the value in `backend/.env.prod`, or tokens
minted in one place will not validate in the other.

Migrations run in the build command rather than as a pre-deploy step, because
pre-deploy commands need a paid instance type. The Prisma client is generated
into `src/generated/` which is git-ignored, so `build:deploy` regenerates it
on every build.

### Working against the production database locally

`backend/.env.prod` holds the deployed configuration and is git-ignored like
every other env file. These scripts run against it without touching your local
`.env`:

| Script                  | What it does                                  |
| ----------------------- | --------------------------------------------- |
| `npm run prod:status`   | Show which migrations the prod DB has          |
| `npm run prod:migrate`  | Apply pending migrations to the prod DB        |
| `npm run prod:seed`     | Seed the prod DB (idempotent)                  |
| `npm run prod:start`    | Run the built server against prod config       |

### After the first deploy

Two values can only be filled in once the service has a URL:

1. **`CORS_ORIGINS`** — list **both** front ends. The admin panel is a SPA, so
   every API call it makes is a browser request and fails CORS until its
   origin is here. The web app's HTTP calls are server-side, but its real-time
   chat connects the WebSocket straight from the browser and the gateway
   checks the same list, so it needs an entry too or chat silently fails to
   connect. **Order matters:** the first entry is where a buyer is redirected
   after paying, so put the public web app first and the admin panel second.
2. **`PAYSTATION_CALLBACK_URL`** — set to `https://<your-service>/payments/callback`,
   and point the IPN URL in the PayStation dashboard at
   `https://<your-service>/payments/ipn`.

Both are plain environment variables; editing them triggers a redeploy.

### Pointing the front ends at it

Neither front end reads `render.yaml`; each takes the API URL from its own
environment:

| App     | Variable             | Where it is read               | Set it as               |
| ------- | -------------------- | ------------------------------ | ----------------------- |
| `web`   | `API_URL`            | `web/src/lib/api/config.ts`    | Runtime env var          |
| `web`   | `NEXT_PUBLIC_WS_URL` | `web/src/lib/socket/config.ts` | Build-time (inlined)     |
| `admin` | `VITE_API_URL`       | `admin/src/lib/api/config.ts`  | Build-time (inlined)     |

All three default to `http://localhost:5000` when unset, which is why local
development needs no configuration.

The two apps reach the API differently, which is worth knowing when something
breaks:

- **`web` never calls the API from the browser.** Server components, server
  actions and the route handlers under `app/api/` all call it server-side, so
  `API_URL` is a private runtime value and can point at an internal address.
  The exception is the WebSocket, which the browser opens directly — that is
  what `NEXT_PUBLIC_WS_URL` is for, and it must be a publicly reachable URL.
- **`admin` is a static SPA**, so every call comes from the browser and
  `VITE_API_URL` is compiled into the bundle. Changing it means rebuilding,
  not restarting.

Each app keeps its own `.env` (`backend/.env`, `web/.env`, `admin/.env`), all
git-ignored. To run the front ends against a deployed API, point those
variables at its public URL.

### Free-tier caveats

- A free web service sleeps after inactivity; the first request afterwards
  waits ~50s for a cold start. Real-time chat reconnects, but the delay is
  visible.
- A free Postgres instance **expires 30 days after creation**. Take a dump and
  move to a paid plan before then, or the data goes with it.

## Scripts

| Script                    | What it does                          |
| ------------------------- | ------------------------------------- |
| `npm run dev`             | Watch-mode dev server                 |
| `npm run build`           | Compile to `dist/`                    |
| `npm run build:deploy`    | Generate the Prisma client, then build |
| `npm run migrate:deploy`  | Apply migrations without prompting     |
| `npm run start:prod`      | Run the compiled server               |
| `npm run lint`            | oxlint                                |
| `npm test`                | Unit tests                            |
| `npm run test:e2e`        | End-to-end tests                      |
| `npm run prisma:migrate`  | Apply migrations in development       |
| `npm run prisma:seed`     | Seed demo data (idempotent)           |
| `npm run prisma:generate` | Regenerate the Prisma client          |

## Modules

One module per domain, each with its own controller, service and DTOs:

`auth` · `users` · `ads` · `boost` · `payments` · `messaging` ·
`notifications` · `reviews` · `reports` · `analytics` · `admin`

`common/` holds the shared list-query contract — pagination, allow-listed
sorting and query-param transforms — that every admin list endpoint uses:

```
GET /admin/ads?page=1&limit=20&sort=createdAt&order=desc&search=…&status=PENDING,LIVE
```

Responses are `{ data, meta }`, where `meta` carries `page`, `limit`, `total`,
`totalPages`, `hasPreviousPage`, `hasNextPage`, plus the `sort` and `order`
actually applied. Sort columns are allow-listed per endpoint in two places: the
DTO rejects an unknown `?sort=` with a 400, and `resolveSort` falls back to the
endpoint's default, so no caller-supplied column name ever reaches the database.
