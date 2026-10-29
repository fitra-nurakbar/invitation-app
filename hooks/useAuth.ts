'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@/types/auth';

const TOKEN_KEY = 'invitation_token';
const USER_KEY = 'invitation_user';

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const readStorage = useCallback(() => {
    try {
      const savedToken = localStorage.getItem(TOKEN_KEY);
      const savedUser = localStorage.getItem(USER_KEY);

      if (savedToken && savedUser && savedUser !== 'undefined' && savedUser !== 'null') {
        const parsedUser = JSON.parse(savedUser);
        if (parsedUser && typeof parsedUser === 'object') {
          setToken(savedToken);
          setUser(parsedUser);
          setLoading(false);
          return;
        }
      }
      setToken(null);
      setUser(null);
    } catch (e) {
      console.error('Gagal membaca sesi auth dari localStorage:', e);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    readStorage();
    const handleAuthChange = () => readStorage();
    window.addEventListener('auth_state_change', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);
    return () => {
      window.removeEventListener('auth_state_change', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, [readStorage]);

  const saveAuth = useCallback((token: string, user: User) => {
    if (!token || !user) {
      console.warn('saveAuth dipanggil dengan token atau user undefined/null', { token, user });
      return;
    }
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    setToken(token);
    setUser(user);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('auth_state_change'));
    }
  }, []);

  const updateUser = useCallback((updatedUser: User) => {
    localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
    setUser(updatedUser);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('auth_state_change'));
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('auth_state_change'));
    }
    router.push('/auth/login');
  }, [router]);

  const isAuthenticated = !!token && !!user;

  return { user, token, loading, isAuthenticated, saveAuth, updateUser, logout };
}
