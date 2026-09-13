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
| `CORS_ORIGINS`              | no       | Comma-separated allowed origins (default: web `:3000`, admin `:5173`) |
| `API_BASE_URL`              | yes      | Public URL of this API, used to build payment callback URLs        |
| `SSLCOMMERZ_STORE_ID`       | yes      | SSLCommerz merchant store id                                       |
| `SSLCOMMERZ_STORE_PASSWORD` | yes      | SSLCommerz store password                                          |
| `SSLCOMMERZ_IS_LIVE`        | no       | `true` for production, otherwise the sandbox is used               |
| `SMTP_HOST`                 | no       | Outbound mail host — email notifications are skipped if unset      |
| `SMTP_PORT`                 | no       | Outbound mail port                                                 |
| `SMTP_USER`                 | no       | Mail username                                                      |
| `SMTP_PASSWORD`             | no       | Mail password                                                      |
| `EMAIL_FROM`                | no       | From address on notification emails                                |
| `FIREBASE_PROJECT_ID`       | no       | FCM push — all three Firebase values are needed together           |
| `FIREBASE_CLIENT_EMAIL`     | no       | FCM service-account email                                          |
| `FIREBASE_PRIVATE_KEY`      | no       | FCM service-account private key                                    |

## Scripts

| Script                    | What it does                          |
| ------------------------- | ------------------------------------- |
| `npm run start:dev`       | Watch-mode dev server                 |
| `npm run build`           | Compile to `dist/`                    |
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
