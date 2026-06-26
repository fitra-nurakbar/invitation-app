'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { api } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import styles from './callback.module.css'

export default function CallbackPage() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const { saveAuth } = useAuth()

  const [status, setStatus]   = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')

    if (!token) {
      setStatus('error')
      setMessage('Token tidak ditemukan')
      return
    }

    const handleCallback = async () => {
      try {
        // Kalau token dari magic link verify-api — sudah JWT langsung
        // Kalau dari Google OAuth redirect — juga sudah JWT
        // Coba decode atau verify via /auth/me

        const res = await api.getMe(token)
        saveAuth(token, res.data)

        setStatus('success')
        setTimeout(() => {
          router.push('/dashboard')
        }, 1500)
      } catch {
        setStatus('error')
        setMessage('Token tidak valid atau sudah expired')
      }
    }

    handleCallback()
  }, [searchParams, saveAuth, router])

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {status === 'loading' && (
          <>
            <div className={styles.spinner} />
            <p className={styles.text}>Memverifikasi...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className={styles.icon}>✅</div>
            <h2 className={styles.title}>Login Berhasil!</h2>
            <p className={styles.text}>Mengalihkan ke dashboard...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className={styles.icon}>❌</div>
            <h2 className={styles.title}>Gagal Login</h2>
            <p className={styles.text}>{message}</p>
            <button
              className={styles.btn}
              onClick={() => router.push('/auth/login')}
            >
              Kembali ke Login
            </button>
          </>
        )}
      </div>
    </div>
  )
}