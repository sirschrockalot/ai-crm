#!/bin/bash

# Quick Test Script for AI CRM
# This script provides quick testing options

echo "🧪 AI CRM Quick Test Menu"
echo "========================="
echo ""
echo "Choose an option:"
echo "1. Test Backend Only"
echo "2. Test Frontend Only"
echo "3. Test Both (Backend + Frontend)"
echo "4. Run E2E Tests"
echo "5. Test API Endpoints"
echo "6. Check Services Status"
echo "7. Run All Tests (Full Suite)"
echo "8. Exit"
echo ""

read -p "Enter your choice (1-8): " choice

case $choice in
    1)
        echo "🔧 Testing Backend..."
        cd src/backend
        npm test
        cd ../..
        ;;
    2)
        echo "🎨 Testing Frontend..."
        cd src/frontend
        npm test
        cd ../..
        ;;
    3)
        echo "🔧 Testing Backend..."
        cd src/backend
        npm test
        cd ../..
        echo "🎨 Testing Frontend..."
        cd src/frontend
        npm test
        cd ../..
        ;;
    4)
        echo "🌐 Running E2E Tests..."
        cd src/frontend
        npm run test:e2e
        cd ../..
        ;;
    5)
        echo "🔌 Testing API Endpoints..."
        echo "Testing health endpoint..."
        curl -f http://localhost:3000/api/health || echo "Backend not running"
        ;;
    6)
        echo "🔍 Checking Services Status..."
        docker-compose ps
        ;;
    7)
        echo "🚀 Running Full Test Suite..."
        ./scripts/test-all.sh
        ;;
    8)
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo "✅ Test completed!"
