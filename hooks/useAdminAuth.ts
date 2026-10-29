'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@/types';

const TOKEN_KEY = 'invitation_token';
const USER_KEY = 'invitation_user';

export function useAdminAuth() {
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
      console.error('Gagal membaca sesi admin dari localStorage:', e);
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

  const saveAdminAuth = useCallback((token: string, user: User) => {
    if (!token || !user) return;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    setToken(token);
    setUser(user);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('auth_state_change'));
    }
  }, []);

  const logoutAdmin = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('auth_state_change'));
    }
    router.push('/admin/login');
  }, [router]);

  const isAdmin = !!token && user?.role === 'admin';

  return {
    user,
    token,
    loading,
    isAdmin,
    saveAdminAuth,
    logoutAdmin,
  };
}
