'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import styles from './callback.module.css';

export default function CallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { saveAuth } = useAuth();

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('Token tidak ditemukan');
      return;
    }

    const handleCallback = async () => {
      try {
        const res = await api.getMe(token);
        const user = res?.data;

        if (!user || typeof user !== 'object' || !user.id) {
          throw new Error('Data user tidak valid atau tidak ditemukan');
        }

        saveAuth(token, user);

        setStatus('success');
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      } catch (err: unknown) {
        setStatus('error');
        const msg = err instanceof Error ? err.message : 'Token tidak valid atau sudah expired';
        setMessage(msg);
      }
    };

    handleCallback();
  }, [searchParams, saveAuth, router]);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {status === 'loading' && (
          <>
            <div className={styles.spinner} />
            <p className={styles.text}>Memverifikasi sesi...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className={styles.iconSuccess}>
              <CheckCircle2 size={36} strokeWidth={1.75} />
            </div>
            <h2 className={styles.title}>Verifikasi Berhasil</h2>
            <p className={styles.text}>Mengalihkan ke dashboard...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className={styles.iconError}>
              <AlertCircle size={36} strokeWidth={1.75} />
            </div>
            <h2 className={styles.title}>Gagal Masuk</h2>
            <p className={styles.text}>{message}</p>
            <button className={styles.btn} onClick={() => router.push('/auth/login')}>
              Kembali ke Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}
