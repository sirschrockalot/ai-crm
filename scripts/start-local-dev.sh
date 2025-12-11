#!/bin/bash

# Local Development Startup Script
# Starts backend services with Docker and frontend locally

set -e

echo "🚀 Starting Presidential Digs CRM for Local Development..."
echo "=========================================================="
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop and try again."
    exit 1
fi

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Start backend services with Docker
echo -e "${BLUE}📦 Step 1: Starting backend services with Docker...${NC}"
cd "$(dirname "$0")/.."

# Start only backend services (not frontend)
docker-compose up -d mongodb redis auth-service leads-service user-management-service timesheet-service transactions-service

echo -e "${GREEN}✅ Backend services starting...${NC}"
echo ""

# Wait for services to be ready
echo -e "${YELLOW}⏳ Waiting for services to initialize (30 seconds)...${NC}"
sleep 30

# Check service status
echo ""
echo -e "${BLUE}📊 Checking service status...${NC}"
docker-compose ps

echo ""
echo -e "${BLUE}🏥 Testing service health endpoints...${NC}"

# Test health endpoints
services=(
    "Auth Service:http://localhost:3001/health"
    "Leads Service:http://localhost:3008/health"
    "User Management:http://localhost:3005/health"
    "Timesheet:http://localhost:3007/health"
)

for service_info in "${services[@]}"; do
    IFS=':' read -r name url <<< "$service_info"
    if curl -s -f --max-time 5 "$url" > /dev/null 2>&1; then
        echo -e "  ${GREEN}✅ $name${NC}"
    else
        echo -e "  ${YELLOW}⚠️  $name (may still be starting)${NC}"
    fi
done

echo ""
echo -e "${BLUE}📦 Step 2: Setting up frontend...${NC}"

# Check if frontend dependencies are installed
if [ ! -d "src/frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd src/frontend
    npm install
    cd ../..
else
    echo "✅ Frontend dependencies already installed"
fi

# Check for .env.local
if [ ! -f "src/frontend/.env.local" ]; then
    echo "📝 Creating .env.local from template..."
    if [ -f "src/frontend/env.template" ]; then
        cp src/frontend/env.template src/frontend/.env.local
        echo "⚠️  Please update src/frontend/.env.local with your configuration"
    fi
fi

echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}🎉 Ready to start frontend!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "To start the frontend, run:"
echo -e "  ${BLUE}cd src/frontend && npm run dev${NC}"
echo ""
echo "Then open:"
echo -e "  ${GREEN}http://localhost:3000${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 Service URLs:"
echo "   Frontend:           http://localhost:3000"
echo "   Auth Service:       http://localhost:3001"
echo "   Leads Service:      http://localhost:3008"
echo "   User Management:    http://localhost:3005"
echo "   Timesheet:          http://localhost:3007"
echo "   MongoDB Express:    http://localhost:8081"
echo "   Redis Commander:   http://localhost:8082"
echo ""
echo "📝 Useful Commands:"
echo "   View logs:          docker-compose logs -f"
echo "   Stop services:      docker-compose down"
echo "   Restart services:   docker-compose restart"
echo "   Check status:       docker-compose ps"
echo ""
echo "🧪 Test Service Health:"
echo "   ./scripts/test-service-health.sh"
echo ""

