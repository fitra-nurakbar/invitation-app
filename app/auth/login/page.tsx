'use client'

import { useState } from 'react'
import { api } from '@/lib/api'
import styles from './login.module.css'

type Step = 'input-email' | 'check-email'

export default function LoginPage() {
  const [step, setStep] = useState<Step>('input-email')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [devURL, setDevURL] = useState('') // hanya development

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await api.requestMagicLink(email, name || undefined)

      // Development — tampilkan magic URL
      if (res.magic_url) {
        setDevURL(res.magic_url)
      }

      setStep('check-email')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    window.location.href = process.env.NEXT_PUBLIC_GOOGLE_AUTH_URL!
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>

        {/* Logo */}
        <div className={styles.logo}>
          <span className={styles.logoIcon}>💌</span>
          <h1 className={styles.logoText}>Invitation</h1>
        </div>

        {step === 'input-email' ? (
          <>
            <div className={styles.header}>
              <h2 className={styles.title}>Masuk ke Akun</h2>
              <p className={styles.subtitle}>
                Masukkan email untuk menerima link masuk
              </p>
            </div>

            {/* Google OAuth */}
            <button
              className={styles.googleBtn}
              onClick={handleGoogleLogin}
              type="button"
            >
              <GoogleIcon />
              Lanjutkan dengan Google
            </button>

            <div className={styles.divider}>
              <span>atau</span>
            </div>

            {/* Magic Link Form */}
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.field}>
                <label className={styles.label}>Nama (opsional)</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Nama lengkap kamu"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Email</label>
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
                  <span>⚠️</span> {error}
                </div>
              )}

              <button
                type="submit"
                className={styles.submitBtn}
                disabled={loading || !email}
              >
                {loading ? (
                  <span className={styles.spinner} />
                ) : (
                  'Kirim Link Masuk'
                )}
              </button>
            </form>
          </>
        ) : (
          /* Step 2 — Cek Email */
          <div className={styles.checkEmail}>
            <div className={styles.emailIcon}>📬</div>
            <h2 className={styles.title}>Cek Email Kamu!</h2>
            <p className={styles.subtitle}>
              Kami mengirim link masuk ke
            </p>
            <p className={styles.emailHighlight}>{email}</p>
            <p className={styles.note}>
              Link berlaku selama <strong>15 menit</strong> dan hanya bisa digunakan sekali.
            </p>

            {/* Development only — tampilkan link langsung */}
            {devURL && (
              <div className={styles.devBox}>
                <p className={styles.devLabel}>🛠 Development Mode</p>
                <a href={devURL}
                  className={styles.devLink}
                  target="_blank"
                  rel="noreferrer"
                >
                  Klik magic link
                </a>
              </div>
            )}

            <button
              className={styles.backBtn}
              onClick={() => {
                setStep('input-email')
                setEmail('')
                setDevURL('')
                setError('')
              }}
            >
              ← Ganti Email
            </button>
          </div>
        )}

      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853" />
      <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335" />
    </svg>
  )
}