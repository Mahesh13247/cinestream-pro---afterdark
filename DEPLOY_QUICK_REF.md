# 🚀 Quick Deployment Reference

## 🔑 Your Generated Credentials

**JWT Secret:**
```
eea0e309b45134e93180dea5b9018b21e5024983276405034a7eb91b206bf4b9da611eb44ba6e9ef98a040cf7b46fef1f2731171b0b8c23b86721d01bc8666b9d
```

---

## 📋 Environment Variables Checklist

### Render Backend Environment Variables
```
JWT_SECRET=eea0e309b45134e93180dea5b9018b21e5024983276405034a7eb91b206bf4b9da611eb44ba6e9ef98a040cf7b46fef1f2731171b0b8c23b86721d01bc8666b9d
ADMIN_USERNAME=admin
ADMIN_PASSWORD=<your-strong-password>
FRONTEND_URL=<your-vercel-url>
```

### Vercel Frontend Environment Variables
```
VITE_TMDB_API_KEY=<your-tmdb-key>
VITE_GEMINI_API_KEY=<your-gemini-key>
VITE_API_URL=<your-render-backend-url>
```

---

## 🎯 Deployment Order

1. **Deploy Backend First** (Render)
   - Use Blueprint with `render.yaml`
   - Add environment variables
   - Copy backend URL

2. **Deploy Frontend Second** (Vercel)
   - Import from GitHub
   - Add environment variables with backend URL
   - Copy frontend URL

3. **Connect Them**
   - Update `FRONTEND_URL` in Render
   - Wait for backend redeploy

---

## 🔗 Important Links

- [Render Dashboard](https://dashboard.render.com/)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [TMDB API Keys](https://www.themoviedb.org/settings/api)
- [Gemini API Keys](https://aistudio.google.com/app/apikey)

---

## ✅ Files Ready for Deployment

- ✅ `vercel.json` - Frontend config
- ✅ `render.yaml` - Backend config
- ✅ `vite.config.ts` - Fixed (base path removed)
- ✅ Production build tested
- ✅ All documentation created

---

## 📚 Full Documentation

See [walkthrough.md](file:///C:/Users/realme/.gemini/antigravity/brain/3705442f-6670-490d-ac2e-d3b2d68458d8/walkthrough.md) for complete step-by-step instructions.
