import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const GoogleCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { fetchUser } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    const role = searchParams.get('role');

    if (token) {
      // Save token, then fetch full user profile
      localStorage.setItem('token', token);
      
      fetchUser().then(() => {
        // Redirect based on role
        navigate(role === 'admin' ? '/admin' : '/', { replace: true });
      });
    } else {
      setError('Authentication failed. No token received.');
      setTimeout(() => navigate('/login', { replace: true }), 3000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <div className="card p-12 text-center max-w-md">
        {error ? (
          <>
            <div className="text-5xl mb-4">❌</div>
            <h2 className="text-xl font-bold text-red-600 mb-2">Login Failed</h2>
            <p className="text-slate-500">{error}</p>
            <p className="text-sm text-slate-400 mt-2">Redirecting to login...</p>
          </>
        ) : (
          <>
            <div className="text-5xl mb-4 animate-float">🔐</div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Signing you in...</h2>
            <p className="text-slate-500">Please wait while we complete your Google sign-in</p>
            <div className="mt-6">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GoogleCallback;
