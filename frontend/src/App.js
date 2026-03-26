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
import Feedback from './pages/Feedback';
import AdminFeedback from './pages/AdminFeedback';
import Recommendations from './pages/Recommendationss';
import Forum from './pages/Forum';
import GoogleCallback from './pages/GoogleCallback';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/"               element={<Home />} />
              <Route path="/login"          element={<Login />} />
              <Route path="/register"       element={<Register />} />
              <Route path="/scholarships"   element={<ScholarshipList />} />
              <Route path="/scholarships/:id" element={<ScholarshipDetail />} />
              <Route path="/forum"          element={<Forum />} />
              <Route path="/feedback"       element={<Feedback />} />
              <Route path="/recommendations" element={<Recommendations />} />
              <Route path="/auth/google/callback" element={<GoogleCallback />} />

              {/* Protected routes */}
              <Route path="/apply/:id"      element={<ProtectedRoute><ApplyForm /></ProtectedRoute>} />
              <Route path="/my-applications" element={<ProtectedRoute><MyApplications /></ProtectedRoute>} />
              <Route path="/profile"        element={<ProtectedRoute><Profile /></ProtectedRoute>} />

              {/* Admin routes */}
              <Route path="/admin"          element={<ProtectedRoute admin><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin-feedback" element={<ProtectedRoute admin><AdminFeedback /></ProtectedRoute>} />
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
