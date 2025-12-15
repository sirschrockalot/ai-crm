# Local Development Setup (Without Docker Services)

This guide helps you run the CRM and microservices locally for faster development without Docker delays.

## Quick Start

### 1. Stop Docker Services (Keep MongoDB/Redis)

```bash
# Stop application services but keep MongoDB and Redis
docker stop auth-service leads-service transactions-service user-management-service timesheet-service lead-import-service ai-crm-frontend

# Or use the convenience script
./stop-local.sh
```

### 2. Start Services Locally

```bash
# Start all services locally
./start-local.sh
```

This will start:
- **Auth Service** on port 3001
- **Frontend** on port 3000

### 3. Manual Start (Alternative)

If you prefer to start services manually in separate terminals:

#### Terminal 1: Auth Service
```bash
cd ../auth-service-repo
npm run start:dev
```

#### Terminal 2: Frontend
```bash
cd src/frontend
npm run dev
```

## Service URLs

Once running locally:

- **Frontend**: http://localhost:3000
- **Auth Service**: http://localhost:3001
- **Auth Health Check**: http://localhost:3001/api/auth/health

## Infrastructure Services (Still in Docker)

These services remain in Docker for convenience:

- **MongoDB**: `localhost:27017` (Docker container: `crm-mongodb`)
- **Redis**: `localhost:6379` (Docker container: `crm-redis`)

## Configuration

### Auth Service Configuration

The auth service is configured in `../auth-service-repo/.env.local`:

```env
MONGODB_URI=mongodb://admin:password@localhost:27017/dealcycle?authSource=admin
PORT=3001
```

### Frontend Configuration

The frontend is configured in `src/frontend/.env.local`:

```env
NEXT_PUBLIC_BYPASS_AUTH=false
NEXT_PUBLIC_AUTH_SERVICE_URL=http://localhost:3001
NEXT_PUBLIC_AUTH_SERVICE_API_URL=http://localhost:3001/api/auth
```

## Creating a Test User

Once the auth service is running, create a test user:

```bash
# Option 1: Use the registration endpoint (if working)
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@dealcycle.com",
    "password": "admin123",
    "firstName": "Admin",
    "lastName": "User",
    "companyName": "DealCycle",
    "role": "admin",
    "adminAutoActivate": true,
    "provisionKey": "VkDtUKn4fWqR"
  }'

# Option 2: Use MongoDB directly
mongosh mongodb://admin:password@localhost:27017/dealcycle?authSource=admin
# Then create user in MongoDB shell
```

## Troubleshooting

### Port Already in Use

```bash
# Check what's using the port
lsof -i :3000
lsof -i :3001

# Kill the process
kill -9 <PID>
```

### MongoDB Connection Issues

```bash
# Check if MongoDB is running
docker ps | grep mongodb

# Check MongoDB connection
mongosh mongodb://admin:password@localhost:27017/dealcycle?authSource=admin
```

### Service Not Starting

```bash
# Check service logs
tail -f /tmp/Auth\ Service.log
tail -f /tmp/Frontend.log

# Or check directly in the terminal where you started the service
```

### Clear Everything and Restart

```bash
# Stop all local services
./stop-local.sh

# Kill any remaining processes
pkill -f "nest start"
pkill -f "next dev"

# Restart
./start-local.sh
```

## Development Workflow

1. **Make code changes** - Files are watched and auto-reload
2. **Test changes** - Refresh browser or check service logs
3. **No Docker rebuilds** - Changes apply immediately
4. **Fast iteration** - No waiting for Docker containers

## Benefits of Local Development

✅ **Faster startup** - No Docker build times
✅ **Instant changes** - Hot reload works immediately  
✅ **Better debugging** - Direct access to Node.js processes
✅ **Easier testing** - Can easily attach debuggers
✅ **Resource efficient** - Only run what you need

## Switching Back to Docker

If you need to switch back to Docker:

```bash
# Stop local services
./stop-local.sh

# Start Docker services
docker-compose up -d
```

## Next Steps

1. Start services: `./start-local.sh`
2. Create a test user (see above)
3. Access frontend: http://localhost:3000
4. Login with your test credentials
5. Start developing!

