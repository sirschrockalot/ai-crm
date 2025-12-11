# Troubleshooting Guide - Frontend Not Loading

## Issue: Frontend/Admin URLs Not Working in Browser

### Symptoms
- Browser shows connection error or page won't load
- URLs like `http://localhost:3000` or `http://localhost:3000/admin` don't work

### Common Causes & Solutions

#### 1. Frontend Server Not Running

**Check:**
```bash
lsof -i :3000
```

**Solution:**
```bash
cd /Users/jschrock/Development/cloned_repos/ai-crm/src/frontend
npm run dev
```

Wait for the message: `✓ Ready in X seconds` or `○ Local: http://localhost:3000`

#### 2. Port 3000 Already in Use

**Error:** `EADDRINUSE: address already in use :::3000`

**Solution:**
```bash
# Find what's using port 3000
lsof -i :3000

# Kill the process (replace PID with actual process ID)
kill -9 <PID>

# Or kill all node processes on port 3000
lsof -ti:3000 | xargs kill -9

# Then restart
cd /Users/jschrock/Development/cloned_repos/ai-crm/src/frontend
npm run dev
```

#### 3. Frontend Server Crashed

**Check logs:**
```bash
# If running in background, check logs
tail -f /tmp/frontend.log

# Or check terminal where you ran npm run dev
```

**Common errors:**
- **Module not found**: Run `npm install` in `src/frontend`
- **TypeScript errors**: Check for syntax errors in files
- **Port conflict**: See solution #2

#### 4. Browser Cache Issues

**Solution:**
- Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows/Linux)
- Clear browser cache
- Try incognito/private mode
- Check browser console for errors (F12)

#### 5. Next.js Build Cache Issues

**Solution:**
```bash
cd /Users/jschrock/Development/cloned_repos/ai-crm/src/frontend
rm -rf .next
npm run dev
```

#### 6. Environment Variables Not Loaded

**Check:**
```bash
cd /Users/jschrock/Development/cloned_repos/ai-crm/src/frontend
cat .env.local | grep BYPASS_AUTH
```

**Should show:**
```
NEXT_PUBLIC_BYPASS_AUTH=true
```

If missing or wrong, edit `.env.local` and restart the server.

## Quick Fix Commands

### Restart Frontend Server

```bash
# Kill any existing process
lsof -ti:3000 | xargs kill -9 2>/dev/null

# Clear cache
cd /Users/jschrock/Development/cloned_repos/ai-crm/src/frontend
rm -rf .next

# Start server
npm run dev
```

### Verify Server is Running

```bash
# Check if port is listening
lsof -i :3000

# Test if server responds
curl http://localhost:3000

# Should return HTML, not connection error
```

### Check for Errors

```bash
# In the terminal where npm run dev is running, look for:
# - ✓ Ready in X seconds (good)
# - ⨯ Error messages (bad)
# - Compiling... (normal, wait for it to finish)
```

## Expected Behavior

### When Server Starts Successfully

You should see:
```
▲ Next.js 14.0.0
- Local:        http://localhost:3000
- ready started server on 0.0.0.0:3000, url: http://localhost:3000
```

### When You Access http://localhost:3000

- Should load the home page (or redirect to login/dashboard)
- No connection errors
- Page content appears

### When You Access http://localhost:3000/admin

- Should load the admin page
- Shows tabs: User Management, System Monitoring, etc.
- Service Health Status component visible in System Monitoring tab

## Still Not Working?

1. **Check backend services are running:**
   ```bash
   docker-compose ps
   ```

2. **Check for TypeScript/compilation errors:**
   ```bash
   cd src/frontend
   npm run type-check
   ```

3. **Check browser console** (F12) for JavaScript errors

4. **Try a different port:**
   ```bash
   PORT=3001 npm run dev
   ```
   Then access: http://localhost:3001

5. **Check firewall/antivirus** isn't blocking port 3000

## Getting Help

If none of these solutions work:
1. Check the terminal output where `npm run dev` is running
2. Check browser console (F12) for errors
3. Check `/tmp/frontend.log` if running in background
4. Verify Node.js version: `node --version` (should be 18+)

