# Luxe Screens

A full-stack booking platform for private luxury theatres. Customers browse theatres, get an AI-style recommendation for their occasion, and complete a 9-step booking with cakes, decor, gifts, coupons and a simulated payment gateway.

**Stack:** React 19 · Vite · React Router 7 · Tailwind CSS v4 · Node.js · Express 5 · PostgreSQL · Prisma 7 · Zod · React Hook Form · Vitest. Written in plain **JavaScript**.

---

## Features

| Area                      | What it does                                                                                                                                                                                        |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Landing page**          | Auto-playing hero slideshow, services grid, how-it-works, top-rated theatres (from the database), FAQ, contact form                                                                                 |
| **AI Experience Planner** | Occasion + budget + guests + city → recommended theatre, add-on package within budget, reasons and alternatives. One click opens the booking wizard pre-filled                                      |
| **9-step booking**        | Date & time → theatre → contact → occasion → cakes → decor → gifts → payment → receipt. Live availability, server-side pricing, coupons, a slot hold with a countdown, progress kept across reloads |
| **Gallery**               | Search, filter by city and group size, sort by rating, price or capacity, keyboard-friendly lightbox                                                                                                |
| **Waitlist**              | Lead capture for upcoming cities, with duplicate detection                                                                                                                                          |
| **Responsive**            | Tested at 1440 px, 820 px and 390 px with no horizontal overflow and no console errors                                                                                                              |

## Project structure

```
Luxe_Screen/
├── client/                  Standalone React 19 single-page app (Vite)
│   ├── src/pages/           One file per route: data `loader` + `Component`
│   ├── src/components/      booking, gallery, layout, planner, sections, ui, waitlist
│   ├── src/lib/             API client, helpers
│   ├── src/shared/          Frontend-owned pricing, dates, validation and planner helpers
│   └── package.json         Client dependencies and scripts
├── server/                  Standalone REST API (Express 5)
│   ├── src/routes.js        All /api endpoints
│   ├── src/services/        Business logic + database access (Prisma)
│   ├── src/shared/          Server-owned copies of pricing, dates and validation rules
│   ├── prisma/              schema.prisma, migrations, seed.js
│   └── package.json         Server dependencies and scripts
├── docker-compose.yml       Optional local PostgreSQL
├── vercel.json              Frontend deployment (Vercel)
└── render.yaml              API deployment (Render)
```

`client` and `server` are independent npm projects. Run `npm install` inside each folder; each gets its own `node_modules` and lockfile. The small pure-JavaScript helpers are kept in both packages so either can be built and deployed without depending on another workspace. When changing shared pricing, date, validation or planner behavior, update both copies; server-side validation and pricing remain authoritative.

## Quick start

> **New to the project?** Follow the step-by-step **[Windows Setup Guide](./SETUP_GUIDE.md)**.

All commands below are for **Windows PowerShell**.

**Prerequisites:** Windows 10/11, Node.js 20.19+, Git, and PostgreSQL 14+ (installed, or via Docker Desktop).

```powershell
git clone https://github.com/Anand1-18/Luxe_Screen.git
cd Luxe_Screen
Copy-Item server\.env.example server\.env  # edit DATABASE_URL if needed
cd server
npm install
cd ..\client
npm install
cd ..
```

Start a database (pick one):

```powershell
# Option A: installed PostgreSQL. Create the database and set your password in server\.env.
& "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -h localhost -c "CREATE DATABASE luxe_screens;"

# Option B: Docker Desktop
docker compose up -d
```

Apply migrations and load sample data:

```powershell
npm run db:deploy
npm run db:seed
```

Run the API and frontend in **two terminals**:

```powershell
# Terminal 1
npm run dev:server

# Terminal 2
npm run dev:client
```

Open <http://localhost:5173>. The API runs at <http://localhost:4000>.

### Environment variables

**`server\.env`** (required): `DATABASE_URL`, `PORT` (default `4000`), and `CLIENT_ORIGIN` (default `http://localhost:5173`).

**`client\.env`** (production only): set `VITE_API_URL` to the deployed API origin. Leave it empty locally; Vite proxies `/api` to port 4000.

Real env files are git-ignored; only `.env.example` templates are committed.

### Commands

Root convenience commands delegate to the standalone packages:

| Command | Purpose |
|---|---|
| `npm run dev:server` / `npm run dev:client` | Start either app |
| `npm run build` / `npm run preview` | Build or preview the client |
| `npm start` | Start the API |
| `npm test` | Run server and client tests |
| `npm run db:deploy` / `npm run db:seed` | Apply migrations / load sample data |

You can also run each package's scripts from its own folder, e.g. `cd server; npm run db:deploy`.

### Try it

- **Coupons:** `LUXE10` (10% off, up to ₹500), `FIRSTSHOW` (₹300 off orders over ₹2,000), `CELEBRATE20` (20% off orders over ₹4,000). `MONSOON25` is expired, to show validation.
- **Payment:** the gateway is simulated. Tick _"Test mode: simulate a declined payment"_ on the payment step to see the failure path. No card details are collected.

---

## Architecture

```
Browser ── React SPA (client) ──fetch /api/...──► Express API (server) ──Prisma──► PostgreSQL
```

- **Client:** each route in `client/src/router.jsx` lazy-loads a page module that exports a **loader** (fetches its data from the API before rendering) and a **Component**. Errors and unknown URLs render an error/404 page inside the normal layout. Per-page `<title>` and `<meta>` use React 19's built-in metadata hoisting.
- **Server:** thin route handlers in `server/src/routes.js` validate input with Zod and call services in `server/src/services/`. Express 5 forwards thrown errors to one `errorHandler`, so every error has the same JSON shape.
- **Local helper copies:** frontend previews and server enforcement use matching pure functions in each package's `src/shared/` folder. Server calculations are authoritative.

### API

All responses are JSON. Errors always have the shape `{ "error": { "code", "message", "details?" } }`.

| Method & path | Description |
|---|---|
| `GET /api/slots?date=YYYY-MM-DD&location=<slug>` (or `&theaterId=`) | Theatres with each slot marked `AVAILABLE`, `BOOKED` or `CLOSED` |
| `POST /api/coupons/validate` | `{ code, theaterId, guests, items[] }` → discount and server-side quote |
| `POST /api/booking` | Creates a `PENDING` booking that holds the slot for 10 minutes → `201` |
| `POST /api/booking/confirm` | `{ bookingId, paymentMethod, simulateOutcome? }` → confirms; safe to repeat |
| `GET /api/booking/:id` | Booking receipt |
| `POST /api/planner` | `{ occasion, budget, guests, location }` → recommendation + alternatives |
| `POST /api/waitlist` · `POST /api/contact` | Lead capture |
| `GET /api/locations` · `/api/theaters` · `/api/theaters/:slug` · `/api/addons` · `/api/health` | Catalogue and health check |

Notable status codes: `400` validation, `402` payment declined, `409` slot taken / duplicate waitlist, `410` hold expired, `422` business rule (capacity, date window, coupon), `429` rate limited.

### Data model

`Location` → `Theater` → `Slot` (daily time windows) · `AddOn` → `AddOnOption` · `Booking` → `CartItem` · `Coupon` · `WaitlistEntry` · `ContactMessage`

### Key decisions

- **Money is stored as integer paise**, so there's no floating-point drift. Cart items snapshot their name and price, so later catalogue changes never alter a receipt.
- **Double-booking is impossible at the database level.** A booking holds the slot through a unique `activeSlotKey` (`theaterId:slotId:date`) while it is `PENDING` or `CONFIRMED`. Concurrent attempts get `409`. Lapsed holds are released inside the same transaction.
- **The server prices everything.** Totals are recalculated from catalogue data on every booking; client-sent prices are never trusted.
- **Payment confirmation is idempotent and race-safe.** It uses a conditional update, and coupon redemption is an atomic SQL increment that respects the usage limit.
- **Dates use IST.** Bookings are open from today to 60 days ahead, with a 30-minute lead time before each slot.
- **The "AI" planner is a deterministic, explainable scoring engine** (`server/src/shared/planner.js`): capacity fit, occasion mood, budget headroom and rating. Its package builder first secures one item per category, then upgrades within budget. It needs no external API key and is unit tested.
- **Prisma uses the `prisma-client-js` generator**, which outputs plain JavaScript, with the `pg` driver adapter.

## Testing

```powershell
npm test
```

## Deployment

The client and API deploy independently; the database can be a managed PostgreSQL instance such as [Neon](https://neon.tech).

1. **Database:** create a PostgreSQL database and set `DATABASE_URL` in the server environment. From the repository root, run `npm run db:deploy` and `npm run db:seed`.
2. **API on Render:** use `render.yaml`, which sets the service root to `server`. Configure `DATABASE_URL` and `CLIENT_ORIGIN`.
3. **Website on Vercel:** set the project's Root Directory to `client`. Its `vercel.json` installs and builds the standalone frontend; set `VITE_API_URL` to the Render API origin.
4. Update `CLIENT_ORIGIN` on Render if the Vercel URL changes.

## Known limitations

- The payment gateway is simulated, and no confirmation emails or SMS are sent.
- Rate limiting is in memory, per server instance. Use Redis for multi-instance deployments.
- There is no admin panel or authentication. Catalogue changes go through `server/src/data/catalog.js` + `npm run db:seed`.
- The website is a client-rendered SPA, so search engines see less content than with server rendering.
