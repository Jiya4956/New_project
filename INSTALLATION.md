# Installation Guide - Scholar Connect

Complete step-by-step installation instructions for Scholar Connect.

## Table of Contents

1. [Requirements](#requirements)
2. [MongoDB Atlas Setup](#mongodb-atlas-setup)
3. [Backend Installation](#backend-installation)
4. [Frontend Installation](#frontend-installation)
5. [Seed Database](#seed-database)
6. [Run the Application](#run-the-application)
7. [Verify Installation](#verify-installation)

---

## Requirements

Before starting, ensure you have:

- ✅ Node.js v14 or higher ([Download](https://nodejs.org/))
- ✅ npm (comes with Node.js)
- ✅ MongoDB Atlas account (free tier)
- ✅ Text editor or IDE

### Check Your Installation

```bash
# Check Node.js version
node --version  # Should be v14 or higher

# Check npm version
npm --version
```

---

## MongoDB Atlas Setup

### Step 1: Create Account

1. Visit [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Click "Try Free" or "Sign Up"
3. Fill in your details and create account

### Step 2: Create Cluster

1. After login, you'll see "Build a Database"
2. Choose **"M0 Free"** tier
3. Select your preferred cloud provider and region
4. Click "Create"

*This takes about 3-5 minutes to provision.*

### Step 3: Database Access

1. Go to **"Database Access"** in left sidebar
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Enter username (e.g., `scholarconnect`)+de
5. Generate a password (save it securely!)
6. Set privileges to **"Read and write to any database"**
7. Click **"Add User"**

### Step 4: Network Access

1. Go to **"Network Access"** in left sidebar
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (sets 0.0.0.0/0)
4. Click **"Confirm"**

*For production, restrict IP addresses.*

### Step 5: Get Connection String

1. Go to **"Database"** → Click **"Connect"** on your cluster
2. Choose **"Connect your application"**
3. Select **"Node.js"** and **version "4.1 or later"**
4. Copy the connection string

It looks like:
```
mongodb+srv://username:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

**Important**: Replace `<password>` with your actual password when using.

---

## Backend Installation

### Step 1: Navigate to Backend

```bash
# From project root
cd backend
```

### Step 2: Install Dependencies

```bash
npm install
```

*This installs: express, mongoose, bcryptjs, jsonwebtoken, cors, dotenv*

### Step 3: Create Environment File

Create a file named `.env` in the `backend` folder:

**Windows (PowerShell):**
```powershell
cd backend
New-Item -Path ".env" -ItemType File
notepad .env
```

**Windows (Command Prompt):**
```cmd
cd backend
type nul > .env
notepad .env
```

**Mac/Linux:**
```bash
cd backend
touch .env
nano .env
```

### Step 4: Add Environment Variables

Open `.env` and add:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string_here
JWT_SECRET=your_secret_jwt_key_minimum_32_characters_long
```

**Example:**
```env
PORT=5000
MONGO_URI=mongodb+srv://scholarconnect:mypassword123@cluster0.xxxxx.mongodb.net/scholar-connect?retryWrites=true&w=majority
JWT_SECRET=mySuperSecretJWTKeyForScholarConnect2024!
```

**Important:**
- Replace `your_mongodb_connection_string_here` with your Atlas connection string
- Replace `<password>` in MongoDB URI with your actual password
- Use a strong random string for JWT_SECRET (minimum 32 characters)

### Step 5: Start Backend Server

```bash
npm run dev
```

You should see:
```
Connected to MongoDB
Server is running on port 5000
```

**Keep this terminal open!**

---

## Frontend Installation

### Step 1: Open New Terminal

Open a **new terminal window** (keep backend running).

### Step 2: Navigate to Frontend

```bash
# From project root
cd frontend
```

### Step 3: Install Dependencies

```bash
npm install
```

*This installs: react, react-router-dom, axios, tailwindcss, and more*

### Step 4: Create Environment File

Create a file named `.env` in the `frontend` folder:

**Windows:**
```powershell
cd frontend
New-Item -Path ".env" -ItemType File
notepad .env
```

**Mac/Linux:**
```bash
cd frontend
touch .env
nano .env
```

### Step 5: Add Environment Variables

Open `.env` and add:

```env
REACT_APP_API_URL=http://localhost:5000
```

### Step 6: Start Frontend Server

```bash
npm start
```

This will:
1. Start the development server
2. Open http://localhost:3000 in your browser
3. Watch for file changes

---

## Seed Database

### Why Seed?

Seeding creates sample data for testing:
- Admin and student accounts
- Sample scholarships
- Test applications

### How to Seed

1. Make sure backend server is running
2. Open a new terminal
3. Navigate to backend:

```bash
cd backend
npm run seed
```

You'll see:
```
Connected to MongoDB
Cleared existing data
Created admin user
Created student user
Created scholarship: Fulbright Foreign Student Program
...
✅ Seeding completed successfully!
```

### Default Accounts

**Admin:**
- Email: `admin@scholarconnect.com`
- Password: `admin123`

**Student:**
- Email: `student@example.com`
- Password: `student123`

---

## Run the Application

### Start Everything

1. **Terminal 1** - Backend:
   ```bash
   cd backend
   npm run dev
   ```

2. **Terminal 2** - Frontend:
   ```bash
   cd frontend
   npm start
   ```

3. **Browser** - Visit: http://localhost:3000

### Expected Result

- ✅ Frontend loads at http://localhost:3000
- ✅ Backend API available at http://localhost:5000
- ✅ You can see scholarships on home page
- ✅ You can register/login

---

## Verify Installation

### 1. Check Backend Health

Visit: http://localhost:5000/api/health

Should return:
```json
{"message":"Scholar Connect API is running"}
```

### 2. Test Frontend

1. Go to http://localhost:3000
2. You should see the home page
3. Try browsing scholarships

### 3. Test Authentication

1. Click "Register"
2. Create a new account
3. Login with credentials
4. You should see personalized content

### 4. Test Admin Panel

1. Login with admin credentials:
   - Email: `admin@scholarconnect.com`
   - Password: `admin123`
2. Go to Admin Dashboard
3. Should see statistics and management options

---

## Common Issues

### Issue: "Cannot find module"

**Solution:**
```bash
# Navigate to the folder
cd backend  # or cd frontend

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: "Port already in use"

**Solution:**
```bash
# Kill process on port 5000 (backend)
npx kill-port 5000

# Kill process on port 3000 (frontend)
npx kill-port 3000

# Or use Task Manager (Windows) / Activity Monitor (Mac)
```

### Issue: "MongoDB connection error"

**Solutions:**
1. Check your connection string in `.env`
2. Replace `<password>` with actual password
3. URL-encode special characters in password
4. Check MongoDB Atlas IP whitelist
5. Verify cluster is running

### Issue: "CORS error"

**Solution:**
Backend `server.js` should have:
```javascript
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
```

### Issue: "Page not found"

**Solution:**
- Make sure both servers are running
- Check URL in browser
- Verify frontend `.env` has correct API URL

### Issue: "Authentication failed"

**Solution:**
1. Check JWT_SECRET in backend `.env`
2. Clear browser localStorage:
   ```javascript
   // In browser console
   localStorage.clear()
   ```
3. Re-login

---

## Next Steps

Now that installation is complete:

1. ✅ Explore the application
2. ✅ Register new users
3. ✅ Create scholarships (admin)
4. ✅ Apply for scholarships (student)
5. ✅ Test chatbot
6. ✅ Customize for your needs

---

## Production Deployment

Ready to deploy? Check:
- [DEPLOYMENT.md](../DEPLOYMENT.md)

---

## Need Help?

- Check [QUICK_START.md](../QUICK_START.md) for quick setup
- Read [README.md](../README.md) for detailed docs
- Review error messages in terminal
- Check MongoDB Atlas dashboard

---

**Installation complete! Happy coding! 🎉**

