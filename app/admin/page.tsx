'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { api } from '@/lib/api';
import type { User, Invitation, Order, Message } from '@/types';
import { ArrowRight, AlertCircle } from 'lucide-react';
import styles from './admin.module.css';

export default function AdminDashboardPage() {
  const { token } = useAdminAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [users, setUsers] = useState<User[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (!token) return;

    Promise.all([
      api.getAdminUsers(token).catch(() => ({ data: [] })),
      api.getAdminInvitations(token).catch(() => ({ data: [] })),
      api.getAdminOrders(token).catch(() => ({ data: [] })),
      api.getAdminMessages(token).catch(() => ({ data: [] })),
    ])
      .then(([uRes, iRes, oRes, mRes]) => {
        setUsers(uRes.data || []);
        setInvitations(iRes.data || []);
        setOrders(oRes.data || []);
        setMessages(mRes.data || []);
      })
      .catch(err => {
        setError(err.message || 'Gagal memuat metrik sistem administrator');
      })
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div style={{ fontSize: '13px', color: '#6b665f' }}>Memuat metrik ringkasan sistem...</div>
    );
  }

  // Calculate statistics
  const totalUsers = users.length;
  const totalInvitations = invitations.length;
  const activeInvitations = invitations.filter(i => i.status === 'active').length;

  const paidOrders = orders.filter(o => o.status === 'paid');
  const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.amount || 0), 0);
  const totalMessages = messages.length;

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1
          style={{
            fontFamily: 'var(--font-serif, Georgia, serif)',
            fontSize: '24px',
            fontWeight: 600,
            margin: '0 0 6px',
          }}
        >
          Ringkasan Sistem
        </h1>
        <p style={{ fontSize: '13px', color: '#6b665f', margin: 0 }}>
          Metrik operasional, transaksi pembayaran, dan aktivitas undangan pengguna
        </p>
      </div>

      {error && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 16px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            fontSize: '13px',
            marginBottom: '24px',
          }}
        >
          <AlertCircle size={16} strokeWidth={1.75} />
          <span>{error}</span>
        </div>
      )}

      {/* Metric Cards */}
      <div className={styles.statGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Total Pengguna</div>
          <div className={styles.statValue}>{totalUsers}</div>
          <div className={styles.statSub}>Akun terdaftar</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statLabel}>Undangan Dibuat</div>
          <div className={styles.statValue}>{totalInvitations}</div>
          <div className={styles.statSub}>{activeInvitations} undangan berstatus aktif</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statLabel}>Pendapatan Transaksi</div>
          <div className={styles.statValue}>{formatRupiah(totalRevenue)}</div>
          <div className={styles.statSub}>{paidOrders.length} pesanan terbayar lunas</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statLabel}>Buku Tamu Masuk</div>
          <div className={styles.statValue}>{totalMessages}</div>
          <div className={styles.statSub}>Ucapan & konfirmasi RSVP</div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className={styles.tableCard}>
        <div className={styles.tableHeaderRow}>
          <div>
            <h3 className={styles.tableTitle}>Pesanan Terbaru</h3>
            <span style={{ fontSize: '12px', color: '#6b665f' }}>5 transaksi pesanan terakhir</span>
          </div>
          <Link href="/admin/orders" className={`${styles.btn} ${styles.btnOutline}`}>
            <span>Lihat Semua Pesanan</span>
            <ArrowRight size={13} strokeWidth={1.75} />
          </Link>
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID Pesanan</th>
              <th>Template</th>
              <th>Nominal</th>
              <th>Status</th>
              <th>Tanggal</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', color: '#6b665f', padding: '32px' }}>
                  Belum ada pesanan transaksi tercatat.
                </td>
              </tr>
            ) : (
              orders.slice(0, 5).map(o => {
                let badgeClass = styles.badgeNeutral;
                let badgeText: string = o.status;
                if (o.status === 'paid') {
                  badgeClass = styles.badgeSuccess;
                  badgeText = 'Lunas';
                } else if (o.status === 'pending') {
                  badgeClass = styles.badgeWarning;
                  badgeText = 'Menunggu';
                } else if (o.status === 'expired' || o.status === 'failed') {
                  badgeClass = styles.badgeDanger;
                  badgeText = 'Batal/Kedaluwarsa';
                }

                return (
                  <tr key={o.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                      {o.id.substring(0, 8)}...
                    </td>
                    <td>{o.template?.name || 'Template Undangan'}</td>
                    <td style={{ fontWeight: 600 }}>{formatRupiah(o.amount || 0)}</td>
                    <td>
                      <span className={`${styles.badge} ${badgeClass}`}>{badgeText}</span>
                    </td>
                    <td style={{ color: '#6b665f', fontSize: '12.5px' }}>
                      {new Date(o.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Recent Invitations */}
      <div className={styles.tableCard}>
        <div className={styles.tableHeaderRow}>
          <div>
            <h3 className={styles.tableTitle}>Undangan Pengguna Terbaru</h3>
            <span style={{ fontSize: '12px', color: '#6b665f' }}>
              Undangan yang baru saja dibuat oleh pengguna
            </span>
          </div>
          <Link href="/admin/users" className={`${styles.btn} ${styles.btnOutline}`}>
            <span>Lihat Manajemen Pengguna</span>
            <ArrowRight size={13} strokeWidth={1.75} />
          </Link>
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Tautan / Slug</th>
              <th>Mempelai</th>
              <th>Tanggal Acara</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {invitations.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', color: '#6b665f', padding: '32px' }}>
                  Belum ada undangan yang dibuat.
                </td>
              </tr>
            ) : (
              invitations.slice(0, 5).map(inv => {
                const groom =
                  typeof inv.detail?.groom === 'object'
                    ? inv.detail?.groom?.name
                    : inv.detail?.groom || '-';
                const bride =
                  typeof inv.detail?.bride === 'object'
                    ? inv.detail?.bride?.name
                    : inv.detail?.bride || '-';

                return (
                  <tr key={inv.id}>
                    <td>
                      <a
                        href={`/${inv.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: '#181716', fontWeight: 600, textDecoration: 'underline' }}
                      >
                        /{inv.slug}
                      </a>
                    </td>
                    <td>
                      {groom} & {bride}
                    </td>
                    <td style={{ color: '#6b665f' }}>
                      {inv.event_date
                        ? new Date(inv.event_date).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '-'}
                    </td>
                    <td>
                      <span
                        className={`${styles.badge} ${inv.status === 'active' ? styles.badgeSuccess : styles.badgeNeutral}`}
                      >
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
