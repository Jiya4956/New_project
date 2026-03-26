# Scholar Connect - Deployment Guide

This guide will help you deploy the Scholar Connect application to production.

## Deployment Overview

- **Backend**: Deploy to Render (recommended) or Railway, Heroku
- **Frontend**: Deploy to Vercel (recommended) or Netlify
- **Database**: MongoDB Atlas (cloud)

## Prerequisites

1. GitHub account
2. MongoDB Atlas account
3. Render account (free tier available)
4. Vercel account (free tier available)

---

## Step 1: MongoDB Atlas Setup

1. **Create Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for a free account

2. **Create Cluster**
   - Click "Build a Database"
   - Choose M0 (Free) tier
   - Select your preferred cloud provider and region
   - Click "Create"

3. **Configure Database Access**
   - Go to "Database Access" → "Add New Database User"
   - Create username and password (save these securely)
   - Set privileges to "Read and write to any database"

4. **Configure Network Access**
   - Go to "Network Access" → "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Or add specific IPs if you prefer

5. **Get Connection String**
   - Go to "Databases" → Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - It will look like: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
   - Replace `<password>` with your actual password

---

## Step 2: Backend Deployment (Render)

### 2.1 Prepare Your Repository

1. Push your code to GitHub
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

### 2.2 Deploy to Render

1. **Create New Web Service**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure Build Settings**
   - **Name**: scholar-connect-backend
   - **Root Directory**: backend
   - **Environment**: Node
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`

3. **Add Environment Variables**
   Add these variables in Render dashboard:
   ```
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_jwt_key_here
   NODE_ENV=production
   CORS_ORIGIN=https://your-frontend-url.vercel.app
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Note your backend URL: `https://your-backend-name.onrender.com`

---

## Step 3: Frontend Deployment (Vercel)

### 3.1 Deploy to Vercel

1. **Create Account**
   - Go to [Vercel](https://vercel.com)
   - Sign up with GitHub

2. **Import Project**
   - Click "Add New" → "Project"
   - Import your GitHub repository

3. **Configure Project**
   - **Framework Preset**: Create React App
   - **Root Directory**: frontend
   - **Build Command**: `npm run build`
   - **Output Directory**: build

4. **Add Environment Variables**
   ```
   REACT_APP_API_URL=https://your-backend-name.onrender.com
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Note your frontend URL

### 3.2 Update Backend CORS

1. Go back to Render dashboard
2. Update `CORS_ORIGIN` environment variable to your Vercel frontend URL
3. Redeploy backend

---

## Step 4: Run Seed Script (Optional)

To populate your database with test data:

1. **Local Method**
   ```bash
   cd backend
   npm install
   # Create .env file with your MongoDB URI and JWT_SECRET
   npm run seed
   ```

2. **Remote Method**
   - SSH into your Render instance
   - Run the seed script manually

---

## Step 5: Post-Deployment

### Verify Deployment

1. **Test Frontend**
   - Visit your Vercel URL
   - Check if the application loads

2. **Test Backend**
   - Visit `https://your-backend.onrender.com/api/health`
   - Should return: `{"message":"Scholar Connect API is running"}`

3. **Test Registration**
   - Register a new user
   - Login with credentials

4. **Test API**
   - Use Postman or similar tool
   - Test authentication endpoints

---

## Environment Variables Reference

### Backend (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret for JWT tokens | `your_secret_here` |
| `NODE_ENV` | Environment | production |
| `CORS_ORIGIN` | Frontend URL | `https://...vercel.app` |

### Frontend (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend URL | `https://...onrender.com` |

---

## Troubleshooting

### Issue: "Cannot connect to database"

**Solutions:**
1. Check MongoDB Atlas IP whitelist
2. Verify connection string is correct
3. Check if password contains special characters (need URL encoding)

### Issue: CORS errors

**Solutions:**
1. Update `CORS_ORIGIN` in backend environment variables
2. Ensure both URLs use HTTPS in production
3. Check CORS middleware configuration

### Issue: Build fails

**Solutions:**
1. Check build logs for specific errors
2. Verify all dependencies in package.json
3. Ensure Node.js version is compatible

### Issue: API calls fail

**Solutions:**
1. Verify `REACT_APP_API_URL` is correct
2. Check backend logs on Render
3. Ensure backend is running

---

## Custom Domain (Optional)

### Backend (Render)

1. Go to Render dashboard
2. Click on your service
3. Go to "Settings" → "Custom Domain"
4. Add your domain
5. Update DNS records

### Frontend (Vercel)

1. Go to Vercel dashboard
2. Click your project
3. Go to "Settings" → "Domains"
4. Add your domain
5. Update DNS records

---

## Monitoring

### Backend Monitoring (Render)

- View logs in Render dashboard
- Set up uptime monitoring
- Monitor response times

### Frontend Monitoring (Vercel)

- View analytics in Vercel dashboard
- Monitor page views
- Track build logs

---

## Security Checklist

- [ ] Use strong JWT_SECRET
- [ ] Enable HTTPS only
- [ ] Restrict MongoDB IP whitelist
- [ ] Set secure CORS origins
- [ ] Use environment variables for secrets
- [ ] Regularly update dependencies
- [ ] Implement rate limiting
- [ ] Add input validation

---

## Cost Estimation

### Free Tier (Suitable for Development)

- **Render**: Free tier available
- **Vercel**: Free tier available
- **MongoDB Atlas**: Free tier (512MB)

### Paid Tier (For Production)

- **Render**: $7/month for basic plan
- **Vercel**: Free for small projects, pro at $20/month
- **MongoDB Atlas**: Pay as you go

---

## Backup Strategy

1. **Database Backup**
   - MongoDB Atlas provides automatic backups
   - Configure backup frequency in Atlas dashboard

2. **Code Backup**
   - Use GitHub for version control
   - Enable branch protection

3. **Environment Variables Backup**
   - Keep a secure backup of all environment variables
   - Store in password manager

---

## Support

For issues or questions:

1. Check the [README.md](README.md)
2. Review [SETUP.md](SETUP.md)
3. Check application logs
4. Review Render and Vercel documentation

---

**Congratulations!** Your Scholar Connect application is now live! 🎉

