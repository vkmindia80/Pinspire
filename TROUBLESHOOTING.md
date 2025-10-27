# Pinspire Troubleshooting Guide

## Common Issues and Solutions

### 🔴 HTTP ERROR 502 - Bad Gateway

**Symptoms:**
- "This page isn't working" error
- "pinpost-scheduler.preview.emergentagent.com is currently unable to handle this request"
- HTTP ERROR 502

**Causes:**
- Frontend service stopped running
- Backend service not responding
- Services not bound to correct ports

**Solutions:**

#### Quick Fix (Run this first):
```bash
bash /app/restart_services.sh
```

#### Manual Fix:

1. **Check service status:**
```bash
bash /app/check_status.sh
```

2. **Restart frontend manually:**
```bash
pkill -f vite
cd /app/frontend
yarn dev > /tmp/frontend_start.log 2>&1 &
```

3. **Restart backend:**
```bash
sudo supervisorctl restart backend
```

4. **Verify services are running:**
```bash
# Check backend
curl http://localhost:8001/

# Check frontend
curl http://localhost:3000/
```

5. **Check for port conflicts:**
```bash
sudo lsof -i :3000  # Frontend port
sudo lsof -i :8001  # Backend port
```

---

### 🟡 Frontend Not Loading

**Symptoms:**
- Blank page
- "Connection refused"
- Assets not loading

**Solutions:**

1. **Check if Vite is running:**
```bash
ps aux | grep vite
```

2. **Check frontend logs:**
```bash
tail -f /tmp/frontend_start.log
```

3. **Restart frontend:**
```bash
pkill -f vite
cd /app/frontend && yarn dev > /tmp/frontend_start.log 2>&1 &
```

4. **Check for syntax errors:**
```bash
cd /app/frontend
yarn build
```

---

### 🟡 Backend API Not Responding

**Symptoms:**
- API calls fail
- "Network Error"
- 401/404 errors

**Solutions:**

1. **Check backend status:**
```bash
sudo supervisorctl status backend
```

2. **View backend logs:**
```bash
tail -f /var/log/supervisor/backend.out.log
tail -f /var/log/supervisor/backend.err.log
```

3. **Restart backend:**
```bash
sudo supervisorctl restart backend
```

4. **Test backend directly:**
```bash
curl http://localhost:8001/
curl http://localhost:8001/api/auth/login -X POST \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}'
```

5. **Check for Python errors:**
```bash
cd /app/backend
python3 server.py
```

---

### 🟡 AI Caption Generation Not Working

**Symptoms:**
- "Failed to generate caption"
- Timeout errors
- Error messages in UI

**Solutions:**

1. **Check Emergent LLM Key:**
```bash
cat /app/backend/.env | grep EMERGENT_LLM_KEY
```

2. **Test AI generation directly:**
```bash
# Get a token first
TOKEN=$(curl -s -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123"}' \
  | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])")

# Test caption generation
curl -X POST http://localhost:8001/api/ai/generate-caption \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"topic":"test","tone":"engaging"}'
```

3. **Check backend logs for AI errors:**
```bash
tail -n 100 /var/log/supervisor/backend.out.log | grep -i "error"
```

---

### 🟡 Database Connection Issues

**Symptoms:**
- "Failed to connect to database"
- Post creation fails
- Login doesn't work

**Solutions:**

1. **Check MongoDB status:**
```bash
sudo supervisorctl status mongodb
```

2. **Restart MongoDB:**
```bash
sudo supervisorctl restart mongodb
```

3. **Test MongoDB connection:**
```bash
mongosh pinspire --eval "db.adminCommand('ping')"
```

4. **Check MongoDB logs:**
```bash
tail -f /var/log/mongodb/mongod.log
```

---

### 🟡 Login Not Working

**Symptoms:**
- "Invalid credentials" error
- Token errors
- Can't access protected routes

**Solutions:**

1. **Use demo credentials:**
   - Username: `testuser`
   - Password: `test123`

2. **Create a new user:**
```bash
curl -X POST http://localhost:8001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"newuser","email":"new@example.com","password":"password123"}'
```

3. **Check JWT secret:**
```bash
cat /app/backend/.env | grep JWT_SECRET
```

4. **Clear browser cache and localStorage**

---

### 🟡 Changes Not Reflecting

**Symptoms:**
- Code changes not showing
- Old version still visible
- Cached assets

**Solutions:**

1. **Hard reload browser:**
   - Chrome/Firefox: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)

2. **Clear browser cache:**
   - Open DevTools (F12)
   - Right-click refresh button → "Empty Cache and Hard Reload"

3. **Restart frontend (HMR might be stuck):**
```bash
pkill -f vite
cd /app/frontend && yarn dev > /tmp/frontend_start.log 2>&1 &
```

4. **Check if Vite HMR is connected:**
   - Open browser console (F12)
   - Look for "[vite] connected" message

---

## Service Management Commands

### Status Checks
```bash
# Overall status
bash /app/check_status.sh

# Individual service status
sudo supervisorctl status

# Check processes
ps aux | grep -E "(vite|uvicorn|mongo)"
```

### Restart Services
```bash
# Restart all (recommended)
bash /app/restart_services.sh

# Restart individual services
sudo supervisorctl restart backend
pkill -f vite && cd /app/frontend && yarn dev > /tmp/frontend.log 2>&1 &
sudo supervisorctl restart mongodb
```

### View Logs
```bash
# Frontend logs
tail -f /tmp/frontend_start.log

# Backend logs
tail -f /var/log/supervisor/backend.out.log
tail -f /var/log/supervisor/backend.err.log

# MongoDB logs
tail -f /var/log/mongodb/mongod.log
```

---

## Emergency Reset

If nothing else works, try this complete reset:

```bash
# 1. Stop all services
sudo supervisorctl stop all
pkill -f vite
pkill -f uvicorn

# 2. Start MongoDB
sudo supervisorctl start mongodb
sleep 3

# 3. Start backend
sudo supervisorctl start backend
sleep 3

# 4. Start frontend
cd /app/frontend && yarn dev > /tmp/frontend_start.log 2>&1 &
sleep 5

# 5. Check status
bash /app/check_status.sh
```

---

## Health Check URLs

- **Frontend:** https://smartcaption-2.preview.emergentagent.com/
- **Backend:** https://smartcaption-2.preview.emergentagent.com/api/ (should return 404, means it's running)
- **API Docs:** http://localhost:8001/docs (local only)

---

## Getting Help

1. Run diagnostic: `bash /app/check_status.sh`
2. Check logs: `tail -f /tmp/frontend_start.log` and `tail -f /var/log/supervisor/backend.out.log`
3. Try restart: `bash /app/restart_services.sh`
4. If still having issues, check the error messages in logs

---

## Prevention Tips

1. **Regular status checks:** Run `bash /app/check_status.sh` periodically
2. **Monitor logs:** Keep an eye on error logs
3. **Resource usage:** Frontend and backend can be resource-intensive
4. **Browser cache:** Clear cache when testing changes
5. **Graceful restarts:** Use the provided scripts instead of killing processes

---

**Last Updated:** October 2025
