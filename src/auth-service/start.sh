#!/bin/bash

# Startup script for DealCycle CRM Authentication Service

echo "🚀 Starting DealCycle CRM Authentication Service..."
echo "================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm version: $(npm -v)"

# Check if MongoDB is running (optional)
if command -v mongosh &> /dev/null; then
    if mongosh --eval "db.runCommand('ping')" > /dev/null 2>&1; then
        echo "✅ MongoDB is running"
    else
        echo "⚠️  MongoDB is not running. Starting MongoDB..."
        if command -v docker &> /dev/null; then
            docker run -d -p 27017:27017 --name dealcycle-mongo mongo:6.0
            echo "✅ MongoDB started in Docker"
        else
            echo "⚠️  Docker not available. Please start MongoDB manually."
        fi
    fi
else
    echo "⚠️  MongoDB client not found. Please ensure MongoDB is running."
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies already installed"
fi

# Check if environment file exists
if [ ! -f ".env.local" ] && [ ! -f ".env" ]; then
    echo "📝 Creating environment file..."
    if [ -f "env.development" ]; then
        cp env.development .env.local
        echo "✅ Environment file created from env.development"
    else
        echo "❌ No environment template found. Please create .env.local manually."
        exit 1
    fi
fi

# Build the application
echo "🔨 Building application..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi
echo "✅ Application built successfully"

# Start the service
echo "🚀 Starting authentication service..."
echo "📍 Service will be available at: http://localhost:3001"
echo "📚 API documentation: http://localhost:3001/api/auth"
echo "🏥 Health check: http://localhost:3001/api/auth/health"
echo ""
echo "Press Ctrl+C to stop the service"
echo ""

npm run start:dev
