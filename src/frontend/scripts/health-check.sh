#!/bin/bash

# Health check script for DealCycle CRM Frontend
# Usage: ./scripts/health-check.sh [environment]

set -e

# Default environment
ENVIRONMENT=${1:-staging}

echo "🏥 Performing health check for $ENVIRONMENT environment..."

# Load environment variables
if [ -f "env.$ENVIRONMENT" ]; then
    export $(cat env.$ENVIRONMENT | grep -v '^#' | xargs)
fi

# Set URLs based on environment
case $ENVIRONMENT in
    development)
        BASE_URL="http://localhost:3001"
        ;;
    staging)
        BASE_URL="https://staging.dealcycle.com"
        ;;
    production)
        BASE_URL="https://app.dealcycle.com"
        ;;
    *)
        echo "❌ Invalid environment: $ENVIRONMENT"
        exit 1
        ;;
esac

# Health check endpoints
ENDPOINTS=(
    "/api/health"
    "/"
    "/dashboard"
    "/leads"
)

# Function to check endpoint
check_endpoint() {
    local url=$1
    local timeout=${2:-10}
    
    echo "🔍 Checking: $url"
    
    # Check if endpoint is accessible
    if curl -f -s --max-time $timeout "$url" > /dev/null; then
        echo "✅ $url - OK"
        return 0
    else
        echo "❌ $url - FAILED"
        return 1
    fi
}

# Function to check response time
check_response_time() {
    local url=$1
    local timeout=${2:-10}
    
    echo "⏱️  Checking response time for: $url"
    
    # Measure response time
    local start_time=$(date +%s%N)
    if curl -f -s --max-time $timeout "$url" > /dev/null; then
        local end_time=$(date +%s%N)
        local duration=$(( (end_time - start_time) / 1000000 ))
        echo "⏱️  Response time: ${duration}ms"
        
        # Check if response time is acceptable
        if [ $duration -lt 2000 ]; then
            echo "✅ Response time is acceptable"
            return 0
        else
            echo "⚠️  Response time is slow: ${duration}ms"
            return 1
        fi
    else
        echo "❌ Failed to measure response time"
        return 1
    fi
}

# Function to check SSL certificate (for HTTPS)
check_ssl() {
    if [[ $BASE_URL == https://* ]]; then
        echo "🔒 Checking SSL certificate..."
        if echo | openssl s_client -servername $(echo $BASE_URL | sed 's|https://||') -connect $(echo $BASE_URL | sed 's|https://||'):443 2>/dev/null | openssl x509 -noout -dates > /dev/null; then
            echo "✅ SSL certificate is valid"
            return 0
        else
            echo "❌ SSL certificate is invalid or expired"
            return 1
        fi
    else
        echo "ℹ️  Skipping SSL check (not HTTPS)"
        return 0
    fi
}

# Main health check
echo "🚀 Starting health check for $BASE_URL"

# Check SSL certificate
check_ssl

# Check all endpoints
FAILED_CHECKS=0
for endpoint in "${ENDPOINTS[@]}"; do
    if ! check_endpoint "$BASE_URL$endpoint"; then
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
    fi
done

# Check response times for critical endpoints
echo "⏱️  Checking response times for critical endpoints..."
for endpoint in "/api/health" "/"; do
    if ! check_response_time "$BASE_URL$endpoint"; then
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
    fi
done

# Check if application is serving static assets
echo "📦 Checking static assets..."
if curl -f -s --max-time 10 "$BASE_URL/_next/static/chunks/pages/_app.js" > /dev/null; then
    echo "✅ Static assets are being served"
else
    echo "❌ Static assets are not accessible"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
fi

# Check if application is serving images
echo "🖼️  Checking image optimization..."
if curl -f -s --max-time 10 "$BASE_URL/_next/image" > /dev/null; then
    echo "✅ Image optimization is working"
else
    echo "❌ Image optimization is not accessible"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
fi

# Summary
echo "📊 Health check summary:"
if [ $FAILED_CHECKS -eq 0 ]; then
    echo "✅ All health checks passed!"
    echo "🎉 Application is healthy and ready for use"
    exit 0
else
    echo "❌ $FAILED_CHECKS health check(s) failed"
    echo "⚠️  Application may have issues"
    exit 1
fi 