'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/context/ToastContext';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { api } from '@/lib/api';
import type { Order } from '@/types';
import { Receipt, Layers, Calendar, CreditCard, CheckCircle2, ExternalLink } from 'lucide-react';
import styles from './page.module.css';

export default function OrdersPage() {
  const { token } = useAuth();
  const toast = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Order | null>(null);

  useEffect(() => {
    if (!token) return;
    api
      .getOrders(token)
      .then(res => setOrders(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  const confirmCancel = async () => {
    if (!token || !cancelTarget) return;
    const id = cancelTarget.id;
    setCancelling(id);
    try {
      await api.cancelOrder(token, id);
      setOrders(prev => prev.map(o => (o.id === id ? { ...o, status: 'expired' } : o)));
      toast.success('Pesanan berhasil dibatalkan', 'Pesanan Dibatalkan');
      setCancelTarget(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal membatalkan pesanan';
      toast.error(msg, 'Gagal Membatalkan');
    } finally {
      setCancelling(null);
    }
  };

  const formatPrice = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;
  const formatDate = (s: string) =>
    new Date(s).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const statusMap: Record<string, { label: string; cls: string }> = {
    pending: { label: 'Menunggu Pembayaran', cls: 'yellow' },
    paid: { label: 'Lunas', cls: 'green' },
    expired: { label: 'Kedaluwarsa', cls: 'gray' },
    failed: { label: 'Gagal', cls: 'red' },
  };

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Riwayat Pesanan</h1>
        <p className={styles.subtitle}>{orders.length} total pesanan transaksi</p>
      </div>

      {loading ? (
        <div className={styles.list}>
          {[...Array(3)].map((_, i) => (
            <div key={i} className={styles.skeleton} />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className={styles.empty}>
          <Receipt size={40} strokeWidth={1.5} className={styles.emptyIcon} />
          <h3 className={styles.emptyTitle}>Belum Ada Pesanan</h3>
          <p className={styles.emptyText}>
            Beli atau aktifkan template untuk mulai membuat undangan.
          </p>
        </div>
      ) : (
        <div className={styles.list}>
          {orders.map(order => {
            const s = statusMap[order.status] || {
              label: order.status,
              cls: 'gray',
            };
            return (
              <div key={order.id} className={styles.card}>
                <div className={styles.cardLeft}>
                  <div className={styles.templateName}>
                    <Layers size={16} strokeWidth={1.75} className={styles.templateIcon} />
                    <span>{order.template?.name || 'Template'}</span>
                  </div>
                  <div className={styles.meta}>
                    <span>
                      <Calendar size={13} strokeWidth={1.75} />
                      {formatDate(order.created_at)}
                    </span>
                    {order.payment_method && (
                      <span>
                        <CreditCard size={13} strokeWidth={1.75} />
                        {order.payment_method} — {order.payment_channel}
                      </span>
                    )}
                    {order.paid_at && (
                      <span>
                        <CheckCircle2 size={13} strokeWidth={1.75} />
                        Dibayar: {formatDate(order.paid_at)}
                      </span>
                    )}
                  </div>
                </div>

                <div className={styles.cardRight}>
                  <div className={styles.amount}>{formatPrice(order.amount)}</div>
                  <span className={`${styles.badge} ${styles[`badge_${s.cls}`]}`}>{s.label}</span>
                  <div className={styles.actions}>
                    {order.status === 'pending' && (
                      <>
                        <a
                          href={order.invoice_url}
                          target="_blank"
                          rel="noreferrer"
                          className={styles.payBtn}
                        >
                          <span>Bayar</span>
                          <ExternalLink size={12} strokeWidth={2} />
                        </a>
                        <button
                          className={styles.cancelBtn}
                          onClick={() => setCancelTarget(order)}
                          disabled={cancelling === order.id}
                        >
                          {cancelling === order.id ? '...' : 'Batal'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Konfirmasi Batal Pesanan */}
      <ConfirmModal
        isOpen={Boolean(cancelTarget)}
        title="Batalkan Pesanan"
        message={`Apakah Anda yakin ingin membatalkan pesanan untuk template "${cancelTarget?.template?.name}" senilai ${cancelTarget ? formatPrice(cancelTarget.amount) : 'Rp 0'}?`}
        confirmLabel="Batalkan Pesanan"
        cancelLabel="Kembali"
        variant="warning"
        loading={Boolean(cancelling)}
        onConfirm={confirmCancel}
        onCancel={() => setCancelTarget(null)}
      />
    </div>
  );
}
