#!/bin/bash

# Service Health Test Script
# Tests all backend services to verify they're running and accessible

echo "🔍 Testing Backend Service Health..."
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Service URLs (update these if your services run on different ports)
AUTH_SERVICE="http://localhost:3001/health"
LEADS_SERVICE="http://localhost:3008/health"
USER_MGMT_SERVICE="http://localhost:3005/health"
TIMESHEET_SERVICE="http://localhost:3007/health"

# Function to test a service
test_service() {
    local service_name=$1
    local service_url=$2
    
    echo -n "Testing $service_name... "
    
    # Try to fetch the health endpoint
    response=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$service_url" 2>/dev/null)
    
    if [ "$response" = "200" ]; then
        echo -e "${GREEN}✓ Healthy${NC}"
        return 0
    elif [ "$response" = "000" ]; then
        echo -e "${RED}✗ Unreachable (service may not be running)${NC}"
        return 1
    else
        echo -e "${YELLOW}⚠ Responded with HTTP $response${NC}"
        return 1
    fi
}

# Test all services
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_service "Auth Service" "$AUTH_SERVICE"
test_service "Leads Service" "$LEADS_SERVICE"
test_service "User Management Service" "$USER_MGMT_SERVICE"
test_service "Timesheet Service" "$TIMESHEET_SERVICE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Summary
healthy_count=0
total_count=4

for service_url in "$AUTH_SERVICE" "$LEADS_SERVICE" "$USER_MGMT_SERVICE" "$TIMESHEET_SERVICE"; do
    response=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$service_url" 2>/dev/null)
    if [ "$response" = "200" ]; then
        ((healthy_count++))
    fi
done

echo "Summary: $healthy_count/$total_count services healthy"
echo ""

if [ $healthy_count -eq $total_count ]; then
    echo -e "${GREEN}✅ All services are healthy!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Start the frontend: cd src/frontend && npm run dev"
    echo "2. Navigate to http://localhost:3001/admin"
    echo "3. Click on 'System Monitoring' tab"
    echo "4. View the Service Health Status component"
    exit 0
elif [ $healthy_count -eq 0 ]; then
    echo -e "${RED}❌ No services are responding${NC}"
    echo ""
    echo "Troubleshooting:"
    echo "1. Check if services are running:"
    echo "   - Auth Service: lsof -i :3001"
    echo "   - Leads Service: lsof -i :3008"
    echo "   - User Management: lsof -i :3005"
    echo "   - Timesheet: lsof -i :3007"
    echo ""
    echo "2. Start services if not running"
    echo "3. Check service logs for errors"
    exit 1
else
    echo -e "${YELLOW}⚠️  Some services are unhealthy${NC}"
    echo ""
    echo "Check the services marked as unhealthy above"
    exit 1
fi

