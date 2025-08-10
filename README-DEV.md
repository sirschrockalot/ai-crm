# AI CRM Development Environment

This guide explains how to set up and run the AI CRM application in development mode for testing.

## Prerequisites

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **Docker & Docker Compose** - [Download here](https://www.docker.com/products/docker-desktop/)
- **Git** - [Download here](https://git-scm.com/)

## Quick Start

### 1. Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd ai_crm

# Make the development script executable
chmod +x scripts/dev.sh
```

### 2. Start Development Environment

```bash
# Start the entire application in development mode
./scripts/dev.sh
```

This will:
- ✅ Check prerequisites (Node.js, Docker)
- ✅ Set up environment files
- ✅ Install all dependencies
- ✅ Start core services (MongoDB, Redis, Meilisearch)
- ✅ Start backend in development mode
- ✅ Start frontend in development mode
- ✅ Show status and useful URLs

### 3. Access the Application

Once the script completes successfully, you can access:

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **API Health Check**: http://localhost:3000/api/health
- **MongoDB**: mongodb://localhost:27017
- **Redis**: redis://localhost:6379
- **Meilisearch**: http://localhost:7700

## Development Script Options

### Basic Usage
```bash
# Start backend and frontend
./scripts/dev.sh

# Start with mobile development server
./scripts/dev.sh --with-mobile

# Stop all services
./scripts/dev.sh --stop

# Show help
./scripts/dev.sh --help
```

### Advanced Options

#### Start with Monitoring
```bash
# Start core services with monitoring
docker-compose -f docker-compose.dev.yml --profile monitoring up -d
```

#### View Logs
```bash
# View all service logs
docker-compose -f docker-compose.dev.yml logs -f

# View specific service logs
docker-compose -f docker-compose.dev.yml logs -f mongo
docker-compose -f docker-compose.dev.yml logs -f redis
```

## Development Features

### Test Mode
The development environment runs in test mode with:
- ✅ Pre-configured admin user
- ✅ Relaxed security settings
- ✅ Debug logging enabled
- ✅ Mock data available
- ✅ Hot reload enabled

### Database
- **MongoDB** running on port 27017
- **Redis** running on port 6379
- **Meilisearch** running on port 7700
- All data persists in Docker volumes

### Hot Reload
- Backend automatically restarts on file changes
- Frontend automatically refreshes on file changes
- No manual restart required

## Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Check what's using the port
lsof -i :3000
lsof -i :3001

# Kill the process
kill -9 <PID>
```

#### Docker Issues
```bash
# Restart Docker services
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml up -d

# Reset Docker volumes (WARNING: This will delete all data)
docker-compose -f docker-compose.dev.yml down -v
```

#### Node Modules Issues
```bash
# Clean and reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Reset Everything
```bash
# Stop all services and clean up
./scripts/dev.sh --stop

# Remove all Docker containers and volumes
docker-compose -f docker-compose.dev.yml down -v
docker system prune -f

# Start fresh
./scripts/dev.sh
```

## Development Workflow

### 1. Start Development Environment
```bash
./scripts/dev.sh
```

### 2. Make Changes
- Edit files in `src/backend/` for backend changes
- Edit files in `src/frontend/` for frontend changes
- Changes will automatically reload

### 3. Test Changes
- Frontend: http://localhost:3001
- Backend API: http://localhost:3000
- API Documentation: http://localhost:3000/api/docs

### 4. Run Tests
```bash
# Backend tests
cd src/backend && npm test

# Frontend tests
cd src/frontend && npm test

# E2E tests
cd src/frontend && npm run test:e2e
```

### 5. Stop Development
```bash
./scripts/dev.sh --stop
```

## Environment Variables

The development environment uses `env.dev` which includes:
- Test mode enabled
- Debug logging
- Relaxed security settings
- Development-specific configurations

Key variables:
- `TEST_MODE=true` - Enables test features
- `NODE_ENV=development` - Development mode
- `LOG_LEVEL=debug` - Verbose logging
- `ENABLE_MOCK_DATA=true` - Mock data available

## File Structure

```
ai_crm/
├── scripts/
│   └── dev.sh              # Development setup script
├── docker-compose.dev.yml  # Development services
├── env.dev                 # Development environment
├── src/
│   ├── backend/            # Backend application
│   ├── frontend/           # Frontend application
│   └── mobile/             # Mobile application
└── README-DEV.md          # This file
```

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review the logs: `docker-compose -f docker-compose.dev.yml logs -f`
3. Ensure all prerequisites are installed
4. Try resetting the environment: `./scripts/dev.sh --stop && ./scripts/dev.sh`

## Next Steps

Once the development environment is running:
1. Explore the frontend at http://localhost:3001
2. Test the API at http://localhost:3000/api/health
3. Check the API documentation at http://localhost:3000/api/docs
4. Start developing your features!
