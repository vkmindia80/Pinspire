from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timedelta
from passlib.context import CryptContext
from jose import JWTError, jwt
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os
import uuid
import asyncio
from emergentintegrations.llm.chat import LlmChat, UserMessage
from pinterest_service import pinterest_service

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(title="Pinspire API")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database setup
MONGO_URL = os.getenv("MONGO_URL")
client = AsyncIOMotorClient(MONGO_URL)
db = client.pinspire

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()
JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
EMERGENT_LLM_KEY = os.getenv("EMERGENT_LLM_KEY")

# Pydantic Models
class UserSignup(BaseModel):
    username: str
    email: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class CaptionRequest(BaseModel):
    topic: str
    tone: Optional[str] = "engaging"
    keywords: Optional[List[str]] = []

class ImageGenerationRequest(BaseModel):
    prompt: str
    style: Optional[str] = "professional"

class PostCreate(BaseModel):
    caption: str
    image_url: Optional[str] = None
    image_data: Optional[str] = None
    boards: Optional[List[str]] = []
    scheduled_time: Optional[str] = None
    ai_generated_caption: bool = False
    ai_generated_image: bool = False

class PostUpdate(BaseModel):
    caption: Optional[str] = None
    image_url: Optional[str] = None
    boards: Optional[List[str]] = None
    scheduled_time: Optional[str] = None

# Helper Functions
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=24)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    
    user = await db.users.find_one({"_id": user_id})
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user

# Routes
@app.get("/")
async def root():
    return {"message": "Pinspire API is running", "status": "healthy"}

# Authentication Routes
@app.post("/api/auth/signup")
async def signup(user_data: UserSignup):
    # Check if user exists
    existing_user = await db.users.find_one({"$or": [{"username": user_data.username}, {"email": user_data.email}]})
    if existing_user:
        raise HTTPException(status_code=400, detail="Username or email already exists")
    
    # Create new user
    user_id = str(uuid.uuid4())
    hashed_password = hash_password(user_data.password)
    
    user = {
        "_id": user_id,
        "username": user_data.username,
        "email": user_data.email,
        "password_hash": hashed_password,
        "pinterest_connected": False,
        "pinterest_access_token": None,
        "pinterest_refresh_token": None,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat()
    }
    
    await db.users.insert_one(user)
    
    # Create access token
    access_token = create_access_token(data={"sub": user_id})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "username": user_data.username,
            "email": user_data.email
        }
    }

@app.post("/api/auth/login")
async def login(user_data: UserLogin):
    user = await db.users.find_one({"username": user_data.username})
    if not user or not verify_password(user_data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    
    access_token = create_access_token(data={"sub": user["_id"]})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user["_id"],
            "username": user["username"],
            "email": user["email"],
            "pinterest_connected": user.get("pinterest_connected", False)
        }
    }

@app.get("/api/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return {
        "id": current_user["_id"],
        "username": current_user["username"],
        "email": current_user["email"],
        "pinterest_connected": current_user.get("pinterest_connected", False)
    }

# AI Generation Routes
@app.post("/api/ai/generate-caption")
async def generate_caption(request: CaptionRequest, current_user: dict = Depends(get_current_user)):
    try:
        # Create AI chat instance
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"caption-{uuid.uuid4()}",
            system_message="You are a creative Pinterest caption writer. Create engaging, scroll-stopping captions that drive engagement."
        ).with_model("openai", "gpt-4o")
        
        # Build prompt
        prompt = f"Create a compelling Pinterest caption about: {request.topic}\n"
        prompt += f"Tone: {request.tone}\n"
        if request.keywords:
            prompt += f"Include these keywords naturally: {', '.join(request.keywords)}\n"
        prompt += "\nThe caption should be engaging, include relevant hashtags, and be optimized for Pinterest. Keep it under 500 characters."
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        return {
            "caption": response,
            "success": True
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating caption: {str(e)}")

@app.post("/api/ai/generate-image")
async def generate_image(request: ImageGenerationRequest, current_user: dict = Depends(get_current_user)):
    try:
        # Note: For DALL-E image generation, we'll use OpenAI's API directly
        # The emergentintegrations library is primarily for chat
        # We'll implement a placeholder that returns a mock response for now
        # In production, you'll need to use OpenAI's images.generate endpoint
        
        return {
            "image_url": f"https://via.placeholder.com/800x600?text=AI+Generated+Image",
            "prompt": request.prompt,
            "success": True,
            "note": "Image generation will be implemented with OpenAI DALL-E API"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating image: {str(e)}")

@app.post("/api/ai/suggest-hashtags")
async def suggest_hashtags(request: CaptionRequest, current_user: dict = Depends(get_current_user)):
    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"hashtags-{uuid.uuid4()}",
            system_message="You are a Pinterest hashtag expert. Suggest relevant, trending hashtags."
        ).with_model("openai", "gpt-4o")
        
        prompt = f"Suggest 10-15 relevant Pinterest hashtags for a post about: {request.topic}\n"
        prompt += "Return only the hashtags, one per line, with the # symbol."
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        # Parse hashtags from response
        hashtags = [line.strip() for line in response.split('\n') if line.strip().startswith('#')]
        
        return {
            "hashtags": hashtags,
            "success": True
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error suggesting hashtags: {str(e)}")

# Post Management Routes
@app.get("/api/posts")
async def get_posts(current_user: dict = Depends(get_current_user)):
    posts = await db.posts.find({"user_id": current_user["_id"]}).sort("created_at", -1).to_list(100)
    return {"posts": posts}

@app.post("/api/posts")
async def create_post(post_data: PostCreate, current_user: dict = Depends(get_current_user)):
    post_id = str(uuid.uuid4())
    
    post = {
        "_id": post_id,
        "user_id": current_user["_id"],
        "caption": post_data.caption,
        "image_url": post_data.image_url,
        "image_data": post_data.image_data,
        "boards": post_data.boards or [],
        "scheduled_time": post_data.scheduled_time,
        "status": "scheduled" if post_data.scheduled_time else "draft",
        "ai_generated_caption": post_data.ai_generated_caption,
        "ai_generated_image": post_data.ai_generated_image,
        "pinterest_post_id": None,
        "created_at": datetime.utcnow().isoformat(),
        "published_at": None,
        "metadata": {}
    }
    
    await db.posts.insert_one(post)
    
    return {"post": post, "message": "Post created successfully"}

@app.get("/api/posts/{post_id}")
async def get_post(post_id: str, current_user: dict = Depends(get_current_user)):
    post = await db.posts.find_one({"_id": post_id, "user_id": current_user["_id"]})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return {"post": post}

@app.put("/api/posts/{post_id}")
async def update_post(post_id: str, post_data: PostUpdate, current_user: dict = Depends(get_current_user)):
    post = await db.posts.find_one({"_id": post_id, "user_id": current_user["_id"]})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    update_data = {k: v for k, v in post_data.dict().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow().isoformat()
    
    await db.posts.update_one({"_id": post_id}, {"$set": update_data})
    
    updated_post = await db.posts.find_one({"_id": post_id})
    return {"post": updated_post, "message": "Post updated successfully"}

@app.delete("/api/posts/{post_id}")
async def delete_post(post_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.posts.delete_one({"_id": post_id, "user_id": current_user["_id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Post not found")
    return {"message": "Post deleted successfully"}

# Pinterest Integration Routes (Placeholder)
@app.get("/api/pinterest/boards")
async def get_pinterest_boards(current_user: dict = Depends(get_current_user)):
    # Placeholder - will be implemented with actual Pinterest API
    if not current_user.get("pinterest_connected"):
        raise HTTPException(status_code=400, detail="Pinterest not connected")
    
    # Mock boards for now
    mock_boards = [
        {"id": "board1", "name": "My Inspiration Board"},
        {"id": "board2", "name": "Design Ideas"},
        {"id": "board3", "name": "Marketing Tips"}
    ]
    
    return {"boards": mock_boards}

@app.post("/api/pinterest/post/{post_id}")
async def post_to_pinterest(post_id: str, current_user: dict = Depends(get_current_user)):
    post = await db.posts.find_one({"_id": post_id, "user_id": current_user["_id"]})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    if not current_user.get("pinterest_connected"):
        raise HTTPException(status_code=400, detail="Pinterest not connected")
    
    # Placeholder - will be implemented with actual Pinterest API
    await db.posts.update_one(
        {"_id": post_id},
        {"$set": {
            "status": "published",
            "published_at": datetime.utcnow().isoformat(),
            "pinterest_post_id": f"mock_pin_{uuid.uuid4()}"
        }}
    )
    
    return {"message": "Post published to Pinterest successfully (mock)", "success": True}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)