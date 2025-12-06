# ✅ Render Deployment Checklist

**Use this after Vercel deployment is complete**

---

## 🎯 Before You Start

Have these ready:
- [ ] Vercel URL (e.g., `https://cinestream-pro.vercel.app`)
- [ ] JWT Secret: `eea0e309b45134e93180dea5b9018b21e5024983276405034a7eb91b206bf4b9da611eb44ba6e9ef98a040cf7b46fef1f2731171b0b8c23b86721d01bc8666b9d`
- [ ] Admin username (e.g., `admin`)
- [ ] Strong admin password (create one!)

---

## 📝 Step-by-Step Checklist

### Phase 1: Create Render Account
- [ ] Go to https://render.com
- [ ] Click "Get Started for Free"
- [ ] Sign up with GitHub
- [ ] Authorize Render

### Phase 2: Deploy with Blueprint
- [ ] Click "New +" → "Blueprint"
- [ ] Select repository: `Mahesh13247/cinestream-pro---afterdark`
- [ ] Click "Connect"
- [ ] Click "Apply"
- [ ] Wait for deployment (2-3 minutes)
- [ ] Verify both services show green status

### Phase 3: Configure Environment Variables
- [ ] Click "cinestream-backend" service
- [ ] Click "Environment" in sidebar
- [ ] Add `JWT_SECRET` = `eea0e309b45134e93180dea5b9018b21e5024983276405034a7eb91b206bf4b9da611eb44ba6e9ef98a040cf7b46fef1f2731171b0b8c23b86721d01bc8666b9d`
- [ ] Add `ADMIN_USERNAME` = `admin`
- [ ] Add `ADMIN_PASSWORD` = `[your-password]`
- [ ] Add `FRONTEND_URL` = `https://[your-vercel-url].vercel.app` (NO trailing slash!)
- [ ] Click "Save Changes"
- [ ] Wait for redeploy (1-2 minutes)

### Phase 4: Verify Backend
- [ ] Copy backend URL from Render
- [ ] Open: `https://[backend-url].onrender.com/health`
- [ ] Verify JSON response shows `"success": true`
- [ ] Check Render logs for "PostgreSQL database ready"
- [ ] Check logs for "Default admin user created"

### Phase 5: Connect to Vercel
- [ ] Go to Vercel dashboard
- [ ] Open your project
- [ ] Go to Settings → Environment Variables
- [ ] Update `VITE_API_URL` to your Render backend URL
- [ ] Go to Deployments tab
- [ ] Click "Redeploy" on latest deployment
- [ ] Wait for redeploy (1-2 minutes)

### Phase 6: Test Everything
- [ ] Visit Vercel URL
- [ ] Homepage loads without errors
- [ ] Open DevTools (F12) - no console errors
- [ ] Register new test account
- [ ] Login with test account
- [ ] Logout
- [ ] Login with admin credentials
- [ ] Access admin dashboard
- [ ] Play a video
- [ ] Add to watchlist
- [ ] Check history
- [ ] Refresh page - data persists

---

## 🎉 Deployment Complete!

If all checkboxes are checked, your deployment is successful!

**Your URLs:**
- Frontend: `https://[your-project].vercel.app`
- Backend: `https://cinestream-backend-[xxx].onrender.com`

---

## 🔧 If Something Goes Wrong

| Issue | Fix |
|-------|-----|
| CORS error | Check `FRONTEND_URL` matches Vercel URL exactly |
| Admin login fails | Verify `ADMIN_USERNAME` and `ADMIN_PASSWORD` set |
| Backend slow | Normal for free tier (30s first request) |
| Database error | Check database status is "Available" |

**Need detailed help?** See [render-deployment-detailed.md](file:///L:/porn/cinestream-pro-afterdark/docs/render-deployment-detailed.md)

---

**Estimated Time:** 15-20 minutes total
**Difficulty:** Easy (just follow the steps!)
