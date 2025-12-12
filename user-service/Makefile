.PHONY: help install build dev test lint format clean setup migrate seed studio docker-build docker-up docker-down

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-20s %s\n", $$1, $$2}'

install: ## Install dependencies
	npm install

build: ## Build the service
	npm run prisma:generate || true
	npm run build

dev: ## Start development server
	npm run dev

test: ## Run tests
	npm test

test:watch: ## Run tests in watch mode
	npm run test:watch

test:coverage: ## Run tests with coverage
	npm run test:coverage

lint: ## Lint code
	npm run lint

lint:fix: ## Fix linting issues
	npm run lint:fix

format: ## Format code
	npm run format || npx prettier --write "**/*.{ts,js,json,md}"

clean: ## Clean build artifacts
	rm -rf dist node_modules/.prisma

setup: ## Complete setup (install, migrate, seed)
	make install
	make migrate
	@echo "✅ Setup complete"

migrate: ## Run database migrations
	npm run prisma:generate
	npm run prisma:migrate:deploy

migrate:dev: ## Create new migration
	npm run prisma:migrate

seed: ## Seed database
	npm run prisma:seed || echo "No seed script available"

studio: ## Open Prisma Studio
	npm run prisma:studio

docker-build: ## Build Docker image
	docker build -t user-service:latest .

docker-up: ## Start services with docker-compose
	docker-compose up -d

docker-down: ## Stop docker-compose services
	docker-compose down

docker-logs: ## View docker-compose logs
	docker-compose logs -f

