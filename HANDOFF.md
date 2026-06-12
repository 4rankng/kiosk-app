# HANDOFF.md — Session State

## Goal
Get the kiosk-app full stack running end-to-end: backend (Hono + Drizzle + PostgreSQL) + frontend (React + Vite + TanStack Query) working together with real API calls instead of mock data.

## What Was Done

### Infrastructure
- Created `.env` with dev credentials (DB: kiosk/kiosk_dev_2024, Redis on port 6382, Adminer on 8082)
- Fixed Docker Compose port conflicts (Redis 6379→6382, Adminer 8080→8082) to avoid collisions with other projects
- Started Postgres, Redis, Adminer containers — all healthy

### Backend Fixes
- **Shared dotenv loader** (`src/config/dotenv.ts`): All CLI scripts (migrate, wait, reset, create-admin) now find `.env` from either `backend/` or project root
- **Circular dependency fix**: `logger.ts` no longer imports `env.ts` (reads env vars directly), breaking the env↔logger cycle
- **`pg_trgm` extension**: Added `CREATE EXTENSION IF NOT EXISTS pg_trgm` to migration SQL for trigram search indexes
- **`queryOne`/`query` helpers** (`lib/sql.ts`): Changed from calling `.execute()` on SQL fragments to accepting `db` as first param; updated all 20+ callers across auth, orders, reports
- **`inArray()` instead of raw `ANY()`**: Orders route used `sql\`${id} = ANY(${array})\`` which fails for UUID arrays — replaced with Drizzle's `inArray()` for all 4 occurrences
- **Reports dashboard**: Changed `status = 'pending'` to `status = 'draft'` to match the `order_status` enum

### Frontend Fixes
- **Types unified**: `types/company.ts`, `types/customer.ts`, `types/business-entity.ts`, `types/invoice.ts`, `types/price-list.ts` now re-export from services (single source of truth)
- **`OrderStatus`**: Added `'cancelled'` to match backend enum
- **`useQuery` wrappers**: All 10+ components using `queryFn: getService` changed to `queryFn: () => getService()` for TanStack Query compatibility; services returning `PaginatedResponse<T>` extract `.data`
- **`api-client.ts`**: Fixed `normalizeError` to accept plain `AxiosError` instead of typed generic
- **Company `taxId`→`taxCode`**: Renamed across companies feature (columns, schema, mobile config, mutate dialog)
- **Invoice `date`→`issuedAt`**: Renamed in invoices columns; print dialog now fetches `InvoiceDetail` for items
- **Auth form**: Fixed `signInWithEmail` to use `LoginPayload` object, extract `.user`/`.accessToken` from response
- **Price list table**: Restructured to accept `items` as separate prop (service `PriceList` doesn't include items); index page fetches items via `getPriceListById`
- **Product create**: Made `stockQuantity` optional in `createProduct` signature
- **Category/Unit inline create**: Fixed to pass objects `{name}` instead of raw strings; return `.id` instead of `.name`

### Verified Working
- Backend: `tsc --noEmit` ✓, health/ready endpoints ✓
- Frontend: `tsc --noEmit` ✓, `vite build` ✓ (281ms)
- Login flow: POST /api/auth/login → JWT tokens ✓
- CRUD: categories, units, products, companies, customers, business entities ✓
- Order creation with price resolution ✓
- Dashboard reports ✓
- Admin user created: admin@kiosk.vn / admin1234

## Running State
- Backend: `pnpm dev:api` on port 3000 (running in background)
- Docker: postgres (5432), redis (6382), adminer (8082)
- Frontend: not started yet — run `cd frontend && pnpm dev` for :5173

## Gotchas
- `.env` is at project ROOT (for Docker Compose). Backend scripts use shared `dotenv.ts` to find it from either location.
- Port 6379 is used by payroll-redis; kiosk uses 6382.
- `queryOne`/`query` now require `db` as first argument — don't use old single-arg signature.
- `types/` files re-export from `services/` — don't redefine types locally.
- The `invoice.status` on backend is `invoice_status` enum ('pending'|'completed'|'cancelled'), NOT `order_status`.
- `company.taxCode` (not `taxId`) is the correct field name.

## Next Steps
- Start frontend dev server and test full UI flow (sign-in → dashboard → orders)
- Test Google OAuth flow (needs client ID/secret in .env)
- Add seed data or use UI to populate more products/customers
- Test PDF invoice generation
- Test Excel export for debt reports
- Deploy setup (Dockerfile.backend, Dockerfile.frontend, nginx.conf)
