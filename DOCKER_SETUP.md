# Presidential Digs CRM - Docker Setup

This guide explains how to run the entire Presidential Digs CRM application locally using Docker Compose.

## 🏗️ Architecture

The application consists of the following services:

- **Frontend** (Port 3000) - Next.js React application
- **Auth Service** (Port 3001) - Authentication and user management
- **Leads Service** (Port 3008) - Lead management and CRM functionality
- **Transactions Service** (Port 3003) - Transaction processing
- **Timesheet Service** (Port 3007) - Time tracking and timesheet management
- **User Management Service** (Port 3005) - User roles and permissions
- **Lead Import Service** (Port 3004) - Lead import and data processing
- **MongoDB** (Port 27017) - Shared database
- **Redis** (Port 6379) - Caching and session storage
- **Mongo Express** (Port 8081) - Database management UI
- **Redis Commander** (Port 8082) - Redis management UI

## 🚀 Quick Start

### Prerequisites

- Docker Desktop installed and running
- Docker Compose v3.8+
- At least 8GB RAM available for Docker
- Ports 3000-3008, 27017, 6379, 8081-8082 available

### 1. Clone and Setup

```bash
# Navigate to the ai-crm directory
cd /Users/jschrock/Development/cloned_repos/ai-crm

# Copy environment file
cp .env.docker .env

# Build and start all services
docker-compose up --build -d
```

### 2. Verify Services

```bash
# Check service status
docker-compose ps

# View logs
docker-compose logs -f

# Check specific service logs
docker-compose logs -f frontend
docker-compose logs -f auth-service
```

### 3. Access the Application

- **Frontend**: http://localhost:3000
- **API Documentation**: 
  - Auth Service: http://localhost:3001/api/docs
  - Leads Service: http://localhost:3008/api/docs
  - Transactions Service: http://localhost:3003/api/docs
  - Timesheet Service: http://localhost:3007/api/docs
  - User Management: http://localhost:3005/api/docs
- **Database Management**: http://localhost:8081 (Mongo Express)
- **Redis Management**: http://localhost:8082 (Redis Commander)

## 🔧 Management Commands

### Start Services
```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up -d frontend
docker-compose up -d auth-service
```

### Stop Services
```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Rebuild Services
```bash
# Rebuild all services
docker-compose up --build -d

# Rebuild specific service
docker-compose up --build -d frontend
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f frontend
docker-compose logs -f auth-service
docker-compose logs -f leads-service
```

### Execute Commands
```bash
# Access container shell
docker-compose exec frontend sh
docker-compose exec auth-service sh

# Run commands in container
docker-compose exec frontend npm run build
docker-compose exec auth-service npm run test
```

## 🗄️ Database Management

### MongoDB Access
```bash
# Connect to MongoDB
docker-compose exec mongodb mongosh

# Or use external client
mongodb://admin:password123@localhost:27017/
```

### Database Initialization
The MongoDB initialization script (`docker/mongo-init.js`) automatically:
- Creates databases for each service
- Sets up collections and indexes
- Configures proper permissions

### Reset Database
```bash
# Stop services and remove volumes
docker-compose down -v

# Start fresh
docker-compose up -d
```

## 🔍 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Check what's using the port
   lsof -i :3000
   
   # Kill the process
   kill -9 <PID>
   ```

2. **Service Won't Start**
   ```bash
   # Check logs
   docker-compose logs <service-name>
   
   # Check service status
   docker-compose ps
   ```

3. **Database Connection Issues**
   ```bash
   # Check MongoDB logs
   docker-compose logs mongodb
   
   # Verify MongoDB is running
   docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"
   ```

4. **Memory Issues**
   ```bash
   # Check Docker resource usage
   docker stats
   
   # Increase Docker memory limit in Docker Desktop settings
   ```

### Health Checks

All services include health checks. Check status:
```bash
# Check health of all services
docker-compose ps

# Test specific service health
curl http://localhost:3001/api/v1/health
curl http://localhost:3008/api/v1/health
curl http://localhost:3007/api/health
```

## 🔧 Development

### Hot Reload
For development with hot reload, you can run services individually:

```bash
# Start only infrastructure services
docker-compose up -d mongodb redis

# Run frontend locally with hot reload
cd src/frontend && npm run dev

# Run services locally
cd ../auth-service-repo && npm run start:dev
cd ../Leads-Service && npm run start:dev
```

### Environment Variables
Edit `.env.docker` to modify environment variables, then restart services:
```bash
docker-compose down
docker-compose up -d
```

## 📊 Monitoring

### Resource Usage
```bash
# View resource usage
docker stats

# View disk usage
docker system df
```

### Logs
```bash
# Follow all logs
docker-compose logs -f

# Follow specific service
docker-compose logs -f frontend

# View last 100 lines
docker-compose logs --tail=100 frontend
```

## 🚀 Production Considerations

For production deployment:

1. **Security**: Change all default passwords and secrets
2. **Volumes**: Use named volumes for data persistence
3. **Networks**: Use custom networks for service isolation
4. **Resources**: Set appropriate memory and CPU limits
5. **Monitoring**: Add logging and monitoring solutions
6. **SSL**: Configure HTTPS for all services

## 📝 Notes

- All services use the same JWT secret for development
- MongoDB data persists in Docker volumes
- Redis is used for session storage and caching
- Services are configured with health checks and restart policies
- The frontend is built as a standalone Next.js application

For more information, see the individual service documentation in their respective directories.
