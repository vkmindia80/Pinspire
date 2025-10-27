#!/bin/bash

# Create test user for Pinspire login

echo "======================================"
echo "  Creating Test User for Pinspire"
echo "======================================"
echo ""

echo "Creating user: testuser"
echo "Password: test123"
echo ""

RESPONSE=$(curl -s -X POST http://localhost:8001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"testuser@example.com","password":"test123"}')

if echo "$RESPONSE" | grep -q "access_token"; then
  echo "✅ User created successfully!"
  echo ""
  echo "Login Credentials:"
  echo "  Username: testuser"
  echo "  Password: test123"
  echo ""
  echo "You can now login at the frontend!"
elif echo "$RESPONSE" | grep -q "already exists"; then
  echo "✅ User already exists!"
  echo ""
  echo "Login Credentials:"
  echo "  Username: testuser"
  echo "  Password: test123"
  echo ""
  echo "You can login with these credentials."
else
  echo "❌ Error creating user:"
  echo "$RESPONSE" | python3 -m json.tool
fi

echo ""
echo "======================================"
