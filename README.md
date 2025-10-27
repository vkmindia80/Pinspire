# Pinspire - AI Pinterest Post Creator & Scheduler

<div align="center">
  <h3>🎨 Create Stunning Pinterest Posts with AI 🚀</h3>
  <p>AI-Powered Caption Generation | Image Creation | Smart Scheduling</p>
</div>

---

## ✨ Features

### 🤖 AI-Powered Content Creation
- **Smart Caption Generation**: GPT-4o generates engaging, Pinterest-optimized captions
- **AI Image Generation**: DALL-E 3 creates stunning visuals from text prompts
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

### Installation

The application is already set up and running!

**Backend**: http://localhost:8001
**Frontend**: http://localhost:3000

### Environment Variables

#### Backend (.env)
```bash
MONGO_URL=mongodb://localhost:27017/pinspire
JWT_SECRET=your-secret-key-change-in-production
JWT_ALGORITHM=HS256
EMERGENT_LLM_KEY=sk-emergent-c5277642b022eC64e7
PINTEREST_APP_ID=        # Add your Pinterest App ID
PINTEREST_APP_SECRET=    # Add your Pinterest App Secret
PINTEREST_REDIRECT_URI=http://localhost:3000/pinterest/callback
```

#### Frontend (.env)
```bash
REACT_APP_BACKEND_URL=http://localhost:8001
```

---

## 📱 Using the Application

### 1. Sign Up / Login
- Navigate to http://localhost:3000
- Create an account or login
- Your credentials are securely stored

### 2. Create a Post
- Click "Create Post" in the navigation
- Use AI to generate captions:
  - Enter your topic/description
  - Choose a tone (engaging, professional, etc.)
  - Add keywords (optional)
  - Click "Generate Caption"
- Use AI to generate images:
  - Describe the image you want
  - Click "Generate Image"
  - Or paste an image URL

### 3. Schedule Your Post
- Choose a date and time for posting
- Or save as draft for later
- Your post will be automatically published at the scheduled time

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
- [x] AI image generation (placeholder - DALL-E integration ready)
- [x] Post creation and management
- [x] Post scheduling
- [x] Dashboard with filtering
- [x] Responsive UI design
- [x] MongoDB integration

### 🚧 Pending Integration
- [ ] Pinterest OAuth flow (requires Pinterest App credentials)
- [ ] Pinterest board fetching
- [ ] Actual posting to Pinterest
- [ ] DALL-E 3 image generation (requires OpenAI API integration)
- [ ] Automated scheduled post publishing (APScheduler)

---

## 📖 API Documentation

### Authentication
```bash
# Signup
POST /api/auth/signup
Body: {"username": "user", "email": "user@example.com", "password": "pass123"}

# Login
POST /api/auth/login
Body: {"username": "user", "password": "pass123"}

# Get current user
GET /api/auth/me
Headers: Authorization: Bearer <token>
```

### AI Generation
```bash
# Generate caption
POST /api/ai/generate-caption
Headers: Authorization: Bearer <token>
Body: {"topic": "Healthy recipes", "tone": "engaging", "keywords": ["healthy", "food"]}

# Generate image
POST /api/ai/generate-image
Headers: Authorization: Bearer <token>
Body: {"prompt": "Beautiful sunset over mountains", "style": "professional"}

# Suggest hashtags
POST /api/ai/suggest-hashtags
Headers: Authorization: Bearer <token>
Body: {"topic": "Travel photography"}
```

### Posts
```bash
# Get all posts
GET /api/posts
Headers: Authorization: Bearer <token>

# Create post
POST /api/posts
Headers: Authorization: Bearer <token>
Body: {"caption": "...", "image_url": "...", "scheduled_time": "2025-01-01T10:00:00"}

# Update post
PUT /api/posts/{post_id}
Headers: Authorization: Bearer <token>
Body: {"caption": "Updated caption"}

# Delete post
DELETE /api/posts/{post_id}
Headers: Authorization: Bearer <token>
```

---

## 🔧 Development

### Running Services

**Backend:**
```bash
cd /app/backend
python3 -m uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

**Frontend:**
```bash
cd /app/frontend
yarn dev
```

**Using Supervisor (Recommended):**
```bash
sudo supervisorctl restart all
sudo supervisorctl status
```

### Project Structure
```
/app/
├── backend/
│   ├── server.py           # Main FastAPI application
│   ├── requirements.txt    # Python dependencies
│   └── .env               # Backend environment variables
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/      # Login & Signup
│   │   │   ├── Dashboard/ # Post management
│   │   │   ├── PostCreator/ # AI post creation
│   │   │   └── Common/    # Shared components
│   │   ├── services/
│   │   │   └── api.js     # API client
│   │   ├── App.js         # Main React component
│   │   └── main.jsx       # Entry point
│   ├── package.json       # Node dependencies
│   └── .env              # Frontend environment variables
├── ROADMAP.md             # Detailed development roadmap
└── PINTEREST_API_SETUP.md # Pinterest API setup guide
```

---

## 🔌 Pinterest API Setup

To enable real Pinterest posting, follow these steps:

1. **Create Pinterest Developer Account**
   - Go to https://developers.pinterest.com/
   - Create a new app
   - Get your App ID and App Secret

2. **Configure OAuth**
   - Set redirect URI: `http://localhost:3000/pinterest/callback`
   - Add required scopes: `boards:read`, `boards:write`, `pins:read`, `pins:write`

3. **Update Environment Variables**
   - Add `PINTEREST_APP_ID` to backend/.env
   - Add `PINTEREST_APP_SECRET` to backend/.env

📖 See [PINTEREST_API_SETUP.md](./PINTEREST_API_SETUP.md) for detailed instructions.

---

## 🧪 Testing

### Test Backend API
```bash
# Health check
curl http://localhost:8001/

# Create user
curl -X POST http://localhost:8001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"test123"}'

# Generate AI caption
curl -X POST http://localhost:8001/api/ai/generate-caption \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"topic":"Travel tips","tone":"engaging"}'
```

### Test Frontend
- Open http://localhost:3000 in your browser
- Sign up / Login
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

### Phase 2 Features
- Analytics dashboard
- Post performance tracking
- Template library
- Batch operations
- Image editing tools

### Phase 3 Features
- Multi-platform support (Instagram, Facebook)
- Team collaboration
- Advanced scheduling (optimal time suggestions)
- Content calendar view
- Brand kit management

---

## 📝 Notes

### AI Generation
- Uses Emergent LLM Key for OpenAI access
- GPT-4o for caption generation
- DALL-E 3 integration ready (placeholder active)
- Supports multiple tones and styles

### Database
- MongoDB for flexible document storage
- Collections: users, posts, templates
- UUID-based IDs for consistency

### Security
- Passwords hashed with bcrypt
- JWT tokens for authentication
- CORS configured for local development
- Protected API endpoints

---

## 🤝 Contributing

This is an MVP application. Future improvements include:
- Pinterest API integration
- Advanced scheduling features
- Analytics and insights
- Template library
- Team collaboration features

---

## 📄 License

This project is part of the Pinspire MVP.

---

## 🆘 Support

For issues or questions:
1. Check the [ROADMAP.md](./ROADMAP.md) for planned features
2. Review [PINTEREST_API_SETUP.md](./PINTEREST_API_SETUP.md) for API setup
3. Check logs:
   - Backend: `/var/log/supervisor/backend.*.log`
   - Frontend: `/var/log/supervisor/frontend.*.log`

---

**Built with ❤️ using FastAPI, React, and OpenAI**

*Pinspire - Making Pinterest Marketing Effortless*
