#!/bin/bash

# Local Development Startup Script
# This script starts all services locally without Docker (except MongoDB which can stay in Docker)

set -e

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting Local Development Environment${NC}"
echo ""

# Check if MongoDB is accessible
echo -e "${YELLOW}📊 Checking MongoDB connection...${NC}"
if nc -z localhost 27017 2>/dev/null || lsof -i :27017 >/dev/null 2>&1; then
    echo -e "${GREEN}✅ MongoDB is accessible on port 27017${NC}"
else
    echo -e "${YELLOW}⚠️  MongoDB not found on port 27017${NC}"
    echo "   Starting MongoDB Docker container..."
    docker start crm-mongodb 2>/dev/null || echo -e "${RED}   ❌ Please ensure MongoDB is running${NC}"
fi

# Check if Redis is accessible
echo -e "${YELLOW}📊 Checking Redis connection...${NC}"
if nc -z localhost 6379 2>/dev/null || lsof -i :6379 >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Redis is accessible on port 6379${NC}"
else
    echo -e "${YELLOW}⚠️  Redis not found on port 6379${NC}"
    echo "   Starting Redis Docker container..."
    docker start crm-redis 2>/dev/null || echo -e "${RED}   ❌ Please ensure Redis is running${NC}"
fi

echo ""
echo -e "${BLUE}📦 Starting Services Locally${NC}"
echo ""

# Function to start a service
start_service() {
    local service_name=$1
    local service_path=$2
    local command=$3
    local port=$4
    
    echo -e "${YELLOW}Starting ${service_name}...${NC}"
    
    # Check if port is already in use
    if lsof -Pi :${port} -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        echo -e "${YELLOW}⚠️  Port ${port} is already in use. Skipping ${service_name}${NC}"
        return 1
    fi
    
    # Check if service directory exists
    if [ ! -d "$service_path" ]; then
        echo -e "${RED}❌ Service directory not found: ${service_path}${NC}"
        return 1
    fi
    
    # Check if node_modules exists
    if [ ! -d "$service_path/node_modules" ]; then
        echo -e "${YELLOW}⚠️  node_modules not found. Installing dependencies...${NC}"
        cd "$service_path"
        npm install
        cd "$SCRIPT_DIR"
    fi
    
    # Start in background
    cd "$service_path"
    nohup bash -c "${command}" > "/tmp/${service_name// /_}.log" 2>&1 &
    local pid=$!
    echo $pid > "/tmp/${service_name// /_}.pid"
    
    # Wait a moment to see if it starts successfully
    sleep 2
    if ps -p $pid > /dev/null 2>&1; then
        echo -e "${GREEN}✅ ${service_name} started (PID: ${pid})${NC}"
        echo "   Logs: /tmp/${service_name// /_}.log"
        echo "   Port: ${port}"
        echo ""
        return 0
    else
        echo -e "${RED}❌ ${service_name} failed to start. Check logs: /tmp/${service_name// /_}.log${NC}"
        echo ""
        return 1
    fi
}

# Start Auth Service
AUTH_PATH="../auth-service-repo"
if [ -d "$AUTH_PATH" ]; then
    start_service "AuthService" "$AUTH_PATH" "npm run start:dev" "3001"
else
    echo -e "${YELLOW}⚠️  Auth service repo not found at ${AUTH_PATH}${NC}"
    echo "   Skipping auth service..."
fi

# Start Timesheet Service
TIMESHEET_PATH="../Timesheet-Service"
if [ -d "$TIMESHEET_PATH" ]; then
    start_service "TimesheetService" "$TIMESHEET_PATH" "npm run dev" "3007"
else
    echo -e "${YELLOW}⚠️  Timesheet service repo not found at ${TIMESHEET_PATH}${NC}"
fi

# Start Frontend
FRONTEND_PATH="src/frontend"
if [ ! -d "$FRONTEND_PATH" ]; then
    # Try alternative path
    FRONTEND_PATH="frontend"
fi

if [ -d "$FRONTEND_PATH" ]; then
    start_service "Frontend" "$FRONTEND_PATH" "npm run dev" "3000"
else
    echo -e "${YELLOW}⚠️  Frontend not found. Please start manually:${NC}"
    echo "   cd src/frontend && npm run dev"
fi

echo ""
echo -e "${GREEN}✅ Local development environment started!${NC}"
echo ""
echo -e "${BLUE}📍 Service URLs:${NC}"
echo "   Frontend:         http://localhost:3000"
echo "   Auth Service:     http://localhost:3001"
echo "   Timesheet Service: http://localhost:3007"
echo ""
echo -e "${BLUE}📋 To stop services:${NC}"
echo "   ./stop-local.sh"
echo ""
echo -e "${BLUE}📋 To view logs:${NC}"
echo "   tail -f /tmp/AuthService.log"
echo "   tail -f /tmp/TimesheetService.log"
echo "   tail -f /tmp/Frontend.log"
echo ""
echo -e "${BLUE}💡 Tip: Services will auto-reload on file changes${NC}"

