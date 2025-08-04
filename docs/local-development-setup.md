# Local Development Setup Guide

## Prerequisites

Before starting, make sure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **MongoDB** (v6 or higher)
- **Git**

## Quick Start

### 1. Clone and Setup

```bash
# Clone the repository (if not already done)
git clone <repository-url>
cd ai_crm

# Install all dependencies
npm run install:all
```

### 2. Environment Configuration

```bash
# Copy the local environment file
cp env.local.example .env

# Copy the test mode configuration
cp env.test-mode.example .env.test
```

### 3. Start MongoDB

You have several options for running MongoDB:

#### Option A: Local MongoDB Installation
```bash
# Start MongoDB service
sudo systemctl start mongod

# Or on macOS with Homebrew
brew services start mongodb-community
```

#### Option B: Docker MongoDB
```bash
# Start just MongoDB with Docker
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  mongo:6.0
```

#### Option C: Full Stack with Docker Compose
```bash
# Start all services (MongoDB, Redis, etc.)
docker-compose up -d mongo redis
```

### 4. Start the Application

#### Option A: Start Backend Only (Recommended for Development)

```bash
# Start the backend API
npm run dev:backend
```

This will start the backend on `http://localhost:3000`

#### Option B: Start Full Stack

```bash
# Start both backend and frontend
npm run dev
```

This will start:
- Backend API: `http://localhost:3000`
- Frontend: `http://localhost:3001`

#### Option C: Start with Docker

```bash
# Start all services with Docker
docker-compose up -d
```

## Accessing the Application

### Backend API
- **URL**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api/docs
- **Health Check**: http://localhost:3000/api/health

### Frontend (if started)
- **URL**: http://localhost:3001

### Test Mode Endpoints
- **Test Mode Status**: http://localhost:3000/api/auth/test-mode/status
- **Test Login**: http://localhost:3000/api/auth/test-mode/login

## Testing the Application

### 1. Test Mode is Enabled

With test mode enabled, you can access the API without authentication:

```bash
# Check test mode status
curl http://localhost:3000/api/auth/test-mode/status

# Login as admin
curl -X POST "http://localhost:3000/api/auth/test-mode/login?role=admin"

# Access protected endpoints with test role
curl "http://localhost:3000/api/users?testRole=admin"
```

### 2. Available Test Users

- **Admin**: `admin@test.dealcycle.com` (role: admin)
- **Acquisitions**: `acquisitions@test.dealcycle.com` (role: acquisitions)
- **Dispositions**: `dispositions@test.dealcycle.com` (role: dispositions)

### 3. API Testing Examples

```bash
# Get all users (as admin)
curl "http://localhost:3000/api/users?testRole=admin"

# Get user profile (as acquisitions)
curl "http://localhost:3000/api/users/me?testRole=acquisitions"

# Search users (as dispositions)
curl "http://localhost:3000/api/users?testRole=dispositions&search=test"
```

## Development Workflow

### 1. Backend Development

```bash
# Start backend in development mode
npm run dev:backend

# Run tests
npm run test:backend

# Run linting
npm run lint:backend

# Type checking
npm run type-check:backend
```

### 2. Frontend Development

```bash
# Start frontend in development mode
npm run dev:frontend

# Run tests
npm run test:frontend

# Run linting
npm run lint:frontend
```

### 3. Database Management

```bash
# Access MongoDB shell
mongosh mongodb://localhost:27017/dealcycle

# Or with Docker
docker exec -it mongodb mongosh
```

## Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Check what's using the port
lsof -i :3000
lsof -i :3001

# Kill the process
kill -9 <PID>
```

#### 2. MongoDB Connection Issues
```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Check MongoDB logs
sudo journalctl -u mongod -f
```

#### 3. Dependencies Issues
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 4. Test Mode Not Working
```bash
# Check environment variables
echo $TEST_MODE

# Restart the application after changing .env
npm run dev:backend
```

### Logs and Debugging

#### Backend Logs
```bash
# View backend logs
npm run dev:backend

# Check for test mode warnings in logs
grep "TEST MODE" logs/backend.log
```

#### Docker Logs
```bash
# View all container logs
docker-compose logs

# View specific service logs
docker-compose logs backend
docker-compose logs mongo
```

## Environment Variables

### Required Variables
- `TEST_MODE`: Enable/disable test mode
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret for JWT tokens

### Optional Variables
- `PORT`: Backend port (default: 3000)
- `TEST_DEFAULT_ROLE`: Default test role (default: admin)
- `FRONTEND_URL`: Frontend URL for CORS

## Next Steps

1. **Explore the API**: Visit http://localhost:3000/api/docs
2. **Test Different Roles**: Try the different test users
3. **Build Features**: Start implementing new features
4. **Run Tests**: Ensure everything works with `npm test`

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review the logs for error messages
3. Ensure all prerequisites are installed
4. Verify environment variables are set correctly 