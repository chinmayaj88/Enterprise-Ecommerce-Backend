.PHONY: help install build dev test lint format clean clean:all clean:docker setup setup:local docker-build docker-up docker-down docker-logs docker-restart docker-clean docker:setup

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

setup: ## Complete local setup (install)
	@echo "🚀 Starting complete setup..."
	@echo "📦 Step 1/2: Installing dependencies..."
	make install
	@echo "✅ Step 2/2: Setup complete!"
	@echo ""
	@echo "📝 Next steps:"
	@echo "   1. Copy .env.example to .env and configure it"
	@echo "   2. Ensure backend services are running"
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
	npm run build
	@echo "✅ Build complete"

# ============================================================================
# TESTING
# ============================================================================

test: ## Run all tests
	@echo "🧪 Running all tests..."
	npm test

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

clean: ## Clean build artifacts (dist, coverage)
	@echo "🧹 Cleaning build artifacts..."
	rm -rf dist
	rm -rf coverage
	rm -rf .jest
	@echo "✅ Clean complete"

clean:all: ## Clean everything including node_modules (WARNING: Requires reinstall)
	@echo "🧹 Cleaning everything..."
	rm -rf dist
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
	docker-compose build gateway-service
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

docker:setup: ## Complete Docker setup (build, up, wait)
	@echo "🐳 Starting complete Docker setup..."
	@echo "📦 Step 1/3: Building Docker image..."
	make docker-build
	@echo "🚀 Step 2/3: Starting services..."
	make docker-up
	@echo "⏳ Step 3/3: Waiting for services to be ready..."
	@sleep 10
	@echo "✅ Docker setup complete!"
	@echo ""
	@echo "📝 Services are running:"
	@echo "   - Gateway Service: http://localhost:3000"
	@echo "   - Redis: localhost:6379"

# ============================================================================
# UTILITY COMMANDS
# ============================================================================

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

