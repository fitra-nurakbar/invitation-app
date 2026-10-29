'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import type { Invitation, Order, UserTemplate } from '@/types';
import {
  FileText,
  Layers,
  ShoppingBag,
  Plus,
  Compass,
  Clock,
  Calendar,
  Globe,
  ArrowRight,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';
import styles from './page.module.css';

function getPersonName(person: unknown): string {
  if (!person) return '—';
  if (typeof person === 'string') return person;
  if (typeof person === 'object' && person !== null && 'name' in person) {
    return String((person as { name?: unknown }).name || '—');
  }
  return '—';
}

export default function DashboardPage() {
  const { user, token } = useAuth();

  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [myTemplates, setMyTemplates] = useState<UserTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    const fetchAll = async () => {
      try {
        const [invRes, ordRes, tmplRes] = await Promise.all([
          api.getInvitations(token),
          api.getOrders(token),
          api.getMyTemplates(token),
        ]);
        setInvitations(invRes.data || []);
        setOrders(ordRes.data || []);
        setMyTemplates(tmplRes.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [token]);

  const activeInvitations = invitations.filter(i => i.status === 'active').length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const totalRsvpCount = invitations.reduce((acc, inv) => {
    return acc + (Array.isArray(inv.messages) ? inv.messages.length : 0);
  }, 0);
  const recentInvitation = invitations[0];

  if (loading) return <LoadingState />;

  return (
    <div>
      {/* Greeting */}
      <div className={styles.greeting}>
        <h1 className={styles.greetingTitle}>Selamat datang, {user?.name?.split(' ')[0]}</h1>
        <p className={styles.greetingSubtitle}>Ikhtisar dan pengelolaan undangan digital Anda</p>
      </div>

      {/* Stats */}
      <div className={styles.stats}>
        <StatCard
          icon={FileText}
          label="Total Undangan"
          value={invitations.length}
          sub={`${activeInvitations} aktif`}
        />
        <StatCard
          icon={MessageSquare}
          label="Ucapan & RSVP"
          value={totalRsvpCount}
          sub="Total respon buku tamu"
        />
        <StatCard
          icon={Layers}
          label="Template Dimiliki"
          value={myTemplates.length}
          sub="Koleksi template aktif"
        />
        <StatCard
          icon={ShoppingBag}
          label="Total Pesanan"
          value={orders.length}
          sub={pendingOrders > 0 ? `${pendingOrders} menunggu bayar` : 'Semua transaksi selesai'}
          highlight={pendingOrders > 0}
        />
      </div>

      {/* Quick Actions */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Aksi Cepat</h2>
        <div className={styles.actions}>
          <Link href="/dashboard/invitations/create" className={styles.actionCard}>
            <Plus size={20} strokeWidth={1.75} className={styles.actionIcon} />
            <span className={styles.actionLabel}>Buat Undangan Baru</span>
          </Link>
          <Link href="/dashboard/templates" className={styles.actionCard}>
            <Compass size={20} strokeWidth={1.75} className={styles.actionIcon} />
            <span className={styles.actionLabel}>Katalog Template</span>
          </Link>
          <Link href="/dashboard/orders" className={styles.actionCard}>
            <Clock size={20} strokeWidth={1.75} className={styles.actionIcon} />
            <span className={styles.actionLabel}>Riwayat Pesanan</span>
          </Link>
        </div>
      </div>

      {/* Recent Invitation */}
      {recentInvitation && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Undangan Terbaru</h2>
          <div className={styles.recentCard}>
            <div className={styles.recentInfo}>
              <div className={styles.recentNames}>
                {getPersonName(recentInvitation.detail?.groom)} &{' '}
                {getPersonName(recentInvitation.detail?.bride)}
              </div>
              <div className={styles.recentMeta}>
                <span>
                  <Calendar size={13} strokeWidth={1.75} />
                  {new Date(recentInvitation.event_date).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
                <span>
                  <Globe size={13} strokeWidth={1.75} />/{recentInvitation.slug}
                </span>
              </div>
            </div>
            <div className={styles.recentActions}>
              <StatusBadge status={recentInvitation.status} />
              <Link
                href={`/dashboard/invitations/${recentInvitation.id}`}
                className={styles.recentBtn}
              >
                <span>Kelola</span>
                <ArrowRight size={14} strokeWidth={1.75} />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Pending Orders Alert */}
      {pendingOrders > 0 && (
        <div className={styles.alert}>
          <AlertCircle size={20} strokeWidth={1.75} className={styles.alertIcon} />
          <div className={styles.alertText}>
            <strong>Terdapat {pendingOrders} pesanan menunggu pembayaran</strong>
            <p>Silakan selesaikan pembayaran sebelum batas waktu kedaluwarsa.</p>
          </div>
          <Link href="/dashboard/orders" className={styles.alertBtn}>
            Bayar Sekarang
          </Link>
        </div>
      )}
    </div>
  );
}

// ─── Sub Components ───────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  highlight = false,
}: {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  label: string;
  value: number;
  sub: string;
  highlight?: boolean;
}) {
  return (
    <div className={`${styles.statCard} ${highlight ? styles.statCardHighlight : ''}`}>
      <div className={styles.statHeader}>
        <span className={styles.statLabel}>{label}</span>
        <Icon size={18} strokeWidth={1.75} className={styles.statIcon} />
      </div>
      <div className={styles.statValue}>{value}</div>
      <div className={styles.statSub}>{sub}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    active: { label: 'Aktif', cls: 'green' },
    draft: { label: 'Draf', cls: 'gray' },
    expired: { label: 'Kedaluwarsa', cls: 'red' },
  };
  const s = map[status] || { label: status, cls: 'gray' };
  return <span className={`${styles.badge} ${styles[`badge_${s.cls}`]}`}>{s.label}</span>;
}

function LoadingState() {
  return (
    <div className={styles.loading}>
      {[...Array(3)].map((_, i) => (
        <div key={i} className={styles.skeleton} />
      ))}
    </div>
  );
}
