# Kiosk App — Wholesale Management & Debt Reconciliation

A B2B wholesale management system for food distribution to restaurant chains.
Built as a production-ready startup MVP that scales to millions of users.

📐 **[Full architecture →](./ARCHITECTURE.md)**

## Quick Start (local dev)

```bash
# Requires: Docker, pnpm 8+, Node 20+
git clone <repo>
cd kiosk-app

# 1. Create your local config from the template
cp .env.example .env
$EDITOR .env                  # set POSTGRES_USER, POSTGRES_PASSWORD, JWT_SECRET, …

# 2. Boot the full stack
make dev

# 3. In another terminal — create your first admin
cd backend && pnpm admin:create -- --email=you@example.com --password=strongpass --name="Your Name"
```

Then open:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Adminer** (DB GUI): http://localhost:8080

The system starts **empty** — no demo data, no fake users. You create the first admin,
then build your catalog (categories, units, products, customers, price lists) through the UI.

## Tech Stack

- **Frontend**: React 19, Vite, TanStack Router, TanStack Query, shadcn/ui, Tailwind 4
- **Backend**: Node 20, Hono, Drizzle ORM, PostgreSQL 16, Redis 7
- **Auth**: JWT + bcrypt + Google OAuth + email allowlist
- **Reports**: pdfkit (PDF), exceljs (Excel)
- **Infra**: Docker Compose, nginx, DigitalOcean Droplet

## Project Structure

```
kiosk-app/
├── backend/                 # Hono API
├── frontend/                # React 19 + TanStack Router
├── deploy/                  # Dockerfiles + nginx + DO setup
├── docker-compose.yml       # local dev (postgres, redis, adminer)
├── docker-compose.prod.yml  # production
├── Makefile                 # dev / prod / test / deploy
└── ARCHITECTURE.md
```

## Common Commands

```bash
make dev               # start full dev stack (migrations included)
make dev-stop          # stop dev services
make db-migrate        # run Drizzle migrations
make admin-create      # create the first admin user
make db-studio         # open Drizzle Studio (DB GUI)
make db-reset          # ⚠ drop all tables & re-migrate (destructive)
make backend-test      # run backend tests
make frontend-build    # build frontend for production
make prod-deploy       # zero-downtime prod deploy
make logs              # tail docker logs
```

## Production Deployment (DigitalOcean)

See [deploy/digitalocean/README.md](./deploy/digitalocean/README.md) for the
full step-by-step. Quick version:

```bash
# On your droplet (after `git clone`):
cp .env.example .env.production && $EDITOR .env.production
bash deploy/digitalocean/setup.sh

# Then create the first admin:
docker compose -f docker-compose.prod.yml run --rm backend pnpm admin:create \
  -- --email=admin@yourdomain.com --password=STRONG --name="Admin"

# Deploy updates:
make prod-deploy
```

## License

MIT
