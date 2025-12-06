# 🚀 CineStream Pro Deployment Guide

This guide walks you through deploying CineStream Pro to production using **Vercel** (frontend) and **Render** (backend + database).

## 📋 Prerequisites

Before deploying, ensure you have:

- [ ] GitHub account (for connecting to Vercel/Render)
- [ ] TMDB API Key ([Get it here](https://www.themoviedb.org/settings/api))
- [ ] Gemini API Key ([Get it here](https://aistudio.google.com/app/apikey))
- [ ] Admin credentials (username and password you want to use)
- [ ] Your code pushed to a GitHub repository

---

## 🎯 Deployment Overview

**Architecture:**
- **Frontend**: React app hosted on Vercel
- **Backend**: Express API hosted on Render
- **Database**: PostgreSQL hosted on Render

---

## 🔧 Part 1: Backend Deployment (Render)

### Step 1: Prepare Your Repository

1. Ensure your code is pushed to GitHub
2. Verify `render.yaml` exists in your project root
3. Verify `server/.env.example` exists

### Step 2: Deploy to Render

1. **Go to [Render Dashboard](https://dashboard.render.com/)**
2. Click **"New +"** → **"Blueprint"**
3. Connect your GitHub repository
4. Render will detect `render.yaml` automatically
5. Click **"Apply"**

### Step 3: Configure Environment Variables

Render will create the service and database. Now configure the environment variables:

1. Go to your **cinestream-backend** service
2. Navigate to **Environment** tab
3. Add/update these variables:

| Variable | Value | Notes |
|----------|-------|-------|
| `NODE_ENV` | `production` | Auto-set by Render |
| `PORT` | `10000` | Auto-set by Render |
| `DATABASE_URL` | (auto-linked) | Auto-set from database |
| `JWT_SECRET` | (generate random) | Use a password generator |
| `FRONTEND_URL` | (your Vercel URL) | Add after frontend deployment |
| `ADMIN_USERNAME` | `admin` | Or your preferred username |
| `ADMIN_PASSWORD` | (strong password) | Create a secure password |

**Generate JWT_SECRET:**
```bash
# Run this in your terminal to generate a secure secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Step 4: Verify Backend Deployment

1. Wait for deployment to complete (2-5 minutes)
2. Copy your backend URL (e.g., `https://cinestream-backend.onrender.com`)
3. Test the health endpoint:

```bash
curl https://your-backend-url.onrender.com/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-12-06T..."
}
```

✅ **Backend is ready!**

---

## 🎨 Part 2: Frontend Deployment (Vercel)

### Step 1: Fix Vite Configuration

Before deploying, update `vite.config.ts`:

**Remove or comment out the `base` property:**

```diff
  server: {
    port: 3000,
    host: '0.0.0.0',
-   base: "/cinestream-pro---afterdark",
  },
```

This ensures your app works at the root domain on Vercel.

### Step 2: Deploy to Vercel

1. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**
2. Click **"Add New..."** → **"Project"**
3. **Import** your GitHub repository
4. Vercel will auto-detect Vite configuration
5. **Configure Build Settings:**
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

### Step 3: Configure Environment Variables

In the Vercel project settings, add these environment variables:

| Variable | Value | Example |
|----------|-------|---------|
| `VITE_TMDB_API_KEY` | Your TMDB API key | `abc123...` |
| `VITE_GEMINI_API_KEY` | Your Gemini API key | `xyz789...` |
| `VITE_API_URL` | Your Render backend URL | `https://cinestream-backend.onrender.com` |

6. Click **"Deploy"**

### Step 4: Update Backend CORS

1. Go back to **Render Dashboard**
2. Open your **cinestream-backend** service
3. Go to **Environment** tab
4. Update `FRONTEND_URL` to your Vercel URL (e.g., `https://cinestream-pro.vercel.app`)
5. Save changes (backend will redeploy automatically)

### Step 5: Verify Frontend Deployment

1. Visit your Vercel URL
2. Open browser DevTools (F12) → Console
3. Check for errors
4. Verify the site loads correctly

✅ **Frontend is ready!**

---

## 🧪 Part 3: Testing & Verification

### Test Checklist

- [ ] **Homepage loads** without errors
- [ ] **Navigation works** (browse movies/TV shows)
- [ ] **User registration** creates new account
- [ ] **User login** works with credentials
- [ ] **Video playback** functions correctly
- [ ] **Watchlist** can add/remove items
- [ ] **History** tracks watched content
- [ ] **Admin login** works with admin credentials
- [ ] **Admin dashboard** accessible to admin users
- [ ] **Mobile responsive** design works on phone
- [ ] **No CORS errors** in browser console

### Common Issues & Solutions

#### ❌ CORS Error: "Access-Control-Allow-Origin"

**Problem:** Frontend can't connect to backend

**Solution:**
1. Verify `FRONTEND_URL` in Render matches your Vercel URL exactly
2. Ensure no trailing slash in URLs
3. Redeploy backend after changing `FRONTEND_URL`

#### ❌ "Network Error" on Login

**Problem:** Backend URL is incorrect

**Solution:**
1. Check `VITE_API_URL` in Vercel environment variables
2. Ensure it points to your Render backend URL
3. Redeploy frontend after fixing

#### ❌ Database Connection Failed

**Problem:** PostgreSQL not connected

**Solution:**
1. Check Render logs for database errors
2. Verify `DATABASE_URL` is set in environment variables
3. Ensure database is in "Available" status in Render

#### ❌ Admin Login Not Working

**Problem:** Admin user not created

**Solution:**
1. Check Render logs for "Default admin user created" message
2. Verify `ADMIN_USERNAME` and `ADMIN_PASSWORD` are set
3. Try redeploying backend to trigger admin creation

---

## 🔒 Security Best Practices

### Production Checklist

- [ ] Use strong, unique `JWT_SECRET` (64+ characters)
- [ ] Use strong admin password (12+ characters, mixed case, numbers, symbols)
- [ ] Never commit `.env` files to Git
- [ ] Enable Render's "Auto-Deploy" for automatic updates
- [ ] Enable Vercel's "Production Protection" if needed
- [ ] Regularly update dependencies (`npm audit`)
- [ ] Monitor Render logs for suspicious activity

---

## 🔄 Updating Your Deployment

### Update Frontend

1. Push changes to GitHub
2. Vercel auto-deploys on push (if enabled)
3. Or manually redeploy from Vercel dashboard

### Update Backend

1. Push changes to GitHub
2. Render auto-deploys on push (if enabled)
3. Or manually redeploy from Render dashboard

---

## ✅ Deployment Complete!

Your CineStream Pro website is now live! 🎉

**Your Deployment URLs:**
- Frontend: `https://your-project.vercel.app`
- Backend: `https://your-backend.onrender.com`
- Database: Managed by Render

Enjoy your deployed application! 🚀
