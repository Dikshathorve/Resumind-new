# 📝 Environment Variables Setup Guide

## 🎯 What You Need to Do

### **Your Current Credentials** ✓

```env
# EmailJS (PUBLIC - Safe to use)
VITE_EMAILJS_SERVICE_ID=service_vn9fhes
VITE_EMAILJS_TEMPLATE_ID=template_051olj5
VITE_EMAILJS_PUBLIC_KEY=_flKog5jvYfD9RL4Z

# Backend API (UPDATE THIS)
VITE_API_URL=https://resumind-new.onrender.com/api
```

---

## 📋 Complete Environment Variable List

### **For Production (Vercel/Netlify)**

Set these variables in your hosting dashboard:

| Variable | Value | Example |
|----------|-------|---------|
| `VITE_API_URL` | Your deployed backend URL | `https://resumind-backend.azurewebsites.net/api` |
| `VITE_EMAILJS_SERVICE_ID` | `service_vn9fhes` | service_vn9fhes |
| `VITE_EMAILJS_TEMPLATE_ID` | `template_051olj5` | template_051olj5 |
| `VITE_EMAILJS_PUBLIC_KEY` | `_flKog5jvYfD9RL4Z` | _flKog5jvYfD9RL4Z |
| `VITE_ENV` | `production` | production |

---

## 🚀 How to Set Up on Each Platform

### **Vercel**

1. Go to: https://vercel.com/dashboard
2. Select your project
3. Click **Settings** → **Environment Variables**
4. Add each variable:

```
VITE_API_URL = https://resumind-new.onrender.com/api
VITE_EMAILJS_SERVICE_ID = service_vn9fhes
VITE_EMAILJS_TEMPLATE_ID = template_051olj5
VITE_EMAILJS_PUBLIC_KEY = _flKog5jvYfD9RL4Z
VITE_ENV = production
```

5. Select scope: **Production**
6. Click **Save**
7. Trigger redeploy (or push to main branch)

---

### **Netlify**

1. Go to: https://app.netlify.com
2. Select your site
3. Click **Site settings** → **Build & deploy** → **Environment**
4. Click **Edit variables**
5. Add each variable:

```
VITE_API_URL = https://resumind-new.onrender.com/api
VITE_EMAILJS_SERVICE_ID = service_vn9fhes
VITE_EMAILJS_TEMPLATE_ID = template_051olj5
VITE_EMAILJS_PUBLIC_KEY = _flKog5jvYfD9RL4Z
VITE_ENV = production
```

6. Click **Save**
7. Trigger redeploy

---

### **Docker Deployment**

Create a `.env` file in your deployment:

```bash
# Create .env file
cat > .env << 'EOF'
VITE_API_URL=https://resumind-new.onrender.com/api
VITE_EMAILJS_SERVICE_ID=service_vn9fhes
VITE_EMAILJS_TEMPLATE_ID=template_051olj5
VITE_EMAILJS_PUBLIC_KEY=_flKog5jvYfD9RL4Z
VITE_ENV=production
EOF
```

Or pass as build arguments:

```bash
docker build \
  --build-arg VITE_API_URL=https://resumind-new.onrender.com/api \
  --build-arg VITE_EMAILJS_SERVICE_ID=service_vn9fhes \
  --build-arg VITE_EMAILJS_TEMPLATE_ID=template_051olj5 \
  --build-arg VITE_EMAILJS_PUBLIC_KEY=_flKog5jvYfD9RL4Z \
  --build-arg VITE_ENV=production \
  -t resumind-frontend:latest ./frontend
```

---

## 📂 Local Files (Already Set)

### **`.env.development`** ✓
For local development (`npm run dev`)
```env
VITE_API_URL=http://localhost:5000/api
VITE_EMAILJS_SERVICE_ID=service_vn9fhes
VITE_EMAILJS_TEMPLATE_ID=template_051olj5
VITE_EMAILJS_PUBLIC_KEY=_flKog5jvYfD9RL4Z
VITE_ENV=development
```

### **`.env.production`** ✓
For production builds (`npm run build`)
```env
VITE_API_URL=https://resumind-new.onrender.com/api
VITE_EMAILJS_SERVICE_ID=service_vn9fhes
VITE_EMAILJS_TEMPLATE_ID=template_051olj5
VITE_EMAILJS_PUBLIC_KEY=_flKog5jvYfD9RL4Z
VITE_ENV=production
```

### **`.env.example`** ✓
Template file (committed to Git - shows structure)

---

## ⚠️ Important: Update VITE_API_URL

**Current value:**
```
https://resumind-new.onrender.com/api
```

**When deploying, change to your actual backend:**

- **Azure:** `https://your-app-name.azurewebsites.net/api`
- **Heroku:** `https://your-app-name.herokuapp.com/api`
- **Render:** `https://your-app-name.onrender.com/api`
- **AWS:** `https://your-api-gateway.execute-api.region.amazonaws.com`
- **Local/Testing:** `http://localhost:5000/api`

---

## 🔒 Security Notes

✅ **EmailJS credentials are PUBLIC**
- It's safe to have `VITE_EMAILJS_*` variables in your code
- They're frontend-facing credentials
- They're committed to Git

✅ **No sensitive secrets in this app**
- API URL is not a secret
- Database credentials should NEVER be in frontend

---

## 🧪 Test After Deployment

1. Open DevTools (F12)
2. Go to **Console** tab
3. Type: `console.log(import.meta.env.VITE_API_URL)`
4. Should show your backend URL
5. Submit a form to test API connection

---

## ✅ Checklist Before Going Live

- [ ] Update `VITE_API_URL` to your actual backend
- [ ] Set all 5 environment variables in Vercel/Netlify dashboard
- [ ] Redeploy project after adding variables
- [ ] Test form submission
- [ ] Check browser console for errors
- [ ] Verify API calls succeed (Network tab)

---

## 📞 Quick Reference

**Production Environment Variables (Copy-Paste Ready):**

```
VITE_API_URL=https://resumind-new.onrender.com/api
VITE_EMAILJS_SERVICE_ID=service_vn9fhes
VITE_EMAILJS_TEMPLATE_ID=template_051olj5
VITE_EMAILJS_PUBLIC_KEY=_flKog5jvYfD9RL4Z
VITE_ENV=production
```

**Development Environment Variables (Local):**

```
VITE_API_URL=http://localhost:5000/api
VITE_EMAILJS_SERVICE_ID=service_vn9fhes
VITE_EMAILJS_TEMPLATE_ID=template_051olj5
VITE_EMAILJS_PUBLIC_KEY=_flKog5jvYfD9RL4Z
VITE_ENV=development
```

---

**Ready to deploy? Follow the steps for your chosen platform above! 🚀**
