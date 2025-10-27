#!/bin/bash

# Pinspire - Service Restart Script
# Use this script to restart both frontend and backend services

echo "🔄 Restarting Pinspire Services..."
echo ""

# Kill existing frontend processes
echo "1️⃣  Stopping frontend processes..."
pkill -f "vite.*3000" 2>/dev/null
sleep 2

# Start frontend
echo "2️⃣  Starting frontend..."
cd /app/frontend
yarn dev > /tmp/frontend_start.log 2>&1 &
FRONTEND_PID=$!
echo "   Frontend started (PID: $FRONTEND_PID)"

# Restart backend
echo ""
echo "3️⃣  Restarting backend..."
sudo supervisorctl restart backend
sleep 2

# Check status
echo ""
echo "4️⃣  Checking services..."
sleep 3

BACKEND_STATUS=$(curl -s http://localhost:8001/ 2>&1 | grep -o "running")
FRONTEND_STATUS=$(curl -s http://localhost:3000 2>&1 | grep -o "Pinspire")

echo ""
if [ "$BACKEND_STATUS" == "running" ] && [ "$FRONTEND_STATUS" == "Pinspire" ]; then
    echo "✅ All services started successfully!"
    echo ""
    echo "🌐 Access your app:"
    echo "   https://codebase-cleanup-12.preview.emergentagent.com"
else
    echo "⚠️  Some services may have issues. Run ./check_status.sh for details."
fi

echo ""
echo "📋 Process IDs:"
ps aux | grep -E "(vite.*3000|uvicorn.*8001)" | grep -v grep | awk '{print "   " $2, $11, $12, $13}'

echo ""
