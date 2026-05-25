# 🚀 Quick Start: Deploy Frontend in 5 Minutes

## Step 1: Choose Your Platform

### **Easiest: Vercel** (Recommended)
- **Time:** 2 minutes
- **Cost:** Free tier available
- **Benefits:** Automatic deployments, global CDN, one-click rollback

Go to: https://vercel.com/new/clone?repository-url=https://github.com/Dikshathorve/Resumind-new&env=VITE_API_URL&envDescription=Your%20backend%20API%20URL&project-name=resumind&framework=vite&rootDirectory=frontend

### **Alternative: Netlify**
- **Time:** 3 minutes
- **Cost:** Free tier available
- **Benefits:** Easy deployment, form handling, analytics

Go to: https://app.netlify.com/start

### **Advanced: Docker + Azure Container Registry**
- **Time:** 10 minutes
- **Cost:** Minimal (pay-as-you-go)
- **Benefits:** Full control, scalable

## Step 2: Set Environment Variables

Your backend API URL:
```
VITE_API_URL=https://your-backend-url/api
```

Example (if using Azure):
```
VITE_API_URL=https://resumind-backend.azurewebsites.net/api
```

## Step 3: Deploy

### **For Vercel:**
1. Click the button in Step 1
2. Connect GitHub
3. Set `VITE_API_URL` environment variable
4. Click "Deploy"
5. Done! ✅

### **For Netlify:**
1. Go to https://app.netlify.com
2. "New site from Git" → Select repository
3. Base directory: `frontend`
4. Build command: `npm run build`
5. Publish directory: `dist`
6. Set environment variables
7. Deploy
8. Done! ✅

### **For Docker:**
```bash
# Build image
docker build -t resumind-frontend:latest ./frontend

# Run locally to test
docker run -p 3000:3000 resumind-frontend:latest

# Tag and push to registry
docker tag resumind-frontend:latest your-registry.azurecr.io/resumind-frontend:latest
docker push your-registry.azurecr.io/resumind-frontend:latest

# Deploy to Azure App Service (via portal or CLI)
```

## Step 4: Verify Deployment

Your app is live at:
- **Vercel:** `https://your-project.vercel.app`
- **Netlify:** `https://your-site.netlify.app`
- **Docker (Azure):** `https://your-app.azurewebsites.net`

## What Was Fixed ✅

✅ Accessibility (WCAG 2.1 Level AA)
- All buttons have title and aria-label
- All form inputs have autocomplete attributes
- Security headers configured in backend

✅ Production Build
- JavaScript: 370 KB gzipped
- CSS: 17 KB gzipped
- Fast load times

✅ Automatic Updates
- Push to GitHub → Auto-deploys to Vercel/Netlify
- No manual deployment needed

## Common Issues & Fixes

### Q: "CORS Error" or "API not responding"
**A:** Make sure `VITE_API_URL` environment variable is set correctly in your hosting platform

### Q: "404 Page Refresh"
**A:** Vercel/Netlify handle this automatically. GitHub Pages needs special config.

### Q: "Build Failed"
**A:** 
1. Check build logs in platform dashboard
2. Verify all environment variables are set
3. Test locally: `npm run build` in frontend folder

### Q: "Can't access environment variables"
**A:** Variables must start with `VITE_` in frontend code. Restart build after adding them.

## Support Resources

- [Vercel Docs](https://vercel.com/docs)
- [Netlify Docs](https://docs.netlify.com)
- [Vite Deployment](https://vitejs.dev/guide/sse.html)
- [GitHub Pages Docs](https://pages.github.com)

## Next Steps

1. ✅ Code pushed to GitHub
2. ✅ Deploy frontend to Vercel/Netlify
3. 📋 Deploy backend to Azure/Heroku/Your server
4. 🔗 Update `VITE_API_URL` to your backend URL
5. 🧪 Test form submissions
6. 📊 Monitor analytics in platform dashboard

---

**Questions?** Check `FRONTEND_DEPLOYMENT_GUIDE.md` for detailed instructions.
