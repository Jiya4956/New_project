# Scholar Connect – Scholarship Management Portal

A complete MERN stack application for managing scholarships, applications, and student interactions. This platform allows students to discover, filter, and apply for national and international scholarships, while administrators can manage listings and review applications.

## 📋 Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Deployment](#deployment)
- [Sample Test Data](#sample-test-data)

## 🚀 Features

### For Students
- User registration and authentication with JWT
- Browse and filter scholarships by category, country, and deadline
- View detailed scholarship information
- Apply for multiple scholarships
- Track application status in real-time
- Interactive chatbot for assistance
- Responsive mobile-friendly design

### For Administrators
- Full scholarship CRUD operations
- View and manage all applications
- Update application status (Pending, Reviewed, Accepted, Rejected)
- Dashboard with statistics
- User management capabilities

### Additional Features
- Role-based access control (Student/Admin)
- JWT-based authentication
- RESTful API with Express.js
- MongoDB database with Mongoose
- TailwindCSS for modern UI
- Chatbot integration (rule-based, expandable to OpenAI)

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI library
- **React Router 6** - Client-side routing
- **Axios** - HTTP client
- **TailwindCSS 3** - Utility-first CSS framework

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB Atlas** - Cloud database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

## 📁 Project Structure

```
scholar-connect/
├── backend/
│   ├── config/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── scholarshipController.js
│   │   ├── applicationController.js
│   │   └── chatbotController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Scholarship.js
│   │   ├── Application.js
│   │   └── Message.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── scholarships.js
│   │   ├── applications.js
│   │   └── chatbot.js
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── api/
│   │   │   └── api.js
│   │   ├── components/
│   │   │   ├── Navbar.js
│   │   │   ├── Footer.js
│   │   │   ├── Chatbot.js
│   │   │   └── ProtectedRoute.js
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── pages/
│   │   │   ├── Home.js
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── ScholarshipList.js
│   │   │   ├── ScholarshipDetail.js
│   │   │   ├── ApplyForm.js
│   │   │   ├── MyApplications.js
│   │   │   ├── AdminDashboard.js
│   │   │   └── Profile.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── package.json
│   ├── tailwind.config.js
│   └── .env
│
├── .gitignore
└── README.md
```

## 🎯 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB Atlas account (or local MongoDB)
- Git

### Installation Steps

#### 1. Clone the Repository

```bash
git clone <repository-url>
cd portal
```

#### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secret_jwt_key
```

Start the backend server:

```bash
npm run dev
```

The backend will run on `http://localhost:5000`

#### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
```

Create a `.env` file in the frontend directory:

```env
REACT_APP_API_URL=http://localhost:5000
```

Start the frontend development server:

```bash
npm start
```

The frontend will run on `http://localhost:3000`

## 🔐 Environment Variables

### Backend (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port number | 5000 |
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret key for JWT tokens | `your_secret_key` |

### Frontend (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API URL | `http://localhost:5000` |

## 📡 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Scholarships

- `GET /api/scholarships` - Get all scholarships (with filters)
- `GET /api/scholarships/:id` - Get scholarship by ID
- `POST /api/scholarships` - Create new scholarship (Admin)
- `PUT /api/scholarships/:id` - Update scholarship (Admin)
- `DELETE /api/scholarships/:id` - Delete scholarship (Admin)

### Applications

- `POST /api/applications` - Apply for scholarship
- `GET /api/applications/my-applications` - Get user's applications
- `GET /api/applications/:id` - Get application by ID
- `GET /api/applications` - Get all applications (Admin)
- `PUT /api/applications/:id/status` - Update application status (Admin)

### Chatbot

- `POST /api/chatbot` - Send message to chatbot
- `GET /api/chatbot/history` - Get message history

## 🚢 Deployment

### Backend Deployment (Render)

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set build command: `cd backend && npm install`
4. Set start command: `cd backend && npm start`
5. Add environment variables in Render dashboard
6. Deploy

### Frontend Deployment (Vercel)

1. Create a new project on Vercel
2. Import your Git repository
3. Set framework preset to "Create React App"
4. Add environment variables
5. Update `REACT_APP_API_URL` to your Render backend URL
6. Deploy

### MongoDB Atlas Setup

1. Create a free cluster on MongoDB Atlas
2. Create a database user
3. Whitelist your IP address (or use 0.0.0.0/0 for all)
4. Get your connection string
5. Replace `<password>` with your actual password

## 📊 Sample Test Data

### Sample Users

**Admin User:**
- Email: `admin@scholarconnect.com`
- Password: `admin123`
- Role: `admin`

**Student User:**
- Email: `student@example.com`
- Password: `student123`
- Role: `student`

### Sample Scholarships

The application includes several sample scholarships in various categories:
- Academic excellence scholarships
- Need-based financial aid
- Merit-based awards
- International opportunities
- Government programs

## 🔒 Security Features

- Password hashing with bcryptjs
- JWT token-based authentication
- Role-based access control
- Protected API routes
- CORS configuration
- Input validation

## 📱 Responsive Design

The application is fully responsive and works seamlessly on:
- Desktop browsers
- Tablets
- Mobile devices

## 🤖 Chatbot

The integrated chatbot provides assistance for:
- Eligibility questions
- Application process
- Document requirements
- Deadlines
- General inquiries

## 📝 Testing

To test the application:

1. Register a new account or use provided credentials
2. Browse available scholarships
3. Apply for scholarships
4. Track your applications
5. (As admin) Manage scholarships and applications

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Built with ❤️ using the MERN stack

## 📞 Support

For support, email info@scholarconnect.com or create an issue in the repository.

---

**Made with React, Node.js, Express, MongoDB, and TailwindCSS**

