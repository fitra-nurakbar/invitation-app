'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function RootLoginRedirect() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        if (user?.role === 'admin') {
          window.location.href = '/admin';
        } else {
          router.replace('/dashboard');
        }
      } else {
        router.replace('/auth/login');
      }
    }
  }, [loading, isAuthenticated, user, router]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#faf9f6',
        color: '#6b665f',
        fontSize: '13px',
        fontFamily:
          'var(--font-sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif)',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <p style={{ margin: 0 }}>Mengarahkan ke halaman login...</p>
      </div>
    </div>
  );
}
