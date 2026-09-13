# Jayga Lagbe — Admin

Internal moderation and operations console. Vite + React + TypeScript, talking
to the NestJS backend over its admin-scoped REST API. Deploys as a static
bundle, independently of `web/` and `backend/`.

## Getting started

The backend must be running first (it serves the data and issues the JWT):

```bash
cd ../backend && npm run start:dev
```

Then:

```bash
npm install
npm run dev
```

Open http://localhost:5173. Sign in with an account that has `isAdmin` — the
seed creates `admin@jaygalagbe.com` / `password123`.

## Configuration

| Variable       | Default                 | Purpose               |
| -------------- | ----------------------- | --------------------- |
| `VITE_API_URL` | `http://localhost:5000` | Backend API origin    |

The backend allowlists this origin for CORS via its own `CORS_ORIGINS`.

## Scripts

| Script              | What it does                       |
| ------------------- | ---------------------------------- |
| `npm run dev`       | Dev server on port 5173            |
| `npm run build`     | Typecheck, then production bundle  |
| `npm run preview`   | Serve the production bundle        |
| `npm run lint`      | ESLint                             |
| `npm run typecheck` | TypeScript only                    |

## Pages

| Route           | What it is                                                     |
| --------------- | -------------------------------------------------------------- |
| `/`             | Platform dashboard — backlog, listing mix, boost revenue        |
| `/review-queue` | Pending ads, oldest first, approve/reject with reason codes     |
| `/ads`          | Every listing in any state, with force take-down                |
| `/reports`      | Customer flags on live ads, triaged to reviewed or dismissed    |
| `/users`        | Accounts, with suspend/restore                                  |
| `/transactions` | Read-only boost payment log with reconciliation totals          |

## How the tables work

Every list page is built from the same three pieces, so they behave
identically:

- `useTableQuery` (`src/lib/table/`) holds search, filters, sort, page and page
  size **in the URL**. A filtered view can be reloaded, bookmarked and pasted
  into a ticket, and the back button steps through what was actually looked at.
  Search is debounced; changing a filter or the page size resets to page one.
- `DataTable` (`src/components/table/`) renders a real `<table>` from `md` up
  and a card list below it, so nothing is squeezed on a phone. Columns declare
  their own `sortKey` and an optional `hideBelow` breakpoint.
- `PaginationBar` carries the rows-per-page dropdown (10/20/50/100), the
  `1–20 of 431` summary and the page controls.

Sorting and filtering are done by the API, never in the browser — the table
only ever holds one page. Allowed sort columns are allow-listed server-side.
