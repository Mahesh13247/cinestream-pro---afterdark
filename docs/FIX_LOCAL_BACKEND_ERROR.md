# 🔧 Fix Local Backend Error - Quick Guide

## ❌ Problem
You're getting **"Request failed with status code 500"** when trying to log in locally.

## 🔍 Root Cause
The backend server doesn't have a `.env` file configured, so it's trying to use default settings which are causing errors.

## ✅ Solution

### Step 1: Create Server Environment File

1. **Navigate to the server folder:**
   ```bash
   cd server
   ```

2. **Create a new file called `.env`** in the `server` folder

3. **Copy and paste this content into `server/.env`:**

```env
# Local Development Configuration
NODE_ENV=development
PORT=5000

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# JWT Secret (for local development)
JWT_SECRET=local-dev-secret-key-change-in-production

# Admin Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=maheshisagoodboy

# Database - Leave commented out to use JSON file storage (no PostgreSQL needed locally)
# DATABASE_URL=postgresql://user:password@localhost:5432/cinestream
```

4. **Save the file**

### Step 2: Restart the Backend

1. **Stop the current dev server** (Ctrl+C in the terminal running `npm run dev:all`)

2. **Start it again:**
   ```bash
   npm run dev:all
   ```

3. **Wait for the backend to start** - you should see:
   ```
   ✓ Using JSON file storage (no DATABASE_URL found)
   ✓ Default admin user created: admin
   🚀 Auth Server running on port 5000
   ```

### Step 3: Try Logging In Again

1. **Go to your local site:** `http://localhost:3000`
2. **Login with:**
   - Username: `admin`
   - Password: `maheshisagoodboy`
3. **Should work now!** ✅

---

## 📝 Quick Copy-Paste

**Create file:** `L:\porn\cinestream-pro-afterdark\server\.env`

**Content:**
```
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000
JWT_SECRET=local-dev-secret-key-change-in-production
ADMIN_USERNAME=admin
ADMIN_PASSWORD=maheshisagoodboy
```

---

## 🎯 What This Does

- ✅ Configures backend to use **JSON file storage** (no PostgreSQL needed locally)
- ✅ Sets up **admin credentials** for local testing
- ✅ Configures **CORS** to allow frontend to connect
- ✅ Sets **JWT secret** for authentication

---

## ⚠️ Important Notes

1. **This is for LOCAL DEVELOPMENT ONLY** - Render deployment uses different settings
2. **The `.env` file won't be committed to Git** (it's in .gitignore for security)
3. **Each developer needs their own `.env` file** in the server folder
4. **For production (Render)**, environment variables are set in the Render dashboard

---

## 🔄 After Creating the File

1. Stop dev server (Ctrl+C)
2. Run `npm run dev:all` again
3. Try logging in
4. Should work! 🎉

---

**Need help?** Make sure the `.env` file is in the correct location: `server/.env` (not in the root folder!)
