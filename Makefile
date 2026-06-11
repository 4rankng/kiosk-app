# =============================================================================
#  Kiosk App — Wholesale Management & Debt Reconciliation System
#  Production-ready startup MVP
# =============================================================================

## Core
.PHONY: help dev dev-stop logs status clean reset install env

DEV_COMPOSE  := docker compose -f docker-compose.yml
PROD_COMPOSE := docker compose -f docker-compose.prod.yml

help: ## Show this help
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m<target>\033[0m\n\nTargets:\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2 }' $(MAKEFILE_LIST)

# -----------------------------------------------------------------------------
#  Local development
# -----------------------------------------------------------------------------
env: ## Create .env from .env.example if it doesn't exist
	@test -f .env || cp .env.example .env
	@echo "→ .env ready (edit it to set POSTGRES_USER, POSTGRES_PASSWORD, JWT_SECRET, …)"

install: env ## Install dependencies (frontend + backend)
	@echo "→ Installing backend deps"
	@cd backend && pnpm install
	@echo "→ Installing frontend deps"
	@cd frontend && pnpm install

dev: env ## Start the entire stack for local dev (one command)
	@echo "→ Booting Postgres + Redis + Adminer (Docker)"
	@$(DEV_COMPOSE) up -d postgres redis adminer
	@echo "→ Waiting for Postgres healthcheck..."
	@cd backend && pnpm db:wait
	@echo "→ Running migrations"
	@cd backend && pnpm db:migrate
	@echo ""
	@echo "✅ Database is up and migrated (empty)."
	@echo ""
	@echo "→ Bootstrap your first admin user in another terminal:"
	@echo "   cd backend && pnpm admin:create -- --email=you@example.com --password=strongpass --name=\"Your Name\""
	@echo ""
	@echo "→ Starting backend (hot reload) + frontend (vite) in parallel"
	@cd backend && pnpm dev:api &
	@cd frontend && pnpm dev

dev-stop: ## Stop all dev services
	@$(DEV_COMPOSE) down
	@echo "✅ Stack stopped"

dev-restart: dev-stop dev ## Restart the full dev stack

logs: ## Tail logs from Postgres + Redis
	@$(DEV_COMPOSE) logs -f

logs-db: ## Tail Postgres logs only
	@$(DEV_COMPOSE) logs -f postgres

status: ## Show status of dev containers
	@$(DEV_COMPOSE) ps

# -----------------------------------------------------------------------------
#  Database
# -----------------------------------------------------------------------------
db-migrate: ## Run Drizzle migrations
	@cd backend && pnpm db:migrate

db-studio: ## Open Drizzle Studio (DB GUI)
	@cd backend && pnpm db:studio

db-reset: ## ⚠ Drop all tables and re-apply migrations (destructive)
	@cd backend && pnpm db:reset FORCE=1

admin-create: ## Create the first admin user (interactive)
	@cd backend && pnpm admin:create

# -----------------------------------------------------------------------------
#  Backend utilities
# -----------------------------------------------------------------------------
backend-lint: ## Lint backend
	@cd backend && pnpm lint

backend-typecheck: ## Type-check backend
	@cd backend && pnpm typecheck

backend-test: ## Run backend tests
	@cd backend && pnpm test

# -----------------------------------------------------------------------------
#  Frontend utilities
# -----------------------------------------------------------------------------
frontend-lint: ## Lint frontend
	@cd frontend && pnpm lint

frontend-typecheck: ## Type-check frontend
	@cd frontend && pnpm typecheck

frontend-build: ## Production build of frontend
	@cd frontend && pnpm build

# -----------------------------------------------------------------------------
#  Production (DigitalOcean)
# -----------------------------------------------------------------------------
prod-build: ## Build production images
	@$(PROD_COMPOSE) build

prod-up: ## Boot production stack (requires .env.production)
	@$(PROD_COMPOSE) up -d

prod-down: ## Stop production stack
	@$(PROD_COMPOSE) down

prod-logs: ## Tail production logs
	@$(PROD_COMPOSE) logs -f

prod-deploy: ## Build + migrate + restart (zero-downtime)
	@$(PROD_COMPOSE) build backend
	@$(PROD_COMPOSE) run --rm backend pnpm db:migrate
	@$(PROD_COMPOSE) up -d backend

# -----------------------------------------------------------------------------
#  Cleanup
# -----------------------------------------------------------------------------
clean: ## Remove build artifacts + node_modules (keeps DB volumes)
	@rm -rf backend/dist backend/node_modules frontend/dist frontend/node_modules
	@echo "✅ Cleaned"

reset: dev-stop ## ⚠ Wipe everything: containers + volumes + node_modules
	@$(DEV_COMPOSE) down -v
	@rm -rf backend/dist backend/node_modules frontend/dist frontend/node_modules
	@echo "✅ Full reset done. Run 'make dev' to start fresh."
