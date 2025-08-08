#!/bin/bash

# Deployment script for DealCycle CRM Frontend
# Usage: ./scripts/deploy.sh [environment] [version]

set -e

# Default values
ENVIRONMENT=${1:-staging}
VERSION=${2:-$(date +%Y%m%d-%H%M%S)}

echo "🚀 Deploying DealCycle CRM Frontend"
echo "Environment: $ENVIRONMENT"
echo "Version: $VERSION"

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(staging|production)$ ]]; then
    echo "❌ Invalid environment: $ENVIRONMENT"
    echo "Valid environments: staging, production"
    exit 1
fi

# Load environment variables
if [ -f "env.$ENVIRONMENT" ]; then
    echo "📋 Loading environment configuration from env.$ENVIRONMENT"
    export $(cat env.$ENVIRONMENT | grep -v '^#' | xargs)
else
    echo "❌ Environment file env.$ENVIRONMENT not found"
    exit 1
fi

# Build the application
echo "🏗️  Building application for $ENVIRONMENT..."
./scripts/build.sh $ENVIRONMENT

# Build Docker image
echo "🐳 Building Docker image..."
docker build -t dealcycle-frontend:$VERSION .

# Tag image for environment
docker tag dealcycle-frontend:$VERSION dealcycle-frontend:$ENVIRONMENT-latest

# Push to registry (if configured)
if [ ! -z "$DOCKER_REGISTRY" ]; then
    echo "📤 Pushing to registry..."
    docker tag dealcycle-frontend:$VERSION $DOCKER_REGISTRY/dealcycle-frontend:$VERSION
    docker tag dealcycle-frontend:$VERSION $DOCKER_REGISTRY/dealcycle-frontend:$ENVIRONMENT-latest
    docker push $DOCKER_REGISTRY/dealcycle-frontend:$VERSION
    docker push $DOCKER_REGISTRY/dealcycle-frontend:$ENVIRONMENT-latest
fi

# Deploy to environment
echo "🚀 Deploying to $ENVIRONMENT..."

case $ENVIRONMENT in
    staging)
        # Deploy to staging
        echo "📋 Deploying to staging environment..."
        
        # Update Kubernetes deployment
        if command -v kubectl &> /dev/null; then
            kubectl set image deployment/dealcycle-frontend-staging \
                dealcycle-frontend=$DOCKER_REGISTRY/dealcycle-frontend:$VERSION \
                --namespace=dealcycle-staging
            
            # Wait for rollout
            kubectl rollout status deployment/dealcycle-frontend-staging \
                --namespace=dealcycle-staging --timeout=300s
        else
            echo "⚠️  kubectl not found, skipping Kubernetes deployment"
        fi
        
        # Health check
        echo "🏥 Performing health check..."
        ./scripts/health-check.sh staging
        
        echo "✅ Staging deployment completed successfully!"
        ;;
        
    production)
        # Deploy to production
        echo "📋 Deploying to production environment..."
        
        # Confirm deployment
        read -p "Are you sure you want to deploy to production? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "❌ Deployment cancelled"
            exit 1
        fi
        
        # Update Kubernetes deployment
        if command -v kubectl &> /dev/null; then
            kubectl set image deployment/dealcycle-frontend-production \
                dealcycle-frontend=$DOCKER_REGISTRY/dealcycle-frontend:$VERSION \
                --namespace=dealcycle-production
            
            # Wait for rollout
            kubectl rollout status deployment/dealcycle-frontend-production \
                --namespace=dealcycle-production --timeout=300s
        else
            echo "⚠️  kubectl not found, skipping Kubernetes deployment"
        fi
        
        # Health check
        echo "🏥 Performing health check..."
        ./scripts/health-check.sh production
        
        echo "✅ Production deployment completed successfully!"
        ;;
esac

# Send notification
echo "📧 Sending deployment notification..."
if [ ! -z "$SLACK_WEBHOOK_URL" ]; then
    curl -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"✅ DealCycle Frontend v$VERSION deployed to $ENVIRONMENT successfully!\"}" \
        $SLACK_WEBHOOK_URL
fi

echo "🎉 Deployment completed successfully!"
echo "Version: $VERSION"
echo "Environment: $ENVIRONMENT" 