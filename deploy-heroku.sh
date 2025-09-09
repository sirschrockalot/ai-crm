#!/bin/bash

# Heroku Deployment Script for Presidential Digs CRM
# This script helps deploy the CRM application to Heroku

set -e

echo "🚀 Starting Heroku deployment for Presidential Digs CRM..."

# Check if Heroku CLI is installed
if ! command -v heroku &> /dev/null; then
    echo "❌ Heroku CLI is not installed. Please install it first:"
    echo "   https://devcenter.heroku.com/articles/heroku-cli"
    exit 1
fi

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Not in a git repository. Please run this script from the project root."
    exit 1
fi

# Get app name from user or use default
APP_NAME=${1:-"presidential-digs-crm"}

echo "📱 Deploying to Heroku app: $APP_NAME"

# Check if app exists
if ! heroku apps:info -a $APP_NAME &> /dev/null; then
    echo "📝 Creating new Heroku app: $APP_NAME"
    heroku create $APP_NAME
else
    echo "✅ Using existing Heroku app: $APP_NAME"
fi

# Set environment variables
echo "🔧 Setting environment variables..."
heroku config:set NODE_ENV=production -a $APP_NAME
heroku config:set NEXT_PUBLIC_BYPASS_AUTH=true -a $APP_NAME

# Set service URLs (update these with your actual service URLs)
echo "🌐 Setting service URLs..."
heroku config:set NEXT_PUBLIC_TRANSACTIONS_API_URL=https://your-transactions-service.herokuapp.com/api/v1 -a $APP_NAME
heroku config:set NEXT_PUBLIC_BUYERS_API_URL=https://your-buyers-service.herokuapp.com/api/v1 -a $APP_NAME
heroku config:set NEXT_PUBLIC_AUTH_API_URL=https://your-auth-service.herokuapp.com/api/v1 -a $APP_NAME

# Add Heroku remote if it doesn't exist
if ! git remote | grep -q heroku; then
    echo "🔗 Adding Heroku remote..."
    heroku git:remote -a $APP_NAME
fi

# Deploy to Heroku
echo "🚀 Deploying to Heroku..."
git push heroku main

# Open the app
echo "🌍 Opening the deployed application..."
heroku open -a $APP_NAME

echo "✅ Deployment complete!"
echo "📊 View logs with: heroku logs --tail -a $APP_NAME"
echo "🔧 Manage app at: https://dashboard.heroku.com/apps/$APP_NAME"
