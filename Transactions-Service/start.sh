#!/bin/bash

# Transactions Service Startup Script

echo "🚀 Starting Transactions Service..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📋 Creating .env file from template..."
    cp env.example .env
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Create uploads directory
mkdir -p uploads

# Start the service
echo "🎯 Starting Transactions Service on port 3003..."
npm run start:dev
