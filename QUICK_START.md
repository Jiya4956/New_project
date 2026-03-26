# Quick Start Guide - Scholar Connect

Get Scholar Connect up and running in 5 minutes!

## Prerequisites

- Node.js installed ([Download](https://nodejs.org/))
- MongoDB Atlas account (free tier)

## Quick Setup

### 1. Clone or Download the Project

```bash
# If you have the code, navigate to the project folder
cd portal
```

### 2. Backend Setup (Terminal 1)

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create .env file
echo "PORT=5000" > .env
echo "MONGO_URI=your_mongodb_connection_string" >> .env
echo "JWT_SECRET=your_secret_key_here" >> .env
```

**Get MongoDB Connection String:**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get your connection string
4. Replace `your_mongodb_connection_string` in .env

```bash
# Start backend server
npm run dev
```

Backend will run on http://localhost:5000

### 3. Frontend Setup (Terminal 2)

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Create .env file
echo "REACT_APP_API_URL=http://localhost:5000" > .env

# Start frontend server
npm start
```

Frontend will run on http://localhost:3000

### 4. Seed Database (Optional)

In Terminal 1 (backend):

```bash
npm run seed
```

This creates:
- Admin user: `admin@scholarconnect.com` / `admin123`
- Student user: `student@example.com` / `student123`
- 5 sample scholarships

### 5. Access the Application

Open http://localhost:3000 in your browser!

## Default Login Credentials

**Admin:**
- Email: `admin@scholarconnect.com`
- Password: `admin123`

**Student:**
- Email: `student@example.com`
- Password: `student123`

## What's Next?

1. Login with admin credentials
2. Browse scholarships
3. Create new scholarships (admin)
4. Apply for scholarships (student)
5. Manage applications (admin)

## Troubleshooting

### Port already in use?

```bash
# Kill process on port 5000 (backend)
npx kill-port 5000

# Kill process on port 3000 (frontend)
npx kill-port 3000
```

### MongoDB connection error?

1. Check your connection string in .env
2. Whitelist your IP in MongoDB Atlas
3. Verify password doesn't have special characters

### Can't find modules?

```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

## Project Structure

```
portal/
├── backend/          # Express API server
│   ├── controllers/  # Route controllers
│   ├── models/       # Database models
│   ├── routes/       # API routes
│   └── server.js     # Entry point
│
└── frontend/         # React frontend
    ├── src/
    │   ├── pages/    # Page components
    │   ├── components/# Reusable components
    │   └── App.js    # Main app
```

## Common Commands

### Backend

```bash
npm start      # Start production server
npm run dev    # Start development server
npm run seed   # Seed database with sample data
```

### Frontend

```bash
npm start      # Start development server
npm run build  # Build for production
```

## Next Steps

- [ ] Set up MongoDB Atlas
- [ ] Configure environment variables
- [ ] Run seed script
- [ ] Test authentication
- [ ] Create test accounts
- [ ] Explore features

## Need Help?

Check these files:
- [README.md](README.md) - Full documentation
- [SETUP.md](SETUP.md) - Detailed setup guide
- [DEPLOYMENT.md](DEPLOYMENT.md) - Production deployment

---

**Happy Coding! 🚀**

