import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const isStudentProfileComplete = (candidate) => {
    if (!candidate || candidate.role !== 'student') return true
    const profile = candidate.profile || {}
    const required = ['country', 'course', 'marks', 'income', 'category']
    return required.every((field) => !!profile[field])
  }

  const getPostAuthRedirect = (candidate) => {
    if (!candidate) return '/'
    if (candidate.role === 'admin') return '/admin'
    return isStudentProfileComplete(candidate)
      ? '/recommendations'
      : '/profile?onboarding=1'
  }

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await api.get('/api/auth/profile');
      setUser(response.data);
      return response.data
    } catch (error) {
      localStorage.removeItem('token');
      setUser(null);
      return null
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      const { token, ...userData } = response.data;
      localStorage.setItem('token', token);
      setUser(userData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Login failed';
    }
  };

  const register = async (name, email, password, role) => {
    try {
      const response = await api.post('/api/auth/register', { name, email, password, role });
      const { token, ...userData } = response.data;
      localStorage.setItem('token', token);
      setUser(userData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Registration failed';
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    fetchUser,
    isStudentProfileComplete,
    getPostAuthRedirect,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
