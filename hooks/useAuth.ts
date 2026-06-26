'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@/types/auth'

const TOKEN_KEY = 'invitation_token'
const USER_KEY  = 'invitation_user'

export function useAuth() {
  const router = useRouter()
  const [user, setUser]       = useState<User | null>(null)
  const [token, setToken]     = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Load dari localStorage saat pertama mount
  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY)
    const savedUser  = localStorage.getItem(USER_KEY)

    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
    }

    setLoading(false)
  }, [])

  const saveAuth = useCallback((token: string, user: User) => {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    setToken(token)
    setUser(user)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
    router.push('/auth/login')
  }, [router])

  const isAuthenticated = !!token && !!user

  return { user, token, loading, isAuthenticated, saveAuth, logout }
}