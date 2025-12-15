#!/bin/bash

# Local Development Stop Script

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🛑 Stopping Local Development Services${NC}"
echo ""

# Function to stop a service
stop_service() {
    local service_name=$1
    local pid_file="/tmp/${service_name// /_}.pid"
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if ps -p $pid > /dev/null 2>&1; then
            echo -e "${YELLOW}Stopping ${service_name} (PID: ${pid})...${NC}"
            kill $pid 2>/dev/null || true
            sleep 1
            # Force kill if still running
            if ps -p $pid > /dev/null 2>&1; then
                kill -9 $pid 2>/dev/null || true
            fi
            rm -f "$pid_file"
            echo -e "${GREEN}✅ ${service_name} stopped${NC}"
        else
            echo -e "${YELLOW}⚠️  ${service_name} process not found${NC}"
            rm -f "$pid_file"
        fi
    else
        echo -e "${YELLOW}⚠️  ${service_name} PID file not found${NC}"
    fi
}

# Stop services
stop_service "AuthService"
stop_service "TimesheetService"
stop_service "Frontend"

# Also kill any processes on the ports
echo ""
echo -e "${YELLOW}Checking for processes on service ports...${NC}"

for port in 3000 3001 3007; do
    pid=$(lsof -ti :${port} 2>/dev/null || true)
    if [ ! -z "$pid" ]; then
        echo -e "${YELLOW}Killing process on port ${port} (PID: ${pid})...${NC}"
        kill $pid 2>/dev/null || true
    fi
done

echo ""
echo -e "${GREEN}✅ All local services stopped${NC}"

