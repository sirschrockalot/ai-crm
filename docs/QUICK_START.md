# Quick Start Guide - Running the App Locally

This guide will help you get the CRM running locally for testing.

## Prerequisites

- ✅ Node.js 18+ installed
- ✅ Docker Desktop installed and running
- ✅ npm installed

## Option 1: Full Docker Setup (Recommended for Testing)

This starts all services (backend + frontend) in Docker containers.

### Step 1: Start Docker Desktop

Make sure Docker Desktop is running on your Mac.

### Step 2: Start All Services

```bash
cd /Users/jschrock/Development/cloned_repos/ai-crm
./start-docker.sh
```

This will:
- Start MongoDB, Redis, and all backend services
- Start the frontend
- Show you access URLs

**Access the app at:** http://localhost:3000

---

## Option 2: Backend in Docker, Frontend Locally (Recommended for Development)

This gives you hot-reload for frontend development while keeping backend services in Docker.

### Step 1: Start Docker Desktop

Make sure Docker Desktop is running.

### Step 2: Start Backend Services

```bash
cd /Users/jschrock/Development/cloned_repos/ai-crm
./scripts/start-local-dev.sh
```

This starts:
- MongoDB
- Redis
- Auth Service (port 3001)
- Leads Service (port 3008)
- User Management Service (port 3005)
- Timesheet Service (port 3007)
- Transactions Service

### Step 3: Start Frontend Locally

In a new terminal:

```bash
cd /Users/jschrock/Development/cloned_repos/ai-crm/src/frontend
npm install  # Only needed first time
npm run dev
```

**Access the app at:** http://localhost:3000

---

## Option 3: Manual Service Startup

If you prefer to start services individually:

### Step 1: Start Infrastructure Services

```bash
# Start MongoDB and Redis
docker-compose up -d mongodb redis
```

### Step 2: Start Backend Services

Start each service in separate terminals:

```bash
# Terminal 1: Auth Service
cd ../auth-service-repo
npm install
npm run start:dev

# Terminal 2: Leads Service
cd ../Leads-Service
npm install
npm run start:dev

# Terminal 3: User Management Service
cd ../user-management-service
npm install
npm run start:dev

# Terminal 4: Timesheet Service
cd ../Timesheet-Service
npm install
npm run start:dev
```

### Step 3: Start Frontend

```bash
cd /Users/jschrock/Development/cloned_repos/ai-crm/src/frontend
npm install
npm run dev
```

---

## Verifying Services Are Running

### Quick Health Check

```bash
cd /Users/jschrock/Development/cloned_repos/ai-crm
./scripts/test-service-health.sh
```

### Manual Checks

```bash
# Check Auth Service
curl http://localhost:3001/health

# Check Leads Service
curl http://localhost:3008/health

# Check User Management
curl http://localhost:3005/health

# Check Timesheet
curl http://localhost:3007/health
```

### Check Docker Services

```bash
docker-compose ps
```

All services should show "Up" status.

---

## Accessing the Application

Once everything is running:

1. **Frontend**: http://localhost:3000
2. **Admin Page**: http://localhost:3000/admin
3. **Service Health**: http://localhost:3000/admin (System Monitoring tab)

### Test Mode Login

If `NEXT_PUBLIC_BYPASS_AUTH=true` in your `.env.local`:
- Navigate to http://localhost:3000
- You'll be automatically logged in as a dev user

If `NEXT_PUBLIC_BYPASS_AUTH=false`:
- Navigate to http://localhost:3000/auth/login
- Use test mode login button (if available in development)
- Or create a user account first

---

## Troubleshooting

### Docker Not Running

**Error:** "Docker is not running"

**Solution:**
1. Open Docker Desktop application
2. Wait for it to fully start (whale icon in menu bar)
3. Try again

### Port Already in Use

**Error:** "Port 3000 already in use"

**Solution:**
```bash
# Find what's using the port
lsof -i :3000

# Kill the process
kill -9 <PID>
```

Or change the frontend port:
```bash
cd src/frontend
PORT=3001 npm run dev
```

### Services Not Starting

**Check logs:**
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f auth-service
docker-compose logs -f leads-service
```

### Frontend Can't Connect to Backend

**Check:**
1. Are backend services running? (`docker-compose ps`)
2. Are service URLs correct in `.env.local`?
3. Check browser console for CORS errors
4. Verify services are accessible:
   ```bash
   curl http://localhost:3001/health
   ```

### MongoDB Connection Issues

**Check:**
1. Is MongoDB container running? (`docker-compose ps mongodb`)
2. Check MongoDB logs: `docker-compose logs mongodb`
3. Verify connection string in service environment variables

---

## Environment Configuration

### Frontend Environment

The frontend uses `.env.local` for local development. Key variables:

```env
# Enable test mode for easier testing
NEXT_PUBLIC_BYPASS_AUTH=true

# Service URLs (should match your setup)
NEXT_PUBLIC_AUTH_SERVICE_URL=http://localhost:3001
NEXT_PUBLIC_LEADS_SERVICE_URL=http://localhost:3008
NEXT_PUBLIC_USER_MANAGEMENT_SERVICE_URL=http://localhost:3005
NEXT_PUBLIC_TIMESHEET_SERVICE_URL=http://localhost:3007
```

### Backend Services

Backend services get their configuration from:
- Docker Compose environment variables
- Service-specific `.env` files in each service directory

---

## Stopping Services

### Stop All Docker Services

```bash
docker-compose down
```

### Stop Specific Services

```bash
docker-compose stop auth-service
docker-compose stop leads-service
```

### Stop Frontend

Press `Ctrl+C` in the terminal running `npm run dev`

---

## Useful Commands

```bash
# View all service logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f auth-service

# Restart a service
docker-compose restart auth-service

# Rebuild and restart
docker-compose up --build -d auth-service

# Check service status
docker-compose ps

# Test service health
./scripts/test-service-health.sh

# Access MongoDB shell
docker exec -it crm-mongodb mongosh

# Access Redis CLI
docker exec -it crm-redis redis-cli
```

---

## Next Steps After Starting

1. ✅ **Verify Services**: Run `./scripts/test-service-health.sh`
2. ✅ **Access Admin Page**: http://localhost:3000/admin
3. ✅ **Check Service Health**: Go to System Monitoring tab
4. ✅ **Test Authentication**: Try logging in
5. ✅ **Explore Features**: Navigate through the CRM

---

## Quick Reference

| Service | Port | URL |
|---------|------|-----|
| Frontend | 3000 | http://localhost:3000 |
| Auth Service | 3001 | http://localhost:3001 |
| Leads Service | 3008 | http://localhost:3008 |
| User Management | 3005 | http://localhost:3005 |
| Timesheet | 3007 | http://localhost:3007 |
| MongoDB | 27017 | mongodb://localhost:27017 |
| Redis | 6379 | redis://localhost:6379 |
| MongoDB Express | 8081 | http://localhost:8081 |
| Redis Commander | 8082 | http://localhost:8082 |

---

**Need Help?** Check the troubleshooting section above or review the logs.

