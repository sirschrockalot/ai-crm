# Setup Guide

Complete guide for setting up the DealCycle CRM development environment.

## Prerequisites

- Node.js 18+
- npm 9+
- Docker Desktop (for Docker setup)
- MongoDB 6.0+ (or use Docker)
- Redis 7.0+ (or use Docker)
- Doppler CLI (for secret management)

## Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/your-org/dealcycle-crm.git
cd dealcycle-crm
npm run install:all
```

### 2. Configure Doppler

```bash
# Install Doppler CLI
# macOS: brew install doppler
# Linux: curl -L --request GET "https://cli.doppler.com/download/binary/unix" --output doppler && chmod +x doppler && sudo mv doppler /usr/local/bin/

# Authenticate
doppler login

# Setup project
doppler setup
```

### 3. Start Development

```bash
# Start with Doppler (recommended)
npm run dev

# Or start individual services
npm run dev:frontend
```

## Setup Options

### Option 1: Full Docker Setup (Recommended for Testing)

Starts all services (backend + frontend) in Docker containers.

```bash
# Start all services
./start-docker.sh

# Or manually
docker-compose up --build -d

# Access the app
# Frontend: http://localhost:3000
# MongoDB: localhost:27017
# Redis: localhost:6379
```

**Services:**
- Frontend (Port 3000)
- Auth Service (Port 3001)
- Leads Service (Port 3008)
- Transactions Service (Port 3003)
- Timesheet Service (Port 3007)
- User Management Service (Port 3005)
- MongoDB (Port 27017)
- Redis (Port 6379)

### Option 2: Backend in Docker, Frontend Locally (Recommended for Development)

Hot-reload for frontend development while keeping backend services in Docker.

```bash
# Start backend services in Docker
./scripts/start-local-dev.sh

# In another terminal, start frontend locally
cd src/frontend
npm run dev
```

### Option 3: All Services Locally (Advanced)

Run all services locally without Docker for fastest development.

```bash
# Stop Docker services (keep MongoDB/Redis)
./stop-local.sh

# Start services locally
./start-local.sh
```

## Environment Configuration

### Using Doppler (Recommended)

All environment variables are managed through Doppler. No `.env` files needed.

```bash
# View secrets
doppler secrets

# Update secrets
doppler secrets set KEY=value

# Run with Doppler
doppler run -- npm run dev
```

### Manual .env (Not Recommended)

Only use if a tool requires a `.env` file:

```bash
# Download secrets to .env (gitignored)
npm run env:pull
```

## Service URLs

Once running:

- **Frontend**: http://localhost:3000
- **Auth Service**: http://localhost:3001
- **Leads Service**: http://localhost:3008
- **Transactions Service**: http://localhost:3003
- **User Management Service**: http://localhost:3005
- **Timesheet Service**: http://localhost:3007
- **Mongo Express**: http://localhost:8081
- **Redis Commander**: http://localhost:8082

## Initial Setup

### 1. Verify Service Health

```bash
# Check all services
curl http://localhost:3001/health
curl http://localhost:3008/health
curl http://localhost:3005/health
curl http://localhost:3007/health
```

### 2. Create Admin User

Use the bootstrap script:

```bash
cd ../auth-service-repo
doppler run -- npm run bootstrap:admin
```

Or create via API (see [Development Guide](./DEVELOPMENT.md)).

### 3. Access the Application

1. Navigate to http://localhost:3000
2. Log in with admin credentials
3. Verify all services are healthy in the Admin dashboard

## Database Setup

### MongoDB

MongoDB runs in Docker by default. To access:

```bash
# Using MongoDB shell
docker exec -it ai-crm-mongodb mongosh

# Or use Mongo Express UI
# Navigate to http://localhost:8081
```

### Redis

Redis runs in Docker by default. To access:

```bash
# Using Redis CLI
docker exec -it ai-crm-redis redis-cli

# Or use Redis Commander UI
# Navigate to http://localhost:8082
```

## Troubleshooting

See [Troubleshooting Guide](./TROUBLESHOOTING.md) for common issues.

## Next Steps

- Read [Development Guide](./DEVELOPMENT.md) for development workflow
- Check [API Documentation](./API.md) for API endpoints
- Review [Architecture](./ARCHITECTURE.md) for system design
