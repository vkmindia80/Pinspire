# Pinspire - AI Pinterest Post Creator & Scheduler

<div align="center">
  <h3>🎨 Create Stunning Pinterest Posts with AI 🚀</h3>
  <p>AI-Powered Caption Generation | Image Creation | Smart Scheduling</p>
</div>

---

## ✨ Features

### 🤖 AI-Powered Content Creation
- **Smart Caption Generation**: GPT-4o generates engaging, Pinterest-optimized captions
- **AI Image Generation**: DALL-E (gpt-image-1) creates stunning visuals from text prompts
- **Image Size Options**: Square (1024x1024), Landscape (1792x1024), Portrait (1024x1792)
- **Quality Settings**: Standard or HD quality
- **Style Control**: Natural or Vivid styles for different aesthetics
- **Hashtag Suggestions**: AI-powered hashtag recommendations for maximum reach
- **Tone Customization**: Choose from multiple tones (engaging, professional, casual, etc.)

### 📅 Scheduling & Management
- **Post Scheduling**: Plan your content calendar with date/time scheduling
- **Draft System**: Save posts as drafts and publish later
- **Multi-Board Posting**: Post to multiple Pinterest boards simultaneously
- **Post Management**: Edit, delete, and track all your posts from one dashboard

### 🔐 Authentication & Security
- JWT-based authentication
- Secure password hashing
- Protected API endpoints

### 💻 Modern Tech Stack
- **Backend**: FastAPI (Python)
- **Frontend**: React + Vite + Tailwind CSS
- **Database**: MongoDB
- **AI**: OpenAI (GPT-4o + DALL-E 3) via Emergent LLM Key
- **API**: Pinterest API v5 integration

---

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- MongoDB
- Emergent LLM Key (provided)

### 🏃 Application is Running!

**Frontend**: http://localhost:3000
**Backend**: http://localhost:8001

### 🔑 Demo Login
1. Go to http://localhost:3000
2. Click the **"Use Demo"** button (logs in automatically)
3. Start creating posts!

**Demo Credentials:**
- Username: `demo`
- Password: `demo123`

*Note: The demo user is now active and working correctly!*

---

## 📱 Using the Application

### 1. Sign Up / Login
- Navigate to http://localhost:3000
- Use the demo account or create your own
- Your credentials are securely stored

### 2. Create a Post
- Click "Create Post" in the navigation
- **Generate Caption with AI:**
  - Enter your topic/description
  - Choose a tone (engaging, professional, etc.)
  - Add keywords (optional)
  - Click "Generate Caption"
- **Generate Image with AI:**
  - Describe the image you want
  - Select size, quality, and style
  - Click "Generate Image"
  - Or paste an image URL

### 3. Schedule Your Post
- Choose a date and time for posting
- Or save as draft for later
- Your post will be stored securely

### 4. Manage Posts
- View all your posts in the dashboard
- Filter by status: All, Draft, Scheduled, Published
- Edit or delete posts as needed

---

## 🎯 Current Status

### ✅ Completed Features
- [x] User authentication (signup/login)
- [x] JWT-based security
- [x] AI caption generation (GPT-4o)
- [x] **AI image generation (DALL-E via gpt-image-1)**
- [x] Post creation and management
- [x] Post scheduling
- [x] Dashboard with filtering
- [x] Responsive UI design
- [x] MongoDB integration
- [x] Pinterest integration (Mock mode)
- [x] Multi-board posting
- [x] **Fixed: All text inputs working correctly**

### 🚧 Ready for Enhancement
- [ ] Pinterest OAuth flow (requires real Pinterest App credentials)
- [ ] Automated scheduled post publishing (APScheduler)
- [ ] Analytics dashboard
- [ ] Template library

---

## 📚 Documentation

- **README.md** (this file) - Overview and quick start
- **ROADMAP.md** - Detailed development status and next steps
- **LOGIN_CREDENTIALS.md** - Demo account and login instructions
- **PINTEREST_API_SETUP.md** - Pinterest API setup guide
- **TROUBLESHOOTING.md** - Common issues and solutions

---

## 🔧 Service Management

### Check Status
```bash
sudo supervisorctl status
```

### Restart Services
```bash
# Restart all
sudo supervisorctl restart all

# Restart individually
sudo supervisorctl restart backend
sudo supervisorctl restart frontend
```

### View Logs
```bash
# Backend logs
tail -f /var/log/supervisor/backend.err.log

# Frontend logs
tail -f /var/log/supervisor/frontend.err.log
```

---

## 💻 Development

### Project Structure
```
/app/
├── backend/
│   ├── server.py              # Main FastAPI application
│   ├── pinterest_service.py   # Pinterest integration
│   ├── requirements.txt       # Python dependencies
│   └── .env                   # Backend environment variables
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── services/          # API client
│   │   ├── App.js             # Main React component
│   │   └── main.jsx           # Entry point
│   ├── package.json           # Node dependencies
│   ├── vite.config.js         # Vite configuration
│   └── .env                   # Frontend environment variables
└── *.md                       # Documentation
```

### Environment Variables

**Backend (.env)**
```bash
MONGO_URL=mongodb://localhost:27017/pinspire
JWT_SECRET=your-secret-key-change-in-production
JWT_ALGORITHM=HS256
EMERGENT_LLM_KEY=sk-emergent-c5277642b022eC64e7
PINTEREST_APP_ID=MOCK_1234567890        # Mock mode
PINTEREST_APP_SECRET=MOCK_secret        # Mock mode
PINTEREST_REDIRECT_URI=http://localhost:3000/pinterest/callback
```

**Frontend (.env)**
```bash
REACT_APP_BACKEND_URL=http://localhost:8001
```

---

## 📡 API Endpoints

### Authentication
```bash
POST /api/auth/signup - User registration
POST /api/auth/login - User login
GET /api/auth/me - Get current user
```

### AI Generation
```bash
POST /api/ai/generate-caption - Generate caption using GPT-4o
POST /api/ai/generate-image - Generate image using DALL-E 3
POST /api/ai/suggest-hashtags - Get hashtag suggestions
```

### Posts
```bash
GET /api/posts - Get all user posts
POST /api/posts - Create new post
GET /api/posts/{id} - Get post by ID
PUT /api/posts/{id} - Update post
DELETE /api/posts/{id} - Delete post
```

### Pinterest
```bash
GET /api/pinterest/mode - Check mock/real mode
GET /api/pinterest/connect - Initiate OAuth
POST /api/pinterest/callback - OAuth callback
GET /api/pinterest/boards - Get user boards
POST /api/pinterest/post/{id} - Post to Pinterest
```

**API Documentation**: http://localhost:8001/docs (FastAPI auto-generated)

---

## 🧪 Testing

### Test Backend
```bash
# Health check
curl http://localhost:8001/

# Create user
curl -X POST http://localhost:8001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"test123"}'

# Generate AI caption (replace <token>)
curl -X POST http://localhost:8001/api/ai/generate-caption \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"topic":"Travel tips","tone":"engaging"}'
```

### Test Frontend
- Open http://localhost:3000 in your browser
- Login with demo account
- Create a post with AI assistance
- View posts in dashboard

---

## 🎨 UI Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Pinterest-Inspired**: Red color scheme matching Pinterest branding
- **Modern Components**: Clean, intuitive interface
- **Loading States**: Visual feedback during AI generation
- **Error Handling**: User-friendly error messages

---

## 🔮 Future Enhancements

### Phase 6: Automated Scheduling
- APScheduler integration
- Background job system
- Automated publishing at scheduled times

### Phase 7: Analytics & Polish
- Analytics dashboard
- Post performance tracking
- Template library
- Batch operations

### Beyond
- Multi-platform support (Instagram, Facebook)
- Team collaboration
- Advanced AI features
- Content calendar view

---

## 📝 Notes

### AI Generation
- Uses Emergent LLM Key for OpenAI access
- GPT-4o for caption generation
- DALL-E 3 for image generation
- Supports multiple tones and styles

### Database
- MongoDB for flexible document storage
- Collections: users, posts
- UUID-based IDs for consistency

### Security
- Passwords hashed with bcrypt
- JWT tokens for authentication
- CORS configured for local development
- Protected API endpoints

---

## 🆘 Recent Updates

**January 27, 2025:**
- ✅ Fixed text input issue in Create Post page
- ✅ Added Vite proxy configuration for /api routes
- ✅ All text inputs now working correctly
- ✅ Cleaned up documentation
- ✅ Updated ROADMAP with current status

---

## 🔱 Troubleshooting

For common issues and solutions, see **TROUBLESHOOTING.md**

Quick fixes:
```bash
# Check service status
sudo supervisorctl status

# Restart all services
sudo supervisorctl restart all

# View backend logs
tail -f /var/log/supervisor/backend.err.log
```

---

## 🤝 Contributing

This is an MVP application. Planned improvements include:
- Pinterest API integration (real credentials)
- Advanced scheduling features
- Analytics and insights
- Template library
- Team collaboration features

---

## 📝 License

This project is part of the Pinspire MVP.

---

**Built with ❤️ using FastAPI, React, and OpenAI**

*Pinspire - Making Pinterest Marketing Effortless*