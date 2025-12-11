#!/bin/bash

# Presidential Digs CRM - Docker Startup Script
# This script starts the entire application using Docker Compose

set -e

echo "🚀 Starting Presidential Digs CRM with Docker..."
echo "=============================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop and try again."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose is not installed. Please install Docker Compose and try again."
    exit 1
fi

# Copy environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "📋 Copying environment configuration..."
    cp .env.docker .env
fi

# Build and start services
echo "🔨 Building and starting services..."
docker-compose up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check service status
echo "📊 Checking service status..."
docker-compose ps

# Test health endpoints
echo "🏥 Testing service health..."
echo "Auth Service: $(curl -s http://localhost:3001/api/v1/health | jq -r '.status // "Not responding"')"
echo "Leads Service: $(curl -s http://localhost:3008/api/v1/health | jq -r '.status // "Not responding"')"
echo "Timesheet Service: $(curl -s http://localhost:3007/api/health | jq -r '.status // "Not responding"')"

echo ""
echo "✅ Presidential Digs CRM is now running!"
echo ""
echo "🌐 Access Points:"
echo "   Frontend:           http://localhost:3000"
echo "   Auth Service API:   http://localhost:3001/api/docs"
echo "   Leads Service API:  http://localhost:3008/api/docs"
echo "   Timesheet API:      http://localhost:3007/api/docs"
echo "   Database Admin:     http://localhost:8081"
echo "   Redis Admin:        http://localhost:8082"
echo ""
echo "📝 Useful Commands:"
echo "   View logs:          docker-compose logs -f"
echo "   Stop services:      docker-compose down"
echo "   Restart services:   docker-compose restart"
echo "   Check status:       docker-compose ps"
echo ""
echo "Happy coding! 🎉"
