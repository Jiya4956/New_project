# Scholar Connect - Setup Guide

## Quick Start Instructions

### 1. Prerequisites Installation

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v14 or higher)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account (free tier is fine)

### 2. MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (free tier M0)
4. Click "Connect" → "Connect your application"
5. Copy the connection string (e.g., `mongodb+srv://username:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`)

### 3. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env file with your MongoDB connection string
# Replace <password> with your MongoDB password
# Add your JWT secret key

# Start the backend server
npm run dev
```

The backend will start on `http://localhost:5000`

### 4. Frontend Setup

```bash
# Open a NEW terminal
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# The .env file should already have the correct API URL
# REACT_APP_API_URL=http://localhost:5000

# Start the frontend development server
npm start
```

The frontend will start on `http://localhost:3000`

### 5. Create Test Accounts

You can create accounts through the registration form or use these test credentials:

**Admin Account:**
- Name: Admin User
- Email: admin@scholarconnect.com
- Password: admin123
- Role: admin

**Student Account:**
- Name: Student User
- Email: student@example.com
- Password: student123
- Role: student

### 6. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/api/health

## Build for Production

### Backend

```bash
cd backend
npm run build
npm start
```

### Frontend

```bash
cd frontend
npm run build
```

The production build will be in `frontend/build` directory.

## Deployment

### Deploy Backend to Render

1. Push your code to GitHub
2. Go to [Render](https://render.com/)
3. Click "New" → "Web Service"
4. Connect your GitHub repository
5. Select the backend folder
6. Add environment variables:
   - `PORT`: 5000
   - `MONGO_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Your secret key
7. Deploy

### Deploy Frontend to Vercel

1. Go to [Vercel](https://vercel.com/)
2. Import your Git repository
3. Set root directory to `frontend`
4. Add environment variable:
   - `REACT_APP_API_URL`: Your Render backend URL
5. Deploy

### Update CORS Settings

In your backend `.env` file or Render environment variables, add:
```
CORS_ORIGIN=https://your-frontend-domain.vercel.app
```

## Common Issues

### Issue: MongoDB Connection Error

**Solution:**
- Verify your connection string is correct
- Ensure your IP is whitelisted in MongoDB Atlas
- Check your MongoDB password doesn't have special characters (if it does, URL encode them)

### Issue: CORS Error

**Solution:**
- Update the backend CORS configuration
- Ensure REACT_APP_API_URL points to the correct backend URL

### Issue: JWT Token Expired

**Solution:**
- Clear browser localStorage and login again
- Check if JWT_SECRET is set correctly

### Issue: Module Not Found

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Development Commands

### Backend

```bash
npm start        # Start production server
npm run dev      # Start development server with nodemon
```

### Frontend

```bash
npm start        # Start development server
npm run build    # Create production build
npm test         # Run tests
```

## Project Structure

```
portal/
├── backend/                 # Express.js backend
│   ├── controllers/         # Route controllers
│   ├── middleware/         # Auth and error middleware
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   └── server.js           # Entry point
│
├── frontend/               # React frontend
│   ├── public/            # Static files
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── context/        # React context
│   │   ├── pages/          # Page components
│   │   ├── api/            # API configuration
│   │   └── App.js          # Main app component
│   └── package.json
│
├── .gitignore
├── README.md
└── SETUP.md
```

## Next Steps

1. Create your MongoDB Atlas cluster
2. Set up environment variables
3. Run both frontend and backend
4. Register a user account
5. Start exploring the application!

## Need Help?

- Check the [README.md](README.md) for detailed documentation
- Review the API endpoints documentation
- Check the console for error messages
- Ensure all dependencies are installed

Happy coding! 🚀

