# =============================================================================
#  Kiosk App — System Architecture
# =============================================================================

## 1. Overview

A B2B wholesale management & debt-reconciliation system for a food distribution business
serving restaurant chains. Optimized for daily order-taking on mobile + reconciliation
reporting on desktop.

**Design philosophy**: minimal but production-ready. No bloat, no premature microservices.

---

## 2. Tech Stack

| Layer        | Choice                                | Why                                                                 |
| ------------ | ------------------------------------- | ------------------------------------------------------------------- |
| Frontend     | React 19 + Vite + TanStack Router     | Already in repo; file-based routing, type-safe params, RSC-ready    |
| UI Kit       | shadcn/ui + Tailwind 4                | Already in repo; accessible, themeable, RTL-friendly                |
| Data         | TanStack Query                        | Cache, dedupe, optimistic updates; aligns with REST API             |
| API Client   | Axios                                 | Interceptors for auth + 401 redirect; already in repo               |
| Backend      | Node.js 20 + Hono                     | Smallest, fastest HTTP framework; deploys as a single Node process  |
| ORM          | Drizzle                               | TypeScript-native, no codegen step, raw SQL escape hatch            |
| Database     | PostgreSQL 16                         | Mature, scales vertically to 100k+ rows/day, JSONB for extensibility |
| Cache/Queue  | Redis 7                               | Session store, rate limit, future job queue                          |
| Auth         | JWT (HS256) + bcrypt + Google OAuth   | Standard, no vendor lock-in; OAuth via `google-auth-library`        |
| Validation   | Zod (shared schemas via OpenAPI)      | Same lib on FE + BE; single source of truth for request shape       |
| PDF          | pdfkit                                | Server-side invoice PDFs, no headless browser required              |
| Excel Export | exceljs                               | Streaming writer, handles 100k+ rows for debt reports                |
| Process Mgr  | PM2 (prod) / tsx watch (dev)          | Zero-downtime reloads, log rotation, cluster mode                   |
| Reverse Proxy| nginx (TLS termination)               | Standard, well-understood, plays nice with Let's Encrypt            |
| CI/CD        | GitHub Actions → DO registry          | Build images, push, ssh to droplet, `docker compose pull && up`     |

---

## 3. System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│  Client (Browser / Mobile)                                             │
│  React 19 + TanStack Router + TanStack Query + shadcn/ui               │
└────────────────┬───────────────────────────────────────────────────────┘
                 │  HTTPS
                 ▼
┌────────────────────────────────────────────────────────────────────────┐
│  nginx  (TLS termination + static asset cache + reverse proxy)         │
│  /api/*  →  backend:3000                                               │
│  /*      →  static frontend (index.html + hashed assets)              │
└────────────────┬───────────────────────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────────────────────┐
│  Backend (Hono on Node 20)                                             │
│  /api/auth/*         → JWT issuance, Google OAuth, refresh, allowlist  │
│  /api/products/*     → product catalog + multi-tier pricing            │
│  /api/price-lists/*  → per-company price overrides                     │
│  /api/companies/*    → customer groups (Hộ KD / Chuỗi)                │
│  /api/customers/*    → branches (Nhà hàng)                             │
│  /api/orders/*       → order creation w/ price-list resolution         │
│  /api/invoices/*     → invoice list + PDF (Phương Linh / Hồng Hạnh)   │
│  /api/reports/*      → daily, product, customer, debt + export         │
│  /api/business-entities/*  → invoice header templates                  │
└────┬─────────────────────────────────────┬─────────────────────────────┘
     │                                     │
     ▼                                     ▼
┌──────────────────────┐         ┌──────────────────────┐
│  PostgreSQL 16       │         │  Redis 7             │
│  - 11 core tables    │         │  - refresh tokens     │
│  - JSONB metadata    │         │  - rate-limit buckets│
│  - trigram indexes   │         │  - future: job queue │
│    for fast search   │         │                       │
└──────────────────────┘         └──────────────────────┘
```

---

## 4. Database Schema (11 tables)

```
users                   business_entities        categories (tree)
  id, email, name,        id, name, tax_code,      id, name, parent_id
  password_hash, role,    address, phone,
  is_active, exp          header_lines

units                    products                 price_lists
  id, name                 id, code, name,          id, name, company_id
                           category_id, unit_id,    (NULL = general)
                           description,
                           purchase_price,         price_list_items
                           default_sale_price,     price_list_id, product_id,
                           stock_quantity          custom_price
                                                       UNIQUE(price_list_id, product_id)

companies                customers                orders
  id, name, tax_code,      id, code, name,          id, code, customer_id,
  price_list_id,           company_id, phone,       business_entity_id,
  address, phone, email    email, address,          status, subtotal,
                           tax_id                   discount, total,
                                                    paid_amount, notes,
                                                    created_by, created_at

order_items                                       payments
  order_id, product_id,                           order_id, amount, method,
  quantity, unit_price,                           paid_at, note
  total_price
```

Indexes:
- `products(code)` UNIQUE
- `products.name` trigram GIN
- `orders(customer_id, created_at DESC)`
- `orders(created_at DESC)` for daily reports
- `order_items(product_id)` for product drill-down
- `customers(company_id)` for company-level reports

---

## 5. API Surface (43 endpoints)

All endpoints under `/api`. Authenticated endpoints require `Authorization: Bearer <jwt>`.
Public: `POST /api/auth/*` and `GET /api/health`.

```
AUTH          POST   /api/auth/login                  email + password
              POST   /api/auth/google                 Google OAuth (code exchange)
              GET    /api/auth/google/url             start Google OAuth
              POST   /api/auth/refresh                refresh access token
              POST   /api/auth/logout                 invalidate refresh token
              GET    /api/auth/me                     current user

PRODUCTS      GET    /api/products                    ?q=&categoryId=&page=
              GET    /api/products/:id
              POST   /api/products                    auto-creates general PL entry
              PATCH  /api/products/:id
              DELETE /api/products/:id

CATEGORIES    GET    /api/categories                  tree (parent → children)
              POST   /api/categories                  inline create
              PATCH  /api/categories/:id
              DELETE /api/categories/:id

UNITS         GET    /api/units
              POST   /api/units                       inline create
              DELETE /api/units/:id

PRICE LISTS   GET    /api/price-lists                 ?companyId= (or general)
              GET    /api/price-lists/:id/items
              POST   /api/price-lists
              PUT    /api/price-lists/:id/items       bulk upsert prices
              DELETE /api/price-lists/:id

COMPANIES     GET    /api/companies                   ?q=
              POST   /api/companies
              PATCH  /api/companies/:id
              DELETE /api/companies/:id

CUSTOMERS     GET    /api/customers                   ?q=&companyId=
              GET    /api/customers/:id
              POST   /api/customers
              PATCH  /api/customers/:id
              DELETE /api/customers/:id

ORDERS        GET    /api/orders                      ?date=&status=&customerId=
              GET    /api/orders/:id
              POST   /api/orders                      resolves price-list per customer
              PATCH  /api/orders/:id/status
              POST   /api/orders/:id/payments         record payment (for debt)

INVOICES      GET    /api/invoices                    ?date=&status=&customerId=
              GET    /api/invoices/:id
              GET    /api/invoices/:id/pdf            PDF download (58mm or A4)
              GET    /api/invoices/:id/print          HTML for window.print()

REPORTS       GET    /api/reports/dashboard           today's KPIs
              GET    /api/reports/monthly-revenue    ?month=YYYY-MM
              GET    /api/reports/top-customers       ?month=&limit=10
              GET    /api/reports/products            ?from=&to=
              GET    /api/reports/products/:id        drill-down: order line details
              GET    /api/reports/customer-debt       ?month=&companyId=
              GET    /api/reports/customer-debt.xlsx  Excel export
              GET    /api/reports/customer-debt.pdf   PDF export

ENTITIES      GET    /api/business-entities           Hộ KD templates
              POST   /api/business-entities
              PATCH  /api/business-entities/:id
              DELETE /api/business-entities/:id

HEALTH        GET    /api/health                       liveness
              GET    /api/health/ready                 readiness (db + redis)
```

---

## 6. Authentication & Authorization

- **Local login**: bcrypt-hashed password → JWT access (15m) + refresh (7d) tokens
- **Google OAuth**: standard Authorization Code flow via `google-auth-library`
  - On success: lookup user by email → if email is in `ALLOWED_EMAILS` allow, else 403
  - Auto-provision user on first Google login
- **Refresh tokens**: stored in `redis` (key: `refresh:<jti>`), rotated on each use
- **Email allowlist**: env var `ALLOWED_EMAILS` + optional `users.is_active` flag
- **Authorization model**: single role (`admin`) for MVP. Multi-role can be added
  by extending the `users.role` column — schema is already plumbed for it.

---

## 7. Order Creation Flow (Critical Path)

```
1. Frontend: user picks customer
   → GET /api/customers/:id
   ← returns { ..., company: { priceListId } }

2. Frontend: user types product name
   → GET /api/products?q=...&priceListId=...
   ← returns products with effectivePrice (custom > general > defaultSalePrice)

3. User adjusts qty → UI shows live total (frontend calc)

4. User picks business entity (Hộ KD template)
   → GET /api/business-entities
   ← returns list

5. Submit order
   → POST /api/orders
   body: { customerId, businessEntityId, items: [{productId, quantity, unitPrice?}],
           discount, paidAmount, notes }
   Server:
     - Resolves final unitPrice: custom PL > general PL > product.defaultSalePrice
     - If unitPrice is given in body, uses it (manual override)
     - Computes subtotal, total
     - Inserts order + order_items + initial payment (if any) in a single TX
     - Generates order code: DH000001, DH000002, ...
   ← returns { id, code, total, ... }

6. User clicks "Print"
   → GET /api/invoices/:id/pdf?entityId=...
   ← PDF stream
```

---

## 8. File Structure

```
kiosk-app/
├── Makefile                       # single source of truth for dev commands
├── docker-compose.yml             # local: postgres + redis + adminer
├── docker-compose.prod.yml        # prod: nginx + backend + frontend + db + redis
├── .env.example                   # all env vars documented
├── ARCHITECTURE.md                # this file
├── README.md                      # quickstart
│
├── backend/                       # Hono API
│   ├── package.json
│   ├── tsconfig.json
│   ├── drizzle.config.ts
│   ├── .env.example
│   ├── drizzle/                   # generated migrations
│   ├── uploads/                   # user-uploaded files (gitignored)
│   └── src/
│       ├── server.ts              # entry — boots http server
│       ├── app.ts                 # Hono app factory
│       ├── config/
│       │   ├── env.ts             # Zod-validated env loader
│       │   ├── db.ts              # Drizzle client
│       │   └── redis.ts           # ioredis client
│       ├── db/
│       │   ├── schema/            # 11 table definitions
│       │   ├── migrations/        # generated SQL
│       │   └── create-admin.ts    # one-shot CLI: bootstrap the first admin user
│       ├── middleware/
│       │   ├── auth.ts            # JWT verification
│       │   ├── error.ts           # global error handler
│       │   ├── rate-limit.ts      # Redis-backed limiter
│       │   └── logger.ts          # request logger
│       ├── modules/
│       │   ├── auth/              # login, OAuth, refresh
│       │   ├── products/
│       │   ├── categories/
│       │   ├── units/
│       │   ├── price-lists/
│       │   ├── companies/
│       │   ├── customers/
│       │   ├── orders/
│       │   ├── invoices/          # + PDF generator
│       │   ├── reports/           # + Excel export
│       │   └── business-entities/
│       ├── lib/
│       │   ├── jwt.ts
│       │   ├── password.ts
│       │   ├── pagination.ts
│       │   ├── response.ts        # { data, meta } envelope
│       │   └── pdf.ts             # pdfkit helpers + invoice template
│       └── types/
│           └── api.ts             # shared request/response types
│
├── frontend/                      # already exists
│   ├── src/
│   │   ├── lib/
│   │   │   └── api-client.ts      # NEW: axios instance w/ auth interceptor
│   │   ├── services/              # REPLACED: mock calls → real API
│   │   └── ...
│   └── ...
│
└── deploy/
    ├── Dockerfile.backend         # multi-stage Node 20 build
    ├── Dockerfile.frontend        # multi-stage Vite build → nginx
    ├── nginx.conf                 # reverse proxy + TLS
    └── digitalocean/
        ├── README.md              # step-by-step deploy guide
        └── setup.sh               # one-shot droplet bootstrap
```

---

## 9. Scalability Path

Current MVP is **single-droplet** ($24/mo, 2 GB RAM, 2 vCPU) and serves:
- ~10k orders/day
- ~50k product lookups/day
- ~100 concurrent users
- ~5 GB DB size

**When you outgrow it** (track via DO metrics):

| Symptom                         | Move to                              |
| ------------------------------- | ------------------------------------ |
| DB CPU > 60%                    | Managed Postgres (DO $15/mo)         |
| Latency from single droplet     | Split: 1 droplet API + 1 droplet DB  |
| Need HA                         | 2 API droplets + LB ($12/mo)         |
| Need horizontal scale           | 3+ stateless API behind LB           |
| Long reports blocking API       | Worker process + Redis queue         |
| Big files / lots of uploads     | DO Spaces ($5/mo) + CDN              |

The architecture stays the same — only the **deployment topology** changes.
Stateless API + managed DB + object storage scales to **millions of users** without
rewrites.

---

## 10. Observability

- **Logs**: stdout JSON → DO log forwarding → Better Stack / Papertrail
- **Metrics**: `prom-client` exposes `/api/metrics` (Prometheus format)
- **Errors**: Sentry SDK (optional, plug in via `SENTRY_DSN` env var)
- **Uptime**: UptimeRobot free tier pings `/api/health/ready` every 60s

---

## 11. Security

- HTTPS only (Let's Encrypt via certbot in `setup.sh`)
- httpOnly + SameSite=Strict refresh-token cookie
- CORS allowlist (`CORS_ORIGIN`)
- Rate limit: 100 req/min per IP, 10 login attempts/15min per email
- Password policy: min 8 chars, server-side enforced
- SQL injection: impossible (Drizzle uses parameterized queries)
- XSS: prevented by React + Zod-validated inputs
- Helmet-equivalent headers via `hono/secure-headers`
- Secrets: never in repo, only in `.env` (gitignored)
- Backups: `pg_dump` daily at 03:00 to DO Spaces, 30-day retention

---

## 12. Local Development

```bash
# One command does everything:
make dev

# This:
# 1. Starts Postgres + Redis + Adminer in Docker
# 2. Waits for DB healthcheck
# 3. Runs migrations (empty schema)
# 4. Starts backend with hot reload
# 5. Starts frontend with vite HMR
#
# Then, in another terminal, bootstrap your first admin:
cd backend && pnpm admin:create -- --email=you@example.com --password=strongpass --name="Your Name"
#
# Then open:
#   Frontend  →  http://localhost:5173
#   API       →  http://localhost:3000
#   Adminer   →  http://localhost:8080  (login with values from your .env)
#   Redis     →  localhost:6379
#
# The system starts EMPTY. All data (products, customers, price lists, orders)
# is created through the UI by the admin.

---

## 13. Production Deployment (DigitalOcean)

See `deploy/digitalocean/README.md` for the full step-by-step. Summary:

```bash
# On your local machine
ssh root@<droplet-ip>
git clone <repo> /opt/kiosk && cd /opt/kiosk
cp .env.example .env.production
# Edit .env.production with real values

bash deploy/digitalocean/setup.sh   # installs docker, sets up TLS, runs first deploy

# From then on, just:
make prod-deploy
```
