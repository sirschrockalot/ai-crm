#!/bin/bash

# Development Environment Setup Script for AI CRM
# This script sets up and runs the entire application in development mode

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

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if Docker is running
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    print_success "Docker is running"
}

# Function to check if Node.js is installed
check_node() {
    if ! command_exists node; then
        print_error "Node.js is not installed. Please install Node.js 18+ and try again."
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node --version)"
        exit 1
    fi
    print_success "Node.js $(node --version) is installed"
}

# Function to setup environment files
setup_env() {
    print_status "Setting up environment files..."
    
    # Create .env file if it doesn't exist
    if [ ! -f .env ]; then
        if [ -f env.dev ]; then
            cp env.dev .env
            print_success "Created .env from env.dev (development configuration)"
        elif [ -f env.local.example ]; then
            cp env.local.example .env
            print_success "Created .env from env.local.example"
        elif [ -f env.example ]; then
            cp env.example .env
            print_success "Created .env from env.example"
        else
            print_warning "No environment template found. You may need to create .env manually."
        fi
    else
        print_success ".env file already exists"
    fi
}

# Function to install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Install backend dependencies
    if [ -d "src/backend" ]; then
        print_status "Installing backend dependencies..."
        cd src/backend
        npm install
        cd ../..
        print_success "Backend dependencies installed"
    fi
    
    # Install frontend dependencies
    if [ -d "src/frontend" ]; then
        print_status "Installing frontend dependencies..."
        cd src/frontend
        npm install
        cd ../..
        print_success "Frontend dependencies installed"
    fi
    
    # Install mobile dependencies
    if [ -d "src/mobile" ]; then
        print_status "Installing mobile dependencies..."
        cd src/mobile
        npm install
        cd ../..
        print_success "Mobile dependencies installed"
    fi
}

# Function to start services
start_services() {
    print_status "Starting development services..."
    
    # Start core services (MongoDB, Redis, etc.)
    print_status "Starting core services..."
    docker-compose -f docker-compose.dev.yml up -d mongo redis meilisearch
    
    # Wait for services to be ready
    print_status "Waiting for services to be ready..."
    sleep 10
    
    # Check if services are running
    if docker-compose -f docker-compose.dev.yml ps | grep -q "Up"; then
        print_success "Core services are running"
    else
        print_error "Failed to start core services"
        exit 1
    fi
}

# Function to start backend
start_backend() {
    print_status "Starting backend in development mode..."
    
    cd src/backend
    
    # Check if backend is already running
    if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
        print_warning "Backend is already running on port 3000"
    else
        # Start backend in background
        npm run start:dev &
        BACKEND_PID=$!
        echo $BACKEND_PID > ../../.backend.pid
        
        # Wait for backend to start
        print_status "Waiting for backend to start..."
        sleep 15
        
        # Check if backend is responding
        if curl -f http://localhost:3000/api/health >/dev/null 2>&1; then
            print_success "Backend is running on http://localhost:3000"
        else
            print_error "Backend failed to start"
            exit 1
        fi
    fi
    
    cd ../..
}

# Function to start frontend
start_frontend() {
    print_status "Starting frontend in development mode..."
    
    cd src/frontend
    
    # Check if frontend is already running
    if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null ; then
        print_warning "Frontend is already running on port 3001"
    else
        # Start frontend in background
        npm run dev &
        FRONTEND_PID=$!
        echo $FRONTEND_PID > ../../.frontend.pid
        
        # Wait for frontend to start
        print_status "Waiting for frontend to start..."
        sleep 10
        
        # Check if frontend is responding
        if curl -f http://localhost:3001 >/dev/null 2>&1; then
            print_success "Frontend is running on http://localhost:3001"
        else
            print_error "Frontend failed to start"
            exit 1
        fi
    fi
    
    cd ../..
}

# Function to start mobile (optional)
start_mobile() {
    if [ "$1" = "--with-mobile" ]; then
        print_status "Starting mobile development server..."
        
        cd src/mobile
        
        # Check if mobile is already running
        if lsof -Pi :19000 -sTCP:LISTEN -t >/dev/null ; then
            print_warning "Mobile server is already running on port 19000"
        else
            # Start mobile in background
            npm start &
            MOBILE_PID=$!
            echo $MOBILE_PID > ../../.mobile.pid
            print_success "Mobile development server started on port 19000"
        fi
        
        cd ../..
    fi
}

# Function to show status
show_status() {
    echo ""
    print_status "Development Environment Status:"
    echo "====================================="
    
    # Check backend
    if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
        print_success "Backend: http://localhost:3000"
    else
        print_error "Backend: Not running"
    fi
    
    # Check frontend
    if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null ; then
        print_success "Frontend: http://localhost:3001"
    else
        print_error "Frontend: Not running"
    fi
    
    # Check mobile
    if lsof -Pi :19000 -sTCP:LISTEN -t >/dev/null ; then
        print_success "Mobile: http://localhost:19000"
    else
        print_warning "Mobile: Not running (use --with-mobile to start)"
    fi
    
    # Check services
    echo ""
    print_status "Docker Services:"
    docker-compose -f docker-compose.dev.yml ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
    
    echo ""
    print_status "Useful URLs:"
    echo "  Frontend: http://localhost:3001"
    echo "  Backend API: http://localhost:3000"
    echo "  API Health: http://localhost:3000/api/health"
    echo "  MongoDB: mongodb://localhost:27017"
    echo "  Redis: redis://localhost:6379"
    echo "  Meilisearch: http://localhost:7700"
}

# Function to cleanup
cleanup() {
    print_status "Cleaning up..."
    
    # Kill background processes
    if [ -f .backend.pid ]; then
        kill $(cat .backend.pid) 2>/dev/null || true
        rm .backend.pid
    fi
    
    if [ -f .frontend.pid ]; then
        kill $(cat .frontend.pid) 2>/dev/null || true
        rm .frontend.pid
    fi
    
    if [ -f .mobile.pid ]; then
        kill $(cat .mobile.pid) 2>/dev/null || true
        rm .mobile.pid
    fi
    
    print_success "Cleanup completed"
}

# Function to stop all services
stop_all() {
    print_status "Stopping all services..."
    
    # Stop background processes
    cleanup
    
    # Stop Docker services
    docker-compose -f docker-compose.dev.yml down
    
    print_success "All services stopped"
}

# Main script logic
main() {
    echo "🚀 AI CRM Development Environment Setup"
    echo "======================================="
    echo ""
    
    # Parse command line arguments
    WITH_MOBILE=false
    STOP_ALL=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --with-mobile)
                WITH_MOBILE=true
                shift
                ;;
            --stop)
                STOP_ALL=true
                shift
                ;;
            --help|-h)
                echo "Usage: $0 [OPTIONS]"
                echo ""
                echo "Options:"
                echo "  --with-mobile    Start mobile development server"
                echo "  --stop          Stop all services and cleanup"
                echo "  --help, -h      Show this help message"
                echo ""
                echo "Examples:"
                echo "  $0                    # Start backend and frontend"
                echo "  $0 --with-mobile      # Start backend, frontend, and mobile"
                echo "  $0 --stop             # Stop all services"
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                echo "Use --help for usage information"
                exit 1
                ;;
        esac
    done
    
    # Handle stop command
    if [ "$STOP_ALL" = true ]; then
        stop_all
        exit 0
    fi
    
    # Check prerequisites
    check_docker
    check_node
    
    # Setup environment
    setup_env
    
    # Install dependencies
    install_dependencies
    
    # Start services
    start_services
    
    # Start applications
    start_backend
    start_frontend
    start_mobile $WITH_MOBILE
    
    # Show status
    show_status
    
    echo ""
    print_success "Development environment is ready!"
    echo ""
    print_status "To stop all services, run: $0 --stop"
    print_status "To view logs, run: docker-compose -f docker-compose.dev.yml logs -f"
    echo ""
    print_warning "Press Ctrl+C to stop the script (services will continue running)"
    
    # Wait for interrupt
    trap cleanup EXIT
    wait
}

# Run main function
main "$@"
