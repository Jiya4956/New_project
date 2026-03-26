import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ScholarshipList from './pages/ScholarshipList';
import ScholarshipDetail from './pages/ScholarshipDetail';
import ApplyForm from './pages/ApplyForm';
import MyApplications from './pages/MyApplications';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import Feedback from "./pages/Feedback";
import AdminFeedback from "./pages/AdminFeedback";
import Recommendations from "./pages/Recommendationss";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/feedback" element={<Feedback />} />
              <Route path="/register" element={<Register />} />
              <Route path="/scholarships" element={<ScholarshipList />} />
              
              <Route path="/scholarships/:id" element={<ScholarshipDetail />} />
              <Route path="/apply/:id" element={<ProtectedRoute><ApplyForm /></ProtectedRoute>} />
              <Route path="/my-applications" element={<ProtectedRoute><MyApplications /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute admin><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin-feedback" element={<AdminFeedback />} />
              <Route path="/recommendations" element={<Recommendations />} />
            </Routes>
          </main>
          <Footer />
          <Chatbot />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

