# Pinterest API Setup Guide

## 🎯 Overview

This guide will walk you through setting up Pinterest API access for Pinspire. Pinterest uses OAuth 2.0 for authentication, allowing users to connect their Pinterest accounts securely.

---

## 📋 Prerequisites

- A Pinterest account (personal or business)
- Access to Pinterest Developers portal
- A verified website (for production use)

---

## 🚀 Step-by-Step Setup

### Step 1: Create a Pinterest Developer Account

1. Go to [Pinterest Developers](https://developers.pinterest.com/)
2. Click **"Get Started"** or **"Sign In"**
3. Log in with your Pinterest account
4. Accept the Pinterest Developer Terms of Service

### Step 2: Create a New App

1. Navigate to [My Apps](https://developers.pinterest.com/apps/)
2. Click **"Create app"**
3. Fill in the app details:
   - **App name:** Pinspire (or your preferred name)
   - **App description:** AI-powered Pinterest post creation and scheduling tool
   - **App website URL:** 
     - For development: `http://localhost:3000`
     - For production: Your actual domain
   - **Redirect URI:** 
     - For development: `http://localhost:3000/pinterest/callback`
     - For production: `https://yourdomain.com/pinterest/callback`

4. Select the permissions your app needs:
   - ✅ `boards:read` - Read board information
   - ✅ `boards:write` - Create and update boards
   - ✅ `pins:read` - Read pin information
   - ✅ `pins:write` - Create and update pins
   - ✅ `user_accounts:read` - Read user account information

5. Click **"Create"**

### Step 3: Get Your Credentials

After creating your app:

1. Go to your app's dashboard
2. You'll see:
   - **App ID:** `xxxxxxxxxx`
   - **App Secret:** `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

⚠️ **IMPORTANT:** Keep your App Secret confidential!

### Step 4: Configure OAuth Settings

1. In your app dashboard, go to **"OAuth"** settings
2. Verify your **Redirect URIs** are correctly set:
   ```
   Development: http://localhost:3000/pinterest/callback
   Production: https://yourdomain.com/pinterest/callback
   ```

3. Note the OAuth URLs:
   - **Authorization URL:** `https://www.pinterest.com/oauth/`
   - **Token URL:** `https://api.pinterest.com/v5/oauth/token`

### Step 5: Add Credentials to Pinspire

Once development is complete, you'll add these to your `.env` file:

```bash
# Backend .env file
PINTEREST_APP_ID=your_app_id_here
PINTEREST_APP_SECRET=your_app_secret_here
PINTEREST_REDIRECT_URI=http://localhost:3000/pinterest/callback
```

---

## 🔐 OAuth 2.0 Flow (How It Works)

### Authorization Flow:

1. **User Clicks "Connect Pinterest"**
   - App redirects to Pinterest authorization URL
   - User logs into Pinterest and authorizes app

2. **Pinterest Redirects Back**
   - Pinterest redirects to your callback URL with authorization code
   - Format: `http://localhost:3000/pinterest/callback?code=AUTHORIZATION_CODE`

3. **Exchange Code for Tokens**
   - Backend exchanges authorization code for access token
   - Receives access token and refresh token

4. **Store Tokens Securely**
   - Access token used for API calls
   - Refresh token used to get new access tokens

5. **Make API Calls**
   - Use access token in Authorization header
   - Format: `Authorization: Bearer ACCESS_TOKEN`

### Token Lifetimes:
- **Access Token:** Valid for 1 hour
- **Refresh Token:** Valid for 365 days
- App will automatically refresh tokens when needed

---

## 📚 Pinterest API v5 - Key Endpoints

### User Information
```
GET https://api.pinterest.com/v5/user_account
```
Returns user profile information

### Get Boards
```
GET https://api.pinterest.com/v5/boards
```
Returns list of user's boards

### Create Pin
```
POST https://api.pinterest.com/v5/pins
Content-Type: application/json

{
  "board_id": "board_id_here",
  "title": "Pin title",
  "description": "Pin description",
  "media_source": {
    "source_type": "image_url",
    "url": "https://example.com/image.jpg"
  },
  "link": "https://example.com"
}
```

### Upload Image
```
POST https://api.pinterest.com/v5/media
Content-Type: multipart/form-data

{
  "media": <binary_image_data>
}
```

---

## 🧪 Testing

### Development Mode
- Use your personal Pinterest account for testing
- All pins created will be visible only to you initially
- Test with a dedicated test board

### Rate Limits
- Pinterest API has rate limits:
  - 10 requests per second per user
  - 1000 requests per hour per user
- App will handle rate limiting automatically

---

## ⚠️ Important Notes

### For Development:
1. You can start testing immediately with your developer credentials
2. Pins will post to your personal account
3. No website verification needed for development

### For Production:
1. **Website Verification Required:**
   - You must verify your website domain
   - Add Pinterest meta tag to your website
   - Or upload HTML verification file

2. **App Review:**
   - For public release, Pinterest may require app review
   - Submit app for review in developer dashboard
   - Usually takes 1-2 weeks

3. **Business Account Recommended:**
   - Better analytics
   - Higher API limits
   - Access to Pinterest Business tools

---

## 🔧 Troubleshooting

### Common Issues:

1. **"Invalid redirect_uri" Error**
   - Ensure redirect URI in code matches exactly with Pinterest app settings
   - Include `http://` or `https://`
   - No trailing slashes

2. **"Invalid access token" Error**
   - Token may have expired (1 hour lifetime)
   - Use refresh token to get new access token
   - App handles this automatically

3. **"Permission denied" Error**
   - Ensure all required scopes are added to your app
   - User must re-authorize app after scope changes

4. **"Rate limit exceeded" Error**
   - Wait before retrying
   - Implement exponential backoff
   - App handles this automatically

---

## 📖 Additional Resources

- [Pinterest API Documentation](https://developers.pinterest.com/docs/api/v5/)
- [OAuth 2.0 Guide](https://developers.pinterest.com/docs/getting-started/authentication/)
- [API Reference](https://developers.pinterest.com/docs/api/v5/)
- [Rate Limits](https://developers.pinterest.com/docs/api/v5/#tag/Rate-Limits)
- [Best Practices](https://developers.pinterest.com/docs/solutions/best-practices/)

---

## ✅ Checklist

Before starting development:

- [ ] Created Pinterest Developer account
- [ ] Created new app in Pinterest Dashboard
- [ ] Obtained App ID
- [ ] Obtained App Secret
- [ ] Configured OAuth redirect URIs
- [ ] Added required permissions (scopes)
- [ ] Noted down credentials for .env file

---

## 🎯 Next Steps

Once you have your credentials:

1. ✅ You'll be guided to add them to the application
2. ✅ Backend will implement OAuth flow
3. ✅ Frontend will provide "Connect Pinterest" button
4. ✅ Users can authorize and start posting!

---

## 💡 Quick Start for Testing

If you just want to test the app quickly:

1. Create Pinterest Developer account (5 minutes)
2. Create app with basic settings (3 minutes)
3. Copy App ID and Secret
4. Provide them when prompted during setup
5. Start testing! 🚀

---

**For any questions or issues, Pinterest Developer Support is available at:**
- Email: developers@pinterest.com
- [Support Forum](https://community.pinterest.com/t5/Developer-Forum/bd-p/dev-forum)

---

**Last Updated:** August 2025
