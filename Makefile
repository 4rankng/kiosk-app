.PHONY: dev build test seed migrate reset db-setup prod-up prod-down

# Development — starts postgres/redis/adminer, then streams backend API and
# frontend web into this terminal. Ctrl+C stops both; containers keep running
# (make clean removes them).
dev:
	@test -f .env || cp .env.example .env
	docker compose up -d postgres redis adminer
	pnpm -r --parallel dev

# Build
build:
	cd backend && pnpm build
	cd frontend && pnpm build

# Tests
test:
	cd backend && pnpm test
	cd frontend && pnpm test

# Database
migrate:
	cd backend && npx tsx src/db/migrate.ts

seed:
	cd backend && npx tsx src/db/seed.ts

reset:
	cd backend && npx tsx src/db/reset.ts

db-setup: migrate seed

# Production
prod-build:
	docker compose -f docker-compose.prod.yml build

prod-up:
	docker compose -f docker-compose.prod.yml up -d

prod-down:
	docker compose -f docker-compose.prod.yml down

# Cleanup
clean:
	docker compose down -v
	rm -rf backend/dist frontend/dist
