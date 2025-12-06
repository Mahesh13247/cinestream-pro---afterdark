# 🔧 Render Backend Deployment - Complete Step-by-Step Guide

## 📌 When to Use This Guide

**Use this guide AFTER you've deployed your frontend to Vercel** and have your Vercel URL ready.

---

## 🎯 What You'll Deploy on Render

- **Backend API Server** (Express.js)
- **PostgreSQL Database** (for user data)

Both will be created automatically using the `render.yaml` Blueprint!

---

## 📋 Prerequisites Before Starting

Make sure you have:

- [x] Code pushed to GitHub
- [x] Vercel frontend deployed and URL copied (e.g., `https://cinestream-pro.vercel.app`)
- [x] JWT Secret ready (from walkthrough):
  ```
  eea0e309b45134e93180dea5b9018b21e5024983276405034a7eb91b206bf4b9da611eb44ba6e9ef98a040cf7b46fef1f2731171b0b8c23b86721d01bc8666b9d
  ```
- [x] Admin username chosen (e.g., `admin`)
- [x] Strong admin password created

---

## 🚀 Step-by-Step Render Deployment

### Step 1: Create Render Account

1. Go to **https://render.com**
2. Click **"Get Started for Free"**
3. Choose **"Sign up with GitHub"** (recommended)
4. Authorize Render to access your GitHub account
5. Complete the signup process

✅ **You're now logged into Render Dashboard**

---

### Step 2: Deploy Using Blueprint

1. **In Render Dashboard**, click the **"New +"** button (top right)
2. Select **"Blueprint"** from the dropdown menu

   > **What is a Blueprint?** It's a configuration file (`render.yaml`) that automatically creates multiple services at once!

3. **Connect Your Repository:**
   - You'll see a list of your GitHub repositories
   - Find and click: **`Mahesh13247/cinestream-pro---afterdark`**
   - Click **"Connect"**

4. **Review Blueprint Configuration:**
   - Render will detect your `render.yaml` file
   - You'll see it will create:
     - ✅ **Web Service:** `cinestream-backend`
     - ✅ **PostgreSQL Database:** `cinestream-db`
   
5. **Click "Apply"** to start deployment

⏳ **Render is now creating your services...** (this takes 2-3 minutes)

---

### Step 3: Monitor Initial Deployment

1. You'll be redirected to the Blueprint page
2. Watch the deployment progress:
   - 🟡 **Yellow dot** = Deploying
   - 🟢 **Green dot** = Live
   - 🔴 **Red dot** = Failed (check logs)

3. Wait for both services to show **green dots**

**What's happening behind the scenes:**
- Installing Node.js dependencies
- Creating PostgreSQL database
- Starting the Express server
- Running database initialization

---

### Step 4: Configure Backend Environment Variables

Once deployment completes, you need to add your environment variables:

1. **Click on "cinestream-backend"** service name
2. In the left sidebar, click **"Environment"**
3. You'll see some variables already set (like `PORT`, `DATABASE_URL`)

4. **Click "Add Environment Variable"** and add these one by one:

#### Variable 1: JWT_SECRET
```
Key:   JWT_SECRET
Value: eea0e309b45134e93180dea5b9018b21e5024983276405034a7eb91b206bf4b9da611eb44ba6e9ef98a040cf7b46fef1f2731171b0b8c23b86721d01bc8666b9d
```

#### Variable 2: ADMIN_USERNAME
```
Key:   ADMIN_USERNAME
Value: admin
```
(Or use your preferred admin username)

#### Variable 3: ADMIN_PASSWORD
```
Key:   ADMIN_PASSWORD
Value: YourStrongPassword123!
```
⚠️ **Use a strong password!** Mix uppercase, lowercase, numbers, and symbols.

#### Variable 4: FRONTEND_URL
```
Key:   FRONTEND_URL
Value: https://your-vercel-url.vercel.app
```
🔴 **IMPORTANT:** 
- Replace with your ACTUAL Vercel URL
- **NO trailing slash** at the end
- Must start with `https://`

5. **Click "Save Changes"** at the bottom

⏳ **Backend will automatically redeploy** (takes 1-2 minutes)

---

### Step 5: Get Your Backend URL

1. Stay on the **cinestream-backend** service page
2. At the top, you'll see your backend URL:
   ```
   https://cinestream-backend-xxxx.onrender.com
   ```
3. **Copy this URL** - you'll need it to verify deployment

---

### Step 6: Verify Backend is Working

Let's test if your backend is running correctly:

#### Method 1: Browser Test
1. Open a new browser tab
2. Paste your backend URL and add `/health` at the end:
   ```
   https://cinestream-backend-xxxx.onrender.com/health
   ```
3. Press Enter

**Expected Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-12-06T10:00:00.000Z"
}
```

✅ **If you see this, your backend is working!**

#### Method 2: Check Render Logs
1. In Render Dashboard, click on **cinestream-backend**
2. Click **"Logs"** in the left sidebar
3. Look for these success messages:
   ```
   ✓ PostgreSQL database ready
   ✓ Default admin user created: admin
   🚀 Auth Server running on port 10000
   ```

✅ **If you see these logs, everything is configured correctly!**

---

### Step 7: Check Database Connection

1. In Render Dashboard, click **"Databases"** in the left sidebar
2. Click on **"cinestream-db"**
3. Verify status shows **"Available"** (green)

**Database Information:**
- **Type:** PostgreSQL 16
- **Plan:** Free (1 GB storage)
- **Region:** Oregon (or your selected region)

✅ **Database is ready!**

---

### Step 8: Update Vercel with Backend URL

Now that your backend is live, update your frontend:

1. Go to **https://vercel.com/dashboard**
2. Click on your **cinestream-pro** project
3. Go to **"Settings"** → **"Environment Variables"**
4. Find `VITE_API_URL`
5. **Edit** and update to your Render backend URL:
   ```
   https://cinestream-backend-xxxx.onrender.com
   ```
   🔴 **NO trailing slash!**

6. Click **"Save"**
7. Go to **"Deployments"** tab
8. Click **"Redeploy"** on the latest deployment
9. Check **"Use existing Build Cache"**
10. Click **"Redeploy"**

⏳ **Frontend is redeploying with new backend URL** (1-2 minutes)

---

## 🧪 Step 9: Test Everything Together

### Test 1: Homepage
1. Visit your Vercel URL
2. Homepage should load without errors
3. Open DevTools (F12) → Console
4. Should see no errors

### Test 2: User Registration
1. Click **"Sign Up"** or registration button
2. Create a test account:
   - Username: `testuser`
   - Password: `Test123!`
3. Should successfully register

### Test 3: User Login
1. Log in with your test account
2. Should redirect to homepage/dashboard
3. Should see user menu/profile

### Test 4: Admin Login
1. Log out from test account
2. Log in with admin credentials:
   - Username: `admin` (or your chosen username)
   - Password: (your admin password)
3. Should see **"Admin Dashboard"** link
4. Click it to verify admin panel loads

### Test 5: Video Streaming
1. Browse movies/TV shows
2. Click on a title
3. Try playing a video
4. Should stream without errors

### Test 6: Watchlist & History
1. Add items to watchlist
2. Play a video (adds to history)
3. Refresh page
4. Data should persist (saved in database)

---

## ✅ Deployment Complete Checklist

- [ ] Render Blueprint deployed successfully
- [ ] Backend shows green status
- [ ] Database shows "Available" status
- [ ] Environment variables configured
- [ ] Backend `/health` endpoint responds
- [ ] Vercel updated with backend URL
- [ ] Frontend loads without errors
- [ ] User registration works
- [ ] User login works
- [ ] Admin login works
- [ ] Video streaming works
- [ ] Data persists in database

---

## 🔧 Troubleshooting Common Issues

### ❌ Issue: "Service Unavailable" Error

**Cause:** Backend is still deploying or crashed

**Fix:**
1. Check Render logs for errors
2. Verify all environment variables are set
3. Try manual redeploy: Click "Manual Deploy" → "Deploy latest commit"

---

### ❌ Issue: CORS Error in Browser Console

**Error Message:**
```
Access to fetch at 'https://backend.onrender.com/api/auth/login' 
from origin 'https://your-app.vercel.app' has been blocked by CORS policy
```

**Cause:** `FRONTEND_URL` doesn't match your Vercel URL

**Fix:**
1. Go to Render → cinestream-backend → Environment
2. Check `FRONTEND_URL` exactly matches Vercel URL
3. No trailing slash
4. Must be `https://` not `http://`
5. Save and wait for redeploy

---

### ❌ Issue: Admin Login Fails

**Error:** "Invalid credentials"

**Cause:** Admin user not created

**Fix:**
1. Check Render logs for "Default admin user created"
2. If not found, verify `ADMIN_USERNAME` and `ADMIN_PASSWORD` are set
3. Manual redeploy to trigger admin creation
4. Check logs again

---

### ❌ Issue: Database Connection Error

**Error in logs:** "PostgreSQL connection failed"

**Fix:**
1. Go to Databases → cinestream-db
2. Verify status is "Available"
3. Check `DATABASE_URL` is set in backend environment
4. If missing, it should be auto-linked by Blueprint
5. Try manual redeploy

---

### ❌ Issue: Backend Slow to Respond

**Cause:** Free tier sleeps after 15 minutes of inactivity

**Expected Behavior:**
- First request after sleep: ~30 seconds
- Subsequent requests: Fast (<1 second)

**Fix:** This is normal for free tier. Consider upgrading to paid plan for always-on service.

---

## 📊 Monitoring Your Deployment

### View Logs
1. Render Dashboard → cinestream-backend → Logs
2. Real-time log streaming
3. Filter by log level (info, error, etc.)

### Check Metrics
1. Render Dashboard → cinestream-backend → Metrics
2. View CPU, Memory, Request count
3. Monitor response times

### Database Management
1. Render Dashboard → Databases → cinestream-db
2. Click **"Connect"** for connection details
3. Use external tools like pgAdmin or TablePlus to view data

---

## 🔄 Updating Your Deployment

### Update Backend Code
1. Push changes to GitHub
2. Render auto-deploys (if enabled)
3. Or manually: Click "Manual Deploy" → "Deploy latest commit"

### Update Environment Variables
1. Render Dashboard → cinestream-backend → Environment
2. Edit variable
3. Save (auto-redeploys)

### Database Backups
1. Render Dashboard → Databases → cinestream-db
2. Free tier: Manual backups only
3. Paid tier: Automatic daily backups

---

## 🎉 Success!

Your CineStream Pro backend is now live on Render!

**Your Live Stack:**
- ✅ Frontend: Vercel
- ✅ Backend: Render
- ✅ Database: Render PostgreSQL

**Next Steps:**
- Monitor logs regularly
- Set up auto-deploy on GitHub push
- Consider upgrading for better performance
- Share your site with users!

---

## 📞 Need More Help?

- **Render Docs:** https://render.com/docs
- **Render Community:** https://community.render.com
- **Check Logs:** Always start here for troubleshooting
- **Support:** Render has excellent support for free tier users

---

**Deployment Date:** 2025-12-06
**Guide Version:** 1.0
