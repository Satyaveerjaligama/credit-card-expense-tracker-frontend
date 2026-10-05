'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { api } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const hasVerifiedRef = useRef(false);

  const isAuthPage = pathname === '/login' || pathname === '/register';

  useEffect(() => {
    const savedToken = localStorage.getItem('cc_token');
    const savedUser = localStorage.getItem('cc_user');

    if (savedToken) {
      setToken(savedToken);
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {
          // ignore parsing error
        }
      }

      if (!hasVerifiedRef.current) {
        hasVerifiedRef.current = true;
        api
          .getMe()
          .then((res) => {
            if (res.success && res.user) {
              setUser(res.user);
              localStorage.setItem('cc_user', JSON.stringify(res.user));
            }
          })
          .catch((err) => {
            // Only clear token if backend explicitly rejected auth (401 or 403)
            // Don't log user out on temporary connection issues or cold start delays
            if (err?.status === 401 || err?.status === 403) {
              localStorage.removeItem('cc_token');
              localStorage.removeItem('cc_user');
              setUser(null);
              setToken(null);
              if (!isAuthPage) {
                router.push('/login');
              }
            }
          })
          .finally(() => {
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    } else {
      setLoading(false);
      if (!isAuthPage) {
        router.push('/login');
      }
    }
  }, [pathname, router, isAuthPage]);

  const login = async (credentials) => {
    const res = await api.login(credentials);
    if (res.success && res.token) {
      localStorage.setItem('cc_token', res.token);
      localStorage.setItem('cc_user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
      router.push('/');
      return res;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await api.register(userData);
    if (res.success && res.token) {
      localStorage.setItem('cc_token', res.token);
      localStorage.setItem('cc_user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
      router.push('/');
      return res;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('cc_token');
    localStorage.removeItem('cc_user');
    setToken(null);
    setUser(null);
    router.push('/login');
  };

  const refreshUser = async () => {
    try {
      const res = await api.getMe();
      if (res.success && res.user) {
        setUser(res.user);
        localStorage.setItem('cc_user', JSON.stringify(res.user));
      }
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        refreshUser,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
