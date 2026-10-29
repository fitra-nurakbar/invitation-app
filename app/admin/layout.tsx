'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import {
  LayoutDashboard,
  Mail,
  Users,
  Palette,
  CreditCard,
  MessageSquare,
  Settings,
  LogOut,
  ExternalLink,
} from 'lucide-react';
import styles from './admin.module.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, token, loading, isAdmin, logoutAdmin } = useAdminAuth();

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (!loading && !isAdmin && !isLoginPage) {
      if (token && user && user.role !== 'admin') {
        router.push('/dashboard');
      } else {
        router.push('/admin/login');
      }
    }
  }, [loading, isAdmin, isLoginPage, token, user, router]);

  useEffect(() => {
    if (!loading && isAdmin && isLoginPage) {
      router.replace('/admin');
    }
  }, [loading, isAdmin, isLoginPage, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (loading) {
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
        }}
      >
        Memeriksa hak akses administrator...
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const navLinks = [
    { href: '/admin', label: 'Ringkasan Sistem', icon: LayoutDashboard },
    { href: '/admin/invitations', label: 'Semua Undangan', icon: Mail },
    { href: '/admin/users', label: 'Kelola Pengguna', icon: Users },
    { href: '/admin/templates', label: 'Katalog Template', icon: Palette },
    { href: '/admin/orders', label: 'Pesanan & Transaksi', icon: CreditCard },
    { href: '/admin/messages', label: 'Moderasi Buku Tamu', icon: MessageSquare },
    { href: '/admin/settings', label: 'Pengaturan & Keamanan', icon: Settings },
  ];

  return (
    <div className={styles.shell}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.brandTitle}>Invitation App</div>
          <span className={styles.brandBadge}>Administrator</span>
        </div>

        <nav className={styles.nav}>
          {navLinks.map(link => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
              >
                <Icon size={16} strokeWidth={1.75} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.adminUserBox}>
            <span className={styles.adminUserName}>{user?.name || 'Admin'}</span>
            <span className={styles.adminUserEmail}>{user?.email || 'admin@invitation.com'}</span>
          </div>

          <Link
            href="/dashboard"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              color: '#8a704c',
              textDecoration: 'none',
            }}
          >
            <span>Buka Dashboard Pengguna</span>
            <ExternalLink size={12} strokeWidth={1.75} />
          </Link>

          <button type="button" onClick={logoutAdmin} className={styles.logoutBtn}>
            <LogOut size={14} strokeWidth={1.75} />
            <span>Keluar Sesi Admin</span>
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div className={styles.main}>
        <header className={styles.topbar}>
          <h2 className={styles.pageHeading}>Panel Kendali Administrator</h2>
          <span style={{ fontSize: '12px', color: '#6b665f' }}>Status Server: Terhubung</span>
        </header>

        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
