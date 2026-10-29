'use client';

import { useState, useEffect } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { api } from '@/lib/api';
import type { Order } from '@/types';
import { Search, ExternalLink, AlertCircle } from 'lucide-react';
import styles from '../admin.module.css';

export default function AdminOrdersPage() {
  const { token } = useAdminAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending' | 'expired'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!token) return;

    setLoading(true);
    api
      .getAdminOrders(token)
      .then(res => {
        setOrders(res.data || []);
      })
      .catch(err => {
        setError(err.message || 'Gagal memuat daftar pesanan');
      })
      .finally(() => setLoading(false));
  }, [token]);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(val);
  };

  const filteredOrders = orders.filter(o => {
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (o.id && o.id.toLowerCase().includes(term)) ||
      (o.invoice_id && o.invoice_id.toLowerCase().includes(term)) ||
      (o.template?.name && o.template.name.toLowerCase().includes(term));
    return matchesStatus && matchesSearch;
  });

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
          Pesanan & Transaksi
        </h1>
        <p style={{ fontSize: '13px', color: '#6b665f', margin: 0 }}>
          Monitoring transaksi pembayaran pesanan tema undangan digital oleh pelanggan
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
            marginBottom: '20px',
          }}
        >
          <AlertCircle size={16} strokeWidth={1.75} />
          <span>{error}</span>
        </div>
      )}

      <div className={styles.tableCard}>
        <div className={styles.tableHeaderRow}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <h3 className={styles.tableTitle}>Semua Pesanan ({filteredOrders.length})</h3>
            <div style={{ display: 'inline-flex', gap: '4px', marginLeft: '12px' }}>
              <button
                type="button"
                className={`${styles.btn} ${statusFilter === 'all' ? styles.btnPrimary : styles.btnOutline}`}
                onClick={() => setStatusFilter('all')}
              >
                Semua
              </button>
              <button
                type="button"
                className={`${styles.btn} ${statusFilter === 'paid' ? styles.btnPrimary : styles.btnOutline}`}
                onClick={() => setStatusFilter('paid')}
              >
                Lunas
              </button>
              <button
                type="button"
                className={`${styles.btn} ${statusFilter === 'pending' ? styles.btnPrimary : styles.btnOutline}`}
                onClick={() => setStatusFilter('pending')}
              >
                Menunggu
              </button>
              <button
                type="button"
                className={`${styles.btn} ${statusFilter === 'expired' ? styles.btnPrimary : styles.btnOutline}`}
                onClick={() => setStatusFilter('expired')}
              >
                Kedaluwarsa
              </button>
            </div>
          </div>

          <div style={{ position: 'relative', width: '280px' }}>
            <input
              type="text"
              placeholder="Cari ID atau nama template..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className={styles.input}
              style={{ paddingLeft: '34px' }}
            />
            <Search
              size={14}
              strokeWidth={1.75}
              style={{
                position: 'absolute',
                left: '11px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#8c867e',
              }}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '32px', textAlign: 'center', color: '#6b665f', fontSize: '13px' }}>
            Memuat transaksi pesanan...
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID Pesanan</th>
                <th>Template Undangan</th>
                <th>Nominal</th>
                <th>Status Pembayaran</th>
                <th>Kanal Pembayaran</th>
                <th>Waktu Transaksi</th>
                <th style={{ textAlign: 'right' }}>Invoice</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{ textAlign: 'center', color: '#6b665f', padding: '36px' }}
                  >
                    Tidak ada pesanan yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                filteredOrders.map(o => {
                  let badgeClass = styles.badgeNeutral;
                  let badgeText: string = o.status;
                  if (o.status === 'paid') {
                    badgeClass = styles.badgeSuccess;
                    badgeText = 'Lunas';
                  } else if (o.status === 'pending') {
                    badgeClass = styles.badgeWarning;
                    badgeText = 'Menunggu Pembayaran';
                  } else if (o.status === 'expired' || o.status === 'failed') {
                    badgeClass = styles.badgeDanger;
                    badgeText = 'Kedaluwarsa / Batal';
                  }

                  return (
                    <tr key={o.id}>
                      <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                        {o.id.substring(0, 8)}...
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{o.template?.name || 'Template'}</div>
                        <div style={{ fontSize: '11.5px', color: '#6b665f' }}>
                          {o.template?.slug}
                        </div>
                      </td>
                      <td style={{ fontWeight: 600 }}>{formatRupiah(o.amount || 0)}</td>
                      <td>
                        <span className={`${styles.badge} ${badgeClass}`}>{badgeText}</span>
                      </td>
                      <td style={{ fontSize: '12.5px', color: '#55504a' }}>
                        {o.payment_channel
                          ? `${o.payment_method || ''} (${o.payment_channel})`
                          : '-'}
                      </td>
                      <td style={{ color: '#6b665f', fontSize: '12px' }}>
                        {new Date(o.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {o.invoice_url ? (
                          <a
                            href={o.invoice_url}
                            target="_blank"
                            rel="noreferrer"
                            className={`${styles.btn} ${styles.btnOutline}`}
                            style={{ fontSize: '11.5px', padding: '5px 10px' }}
                          >
                            <span>Invoice</span>
                            <ExternalLink size={11} strokeWidth={1.75} />
                          </a>
                        ) : (
                          <span style={{ color: '#a8a29e', fontSize: '12px' }}>-</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
