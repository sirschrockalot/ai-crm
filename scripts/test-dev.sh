#!/bin/bash

# Test Development Environment Script
# This script tests if the development environment is working correctly

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to test if a service is running
test_service() {
    local service_name=$1
    local url=$2
    local expected_status=${3:-200}
    
    print_status "Testing $service_name..."
    
    if curl -f -s "$url" >/dev/null 2>&1; then
        print_success "$service_name is running at $url"
        return 0
    else
        print_error "$service_name is not responding at $url"
        return 1
    fi
}

# Function to test database connection
test_database() {
    print_status "Testing database connection..."
    
    if docker-compose -f docker-compose.dev.yml exec -T mongo mongosh --eval "db.adminCommand('ping')" >/dev/null 2>&1; then
        print_success "MongoDB is running and accessible"
        return 0
    else
        print_error "MongoDB is not accessible"
        return 1
    fi
}

# Function to test Redis connection
test_redis() {
    print_status "Testing Redis connection..."
    
    if docker-compose -f docker-compose.dev.yml exec -T redis redis-cli ping >/dev/null 2>&1; then
        print_success "Redis is running and accessible"
        return 0
    else
        print_error "Redis is not accessible"
        return 1
    fi
}

# Main test function
main() {
    echo "🧪 Testing AI CRM Development Environment"
    echo "========================================="
    echo ""
    
    local all_tests_passed=true
    
    # Test Docker services
    print_status "Testing Docker services..."
    if docker-compose -f docker-compose.dev.yml ps | grep -q "Up"; then
        print_success "Docker services are running"
    else
        print_error "Docker services are not running"
        all_tests_passed=false
    fi
    
    # Test database
    if test_database; then
        print_success "Database test passed"
    else
        all_tests_passed=false
    fi
    
    # Test Redis
    if test_redis; then
        print_success "Redis test passed"
    else
        all_tests_passed=false
    fi
    
    # Test backend health endpoint
    if test_service "Backend API" "http://localhost:3000/health" 200; then
        print_success "Backend health check passed"
    else
        all_tests_passed=false
    fi
    
    # Test backend API endpoint
    if test_service "Backend API" "http://localhost:3000/api/health" 200; then
        print_success "Backend API health check passed"
    else
        all_tests_passed=false
    fi
    
    # Test frontend
    if test_service "Frontend" "http://localhost:3001" 200; then
        print_success "Frontend is running"
    else
        all_tests_passed=false
    fi
    
    # Test search service
    if test_service "Meilisearch" "http://localhost:7700/health" 200; then
        print_success "Search service is running"
    else
        all_tests_passed=false
    fi
    
    echo ""
    echo "========================================="
    
    if [ "$all_tests_passed" = true ]; then
        print_success "All tests passed! Development environment is working correctly."
        echo ""
        print_status "You can now access:"
        echo "  Frontend: http://localhost:3001"
        echo "  Backend API: http://localhost:3000"
        echo "  API Health: http://localhost:3000/health"
        echo "  Search: http://localhost:7700"
    else
        print_error "Some tests failed. Please check the development environment setup."
        echo ""
        print_status "Troubleshooting steps:"
        echo "  1. Run: ./scripts/dev.sh --stop"
        echo "  2. Run: ./scripts/dev.sh"
        echo "  3. Wait for all services to start"
        echo "  4. Run this test again: ./scripts/test-dev.sh"
        exit 1
    fi
}

# Run main function
main "$@"
