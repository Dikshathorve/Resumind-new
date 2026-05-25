# Frontend Hosting & Deployment Guide

## Quick Start - Choose Your Platform

### Option 1: Vercel (Recommended - Easiest)

**Setup in 2 minutes:**

1. Go to https://vercel.com
2. Click "New Project"
3. Import your GitHub repository: `Dikshathorve/Resumind-new`
4. Framework: React
5. Build Command: `npm run build`
6. Output Directory: `dist`
7. Root Directory: `frontend`
8. Add Environment Variables (if needed):
   - `VITE_API_URL` = Your backend API URL
9. Click "Deploy"

**Next deployments:** Automatic on every push to main branch

**Custom Domain:**
- In Vercel Dashboard → Settings → Domains
- Add your domain and follow DNS instructions

---

### Option 2: Netlify

**Setup Steps:**

1. Go to https://netlify.com
2. Click "New site from Git"
3. Connect GitHub repository
4. Build settings:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Add Build Environment Variables:
   - `VITE_API_URL` = Your backend URL
6. Click "Deploy site"

**Custom Domain:** Settings → Domain Management → Add custom domain

---

### Option 3: GitHub Pages (Free)

**Setup:**

1. Create `frontend/.github/workflows/deploy.yml`:

```yaml
name: Deploy Frontend to GitHub Pages

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: cd frontend && npm install
      - name: Build
        run: cd frontend && npm run build
        env:
          VITE_API_URL: ${{ secrets.API_URL }}
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./frontend/dist
          cname: yourdomain.com  # Optional
```

2. Go to GitHub Repo → Settings → Pages
3. Set "Build and deployment" → Source: "Deploy from a branch"
4. Select "gh-pages" branch
5. Your site will be available at: `https://yourusername.github.io/Resumind-new`

---

### Option 4: Docker + Azure Container Registry + Azure App Service

**Create `frontend/Dockerfile`:**

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
```

**Create `frontend/.dockerignore`:**

```
node_modules
npm-debug.log
dist
.git
.env
.env.local
```

**Deploy Steps:**

```bash
# Build Docker image
docker build -t resumind-frontend:latest ./frontend

# Tag for Azure Container Registry
docker tag resumind-frontend:latest myregistry.azurecr.io/resumind-frontend:latest

# Push to Azure
docker push myregistry.azurecr.io/resumind-frontend:latest

# Deploy to Azure App Service (via Azure Portal or CLI)
az webapp deployment container config --name myapp --resource-group mygroup
az webapp config container set --name myapp --resource-group mygroup \
  --docker-custom-image-name myregistry.azurecr.io/resumind-frontend:latest \
  --docker-registry-server-url https://myregistry.azurecr.io
```

---

## Environment Variables Setup

### Create `frontend/.env.production`

```env
VITE_API_URL=https://your-api-domain.com/api
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
```

### In Vercel/Netlify Dashboard:
Go to Settings → Environment Variables → Add the above

---

## Pre-Deployment Checklist

- [x] All accessibility fixes complete (buttons have title/aria-label)
- [x] All form inputs have autocomplete attributes
- [x] Backend security headers configured
- [x] Production build tested locally
- [x] Code pushed to GitHub
- [ ] Backend API deployed and accessible
- [ ] Environment variables configured in hosting platform
- [ ] Test form submission with real API
- [ ] Test email functionality
- [ ] Lighthouse audit (DevTools F12 → Lighthouse)
- [ ] Test on mobile devices

---

## Production Build Optimization

### Current Build Stats:
- JavaScript: 1,285 KB → 370 KB (gzipped)
- CSS: 96 KB → 17 KB (gzipped)
- Total: ~388 KB gzipped

### To Further Optimize:

**1. Code Splitting (Reduce Initial Load):**

```javascript
// In frontend/vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'emailjs': ['@emailjs/browser'],
          'ui': ['lucide-react']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
}
```

**2. Enable Compression:**
- Vercel/Netlify: Automatic (Brotli)
- Self-hosted: Configure nginx/Apache gzip

**3. CDN Configuration:**
- Vercel/Netlify: Automatic global CDN
- Others: Use Cloudflare free tier

---

## Live Monitoring

### Vercel Analytics:
- Dashboard shows performance metrics
- Web vitals tracking
- Deployment history

### Netlify Analytics:
- Real-time deployment status
- Form submissions tracking
- Bandwidth usage

---

## Troubleshooting

### CORS Issues with Backend API:
Backend already configured with CORS. Ensure `VITE_API_URL` matches your backend domain exactly.

### 404 on Page Refresh:
Need a fallback route to index.html:

**Vercel/Netlify:** Automatic (SPA support built-in)

**GitHub Pages:** Add `gh-pages` branch configuration

**Custom Server (nginx):**
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

### Environment Variables Not Loading:
1. Verify variable name starts with `VITE_` in frontend
2. Check platform dashboard has variables set
3. Rebuild/redeploy after adding variables
4. Check browser DevTools Console → check `import.meta.env.VITE_*`

---

## Rollback Procedure

### Vercel:
Deployments → Select previous version → Redeploy

### Netlify:
Deploys → Select previous deploy → Restore

### GitHub Pages:
Edit `gh-pages` branch or re-run workflow on previous commit

---

## Support

For deployment issues:
1. Check build logs in platform dashboard
2. Verify environment variables are set
3. Test locally: `npm run build` then `npm run preview`
4. Check browser console for errors
5. Review platform-specific documentation

