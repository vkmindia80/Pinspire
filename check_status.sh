#!/bin/bash

echo "🔍 Pinspire Service Status Check"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check Backend
echo "1️⃣  Backend Service (Port 8001)"
BACKEND_LOCAL=$(curl -s http://localhost:8001/ 2>&1 | grep -o "running")
if [ "$BACKEND_LOCAL" == "running" ]; then
    echo -e "   ${GREEN}✓ Running locally${NC}"
else
    echo -e "   ${RED}✗ Not running locally${NC}"
fi

# Check Frontend
echo ""
echo "2️⃣  Frontend Service (Port 3000)"
FRONTEND_LOCAL=$(curl -s http://localhost:3000 2>&1 | grep -o "Pinspire")
if [ "$FRONTEND_LOCAL" == "Pinspire" ]; then
    echo -e "   ${GREEN}✓ Running locally${NC}"
else
    echo -e "   ${RED}✗ Not running locally${NC}"
fi

# Check Preview Domain - Frontend
echo ""
echo "3️⃣  Preview Domain - Frontend"
PREVIEW_FRONTEND=$(curl -s https://smartcaption-2.preview.emergentagent.com/ 2>&1 | grep -o "Pinspire")
if [ "$PREVIEW_FRONTEND" == "Pinspire" ]; then
    echo -e "   ${GREEN}✓ Accessible via preview domain${NC}"
else
    echo -e "   ${RED}✗ Not accessible via preview domain${NC}"
fi

# Check Preview Domain - Backend API
echo ""
echo "4️⃣  Preview Domain - Backend API"
PREVIEW_BACKEND=$(curl -s https://smartcaption-2.preview.emergentagent.com/api/auth/login \
  -X POST -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}' 2>&1 | grep -o "detail")
if [ "$PREVIEW_BACKEND" == "detail" ]; then
    echo -e "   ${GREEN}✓ API accessible via preview domain${NC}"
else
    echo -e "   ${RED}✗ API not accessible via preview domain${NC}"
fi

# Check Process Status
echo ""
echo "5️⃣  Process Status"
VITE_PROCESS=$(ps aux | grep -E "vite.*3000" | grep -v grep | wc -l)
BACKEND_PROCESS=$(ps aux | grep -E "uvicorn.*8001" | grep -v grep | wc -l)

if [ "$VITE_PROCESS" -gt 0 ]; then
    echo -e "   ${GREEN}✓ Vite process running${NC}"
else
    echo -e "   ${RED}✗ Vite process not found${NC}"
fi

if [ "$BACKEND_PROCESS" -gt 0 ]; then
    echo -e "   ${GREEN}✓ Backend process running${NC}"
else
    echo -e "   ${RED}✗ Backend process not found${NC}"
fi

# MongoDB
echo ""
echo "6️⃣  Database (MongoDB)"
MONGO_STATUS=$(sudo supervisorctl status mongodb | grep -o "RUNNING")
if [ "$MONGO_STATUS" == "RUNNING" ]; then
    echo -e "   ${GREEN}✓ MongoDB running${NC}"
else
    echo -e "   ${RED}✗ MongoDB not running${NC}"
fi

echo ""
echo "=================================="
echo ""
echo "📊 Quick Actions:"
echo ""
echo "Restart Frontend:"
echo "  pkill -f vite && cd /app/frontend && yarn dev > /tmp/frontend.log 2>&1 &"
echo ""
echo "Restart Backend:"
echo "  sudo supervisorctl restart backend"
echo ""
echo "View Frontend Logs:"
echo "  tail -f /tmp/frontend_start.log"
echo ""
echo "View Backend Logs:"
echo "  tail -f /var/log/supervisor/backend.out.log"
echo ""
echo "🌐 Access:"
echo "  https://smartcaption-2.preview.emergentagent.com"
echo ""
