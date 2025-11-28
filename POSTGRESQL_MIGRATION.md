# PostgreSQL Migration - Deployment Guide

## ✅ Migration Complete

The application has been successfully migrated from JSON file storage to PostgreSQL database. Users will now persist across server restarts.

---

## 🚀 Deployment Steps

### Step 1: Commit Changes to Git

```bash
git add .
git commit -m "Migrate from JSON to PostgreSQL for persistent user storage"
git push origin main
```

### Step 2: Deploy to Render.com

1. **Login to Render Dashboard**: https://dashboard.render.com

2. **Create PostgreSQL Database** (if not exists):
   - Click "New +" → "PostgreSQL"
   - Name: `cinestream-database`
   - Database: `cinestream_db`
   - User: (auto-generated)
   - Region: Choose closest to your users
   - Plan: **Free** (0.1 GB storage, sufficient for user data)
   - Click "Create Database"
   - **Wait 2-3 minutes** for database to be ready

3. **Update Backend Service**:
   - Go to your `cinestream-auth-server` service
   - Click "Settings" → "Environment"
   - Add new environment variable:
     - Key: `DATABASE_URL`
     - Value: Click "Add from Database" → Select `cinestream-database` → `Internal Database URL`
   - Add (if not exists):
     - Key: `ADMIN_USERNAME`, Value: `admin`
     - Key: `JWT_SECRET`, Value: (click "Generate" for random value)
     - Key: `JWT_REFRESH_SECRET`, Value: (click "Generate" for random value)
   - Click "Save Changes"

4. **Trigger Manual Deploy**:
   - Go to "Manual Deploy" → "Deploy latest commit"
   - Wait for deployment to complete (2-5 minutes)
   - Check logs for: `✓ Database schema initialized successfully`

### Step 3: Verify Deployment

1. **Check Server Health**:
   ```bash
   curl https://cinestream-pro-afterdark.onrender.com/health
   ```
   Should return: `{"success":true,"message":"Server is running"}`

2. **Login to Admin Dashboard**:
   - Go to your frontend: https://mahesh13247.github.io/cinestream-pro---afterdark/
   - Login with: `admin` / `maheshisagoodboy`

3. **Create Test User**:
   - Go to Admin Dashboard
   - Click "Add User"
   - Username: `testuser`, Password: `test123`, Role: `user`
   - Click "Create User"
   - Verify user appears in list

4. **Test Persistence**:
   - In Render dashboard, go to your backend service
   - Click "Manual Deploy" → "Clear build cache & deploy"
   - Wait for restart (2-3 minutes)
   - Login to admin dashboard again
   - **✅ SUCCESS**: `testuser` should still exist
   - **❌ FAILURE**: If user is gone, check logs for database connection errors

---

## 🔧 Local Development Setup

### Option 1: Install PostgreSQL Locally

1. **Install PostgreSQL**:
   - Windows: https://www.postgresql.org/download/windows/
   - Mac: `brew install postgresql`
   - Linux: `sudo apt-get install postgresql`

2. **Create Database**:
   ```bash
   psql -U postgres
   CREATE DATABASE cinestream_db;
   \q
   ```

3. **Update .env**:
   ```env
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/cinestream_db
   ```

4. **Start Server**:
   ```bash
   cd server
   npm install
   npm run dev
   ```

### Option 2: Use Docker PostgreSQL

1. **Run PostgreSQL Container**:
   ```bash
   docker run --name cinestream-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=cinestream_db -p 5432:5432 -d postgres:15
   ```

2. **Update .env**:
   ```env
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/cinestream_db
   ```

3. **Start Server**:
   ```bash
   cd server
   npm install
   npm run dev
   ```

### Option 3: Keep JSON for Local Dev (Not Recommended)

If you don't want to install PostgreSQL locally, you can temporarily use the old JSON database for local development:

1. **Rename files**:
   ```bash
   cd server/src/config
   mv postgres.js postgres.js.backup
   mv database.js.old database.js  # If you have the old file
   ```

2. **Update imports in `server/src/index.js`**:
   ```javascript
   import { initDatabase } from './config/database.js';  // Change back
   ```

**⚠️ Warning**: This will NOT match production behavior!

---

## 📊 Database Schema

The PostgreSQL database has two tables:

### `users` Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    is_blocked INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);
```

### `token_blacklist` Table
```sql
CREATE TABLE token_blacklist (
    id SERIAL PRIMARY KEY,
    token TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🐛 Troubleshooting

### Issue: "Connection refused" or "ECONNREFUSED"

**Cause**: Server cannot connect to PostgreSQL database

**Solution**:
1. Check `DATABASE_URL` environment variable is set correctly
2. Verify PostgreSQL database is running on Render
3. Check Render logs for connection errors

### Issue: "relation 'users' does not exist"

**Cause**: Database schema not initialized

**Solution**:
1. Check server logs for `✓ Database schema initialized successfully`
2. If missing, restart the server to trigger schema creation
3. Manually run schema creation:
   ```bash
   psql $DATABASE_URL -c "CREATE TABLE IF NOT EXISTS users (...)"
   ```

### Issue: Users still disappearing

**Cause**: Server might be using old JSON database

**Solution**:
1. Check `server/src/index.js` imports `postgres.js` not `database.js`
2. Verify `DATABASE_URL` environment variable exists
3. Check Render logs for "PostgreSQL connected" message

### Issue: "password authentication failed"

**Cause**: Wrong database credentials

**Solution**:
1. In Render dashboard, go to PostgreSQL database
2. Copy "Internal Database URL"
3. Update `DATABASE_URL` in backend service environment variables

---

## 📝 What Changed

### Files Modified
- ✅ `server/package.json` - Added `pg` dependency
- ✅ `server/src/config/postgres.js` - **NEW** PostgreSQL connection
- ✅ `server/src/models/User.js` - Replaced JSON with SQL queries
- ✅ `server/src/utils/jwt.js` - Replaced JSON with SQL queries
- ✅ `server/src/index.js` - Import postgres.js instead of database.js
- ✅ `render.yaml` - Added PostgreSQL service
- ✅ `server/.env.example` - Added DATABASE_URL

### Files Deprecated (No Longer Used)
- ❌ `server/src/config/database.js` - Old JSON file database
- ❌ `server/data/database.json` - Old user storage (can be deleted)

---

## 🎉 Benefits

✅ **Persistent Storage**: Users survive server restarts  
✅ **Free Tier**: Render provides free PostgreSQL (0.1 GB)  
✅ **Production Ready**: Industry-standard database  
✅ **Better Performance**: Faster queries for multiple users  
✅ **Scalable**: Can handle thousands of users  
✅ **ACID Compliance**: Data integrity guaranteed  

---

## 📞 Support

If you encounter any issues during deployment:

1. Check Render logs: Dashboard → Service → Logs
2. Verify environment variables are set correctly
3. Ensure PostgreSQL database is in "Available" status
4. Test database connection manually using `psql`

**Next Steps**: Deploy to Render.com and verify user persistence!
