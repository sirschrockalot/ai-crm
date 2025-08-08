#!/bin/bash

# Build script for DealCycle CRM Frontend
# Usage: ./scripts/build.sh [environment]

set -e

# Default environment
ENVIRONMENT=${1:-development}

echo "🚀 Building DealCycle CRM Frontend for environment: $ENVIRONMENT"

# Load environment variables
if [ -f "env.$ENVIRONMENT" ]; then
    echo "📋 Loading environment configuration from env.$ENVIRONMENT"
    export $(cat env.$ENVIRONMENT | grep -v '^#' | xargs)
else
    echo "⚠️  Environment file env.$ENVIRONMENT not found, using defaults"
fi

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(development|staging|production)$ ]]; then
    echo "❌ Invalid environment: $ENVIRONMENT"
    echo "Valid environments: development, staging, production"
    exit 1
fi

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf .next
rm -rf out
rm -rf coverage

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Type checking
echo "🔍 Running TypeScript type checking..."
npm run type-check

# Linting
echo "🔍 Running ESLint..."
npm run lint

# Testing
echo "🧪 Running tests..."
npm run test:coverage

# Build application
echo "🏗️  Building application for $ENVIRONMENT..."
NODE_ENV=$ENVIRONMENT npm run build

# Bundle analysis (if enabled)
if [ "$ANALYZE" = "true" ]; then
    echo "📊 Running bundle analysis..."
    ANALYZE=true npm run build
fi

# Build Storybook
echo "📚 Building Storybook..."
npm run build-storybook

# Validate build output
echo "✅ Validating build output..."
if [ -d ".next" ]; then
    echo "✅ Next.js build completed successfully"
else
    echo "❌ Next.js build failed"
    exit 1
fi

# Check bundle size
echo "📏 Checking bundle size..."
if command -v npx &> /dev/null; then
    npx @next/bundle-analyzer .next/static/chunks/*.js --json | head -20
fi

echo "🎉 Build completed successfully for $ENVIRONMENT environment!"
echo "📁 Build output: .next/"
echo "📚 Storybook output: storybook-static/" 