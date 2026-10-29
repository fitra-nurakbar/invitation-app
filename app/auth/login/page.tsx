'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { AlertCircle, KeyRound, ArrowLeft, RotateCcw, CheckCircle2 } from 'lucide-react';
import styles from './login.module.css';

type Step = 'input-email' | 'verify-otp';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated, saveAuth } = useAuth();

  const [step, setStep] = useState<Step>('input-email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [devOTP, setDevOTP] = useState('');
  const [cooldown, setCooldown] = useState(0);

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-redirect jika token autentikasi aktif sudah ada di storage
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      if (user?.role === 'admin') {
        window.location.href = '/admin';
      } else {
        router.replace('/dashboard');
      }
    }
  }, [authLoading, isAuthenticated, user, router]);

  // Cooldown countdown effect
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Focus first OTP input when step changes to verify-otp
  useEffect(() => {
    if (step === 'verify-otp') {
      setTimeout(() => {
        otpInputsRef.current[0]?.focus();
      }, 100);
    }
  }, [step]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.sendOTP(email);
      if (res.otp_code) {
        setDevOTP(res.otp_code);
      }
      setCooldown(res.cooldown_s || 60);
      setOtp(['', '', '', '', '', '']);
      setStep('verify-otp');
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Terjadi kesalahan saat mengirim kode verifikasi';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (cooldown > 0 || loading) return;
    setError('');
    setLoading(true);

    try {
      const res = await api.sendOTP(email);
      if (res.otp_code) {
        setDevOTP(res.otp_code);
      }
      setCooldown(res.cooldown_s || 60);
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => {
        otpInputsRef.current[0]?.focus();
      }, 50);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mengirim ulang kode verifikasi';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, val: string) => {
    // Hanya perbolehkan angka
    const cleanVal = val.replace(/\D/g, '');
    const char = cleanVal.slice(-1);

    const newOtp = [...otp];
    newOtp[index] = char;
    setOtp(newOtp);

    if (char && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;

    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);

    const nextIndex = Math.min(pastedData.length, 5);
    otpInputsRef.current[nextIndex]?.focus();
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = otp.join('');
    if (fullCode.length !== 6) {
      setError('Masukkan 6 digit kode verifikasi secara lengkap');
      return;
    }

    setError('');
    setVerifying(true);

    try {
      const res = await api.verifyOTP(email, fullCode);
      if (res.token && res.user) {
        saveAuth(res.token, res.user);
        if (res.user.role === 'admin') {
          window.location.href = '/admin';
        } else {
          router.replace('/dashboard');
        }
      } else {
        throw new Error('Respon verifikasi tidak valid');
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Kode verifikasi tidak valid atau kedaluwarsa';
      setError(msg);
      setVerifying(false);
    }
  };

  const handleFillDevOtp = (code: string) => {
    const digits = code.split('').slice(0, 6);
    const newOtp = [...otp];
    digits.forEach((d, i) => {
      newOtp[i] = d;
    });
    setOtp(newOtp);
    otpInputsRef.current[5]?.focus();
  };

  const handleGoogleLogin = () => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
    const googleAuthUrl =
      process.env.NEXT_PUBLIC_GOOGLE_AUTH_URL || `${apiBase.replace(/\/$/, '')}/auth/google`;
    window.location.href = googleAuthUrl;
  };

  if (authLoading || isAuthenticated) {
    return (
      <div className={styles.container}>
        <div className={styles.card} style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div className={styles.spinner} style={{ margin: '0 auto 16px' }} />
          <p style={{ fontSize: '13px', color: '#6b665f' }}>
            {isAuthenticated ? 'Mengarahkan ke dashboard...' : 'Memeriksa sesi pengguna...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* Logo */}
        <div className={styles.logo}>
          <h1 className={styles.logoText}>Invitation</h1>
        </div>

        {step === 'input-email' ? (
          <>
            <div className={styles.header}>
              <h2 className={styles.title}>Masuk ke Akun</h2>
              <p className={styles.subtitle}>
                Masukkan email Anda untuk menerima kode OTP verifikasi
              </p>
            </div>

            {/* Google OAuth */}
            <button className={styles.googleBtn} onClick={handleGoogleLogin} type="button">
              <GoogleIcon />
              <span>Lanjutkan dengan Google</span>
            </button>

            <div className={styles.divider}>
              <span>atau</span>
            </div>

            {/* Request OTP Form */}
            <form onSubmit={handleSendOTP} className={styles.form}>
              <div className={styles.field}>
                <label className={styles.label}>Alamat Email</label>
                <input
                  type="email"
                  className={styles.input}
                  placeholder="email@contoh.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              {error && (
                <div className={styles.error}>
                  <AlertCircle size={15} strokeWidth={1.75} />
                  <span>{error}</span>
                </div>
              )}

              <button type="submit" className={styles.submitBtn} disabled={loading || !email}>
                {loading ? <span className={styles.spinner} /> : 'Kirim Kode Verifikasi'}
              </button>
            </form>
          </>
        ) : (
          /* Step 2 — Verifikasi Kode OTP */
          <div className={styles.verifyWrapper}>
            <div className={styles.header}>
              <div className={styles.iconBadge}>
                <KeyRound size={22} strokeWidth={1.75} />
              </div>
              <h2 className={styles.title}>Verifikasi Kode Masuk</h2>
              <p className={styles.subtitle}>Masukkan 6 digit kode yang telah dikirimkan ke</p>
              <p className={styles.emailHighlight}>{email}</p>
            </div>

            {/* Mode Pengembang (Development) Info */}
            {devOTP && (
              <div className={styles.devBox}>
                <p className={styles.devLabel}>Mode Pengembang (Development)</p>
                <div className={styles.devOtpDisplay}>{devOTP}</div>
                <button
                  type="button"
                  className={styles.devUseBtn}
                  onClick={() => handleFillDevOtp(devOTP)}
                >
                  <CheckCircle2 size={13} strokeWidth={1.75} />
                  <span>Gunakan Kode Ini</span>
                </button>
              </div>
            )}

            <form onSubmit={handleVerifyOTP} className={styles.form}>
              <div className={styles.otpGrid}>
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={el => {
                      otpInputsRef.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    className={styles.otpInput}
                    value={digit}
                    onChange={e => handleOtpChange(idx, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(idx, e)}
                    onPaste={handleOtpPaste}
                    autoComplete="off"
                  />
                ))}
              </div>

              {error && (
                <div className={styles.error}>
                  <AlertCircle size={15} strokeWidth={1.75} />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                className={styles.submitBtn}
                disabled={verifying || otp.join('').length !== 6}
              >
                {verifying ? <span className={styles.spinner} /> : 'Verifikasi & Masuk'}
              </button>

              <div className={styles.resendSection}>
                {cooldown > 0 ? (
                  <p className={styles.cooldownText}>Kirim ulang kode dalam {cooldown} detik</p>
                ) : (
                  <button
                    type="button"
                    className={styles.resendBtn}
                    onClick={handleResendOTP}
                    disabled={loading}
                  >
                    <RotateCcw size={13} strokeWidth={1.75} />
                    <span>Kirim Ulang Kode</span>
                  </button>
                )}
              </div>

              <div className={styles.actionFooter}>
                <button
                  type="button"
                  className={styles.backBtn}
                  onClick={() => {
                    setStep('input-email');
                    setOtp(['', '', '', '', '', '']);
                    setDevOTP('');
                    setError('');
                  }}
                >
                  <ArrowLeft size={14} strokeWidth={1.75} />
                  <span>Ganti Alamat Email</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"
        fill="#EA4335"
      />
    </svg>
  );
}
