.PHONY: help install build dev test lint format clean clean:all clean:docker setup setup:local migrate migrate:dev migrate:reset migrate:status seed studio docker-build docker-up docker-down docker-logs docker-restart docker-clean docker:setup

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-25s %s\n", $$1, $$2}'

# ============================================================================
# INSTALLATION & SETUP
# ============================================================================

install: ## Install all dependencies
	@echo "📦 Installing dependencies..."
	npm install
	@echo "✅ Dependencies installed"

setup: ## Complete local setup (install, generate, migrate)
	@echo "🚀 Starting complete setup..."
	@echo "📦 Step 1/4: Installing dependencies..."
	make install
	@echo "🔧 Step 2/4: Generating Prisma Client..."
	npm run prisma:generate
	@echo "🗄️  Step 3/4: Running database migrations..."
	make migrate
	@echo "✅ Step 4/4: Setup complete!"
	@echo ""
	@echo "📝 Next steps:"
	@echo "   1. Copy .env.example to .env and configure it"
	@echo "   2. Ensure PostgreSQL is running"
	@echo "   3. Run 'make dev' to start development server"

setup:local: ## Setup for local development (with .env check)
	@echo "🚀 Setting up local development environment..."
	@if [ ! -f .env ]; then \
		echo "⚠️  .env file not found. Creating from .env.example..."; \
		cp .env.example .env; \
		echo "✅ .env file created. Please edit it with your configuration."; \
	fi
	@echo "📦 Installing dependencies..."
	make install
	@echo "🔧 Generating Prisma Client..."
	npm run prisma:generate
	@echo "🗄️  Running database migrations..."
	make migrate
	@echo "✅ Local development setup complete!"
	@echo ""
	@echo "📝 To start development:"
	@echo "   make dev"

# ============================================================================
# DEVELOPMENT
# ============================================================================

dev: ## Start development server with hot reload
	@echo "🚀 Starting development server..."
	npm run dev

build: ## Build the service for production
	@echo "🔨 Building service..."
	npm run prisma:generate || true
	npm run build
	@echo "✅ Build complete"

# ============================================================================
# DATABASE MIGRATIONS
# ============================================================================

migrate: ## Run database migrations (deploy - for production)
	@echo "🗄️  Running database migrations..."
	npm run prisma:generate
	npm run prisma:migrate:deploy
	@echo "✅ Migrations applied"

migrate:dev: ## Create new migration (development)
	@echo "🗄️  Creating new migration..."
	@read -p "Migration name: " name; \
	npm run prisma:migrate dev --name $$name

migrate:reset: ## Reset database (WARNING: Deletes all data)
	@echo "⚠️  WARNING: This will delete all data!"
	@read -p "Are you sure? Type 'yes' to continue: " confirm; \
	if [ "$$confirm" = "yes" ]; then \
		npm run prisma:migrate reset; \
		echo "✅ Database reset complete"; \
	else \
		echo "❌ Reset cancelled"; \
	fi

migrate:status: ## Check migration status
	@echo "📊 Checking migration status..."
	npm run prisma:migrate status

# ============================================================================
# DATABASE UTILITIES
# ============================================================================

seed: ## Seed database with sample data
	@echo "🌱 Seeding database..."
	npm run seed || echo "⚠️  No seed script available"

studio: ## Open Prisma Studio (Database GUI)
	@echo "🎨 Opening Prisma Studio..."
	npm run prisma:studio

# ============================================================================
# TESTING
# ============================================================================

test: ## Run all tests
	@echo "🧪 Running all tests..."
	npm test

test:unit: ## Run unit tests only
	@echo "🧪 Running unit tests..."
	npm run test:unit

test:integration: ## Run integration tests only
	@echo "🧪 Running integration tests..."
	npm run test:integration

test:e2e: ## Run e2e tests only
	@echo "🧪 Running e2e tests..."
	npm run test:e2e

test:watch: ## Run tests in watch mode
	@echo "🧪 Running tests in watch mode..."
	npm run test:watch

test:coverage: ## Run tests with coverage report
	@echo "🧪 Running tests with coverage..."
	npm run test:coverage

# ============================================================================
# CODE QUALITY
# ============================================================================

lint: ## Lint code with ESLint
	@echo "🔍 Linting code..."
	npm run lint

lint:fix: ## Fix linting issues automatically
	@echo "🔧 Fixing linting issues..."
	npm run lint:fix

format: ## Format code with Prettier
	@echo "💅 Formatting code..."
	npx prettier --write "**/*.{ts,js,json,md}" || echo "⚠️  Prettier not installed"

# ============================================================================
# CLEANING
# ============================================================================

clean: ## Clean build artifacts (dist, coverage, Prisma cache)
	@echo "🧹 Cleaning build artifacts..."
	rm -rf dist
	rm -rf node_modules/.prisma
	rm -rf coverage
	rm -rf .jest
	@echo "✅ Clean complete"

clean:all: ## Clean everything including node_modules (WARNING: Requires reinstall)
	@echo "🧹 Cleaning everything..."
	rm -rf dist
	rm -rf node_modules/.prisma
	rm -rf coverage
	rm -rf .jest
	rm -rf node_modules
	@echo "✅ Everything cleaned. Run 'make install' to reinstall dependencies."

clean:docker: ## Clean Docker containers, volumes, and images
	@echo "🧹 Cleaning Docker resources..."
	docker-compose down -v
	@echo "✅ Docker resources cleaned"

clean:logs: ## Clean log files
	@echo "🧹 Cleaning log files..."
	find . -name "*.log" -type f -delete
	rm -rf logs
	@echo "✅ Log files cleaned"

# ============================================================================
# DOCKER COMMANDS
# ============================================================================

docker-build: ## Build Docker image
	@echo "🐳 Building Docker image..."
	docker-compose build payment-service
	@echo "✅ Docker image built"

docker-up: ## Start services with docker-compose
	@echo "🐳 Starting Docker services..."
	docker-compose up -d
	@echo "✅ Services started. Run 'make docker-logs' to view logs."

docker-down: ## Stop docker-compose services
	@echo "🐳 Stopping Docker services..."
	docker-compose down
	@echo "✅ Services stopped"

docker-logs: ## View docker-compose logs (follow mode)
	@echo "📋 Viewing Docker logs (Ctrl+C to exit)..."
	docker-compose logs -f

docker-restart: ## Restart docker-compose services
	@echo "🔄 Restarting Docker services..."
	docker-compose restart
	@echo "✅ Services restarted"

docker-clean: ## Stop and remove containers, volumes (WARNING: Deletes data)
	@echo "⚠️  WARNING: This will delete all Docker volumes and data!"
	@read -p "Are you sure? Type 'yes' to continue: " confirm; \
	if [ "$$confirm" = "yes" ]; then \
		docker-compose down -v; \
		echo "✅ Docker resources cleaned"; \
	else \
		echo "❌ Clean cancelled"; \
	fi

docker:setup: ## Complete Docker setup (build, up, wait, migrate)
	@echo "🐳 Starting complete Docker setup..."
	@echo "📦 Step 1/5: Building Docker image..."
	make docker-build
	@echo "🚀 Step 2/5: Starting services..."
	make docker-up
	@echo "⏳ Step 3/5: Waiting for services to be ready..."
	@sleep 10
	@echo "🗄️  Step 4/5: Running database migrations..."
	@docker-compose exec -T payment-service npm run prisma:migrate:deploy || echo "⚠️  Migration failed - check logs"
	@echo "✅ Step 5/5: Docker setup complete!"
	@echo ""
	@echo "📝 Services are running:"
	@echo "   - Payment Service: http://localhost:3005"
	@echo "   - PostgreSQL: localhost:5435"
	@echo "   - Redis: localhost:6385"

# ============================================================================
# UTILITY COMMANDS
# ============================================================================

prisma:generate: ## Generate Prisma Client
	@echo "🔧 Generating Prisma Client..."
	npm run prisma:generate
	@echo "✅ Prisma Client generated"

prisma:studio: ## Open Prisma Studio
	@echo "🎨 Opening Prisma Studio..."
	npm run prisma:studio

status: ## Show project status
	@echo "📊 Project Status"
	@echo "=================="
	@echo "Node version: $$(node --version)"
	@echo "NPM version: $$(npm --version)"
	@echo ""
	@if [ -f .env ]; then \
		echo "✅ .env file exists"; \
	else \
		echo "⚠️  .env file not found (run 'make setup:local')"; \
	fi
	@if [ -d node_modules ]; then \
		echo "✅ Dependencies installed"; \
	else \
		echo "⚠️  Dependencies not installed (run 'make install')"; \
	fi
	@if [ -d dist ]; then \
		echo "✅ Build artifacts exist"; \
	else \
		echo "ℹ️  Not built yet (run 'make build')"; \
	fi

