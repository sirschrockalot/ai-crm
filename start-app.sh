#!/bin/bash

echo "🚀 Starting AI CRM Frontend Application..."
echo "=========================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
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

# Check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_warning "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    print_success "Docker is running"
}

# Start required services
start_services() {
    print_status "Starting required services (MongoDB, Redis)..."
    docker-compose up -d mongo redis
    sleep 5  # Wait for services to be ready
    print_success "Services started"
}

# Start frontend
start_frontend() {
    print_status "Starting frontend..."
    cd src/frontend
    
    # Try to start with npm
    if npm run dev > /dev/null 2>&1 & then
        FRONTEND_PID=$!
        print_success "Frontend started (PID: $FRONTEND_PID)"
    else
        print_warning "Failed to start frontend with npm, trying alternative method..."
        # Try with npx
        if npx next dev -p 3001 > /dev/null 2>&1 & then
            FRONTEND_PID=$!
            print_success "Frontend started with npx (PID: $FRONTEND_PID)"
        else
            print_warning "Failed to start frontend. Please check the frontend directory."
        fi
    fi
    
    cd ../..
}

# Check if services are running
check_services() {
    print_status "Checking if services are running..."
    
    # Wait a bit for services to start
    sleep 10
    
    # Check frontend
    if curl -f http://localhost:3001 > /dev/null 2>&1; then
        print_success "Frontend is running on http://localhost:3001"
    else
        print_warning "Frontend is not responding on http://localhost:3001"
    fi
}

# Main execution
main() {
    echo "🚀 Starting AI CRM Frontend Application..."
    
    # Check prerequisites
    check_docker
    
    # Start services
    start_services
    
    # Start applications
    start_frontend
    
    # Check if everything is running
    check_services
    
    echo ""
    echo "🎉 Application startup completed!"
    echo "📱 Frontend: http://localhost:3001"
    echo ""
    echo "Press Ctrl+C to stop all services"
    
    # Keep script running
    wait
}

# Handle cleanup on exit
cleanup() {
    echo ""
    print_status "Stopping services..."
    
    # Kill background processes
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
    fi
    
    print_success "Services stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Run main function
main "$@"
