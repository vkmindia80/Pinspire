#!/bin/bash

echo "🎯 Pinspire Application Test Suite"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Backend Health
echo "1️⃣  Testing Backend Health..."
HEALTH=$(curl -s http://localhost:8001/ | grep -o "running")
if [ "$HEALTH" == "running" ]; then
    echo -e "${GREEN}✓ Backend is healthy${NC}"
else
    echo -e "${RED}✗ Backend health check failed${NC}"
fi
echo ""

# Test 2: Frontend Availability
echo "2️⃣  Testing Frontend Availability..."
FRONTEND=$(curl -s http://localhost:3000 | grep -o "Pinspire")
if [ "$FRONTEND" == "Pinspire" ]; then
    echo -e "${GREEN}✓ Frontend is accessible${NC}"
else
    echo -e "${RED}✗ Frontend check failed${NC}"
fi
echo ""

# Test 3: User Signup
echo "3️⃣  Testing User Signup..."
SIGNUP=$(curl -s -X POST http://localhost:8001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"demo_$(date +%s)\",\"email\":\"demo_$(date +%s)@example.com\",\"password\":\"demo123\"}" \
  | grep -o "access_token")

if [ "$SIGNUP" == "access_token" ]; then
    echo -e "${GREEN}✓ User signup successful${NC}"
else
    echo -e "${RED}✗ User signup failed${NC}"
fi
echo ""

# Test 4: User Login
echo "4️⃣  Testing User Login..."
LOGIN=$(curl -s -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123"}' \
  | grep -o "access_token")

if [ "$LOGIN" == "access_token" ]; then
    echo -e "${GREEN}✓ User login successful${NC}"
    # Extract token for further tests
    TOKEN=$(curl -s -X POST http://localhost:8001/api/auth/login \
      -H "Content-Type: application/json" \
      -d '{"username":"testuser","password":"test123"}' \
      | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])" 2>/dev/null)
else
    echo -e "${RED}✗ User login failed${NC}"
fi
echo ""

# Test 5: AI Caption Generation
if [ ! -z "$TOKEN" ]; then
    echo "5️⃣  Testing AI Caption Generation..."
    AI_CAPTION=$(curl -s -X POST http://localhost:8001/api/ai/generate-caption \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -d '{"topic":"Summer vacation ideas","tone":"enthusiastic"}' \
      | grep -o "success")
    
    if [ "$AI_CAPTION" == "success" ]; then
        echo -e "${GREEN}✓ AI caption generation working${NC}"
    else
        echo -e "${RED}✗ AI caption generation failed${NC}"
    fi
    echo ""

    # Test 6: Post Creation
    echo "6️⃣  Testing Post Creation..."
    POST=$(curl -s -X POST http://localhost:8001/api/posts \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -d '{"caption":"Test post from automated test","image_url":"https://via.placeholder.com/600x800","ai_generated_caption":false}' \
      | grep -o "Post created successfully")
    
    if [ "$POST" == "Post created successfully" ]; then
        echo -e "${GREEN}✓ Post creation successful${NC}"
    else
        echo -e "${RED}✗ Post creation failed${NC}"
    fi
    echo ""

    # Test 7: Fetch Posts
    echo "7️⃣  Testing Fetch Posts..."
    POSTS=$(curl -s -X GET http://localhost:8001/api/posts \
      -H "Authorization: Bearer $TOKEN" \
      | grep -o "posts")
    
    if [ "$POSTS" == "posts" ]; then
        echo -e "${GREEN}✓ Fetching posts successful${NC}"
    else
        echo -e "${RED}✗ Fetching posts failed${NC}"
    fi
    echo ""
fi

echo "===================================="
echo "✨ Test Suite Complete!"
echo ""
echo "📊 Application Status:"
echo "   Backend:  http://localhost:8001"
echo "   Frontend: http://localhost:3000"
echo ""
echo "🔑 Test User Credentials:"
echo "   Username: testuser"
echo "   Password: test123"
echo ""
echo "📖 Next Steps:"
echo "   1. Open http://localhost:3000 in your browser"
echo "   2. Login with test credentials"
echo "   3. Try creating posts with AI assistance!"
echo ""
