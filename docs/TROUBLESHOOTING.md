# Troubleshooting Guide

Common issues and solutions for DealCycle CRM.

## Frontend Not Loading

### Symptoms
- Browser shows connection error
- URLs like `http://localhost:3000` don't work

### Solutions

**1. Frontend Server Not Running**

```bash
# Check if port 3000 is in use
lsof -i :3000

# Start frontend
cd src/frontend
npm run dev
```

**2. Port Already in Use**

```bash
# Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Restart frontend
cd src/frontend
npm run dev
```

**3. Check Service Health**

```bash
# Verify backend services are running
curl http://localhost:3001/health
curl http://localhost:3008/health
```

## Service Connection Issues

### Symptoms
- API calls failing
- "Service unavailable" errors

### Solutions

**1. Verify Services Are Running**

```bash
# Check Docker containers
docker-compose ps

# Check service health
curl http://localhost:3001/health
```

**2. Check Environment Variables**

```bash
# Verify Doppler is configured
doppler secrets

# Or check .env file (if using)
cat .env
```

**3. Restart Services**

```bash
# Restart Docker services
docker-compose restart

# Or restart locally
./stop-local.sh
./start-local.sh
```

## Authentication Issues

### Symptoms
- Login fails
- "Unauthorized" errors
- Token validation errors

### Solutions

**1. Check Auth Service**

```bash
# Verify auth service is running
curl http://localhost:3001/health

# Check auth service logs
docker-compose logs auth-service
```

**2. Verify JWT Configuration**

Ensure JWT_SECRET is set correctly in Doppler.

**3. Clear Browser Cache**

Clear cookies and local storage, then try again.

## Database Issues

### Symptoms
- Database connection errors
- Data not persisting

### Solutions

**1. Check MongoDB**

```bash
# Verify MongoDB is running
docker-compose ps mongodb

# Check MongoDB logs
docker-compose logs mongodb

# Connect to MongoDB
docker exec -it ai-crm-mongodb mongosh
```

**2. Verify Connection String**

Check MongoDB URI in Doppler secrets.

**3. Restart Database**

```bash
docker-compose restart mongodb
```

## Performance Issues

### Symptoms
- Slow page loads
- Timeout errors

### Solutions

**1. Check Service Resources**

```bash
# Check Docker resource usage
docker stats
```

**2. Verify Redis Cache**

```bash
# Check Redis
docker exec -it ai-crm-redis redis-cli ping
```

**3. Review Logs**

Check service logs for errors or warnings.

## Browser Console Errors

### Common Errors

**1. CORS Errors**

Ensure service URLs are correctly configured in environment variables.

**2. Network Errors**

Verify all services are running and accessible.

**3. Authentication Errors**

Check JWT token validity and expiration.

## Getting Help

1. Check service logs: `docker-compose logs -f`
2. Review [Setup Guide](./SETUP.md)
3. Check [Development Guide](./DEVELOPMENT.md)
4. Review service-specific documentation
