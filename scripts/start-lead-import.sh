#!/bin/bash

# Start Lead Import Service
echo "Starting Lead Import Service..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Error: Docker is not running. Please start Docker first."
    exit 1
fi

# Navigate to project root
cd "$(dirname "$0")/.."

# Check if lead-import-service directory exists
if [ ! -d "src/lead-import-service" ]; then
    echo "Error: lead-import-service directory not found."
    echo "Please ensure the lead-import-service is properly set up."
    exit 1
fi

# Start the service using docker-compose
echo "Starting services with docker-compose..."
docker-compose -f docker-compose.lead-import.yml up --build -d

echo "Lead Import Service is starting on http://localhost:3003"
echo "MongoDB is starting on localhost:27017"
echo ""
echo "To view logs: docker-compose -f docker-compose.lead-import.yml logs -f"
echo "To stop: docker-compose -f docker-compose.lead-import.yml down"
echo ""
echo "Frontend should be configured to use:"
echo "NEXT_PUBLIC_LEAD_IMPORT_SERVICE_URL=http://localhost:3003"
