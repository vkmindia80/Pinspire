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
from functools import lru_cache
from emergentintegrations.llm.chat import LlmChat, UserMessage
from emergentintegrations.llm.openai.image_generation import OpenAIImageGeneration
from pinterest_service import pinterest_service
import httpx
import base64

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(title="Pinspire API")

# Simple rate limiting - track requests per IP
from collections import defaultdict, deque
import time

request_tracker = defaultdict(lambda: deque(maxlen=500))  # Track last 500 requests per IP
RATE_LIMIT_WINDOW = 60  # seconds
MAX_REQUESTS_PER_WINDOW = 300  # Increased to 300 requests per minute

# Paths that should be excluded from rate limiting
RATE_LIMIT_EXCLUDE_PATHS = [
    "/",
    "/docs",
    "/openapi.json",
    "/api/pinterest/mode"  # Cached endpoint, no need to rate limit
]

async def rate_limit_check(request):
    """Simple rate limiting middleware"""
    # Skip rate limiting for excluded paths
    if request.url.path in RATE_LIMIT_EXCLUDE_PATHS:
        return
    
    client_ip = request.client.host
    current_time = time.time()
    
    # Clean old requests outside the window
    while request_tracker[client_ip] and request_tracker[client_ip][0] < current_time - RATE_LIMIT_WINDOW:
        request_tracker[client_ip].popleft()
    
    # Check if limit exceeded
    if len(request_tracker[client_ip]) >= MAX_REQUESTS_PER_WINDOW:
        raise HTTPException(
            status_code=429,
            detail=f"Rate limit exceeded. Maximum {MAX_REQUESTS_PER_WINDOW} requests per {RATE_LIMIT_WINDOW} seconds. Please slow down."
        )
    
    # Add current request
    request_tracker[client_ip].append(current_time)

# Add rate limiting middleware
@app.middleware("http")
async def rate_limiting_middleware(request, call_next):
    """Apply rate limiting to all requests"""
    # Process the request first, then check rate limit
    # This prevents interfering with response generation
    try:
        await rate_limit_check(request)
        response = await call_next(request)
        return response
    except HTTPException as e:
        from fastapi.responses import JSONResponse
        return JSONResponse(
            status_code=e.status_code,
            content={"detail": e.detail}
        )

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
    size: Optional[str] = "1024x1024"  # Options: 1024x1024, 1792x1024, 1024x1792
    quality: Optional[str] = "standard"  # Options: standard, hd
    style: Optional[str] = "vivid"  # Options: natural, vivid

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

class PinterestPostRequest(BaseModel):
    board_ids: List[str]

class PinterestCallbackRequest(BaseModel):
    code: str
    state: str

class UpdateProfileRequest(BaseModel):
    username: str
    email: str

class UpdatePasswordRequest(BaseModel):
    current_password: str
    new_password: str

class PinterestCredentialsRequest(BaseModel):
    app_id: str
    app_secret: str
    redirect_uri: str

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

@app.put("/api/auth/update-profile")
async def update_profile(request: UpdateProfileRequest, current_user: dict = Depends(get_current_user)):
    """Update user profile (username and email)"""
    try:
        # Check if username or email already exists for another user
        existing_user = await db.users.find_one({
            "$and": [
                {"_id": {"$ne": current_user["_id"]}},
                {"$or": [
                    {"username": request.username},
                    {"email": request.email}
                ]}
            ]
        })
        
        if existing_user:
            raise HTTPException(status_code=400, detail="Username or email already in use by another account")
        
        # Update user profile
        await db.users.update_one(
            {"_id": current_user["_id"]},
            {"$set": {
                "username": request.username,
                "email": request.email,
                "updated_at": datetime.utcnow().isoformat()
            }}
        )
        
        return {
            "success": True,
            "message": "Profile updated successfully",
            "user": {
                "id": current_user["_id"],
                "username": request.username,
                "email": request.email
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating profile: {str(e)}")

@app.put("/api/auth/update-password")
async def update_password(request: UpdatePasswordRequest, current_user: dict = Depends(get_current_user)):
    """Update user password"""
    try:
        # Verify current password
        if not verify_password(request.current_password, current_user["password_hash"]):
            raise HTTPException(status_code=400, detail="Current password is incorrect")
        
        # Hash new password
        new_password_hash = hash_password(request.new_password)
        
        # Update password
        await db.users.update_one(
            {"_id": current_user["_id"]},
            {"$set": {
                "password_hash": new_password_hash,
                "updated_at": datetime.utcnow().isoformat()
            }}
        )
        
        return {
            "success": True,
            "message": "Password updated successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating password: {str(e)}")

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
        # Validate size parameter
        valid_sizes = ["1024x1024", "1792x1024", "1024x1792"]
        if request.size not in valid_sizes:
            raise HTTPException(status_code=400, detail=f"Invalid size. Must be one of: {', '.join(valid_sizes)}")
        
        # Validate quality parameter
        valid_qualities = ["standard", "hd"]
        if request.quality not in valid_qualities:
            raise HTTPException(status_code=400, detail=f"Invalid quality. Must be one of: {', '.join(valid_qualities)}")
        
        # Validate style parameter
        valid_styles = ["natural", "vivid"]
        if request.style not in valid_styles:
            raise HTTPException(status_code=400, detail=f"Invalid style. Must be one of: {', '.join(valid_styles)}")
        
        # Initialize OpenAI Image Generation with Emergent LLM Key
        image_gen = OpenAIImageGeneration(api_key=EMERGENT_LLM_KEY)
        
        # Generate image using gpt-image-1 (latest DALL-E model)
        # Note: The emergentintegrations library uses gpt-image-1 as the latest model
        images = await image_gen.generate_images(
            prompt=request.prompt,
            model="gpt-image-1",
            number_of_images=1
        )
        
        if not images or len(images) == 0:
            raise HTTPException(status_code=500, detail="No image was generated")
        
        # Convert image bytes to base64
        image_base64 = base64.b64encode(images[0]).decode('utf-8')
        image_data_url = f"data:image/png;base64,{image_base64}"
        
        return {
            "image_url": image_data_url,
            "prompt": request.prompt,
            "size": request.size,
            "quality": request.quality,
            "style": request.style,
            "success": True,
            "note": "Image generated with DALL-E (gpt-image-1) via Emergent LLM Key"
        }
    except HTTPException:
        raise
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

# Pinterest Integration Routes

@app.get("/api/pinterest/credentials")
async def get_pinterest_credentials(current_user: dict = Depends(get_current_user)):
    """Get user's Pinterest API credentials"""
    credentials = current_user.get("pinterest_credentials", {})
    
    # Return credentials but mask the secret
    if credentials and credentials.get("app_secret"):
        credentials["app_secret"] = "••••••••" + credentials["app_secret"][-4:] if len(credentials["app_secret"]) > 4 else "••••••••"
    
    return {
        "credentials": credentials if credentials else None
    }

@app.put("/api/pinterest/credentials")
async def update_pinterest_credentials(request: PinterestCredentialsRequest, current_user: dict = Depends(get_current_user)):
    """Save user's Pinterest API credentials"""
    try:
        credentials = {
            "app_id": request.app_id,
            "app_secret": request.app_secret,
            "redirect_uri": request.redirect_uri,
            "updated_at": datetime.utcnow().isoformat()
        }
        
        await db.users.update_one(
            {"_id": current_user["_id"]},
            {"$set": {
                "pinterest_credentials": credentials,
                "updated_at": datetime.utcnow().isoformat()
            }}
        )
        
        return {
            "success": True,
            "message": "Pinterest credentials saved successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving credentials: {str(e)}")

@app.delete("/api/pinterest/credentials")
async def delete_pinterest_credentials(current_user: dict = Depends(get_current_user)):
    """Delete user's Pinterest API credentials"""
    try:
        await db.users.update_one(
            {"_id": current_user["_id"]},
            {"$unset": {
                "pinterest_credentials": ""
            }}
        )
        
        return {
            "success": True,
            "message": "Pinterest credentials deleted successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting credentials: {str(e)}")

# Cache for mode info (expires after restart)
_pinterest_mode_cache = None

@app.get("/api/pinterest/mode")
async def get_pinterest_mode(current_user: dict = Depends(get_current_user)):
    """Get information about Pinterest integration mode (mock vs real)"""
    # Check if user has custom credentials
    user_credentials = current_user.get("pinterest_credentials", {})
    has_user_credentials = bool(user_credentials.get("app_id") and user_credentials.get("app_secret"))
    
    if has_user_credentials:
        # User has their own credentials - real mode
        return {
            "is_mock": False,
            "mode": "real",
            "message": "Using your Pinterest API credentials"
        }
    else:
        # No user credentials - mock mode
        return pinterest_service.get_mode_info()

@app.get("/api/pinterest/connect")
async def connect_pinterest(current_user: dict = Depends(get_current_user)):
    """Initiate Pinterest OAuth flow"""
    try:
        # Generate state token for security
        state = str(uuid.uuid4())
        
        # Store state in user document for verification
        await db.users.update_one(
            {"_id": current_user["_id"]},
            {"$set": {"pinterest_oauth_state": state}}
        )
        
        # Get authorization URL
        auth_url = pinterest_service.get_authorization_url(state)
        
        return {
            "auth_url": auth_url,
            "state": state,
            "is_mock": pinterest_service.is_mock
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error initiating Pinterest connection: {str(e)}")

@app.post("/api/pinterest/callback")
async def pinterest_callback(request: PinterestCallbackRequest, current_user: dict = Depends(get_current_user)):
    """Handle Pinterest OAuth callback"""
    try:
        # Verify state
        user = await db.users.find_one({"_id": current_user["_id"]})
        
        # For mock mode, skip state verification if not set
        if not pinterest_service.is_mock:
            if user.get("pinterest_oauth_state") != request.state:
                raise HTTPException(status_code=400, detail="Invalid state parameter")
        
        # Exchange code for tokens
        token_data = await pinterest_service.exchange_code_for_token(request.code)
        
        # Get user info from Pinterest
        try:
            pinterest_user_info = await pinterest_service.get_user_info(token_data["access_token"])
        except:
            pinterest_user_info = {"username": "pinterest_user"}
        
        # Store tokens in database (in production, encrypt these!)
        await db.users.update_one(
            {"_id": current_user["_id"]},
            {"$set": {
                "pinterest_connected": True,
                "pinterest_access_token": token_data["access_token"],
                "pinterest_refresh_token": token_data.get("refresh_token"),
                "pinterest_token_expires": (datetime.utcnow() + timedelta(seconds=token_data.get("expires_in", 3600))).isoformat(),
                "pinterest_username": pinterest_user_info.get("username"),
                "pinterest_oauth_state": None,
                "updated_at": datetime.utcnow().isoformat()
            }}
        )
        
        return {
            "success": True,
            "message": "Pinterest connected successfully",
            "username": pinterest_user_info.get("username"),
            "is_mock": pinterest_service.is_mock
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error connecting Pinterest: {str(e)}")

@app.post("/api/pinterest/disconnect")
async def disconnect_pinterest(current_user: dict = Depends(get_current_user)):
    """Disconnect Pinterest account"""
    try:
        await db.users.update_one(
            {"_id": current_user["_id"]},
            {"$set": {
                "pinterest_connected": False,
                "pinterest_access_token": None,
                "pinterest_refresh_token": None,
                "pinterest_token_expires": None,
                "pinterest_username": None,
                "updated_at": datetime.utcnow().isoformat()
            }}
        )
        
        return {"success": True, "message": "Pinterest disconnected successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error disconnecting Pinterest: {str(e)}")

@app.get("/api/pinterest/boards")
async def get_pinterest_boards(current_user: dict = Depends(get_current_user)):
    """Fetch user's Pinterest boards"""
    if not current_user.get("pinterest_connected"):
        raise HTTPException(status_code=400, detail="Pinterest not connected. Please connect your Pinterest account first.")
    
    try:
        access_token = current_user.get("pinterest_access_token")
        
        # Check if token needs refresh
        token_expires = current_user.get("pinterest_token_expires")
        if token_expires:
            expires_dt = datetime.fromisoformat(token_expires)
            if expires_dt < datetime.utcnow() + timedelta(minutes=5):
                # Token expired or expiring soon, refresh it
                refresh_token = current_user.get("pinterest_refresh_token")
                if refresh_token:
                    token_data = await pinterest_service.refresh_access_token(refresh_token)
                    access_token = token_data["access_token"]
                    
                    # Update tokens in database
                    await db.users.update_one(
                        {"_id": current_user["_id"]},
                        {"$set": {
                            "pinterest_access_token": access_token,
                            "pinterest_token_expires": (datetime.utcnow() + timedelta(seconds=token_data.get("expires_in", 3600))).isoformat()
                        }}
                    )
        
        # Fetch boards
        boards = await pinterest_service.get_user_boards(access_token)
        
        return {
            "boards": boards,
            "is_mock": pinterest_service.is_mock
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching boards: {str(e)}")

@app.post("/api/pinterest/post/{post_id}")
async def post_to_pinterest(post_id: str, request: PinterestPostRequest, current_user: dict = Depends(get_current_user)):
    """Post a pin to Pinterest board(s)"""
    if not current_user.get("pinterest_connected"):
        raise HTTPException(status_code=400, detail="Pinterest not connected")
    
    try:
        # Get post
        post = await db.posts.find_one({"_id": post_id, "user_id": current_user["_id"]})
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")
        
        if not post.get("image_url"):
            raise HTTPException(status_code=400, detail="Post must have an image to post to Pinterest")
        
        access_token = current_user.get("pinterest_access_token")
        
        # Create pins on selected boards
        pin_ids = []
        for board_id in request.board_ids:
            pin_result = await pinterest_service.create_pin(
                access_token=access_token,
                board_id=board_id,
                title=post.get("caption", "")[:100],  # Pinterest title limit
                description=post.get("caption", ""),
                image_url=post.get("image_url"),
                link=None
            )
            pin_ids.append(pin_result.get("id"))
        
        # Update post status
        await db.posts.update_one(
            {"_id": post_id},
            {"$set": {
                "status": "published",
                "published_at": datetime.utcnow().isoformat(),
                "pinterest_post_ids": pin_ids,
                "pinterest_boards_posted": request.board_ids
            }}
        )
        
        return {
            "success": True,
            "message": f"Post published to {len(request.board_ids)} board(s) successfully",
            "pin_ids": pin_ids,
            "is_mock": pinterest_service.is_mock
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error posting to Pinterest: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)