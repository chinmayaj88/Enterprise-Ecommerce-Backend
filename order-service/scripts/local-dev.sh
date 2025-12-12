#!/bin/bash

# One-command local development setup
# Run with: bash scripts/local-dev.sh

set -e

echo "🚀 Setting up local development environment..."

# Check if .env exists
if [ ! -f .env ]; then
  echo "📝 Creating .env file from .env.example..."
  cp .env.example .env 2>/dev/null || echo "⚠️  .env.example not found, please create .env manually"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npm run prisma:generate

# Run migrations
echo "🗄️  Running database migrations..."
npm run prisma:migrate

# Seed database (optional)
read -p "Do you want to seed the database? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "🌱 Seeding database..."
  npm run seed
fi

echo "✅ Setup complete! Run 'npm run dev' to start the server."

