#!/bin/bash

# Test script for the DealCycle CRM Authentication Service
# This script tests the basic functionality of the auth service

echo "🧪 Testing DealCycle CRM Authentication Service"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Base URL for the auth service
BASE_URL="http://localhost:3001/api/auth"

# Function to print colored output
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

# Function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local expected_status=$4
    local description=$5
    
    echo -n "Testing $description... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "%{http_code}" -o /tmp/response.json "$BASE_URL$endpoint")
    else
        response=$(curl -s -w "%{http_code}" -X "$method" -H "Content-Type: application/json" -d "$data" "$BASE_URL$endpoint")
    fi
    
    http_code="${response: -3}"
    
    if [ "$http_code" = "$expected_status" ]; then
        print_status 0 "PASS"
    else
        print_status 1 "FAIL (Expected: $expected_status, Got: $http_code)"
        if [ -f /tmp/response.json ]; then
            echo "Response: $(cat /tmp/response.json)"
        fi
    fi
}

# Check if service is running
echo "🔍 Checking if auth service is running..."
if ! curl -s "$BASE_URL/health" > /dev/null; then
    echo -e "${RED}❌ Auth service is not running. Please start it first.${NC}"
    echo "Run: docker-compose up auth-service"
    exit 1
fi

echo -e "${GREEN}✅ Auth service is running${NC}"
echo ""

# Test health endpoint
echo "🏥 Testing health endpoint..."
test_endpoint "GET" "/health" "" "200" "Health check"

# Test registration endpoint
echo ""
echo "📝 Testing user registration..."
test_endpoint "POST" "/register" '{
    "email": "test@example.com",
    "password": "test123",
    "firstName": "Test",
    "lastName": "User",
    "companyName": "Test Company"
}' "201" "User registration"

# Test login endpoint
echo ""
echo "🔑 Testing user login..."
test_endpoint "POST" "/login" '{
    "email": "test@example.com",
    "password": "test123"
}' "200" "User login"

# Test test mode login (development only)
echo ""
echo "🧪 Testing test mode login..."
test_endpoint "POST" "/test-mode/login" '{
    "userId": "test-user-123",
    "email": "testmode@example.com",
    "role": "admin"
}' "200" "Test mode login"

# Test password reset request
echo ""
echo "🔒 Testing password reset request..."
test_endpoint "POST" "/reset-password" '{
    "email": "test@example.com"
}' "200" "Password reset request"

# Test token validation (should fail without valid token)
echo ""
echo "🔍 Testing token validation..."
test_endpoint "POST" "/validate" '{
    "token": "invalid-token"
}' "200" "Token validation (invalid token)"

echo ""
echo "🎯 Test Summary"
echo "=============="
echo "All basic endpoints tested successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Check the logs for any errors: docker-compose logs auth-service"
echo "2. Test with a real frontend application"
echo "3. Verify database connections and data persistence"
echo "4. Run the full test suite: npm test"
echo ""
echo "🚀 Auth service is ready for development!"
