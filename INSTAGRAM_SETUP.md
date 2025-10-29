# Instagram OAuth Setup Guide

This guide will help you configure Instagram OAuth so you can connect Instagram Business accounts to your brands.

## Prerequisites

- A Facebook Business account
- An Instagram Business or Creator account
- The Instagram account must be connected to a Facebook Page

## Step 1: Create a Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click "My Apps" in the top right
3. Click "Create App"
4. Choose **"Business"** as the app type
5. Fill in the app details:
   - App Name: Your app name (e.g., "SocialHub")
   - App Contact Email: Your email
6. Click "Create App"

## Step 2: Add Instagram Basic Display

1. In your Facebook App dashboard, scroll down to "Add Products"
2. Find **"Instagram Basic Display"** and click "Set Up"
3. Click "Create New App" in the Instagram Basic Display settings
4. Accept the terms and continue

## Step 3: Configure OAuth Settings

1. In the left sidebar, click "Instagram Basic Display" → "Basic Display"
2. Scroll to **"User Token Generator"**
3. Add the following OAuth Redirect URIs:
   ```
   http://localhost:3000/api/oauth/callback/instagram
   ```

   For production, also add:
   ```
   https://yourdomain.com/api/oauth/callback/instagram
   ```

4. Add Deauthorize Callback URL:
   ```
   http://localhost:3000/api/oauth/deauthorize
   ```

5. Add Data Deletion Request URL:
   ```
   http://localhost:3000/api/oauth/data-deletion
   ```

6. Click "Save Changes"

## Step 4: Get Your App Credentials

1. Scroll to the top of the page
2. You'll see:
   - **Instagram App ID** (also called Facebook App ID)
   - **Instagram App Secret** (click "Show" to reveal)
3. Copy these values

## Step 5: Configure Environment Variables

1. Open your `.env` file
2. Add your credentials:
   ```env
   INSTAGRAM_APP_ID="your-app-id-here"
   INSTAGRAM_APP_SECRET="your-app-secret-here"
   ```

3. Make sure you also have:
   ```env
   NEXTAUTH_URL="http://localhost:3000"
   ```

## Step 6: Add Test Users (Development Only)

For development, you need to add Instagram test users:

1. In your Facebook App, go to "Roles" → "Roles"
2. Scroll to "Instagram Testers"
3. Click "Add Instagram Testers"
4. Search for the Instagram account you want to test with
5. The Instagram user must accept the invite in their Instagram app:
   - Open Instagram app
   - Go to Settings → Apps and Websites → Tester Invites
   - Accept the invite

## Step 7: Test the Connection

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Log in to your application
3. Create a new brand (or select an existing one)
4. Go to Settings
5. Click "Connect" next to Instagram
6. Complete the OAuth flow

## Important Notes

### Production Requirements

To use Instagram OAuth in production, your Facebook App needs to be reviewed and approved by Facebook:

1. Complete App Review for the following permissions:
   - `instagram_basic`
   - `instagram_content_publish`
   - `pages_show_list`
   - `pages_read_engagement`

2. Submit your app for Business Verification

### Instagram Business vs Personal Accounts

- This integration **only works with Instagram Business or Creator accounts**
- Personal Instagram accounts cannot be connected
- The Instagram account must be linked to a Facebook Page

### Troubleshooting

**Error: "No Instagram account found"**
- Make sure your Instagram account is a Business or Creator account
- Verify the Instagram account is connected to a Facebook Page
- Check that you selected the correct Facebook Page during OAuth

**Error: "Instagram OAuth is not configured"**
- Verify `INSTAGRAM_APP_ID` and `INSTAGRAM_APP_SECRET` are set in `.env`
- Restart your development server after adding the credentials
- Check that there are no typos in the environment variable names

**Error: "Redirect URI mismatch"**
- Make sure the redirect URI in Facebook App settings matches exactly:
  `http://localhost:3000/api/oauth/callback/instagram`
- Check that `NEXTAUTH_URL` in `.env` matches your app's URL

## Additional Resources

- [Facebook for Developers - Instagram Basic Display](https://developers.facebook.com/docs/instagram-basic-display-api)
- [Instagram Business Account Setup](https://help.instagram.com/502981923235522)
- [Connect Instagram to Facebook Page](https://www.facebook.com/business/help/connect-instagram-to-page)
