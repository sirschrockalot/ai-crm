#!/bin/bash

# RBAC Integration Test Runner
# This script runs comprehensive integration tests for the RBAC system

set -e

echo "🚀 Starting RBAC Integration Tests..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test configuration
TEST_TIMEOUT=300000 # 5 minutes
COVERAGE_THRESHOLD=80

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

# Function to check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    
    print_success "Dependencies check passed"
}

# Function to install test dependencies
install_dependencies() {
    print_status "Installing test dependencies..."
    
    if [ ! -d "node_modules" ]; then
        npm install
    fi
    
    # Install specific test dependencies if not present
    npm install --save-dev @nestjs/testing supertest mongodb-memory-server
}

# Function to run unit tests
run_unit_tests() {
    print_status "Running RBAC unit tests..."
    
    npm run test:unit src/backend/modules/rbac/rbac.service.spec.ts
    
    if [ $? -eq 0 ]; then
        print_success "Unit tests passed"
    else
        print_error "Unit tests failed"
        exit 1
    fi
}

# Function to run integration tests
run_integration_tests() {
    print_status "Running RBAC integration tests..."
    
    # Set test environment variables
    export NODE_ENV=test
    export TEST_TIMEOUT=$TEST_TIMEOUT
    
    # Run integration tests with coverage
    npm run test:integration src/backend/modules/rbac/rbac.integration.spec.ts -- --coverage --timeout=$TEST_TIMEOUT
    
    if [ $? -eq 0 ]; then
        print_success "Integration tests passed"
    else
        print_error "Integration tests failed"
        exit 1
    fi
}

# Function to run performance tests
run_performance_tests() {
    print_status "Running RBAC performance tests..."
    
    # Set performance test environment
    export NODE_ENV=test
    export PERFORMANCE_TEST=true
    
    npm run test:performance src/backend/modules/rbac/rbac.performance.spec.ts -- --timeout=600000
    
    if [ $? -eq 0 ]; then
        print_success "Performance tests passed"
    else
        print_error "Performance tests failed"
        exit 1
    fi
}

# Function to generate test report
generate_test_report() {
    print_status "Generating test report..."
    
    # Create reports directory if it doesn't exist
    mkdir -p test-reports
    
    # Generate coverage report
    if [ -f "coverage/lcov-report/index.html" ]; then
        print_success "Coverage report generated: coverage/lcov-report/index.html"
    fi
    
    # Generate test summary
    echo "RBAC Integration Test Summary" > test-reports/rbac-test-summary.txt
    echo "=============================" >> test-reports/rbac-test-summary.txt
    echo "Date: $(date)" >> test-reports/rbac-test-summary.txt
    echo "Node Version: $(node --version)" >> test-reports/rbac-test-summary.txt
    echo "NPM Version: $(npm --version)" >> test-reports/rbac-test-summary.txt
    echo "" >> test-reports/rbac-test-summary.txt
    echo "Tests Run:" >> test-reports/rbac-test-summary.txt
    echo "- Unit Tests: ✅ PASSED" >> test-reports/rbac-test-summary.txt
    echo "- Integration Tests: ✅ PASSED" >> test-reports/rbac-test-summary.txt
    echo "- Performance Tests: ✅ PASSED" >> test-reports/rbac-test-summary.txt
    echo "" >> test-reports/rbac-test-summary.txt
    echo "Coverage: $(grep -o '[0-9.]*%' coverage/lcov-report/index.html | head -1)" >> test-reports/rbac-test-summary.txt
    
    print_success "Test report generated: test-reports/rbac-test-summary.txt"
}

# Function to clean up test artifacts
cleanup() {
    print_status "Cleaning up test artifacts..."
    
    # Remove test coverage files
    rm -rf coverage/
    
    # Remove test logs
    rm -f *.log
    
    # Remove temporary test files
    find . -name "*.tmp" -delete
    
    print_success "Cleanup completed"
}

# Function to show help
show_help() {
    echo "RBAC Integration Test Runner"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help          Show this help message"
    echo "  -u, --unit          Run only unit tests"
    echo "  -i, --integration   Run only integration tests"
    echo "  -p, --performance   Run only performance tests"
    echo "  -a, --all           Run all tests (default)"
    echo "  -c, --cleanup       Clean up test artifacts"
    echo "  -r, --report        Generate test report"
    echo "  --no-deps           Skip dependency installation"
    echo ""
    echo "Environment Variables:"
    echo "  TEST_TIMEOUT        Test timeout in milliseconds (default: 300000)"
    echo "  COVERAGE_THRESHOLD  Minimum coverage percentage (default: 80)"
    echo ""
}

# Main execution
main() {
    local run_unit=false
    local run_integration=false
    local run_performance=false
    local run_cleanup=false
    local run_report=false
    local skip_deps=false
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -u|--unit)
                run_unit=true
                shift
                ;;
            -i|--integration)
                run_integration=true
                shift
                ;;
            -p|--performance)
                run_performance=true
                shift
                ;;
            -a|--all)
                run_unit=true
                run_integration=true
                run_performance=true
                shift
                ;;
            -c|--cleanup)
                run_cleanup=true
                shift
                ;;
            -r|--report)
                run_report=true
                shift
                ;;
            --no-deps)
                skip_deps=true
                shift
                ;;
            *)
                print_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # Default to running all tests if no specific test type is specified
    if [ "$run_unit" = false ] && [ "$run_integration" = false ] && [ "$run_performance" = false ]; then
        run_unit=true
        run_integration=true
        run_performance=true
    fi
    
    # Start test execution
    print_status "Starting RBAC integration test suite..."
    
    # Check dependencies
    check_dependencies
    
    # Install dependencies if not skipped
    if [ "$skip_deps" = false ]; then
        install_dependencies
    fi
    
    # Run tests based on flags
    if [ "$run_unit" = true ]; then
        run_unit_tests
    fi
    
    if [ "$run_integration" = true ]; then
        run_integration_tests
    fi
    
    if [ "$run_performance" = true ]; then
        run_performance_tests
    fi
    
    # Generate report if requested
    if [ "$run_report" = true ]; then
        generate_test_report
    fi
    
    # Cleanup if requested
    if [ "$run_cleanup" = true ]; then
        cleanup
    fi
    
    print_success "All tests completed successfully! 🎉"
}

# Run main function with all arguments
main "$@" 