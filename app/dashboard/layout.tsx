'use client';

import { useAuth } from '@/hooks/useAuth';
import { FileText, Layers, LayoutDashboard, LogOut, Shield, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import styles from './layout.module.css';

const navItems = [
  { href: '/dashboard', label: 'Beranda', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/invitations', label: 'Undangan', icon: FileText },
  { href: '/dashboard/templates', label: 'Template', icon: Layers },
  { href: '/dashboard/orders', label: 'Pesanan', icon: ShoppingBag },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.spinner} />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <div className={styles.wrapper}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Link href="/dashboard" className={styles.logo}>
            INVITATION
          </Link>
        </div>

        <nav className={styles.nav}>
          {navItems.map(item => {
            const Icon = item.icon;
            const active = isActive(item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navLink} ${active ? styles.navLinkActive : ''}`}
              >
                <Icon size={16} strokeWidth={1.75} className={styles.navIcon} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className={styles.headerRight}>
          {user?.role === 'admin' && (
            <Link
              href="/admin"
              className={styles.adminBadgeLink}
              title="Akses Portal Administrator Sistem"
            >
              <Shield size={13} strokeWidth={2} />
              <span>Portal Admin</span>
            </Link>
          )}

          <Link href="/dashboard/profile" className={styles.userInfo} title="Pengaturan Profil">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className={styles.avatar} />
            ) : (
              <div className={styles.avatarFallback}>{user?.name?.charAt(0).toUpperCase()}</div>
            )}
            <span className={styles.userName}>{user?.name}</span>
          </Link>
          <button className={styles.logoutBtn} onClick={logout} title="Keluar">
            <LogOut size={15} strokeWidth={1.75} />
            <span className={styles.logoutText}>Keluar</span>
          </button>
        </div>
      </header>

      {/* Content */}
      <main className={styles.main}>{children}</main>
    </div>
  );
}
