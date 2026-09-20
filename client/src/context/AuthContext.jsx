import React, { createContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/authApi';
import toast from 'react-hot-toast';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const res = await authApi.getMe();
      setUser(res.data);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (identifier, password) => {
    const res = await authApi.login({ identifier, password });
    if (res.data.token) {
      localStorage.setItem('auth_token', res.data.token);
    }
    setUser(res.data.user);
    toast.success('Logged in successfully');
    return res.data.user;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('auth_token');
      setUser(null);
      toast.success('Logged out successfully');
    }
  };

  const refreshUser = async () => {
    try {
      const res = await authApi.getMe();
      setUser(res.data);
      return res.data;
    } catch (err) {
      setUser(null);
    }
  };

  const getDefaultRedirect = (role) => {
    switch (role) {
      case 'ADMIN':
        return '/admin';
      case 'SECRETARY':
      case 'LEAD':
        return '/head';
      case 'MEMBER':
      default:
        return '/member';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        refreshUser,
        getDefaultRedirect,
        isAuthenticated: !!user,
        mustChangePassword: user?.mustChangePassword || false
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
