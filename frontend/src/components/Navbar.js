import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">

          <Link to="/" className="text-2xl font-bold">
            Scholar Connect
          </Link>

          <div className="flex items-center space-x-4">

            <Link to="/scholarships">Scholarships</Link>

            <Link to="/feedback">Feedback</Link>
            <Link to="/recommendations">AI Recommendations</Link>
            {user ? (
              <>
                {user.role === 'admin' && (
                  <Link to="/admin">Admin Dashboard</Link>
                )}
                {user.role === "admin" && (
  <Link to="/admin-feedback">
    Feedback
  </Link>
)}

                <Link to="/my-applications">My Applications</Link>

                <Link to="/profile">Profile</Link>

                <button
                  onClick={handleLogout}
                  className="bg-blue-700 px-4 py-2 rounded"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login">Login</Link>
                <Link
                  to="/register"
                  className="bg-blue-700 px-4 py-2 rounded"
                >
                  Register
                </Link>
              </>
            )}

          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
