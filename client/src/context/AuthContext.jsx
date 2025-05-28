import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

// Configure axios defaults
axios.defaults.baseURL = 'http://localhost:5000';

export const AuthContext = createContext(null);

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

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await axios.get('/api/v1/users/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data);
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/v1/users/login', { email, password });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Login failed');
      }

      const { token, user: userData } = response.data;
      if (!token) {
        throw new Error('No token received from server');
      }

      localStorage.setItem('token', token);
      setUser(userData || null);
      return { token, user: userData };
    } catch (err) {
      console.error('Login error:', err);
      throw new Error(err.response?.data?.message || 'Login failed - please check your credentials');
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('/api/v1/register', userData);
      const { token, user: newUser } = response.data;
      localStorage.setItem('token', token);
      setUser(newUser);
      return newUser;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Registration failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateProfile = async (userData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put('/api/v1/users/profile', userData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Profile update failed');
    }
  };

  const forgotPassword = async (email) => {
    try {
      await axios.post('/api/v1/forgot-password', { email });
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Password reset request failed');
    }
  };

  const resetPassword = async (token, password) => {
    try {
      await axios.post('/api/v1/reset-password', { token, password });
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Password reset failed');
    }
  };

  // Configure axios defaults
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Handle 401 responses
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        logout();
      }
      return Promise.reject(error);
    }
  );

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    forgotPassword,
    resetPassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 