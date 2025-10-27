#!/bin/bash

# Create demo user for Pinspire login

echo "======================================"
echo "  Creating Demo User for Pinspire"
echo "======================================"
echo ""

echo "Creating user: demo"
echo "Password: demo123"
echo ""

RESPONSE=$(curl -s -X POST http://localhost:8001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"demo","email":"demo@example.com","password":"demo123"}')

if echo "$RESPONSE" | grep -q "access_token"; then
  echo "✅ Demo user created successfully!"
  echo ""
  echo "Login Credentials:"
  echo "  Username: demo"
  echo "  Password: demo123"
  echo ""
  echo "You can now use the 'Use Demo' button on the login page!"
elif echo "$RESPONSE" | grep -q "already exists"; then
  echo "✅ Demo user already exists!"
  echo ""
  echo "Login Credentials:"
  echo "  Username: demo"
  echo "  Password: demo123"
  echo ""
  echo "You can use the 'Use Demo' button on the login page."
else
  echo "❌ Error creating demo user:"
  echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
fi

echo ""
echo "======================================"
