'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import styles from './layout.module.css'

const navItems = [
  { href: '/dashboard', label: '🏠 Beranda', exact: true },
  { href: '/dashboard/invitations', label: '💌 Undangan' },
  { href: '/dashboard/templates', label: '🎨 Template' },
  { href: '/dashboard/orders', label: '🧾 Order' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter()
  const pathname = usePathname()
  const { user, loading, isAuthenticated, logout } = useAuth()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login')
    }
  }, [loading, isAuthenticated, router])

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.spinner} />
      </div>
    )
  }

  if (!isAuthenticated) return null

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  return (
    <div className={styles.wrapper}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.logo}>💌 Invitation</span>
        </div>

        <nav className={styles.nav}>
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navLink} ${isActive(item.href, item.exact) ? styles.navLinkActive : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={styles.headerRight}>
          <div className={styles.userInfo}>
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className={styles.avatar} />
            ) : (
              <div className={styles.avatarFallback}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <span className={styles.userName}>{user?.name}</span>
          </div>
          <button className={styles.logoutBtn} onClick={logout}>
            Keluar
          </button>
        </div>
      </header>

      {/* Content */}
      <main className={styles.main}>
        {children}
      </main>
    </div>
  )
}