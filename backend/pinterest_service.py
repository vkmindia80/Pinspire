"""
Pinterest API Integration Service
Supports both mock mode (for testing) and real Pinterest API integration
"""
import os
import httpx
import uuid
from datetime import datetime, timedelta
from typing import Optional, Dict, List
from urllib.parse import urlencode

# Pinterest API Configuration
PINTEREST_API_BASE = "https://api.pinterest.com/v5"
PINTEREST_AUTH_URL = "https://www.pinterest.com/oauth/"
PINTEREST_TOKEN_URL = "https://api.pinterest.com/v5/oauth/token"

# Get credentials from environment
PINTEREST_APP_ID = os.getenv("PINTEREST_APP_ID", "")
PINTEREST_APP_SECRET = os.getenv("PINTEREST_APP_SECRET", "")
PINTEREST_REDIRECT_URI = os.getenv("PINTEREST_REDIRECT_URI", "http://localhost:3000/pinterest/callback")

# Check if we're in mock mode
IS_MOCK_MODE = PINTEREST_APP_ID.startswith("MOCK_") or not PINTEREST_APP_ID or not PINTEREST_APP_SECRET


class PinterestService:
    """Pinterest API service with mock mode support"""
    
    def __init__(self):
        self.app_id = PINTEREST_APP_ID
        self.app_secret = PINTEREST_APP_SECRET
        self.redirect_uri = PINTEREST_REDIRECT_URI
        self.is_mock = IS_MOCK_MODE
    
    def get_authorization_url(self, state: str) -> str:
        """Generate Pinterest OAuth authorization URL"""
        if self.is_mock:
            # In mock mode, return a mock URL that will be handled by frontend
            return f"/pinterest/mock-auth?state={state}&mock=true"
        
        params = {
            "client_id": self.app_id,
            "redirect_uri": self.redirect_uri,
            "response_type": "code",
            "scope": "boards:read,boards:write,pins:read,pins:write,user_accounts:read",
            "state": state
        }
        return f"{PINTEREST_AUTH_URL}?{urlencode(params)}"
    
    async def exchange_code_for_token(self, code: str) -> Dict:
        """Exchange authorization code for access token"""
        if self.is_mock:
            # Mock token response
            return {
                "access_token": f"mock_access_token_{uuid.uuid4().hex[:16]}",
                "refresh_token": f"mock_refresh_token_{uuid.uuid4().hex[:16]}",
                "token_type": "bearer",
                "expires_in": 3600,
                "scope": "boards:read,boards:write,pins:read,pins:write,user_accounts:read"
            }
        
        # Real Pinterest API call
        async with httpx.AsyncClient() as client:
            response = await client.post(
                PINTEREST_TOKEN_URL,
                data={
                    "grant_type": "authorization_code",
                    "code": code,
                    "redirect_uri": self.redirect_uri
                },
                auth=(self.app_id, self.app_secret),
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )
            
            if response.status_code != 200:
                raise Exception(f"Failed to exchange code: {response.text}")
            
            return response.json()
    
    async def refresh_access_token(self, refresh_token: str) -> Dict:
        """Refresh an expired access token"""
        if self.is_mock:
            # Mock refresh response
            return {
                "access_token": f"mock_access_token_{uuid.uuid4().hex[:16]}",
                "refresh_token": refresh_token,
                "token_type": "bearer",
                "expires_in": 3600
            }
        
        # Real Pinterest API call
        async with httpx.AsyncClient() as client:
            response = await client.post(
                PINTEREST_TOKEN_URL,
                data={
                    "grant_type": "refresh_token",
                    "refresh_token": refresh_token
                },
                auth=(self.app_id, self.app_secret),
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )
            
            if response.status_code != 200:
                raise Exception(f"Failed to refresh token: {response.text}")
            
            return response.json()
    
    async def get_user_boards(self, access_token: str) -> List[Dict]:
        """Fetch user's Pinterest boards"""
        if self.is_mock:
            # Mock boards data
            return [
                {
                    "id": f"mock_board_{i}",
                    "name": board_name,
                    "description": f"A sample {board_name.lower()} board",
                    "privacy": "PUBLIC",
                    "pin_count": 10 + i * 5
                }
                for i, board_name in enumerate([
                    "My Inspiration Board",
                    "Design Ideas",
                    "Marketing Tips",
                    "Travel Dreams",
                    "Recipe Collection"
                ], 1)
            ]
        
        # Real Pinterest API call
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{PINTEREST_API_BASE}/boards",
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Content-Type": "application/json"
                }
            )
            
            if response.status_code != 200:
                raise Exception(f"Failed to fetch boards: {response.text}")
            
            data = response.json()
            return data.get("items", [])
    
    async def create_pin(
        self,
        access_token: str,
        board_id: str,
        title: str,
        description: str,
        image_url: str,
        link: Optional[str] = None
    ) -> Dict:
        """Create a pin on Pinterest"""
        if self.is_mock:
            # Mock pin creation response
            return {
                "id": f"mock_pin_{uuid.uuid4().hex[:12]}",
                "board_id": board_id,
                "title": title,
                "description": description,
                "link": link or image_url,
                "media": {
                    "images": {
                        "originals": {
                            "url": image_url
                        }
                    }
                },
                "created_at": datetime.utcnow().isoformat(),
                "note": "MOCK MODE: Pin created successfully (not posted to real Pinterest)"
            }
        
        # Real Pinterest API call
        pin_data = {
            "board_id": board_id,
            "title": title,
            "description": description,
            "media_source": {
                "source_type": "image_url",
                "url": image_url
            }
        }
        
        if link:
            pin_data["link"] = link
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{PINTEREST_API_BASE}/pins",
                json=pin_data,
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Content-Type": "application/json"
                }
            )
            
            if response.status_code not in [200, 201]:
                raise Exception(f"Failed to create pin: {response.text}")
            
            return response.json()
    
    async def get_user_info(self, access_token: str) -> Dict:
        """Get Pinterest user account information"""
        if self.is_mock:
            # Mock user info
            return {
                "username": "mock_pinterest_user",
                "account_type": "BUSINESS",
                "profile_image": "https://via.placeholder.com/150",
                "website_url": "https://example.com"
            }
        
        # Real Pinterest API call
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{PINTEREST_API_BASE}/user_account",
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Content-Type": "application/json"
                }
            )
            
            if response.status_code != 200:
                raise Exception(f"Failed to fetch user info: {response.text}")
            
            return response.json()
    
    def get_mode_info(self) -> Dict:
        """Get information about current mode (mock or real)"""
        return {
            "is_mock": self.is_mock,
            "mode": "MOCK" if self.is_mock else "REAL",
            "message": "Using mock Pinterest API for testing. Update credentials in settings to use real Pinterest." if self.is_mock else "Connected to real Pinterest API",
            "app_id_configured": bool(self.app_id and not self.app_id.startswith("MOCK_")),
            "app_secret_configured": bool(self.app_secret and not self.app_secret.startswith("MOCK_"))
        }


# Singleton instance
pinterest_service = PinterestService()
