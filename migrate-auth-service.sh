#!/bin/bash

# Migration script to move auth-service to its own repository
# This script helps prepare the auth-service for independent deployment

set -e

echo "🚀 Starting Auth Service Migration..."

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

# Check if we're in the right directory
if [ ! -d "src/auth-service" ]; then
    print_error "Auth service directory not found. Please run this script from the project root."
    exit 1
fi

print_status "Preparing auth-service for migration..."

# Create the new auth-service-repo directory if it doesn't exist
if [ ! -d "auth-service-repo" ]; then
    print_status "Creating auth-service-repo directory..."
    mkdir -p auth-service-repo
fi

# Copy auth-service files to the new repository
print_status "Copying auth-service files..."
cp -r src/auth-service/* auth-service-repo/

print_success "Auth service files copied successfully!"

# Update package.json for standalone repository
print_status "Updating package.json for standalone repository..."
if [ -f "auth-service-repo/package.json" ]; then
    # Update the package name and description
    sed -i.bak 's/"name": "@dealcycle\/auth-service"/"name": "dealcycle-auth-service"/' auth-service-repo/package.json
    sed -i.bak 's/"description": "DealCycle CRM Authentication Microservice"/"description": "DealCycle CRM Authentication Microservice - Standalone Repository"/' auth-service-repo/package.json
    
    # Add repository information
    if ! grep -q '"repository"' auth-service-repo/package.json; then
        # Add repository field before the closing brace
        sed -i.bak 's/}/  "repository": {\n    "type": "git",\n    "url": "https:\/\/github.com\/dealcycle\/dealcycle-auth-service.git"\n  },\n}/' auth-service-repo/package.json
    fi
    
    # Add additional scripts
    if ! grep -q '"docker:compose"' auth-service-repo/package.json; then
        # Add new scripts before the closing brace of the scripts object
        sed -i.bak 's/"docker:run": "docker run -p 3001:3001 dealcycle-auth-service"/"docker:run": "docker run -p 3001:3001 dealcycle-auth-service",\n    "docker:compose": "docker-compose up -d",\n    "docker:compose:dev": "docker-compose -f docker-compose.dev.yml up -d",\n    "docker:compose:down": "docker-compose down",\n    "migrate": "npm run build \&\& node dist\/scripts\/migrate.js",\n    "seed": "npm run build \&\& node dist\/scripts\/seed.js",\n    "health": "curl http:\/\/localhost:3001\/api\/auth\/health"/' auth-service-repo/package.json
    fi
    
    print_success "Package.json updated successfully!"
else
    print_error "Package.json not found in auth-service-repo!"
    exit 1
fi

# Create necessary directories
print_status "Creating additional directories..."
mkdir -p auth-service-repo/.github/workflows
mkdir -p auth-service-repo/scripts
mkdir -p auth-service-repo/docs

print_success "Directories created successfully!"

# Create environment files
print_status "Creating environment files..."
if [ ! -f "auth-service-repo/env.example" ]; then
    cat > auth-service-repo/env.example << 'EOF'
# Application Configuration
NODE_ENV=development
PORT=3001

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/dealcycle-auth
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Logging Configuration
LOG_LEVEL=info

# Security Configuration
BCRYPT_ROUNDS=12
THROTTLE_TTL=60
THROTTLE_LIMIT=100

# Redis Configuration (for session storage)
REDIS_URL=redis://localhost:6379

# Email Configuration (for password reset, etc.)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Frontend URLs
FRONTEND_URL=http://localhost:3000
RESET_PASSWORD_URL=http://localhost:3000/auth/reset-password

# Monitoring
ENABLE_METRICS=true
METRICS_PORT=9090
EOF
    print_success "Environment example file created!"
fi

# Create Docker Compose files
print_status "Creating Docker Compose files..."

# Main docker-compose.yml
if [ ! -f "auth-service-repo/docker-compose.yml" ]; then
    cat > auth-service-repo/docker-compose.yml << 'EOF'
version: '3.8'

services:
  auth-service:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
      - MONGODB_URI=mongodb://mongodb:27017/dealcycle-auth
      - JWT_SECRET=${JWT_SECRET}
      - JWT_EXPIRES_IN=24h
      - GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
      - GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
      - CORS_ORIGIN=${CORS_ORIGIN:-http://localhost:3000}
      - LOG_LEVEL=info
    depends_on:
      - mongodb
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/api/auth/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    networks:
      - auth-network

  mongodb:
    image: mongo:6.0
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_ROOT_USERNAME=${MONGO_ROOT_USERNAME:-admin}
      - MONGO_INITDB_ROOT_PASSWORD=${MONGO_ROOT_PASSWORD:-password}
      - MONGO_INITDB_DATABASE=dealcycle-auth
    volumes:
      - mongodb_data:/data/db
    restart: unless-stopped
    networks:
      - auth-network

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped
    networks:
      - auth-network

volumes:
  mongodb_data:
  redis_data:

networks:
  auth-network:
    driver: bridge
EOF
    print_success "Docker Compose file created!"
fi

# Development docker-compose file
if [ ! -f "auth-service-repo/docker-compose.dev.yml" ]; then
    cat > auth-service-repo/docker-compose.dev.yml << 'EOF'
version: '3.8'

services:
  auth-service:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=development
      - PORT=3001
      - MONGODB_URI=mongodb://mongodb:27017/dealcycle-auth-dev
      - JWT_SECRET=dev-secret-key-change-in-production
      - JWT_EXPIRES_IN=24h
      - GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
      - GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
      - CORS_ORIGIN=http://localhost:3000
      - LOG_LEVEL=debug
    volumes:
      - .:/app
      - /app/node_modules
    depends_on:
      - mongodb
    restart: unless-stopped
    command: npm run start:dev
    networks:
      - auth-network

  mongodb:
    image: mongo:6.0
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=password
      - MONGO_INITDB_DATABASE=dealcycle-auth-dev
    volumes:
      - mongodb_dev_data:/data/db
    restart: unless-stopped
    networks:
      - auth-network

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_dev_data:/data
    restart: unless-stopped
    networks:
      - auth-network

  mongo-express:
    image: mongo-express:latest
    ports:
      - "8081:8081"
    environment:
      - ME_CONFIG_MONGODB_ADMINUSERNAME=admin
      - ME_CONFIG_MONGODB_ADMINPASSWORD=password
      - ME_CONFIG_MONGODB_URL=mongodb://admin:password@mongodb:27017/
    depends_on:
      - mongodb
    restart: unless-stopped
    networks:
      - auth-network

volumes:
  mongodb_dev_data:
  redis_dev_data:

networks:
  auth-network:
    driver: bridge
EOF
    print_success "Development Docker Compose file created!"
fi

# Create .gitignore
print_status "Creating .gitignore..."
if [ ! -f "auth-service-repo/.gitignore" ]; then
    cat > auth-service-repo/.gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build outputs
dist/
build/
*.tsbuildinfo

# Environment files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
.env.staging.local

# Logs
logs/
*.log

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# nyc test coverage
.nyc_output

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Microbundle cache
.rpt2_cache/
.rts2_cache_cjs/
.rts2_cache_es/
.rts2_cache_umd/

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# Next.js build output
.next

# Nuxt.js build / generate output
.nuxt

# Storybook build outputs
.out
.storybook-out

# Temporary folders
tmp/
temp/

# Editor directories and files
.vscode/
.idea/
*.swp
*.swo
*~

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Docker
.dockerignore

# Terraform
*.tfstate
*.tfstate.*
.terraform/
.terraform.lock.hcl

# Kubernetes
*.kubeconfig

# Local development
.local/
EOF
    print_success ".gitignore created!"
fi

print_success "Auth service migration completed successfully!"

echo ""
echo "📋 Next Steps:"
echo "1. Create a new GitHub repository: dealcycle-auth-service"
echo "2. Push the auth-service-repo contents to the new repository"
echo "3. Set up GitHub Secrets for CI/CD:"
echo "   - STAGING_MONGODB_URI"
echo "   - STAGING_JWT_SECRET"
echo "   - PROD_MONGODB_URI"
echo "   - PROD_JWT_SECRET"
echo "4. Update the main project to reference the new auth service URL"
echo "5. Test the standalone auth service"
echo ""
echo "🔗 Useful commands:"
echo "cd auth-service-repo"
echo "npm install"
echo "cp env.example .env"
echo "npm run start:dev"
echo ""
echo "🐳 Docker commands:"
echo "docker-compose -f docker-compose.dev.yml up -d"
echo "docker-compose down"
echo ""
print_success "Migration script completed! 🎉"
