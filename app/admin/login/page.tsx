'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const { user, token, loading, isAdmin, saveAdminAuth } = useAdminAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Otomatis redirect ke admin dashboard jika sesi admin aktif sudah ada di storage
  useEffect(() => {
    if (!loading) {
      if (isAdmin) {
        window.location.href = '/admin';
      } else if (token && user) {
        router.replace('/dashboard');
      }
    }
  }, [loading, isAdmin, token, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await api.adminLogin({ email: email.trim(), password });
      if (!res.user || res.user.role !== 'admin') {
        throw new Error('Akses ditolak: Akun Anda tidak memiliki peran administrator');
      }
      saveAdminAuth(res.token, res.user);
      window.location.href = '/admin';
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Login administrator gagal. Periksa email dan kata sandi Anda.';
      setError(msg);
      setSubmitting(false);
    }
  };

  if (loading || isAdmin || (token && user)) {
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
          <p style={{ margin: 0 }}>
            {isAdmin || (token && user)
              ? 'Mengarahkan ke dashboard...'
              : 'Memeriksa sesi administrator...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#faf9f6',
        padding: '24px',
        fontFamily:
          'var(--font-sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif)',
        color: '#181716',
      }}
    >
      <div
        style={{
          maxWidth: '420px',
          width: '100%',
          background: '#ffffff',
          border: '1px solid #e4dfd5',
          borderRadius: 0,
          padding: '36px 32px',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '44px',
              height: '44px',
              background: '#faf8f5',
              border: '1px solid #e4dfd5',
              borderRadius: 0,
              marginBottom: '16px',
            }}
          >
            <ShieldCheck size={22} strokeWidth={1.5} style={{ color: '#8a704c' }} />
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-serif, Georgia, serif)',
              fontSize: '22px',
              fontWeight: 600,
              margin: '0 0 6px',
            }}
          >
            Panel Administrator
          </h1>
          <p style={{ fontSize: '13px', color: '#6b665f', margin: 0 }}>
            Masuk ke sistem kelola undangan dan transaksi
          </p>
        </div>

        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 0,
              color: '#991b1b',
              fontSize: '12.5px',
              marginBottom: '20px',
            }}
          >
            <AlertCircle size={15} strokeWidth={1.75} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label
              style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '6px' }}
            >
              Alamat Email Administrator
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@invitation.com"
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 36px',
                  fontSize: '13.5px',
                  border: '1px solid #d9d2c4',
                  borderRadius: 0,
                  boxSizing: 'border-box',
                }}
              />
              <Mail
                size={15}
                strokeWidth={1.75}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#8c867e',
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label
              style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '6px' }}
            >
              Kata Sandi
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '9px 38px 9px 36px',
                  fontSize: '13.5px',
                  border: '1px solid #d9d2c4',
                  borderRadius: 0,
                  boxSizing: 'border-box',
                }}
              />
              <Lock
                size={15}
                strokeWidth={1.75}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#8c867e',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Lihat kata sandi'}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#8c867e',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px',
                  lineHeight: 1,
                }}
              >
                {showPassword ? (
                  <EyeOff size={16} strokeWidth={1.75} />
                ) : (
                  <Eye size={16} strokeWidth={1.75} />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '11px',
              background: '#181716',
              color: '#ffffff',
              border: '1px solid #181716',
              borderRadius: 0,
              fontSize: '13px',
              fontWeight: 600,
              cursor: submitting ? 'not-allowed' : 'pointer',
            }}
          >
            <span>{submitting ? 'Memproses Otentikasi...' : 'Masuk sebagai Admin'}</span>
            <ArrowRight size={14} strokeWidth={1.75} />
          </button>
        </form>
      </div>
    </div>
  );
}
