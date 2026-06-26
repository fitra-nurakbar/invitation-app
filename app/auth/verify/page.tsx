'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { api } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'

// Halaman ini dipanggil saat user klik magic link di email
// GET /auth/verify?token=xxx
// Backend redirect ke /auth/callback?token=JWT
// Tapi kalau pakai verify-api, handle di sini

export default function VerifyPage() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const { saveAuth } = useAuth()

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) {
      router.push('/auth/login')
      return
    }

    const verify = async () => {
      try {
        const res = await api.verifyMagicLink(token)
        saveAuth(res.token, res.user)
        router.push('/dashboard')
      } catch {
        router.push('/auth/login?error=invalid-token')
      }
    }

    verify()
  }, [searchParams, saveAuth, router])

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '48px',
        textAlign: 'center'
      }}>
        <div style={{
          width: '40px', height: '40px',
          border: '3px solid #e5e7eb',
          borderTopColor: '#667eea',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto 16px'
        }} />
        <p style={{ color: '#6b7280', margin: 0 }}>Memverifikasi link...</p>
      </div>
    </div>
  )
}