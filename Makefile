.PHONY: dev build test seed migrate reset db-setup prod-up prod-down

# Development
dev:
	docker compose up -d postgres redis adminer
	@echo "Run in separate terminals:"
	@echo "  cd backend && pnpm dev"
	@echo "  cd frontend && pnpm dev"

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
