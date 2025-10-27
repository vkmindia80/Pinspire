# Pinspire Login Credentials

## 🔐 Demo Account (Ready to Use)

### Quick Login with "Use Demo" Button
On the login page, simply click the **"Use Demo"** button to automatically log in with:

- **Username:** `demo`
- **Password:** `demo123`

This will auto-fill the credentials and log you in immediately!

---

## 📝 Available Test Accounts

### Account 1: Demo User
- **Username:** `demo`
- **Email:** `demo@pinspire.com`
- **Password:** `demo123`
- **Status:** ✅ Active

### Account 2: Test User
- **Username:** `test`
- **Email:** `test@test.com`
- **Password:** `test123`
- **Status:** ✅ Active

---

## 🚀 Getting Started

### Option 1: Use Demo Button (Easiest)
1. Go to `http://localhost:3000`
2. Click the **"Use Demo"** button in the blue box
3. You'll be automatically logged in!

### Option 2: Manual Login
1. Go to `http://localhost:3000`
2. Enter username and password from above
3. Click "Sign In"

### Option 3: Create New Account
1. Go to `http://localhost:3000`
2. Click "Sign up"
3. Enter your desired credentials
4. Your account will be created immediately

---

## ✨ What You Can Do After Login

1. **AI Caption Generation**
   - Generate engaging Pinterest captions with GPT-4o
   - Choose from 5 different tones
   - Add keywords for better targeting

2. **AI Image Generation** 🆕
   - Create stunning images with DALL-E
   - Choose size: Square, Landscape, or Portrait
   - Select quality: Standard or HD
   - Pick style: Vivid or Natural

3. **Post Management**
   - Create posts with AI-generated content
   - Save as drafts
   - Schedule for future publishing
   - Edit and delete posts

4. **Pinterest Integration**
   - Connect Pinterest account (Mock mode)
   - Select multiple boards
   - Post to Pinterest

5. **Dashboard**
   - View all your posts
   - Filter by status (Draft, Scheduled, Published)
   - Track AI-generated content

---

## 🔧 Troubleshooting

### "Incorrect Username or Password"
- Make sure you're using one of the accounts listed above
- Check for typos (username is case-sensitive)
- Try the "Use Demo" button for instant login

### "Login failed"
- Check if backend is running: `sudo supervisorctl status backend`
- Check backend logs: `tail -f /var/log/supervisor/backend.err.log`
- Try creating a new account with the Signup page

### Frontend Not Loading
- Check if frontend is running: `sudo supervisorctl status frontend`
- Navigate to: `http://localhost:3000`
- Clear browser cache and reload

---

## 📊 Backend API Endpoints

If you want to test the API directly:

### Login Endpoint
```bash
curl -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"demo","password":"demo123"}'
```

### Signup Endpoint
```bash
curl -X POST http://localhost:8001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"newuser","email":"new@example.com","password":"password123"}'
```

---

## 💡 Tips

1. **Use the Demo Account** for immediate access to all features
2. **Create your own account** if you want to test the signup flow
3. **Username/password are stored securely** with bcrypt hashing
4. **JWT tokens expire after 24 hours** - you'll need to login again
5. **Pinterest is in Mock mode** - no real Pinterest credentials needed for testing

---

**Last Updated:** January 2025
**Pinspire Version:** 1.1

**Need Help?** Check `/app/README.md` or `/app/PHASE_4_COMPLETE.md` for more details.
