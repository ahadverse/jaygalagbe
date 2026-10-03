# Jayga Lagbe — Backend

NestJS + Prisma + MongoDB API. Single source of truth for both frontends:
the public Next.js site (`../web`) and the admin console (`../admin`) talk to
this and nothing else.

## Getting started

```bash
npm install
cp /dev/null .env          # then fill it in — see Environment below
npm run db:push        # creates collections + indexes
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
| `DATABASE_URL`              | yes      | MongoDB connection string (include the db name)                   |
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
| `FIREBASE_SERVICE_ACCOUNT_JSON` | no  | Service-account JSON (as a string) for FCM push; or set `GOOGLE_APPLICATION_CREDENTIALS` to a key file path. Push is skipped if neither is set |
| `EMAIL_FROM`                | no       | From address on notification emails                                |

## Deploying

The API is a plain Node service: build it with `npm ci --include=dev && npm run build:deploy`,
start it with `npm run start:prod`, and point your host's health check at `/health`.
Set the variables from the Environment table above on the host — `DATABASE_URL` is a
MongoDB Atlas connection string. Atlas replica sets are required: the API uses
transactions, which MongoDB only offers on a replica set (every Atlas tier is one).

Indexes are not created on deploy. Run `npm run prod:push` once after changing
`schema.prisma` (it also creates the partial unique indexes Prisma cannot express —
see `prisma/ensure-indexes.ts`).

### Deploying on Vercel

`api/index.js` is the function entry and `vercel.json` rewrites every path to it, so
the API runs as a single serverless function (Fluid compute) built from `dist/`.

1. Import the repo in Vercel and set the **Root Directory** to `backend`. The build
   settings come from `vercel.json` (`npm ci --include=dev`, then
   `npm run build:deploy`, which generates the Prisma client including the
   `rhel-openssl-3.0.x` engine Vercel runs on).
2. Add the variables from the Environment table above (Production scope). `NODE_ENV`
   is set to `production` by Vercel. `DATABASE_URL` is the Atlas string and Atlas must
   allow Vercel's IPs (Network Access `0.0.0.0/0`, since function IPs are not fixed).
3. Run `npm run prod:push` once from your machine to create collections and indexes.
4. Set `CORS_ORIGINS` and `PAYSTATION_CALLBACK_URL` as in "After the first deploy", and
   `API_BASE_URL` to the deployed URL.

What serverless changes:

- **No WebSockets.** Vercel functions cannot hold a Socket.IO connection, so live chat
  and in-app notification events do not reach clients. Messages, the unread count and
  push (FCM) still work over HTTP; clients must poll for new messages.
- **Request bodies are capped at 4.5 MB** by Vercel, below the 8 MB per-photo limit in
  `uploads/upload-limits.ts`. Photos larger than that are rejected by the platform
  before they reach the API, so resize on the client.
- **Rate limits are per instance.** The throttler keeps counts in memory, so the login
  and tracking limits apply to each warm instance, not globally.
- **Cold starts** boot Nest and connect to Atlas once per instance (a second or two).

### Working against the production database locally

`backend/.env.prod` holds the deployed configuration and is git-ignored like
every other env file. These scripts run against it without touching your local
`.env`:

| Script                  | What it does                                  |
| ----------------------- | --------------------------------------------- |
| `npm run prod:push`     | Sync collections and indexes on the prod DB    |
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

Each front end takes the API URL from its own
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

## Scripts

| Script                    | What it does                          |
| ------------------------- | ------------------------------------- |
| `npm run dev`             | Watch-mode dev server                 |
| `npm run build`           | Compile to `dist/`                    |
| `npm run build:deploy`    | Generate the Prisma client, then build |
| `npm run start:prod`      | Run the compiled server               |
| `npm run lint`            | oxlint                                |
| `npm test`                | Unit tests                            |
| `npm run test:e2e`        | End-to-end tests                      |
| `npm run db:push`         | Sync collections and indexes          |
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
