import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold text-gray-800 mb-4">
          Welcome to Scholar Connect
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Your Gateway to National and International Scholarships
        </p>
        {!user && (
          <div className="space-x-4">
            <Link
              to="/register"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 inline-block"
            >
              Get Started
            </Link>
            <Link
              to="/scholarships"
              className="bg-gray-200 text-gray-800 px-8 py-3 rounded-lg hover:bg-gray-300 inline-block"
            >
              Browse Scholarships
            </Link>
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="text-blue-600 text-4xl mb-4">📚</div>
          <h3 className="text-xl font-semibold mb-2">Discover Scholarships</h3>
          <p className="text-gray-600">
            Browse through hundreds of national and international scholarship opportunities.
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="text-blue-600 text-4xl mb-4">🎯</div>
          <h3 className="text-xl font-semibold mb-2">Easy Application</h3>
          <p className="text-gray-600">
            Apply to multiple scholarships with a simple, streamlined process.
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="text-blue-600 text-4xl mb-4">📊</div>
          <h3 className="text-xl font-semibold mb-2">Track Status</h3>
          <p className="text-gray-600">
            Monitor your application status in real-time from your dashboard.
          </p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-blue-600 text-white rounded-lg p-8 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold mb-2">500+</div>
            <div>Active Scholarships</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">10K+</div>
            <div>Students Registered</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">50+</div>
            <div>Countries Covered</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">95%</div>
            <div>Success Rate</div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Ready to Start Your Journey?
        </h2>
        <p className="text-gray-600 mb-6">
          Join thousands of students who have found their perfect scholarship opportunity.
        </p>
        {!user && (
          <Link
            to="/register"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 inline-block"
          >
            Create Your Account
          </Link>
        )}
        {user && (
          <Link
            to="/scholarships"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 inline-block"
          >
            Browse Scholarships
          </Link>
        )}
      </div>
    </div>
  );
};

export default Home;

