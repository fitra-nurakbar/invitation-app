'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useToast } from '@/context/ToastContext';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { api } from '@/lib/api';
import type { Message } from '@/types';
import { Search, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';
import styles from '../admin.module.css';

export default function AdminMessagesPage() {
  const { token } = useAdminAuth();
  const toast = useToast();

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [attendanceFilter, setAttendanceFilter] = useState<'all' | 'hadir' | 'tidak_hadir'>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Message | null>(null);

  const fetchMessages = useCallback(() => {
    if (!token) return;
    setLoading(true);
    api
      .getAdminMessages(token)
      .then(res => {
        setMessages(res.data || []);
      })
      .catch(err => {
        setError(err.message || 'Gagal memuat buku tamu sistem');
      })
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const confirmDeleteMessage = async () => {
    if (!token || !deleteTarget) return;
    const msg = deleteTarget;
    setDeletingId(msg.id);
    setError(null);
    setSuccess(null);

    try {
      await api.deleteAdminMessage(token, msg.id);
      const successText = `Ucapan dari "${msg.name}" berhasil dihapus`;
      setSuccess(successText);
      toast.success(successText, 'Ucapan Dihapus');
      setMessages(prev => prev.filter(m => m.id !== msg.id));
      setDeleteTarget(null);
    } catch (err: unknown) {
      const errorText = err instanceof Error ? err.message : 'Gagal menghapus pesan';
      setError(errorText);
      toast.error(errorText, 'Gagal Menghapus');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredMessages = messages.filter(m => {
    const isTidak = (m.attendance || '').toLowerCase() === 'tidak_hadir';
    const attKey = isTidak ? 'tidak_hadir' : 'hadir';
    const matchesAttendance = attendanceFilter === 'all' || attKey === attendanceFilter;
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (m.name && m.name.toLowerCase().includes(term)) ||
      (m.message && m.message.toLowerCase().includes(term));
    return matchesAttendance && matchesSearch;
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
          Moderasi Buku Tamu Global
        </h1>
        <p style={{ fontSize: '13px', color: '#6b665f', margin: 0 }}>
          Pantau dan moderasi seluruh ucapan serta konfirmasi kehadiran RSVP dari tamu di seluruh
          undangan
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

      {success && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 16px',
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            color: '#166534',
            fontSize: '13px',
            marginBottom: '20px',
          }}
        >
          <CheckCircle2 size={16} strokeWidth={1.75} />
          <span>{success}</span>
        </div>
      )}

      <div className={styles.tableCard}>
        <div className={styles.tableHeaderRow}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <h3 className={styles.tableTitle}>Daftar Ucapan Tamu ({filteredMessages.length})</h3>
            <div style={{ display: 'inline-flex', gap: '4px', marginLeft: '12px' }}>
              <button
                type="button"
                className={`${styles.btn} ${attendanceFilter === 'all' ? styles.btnPrimary : styles.btnOutline}`}
                onClick={() => setAttendanceFilter('all')}
              >
                Semua
              </button>
              <button
                type="button"
                className={`${styles.btn} ${attendanceFilter === 'hadir' ? styles.btnPrimary : styles.btnOutline}`}
                onClick={() => setAttendanceFilter('hadir')}
              >
                Hadir
              </button>
              <button
                type="button"
                className={`${styles.btn} ${attendanceFilter === 'tidak_hadir' ? styles.btnPrimary : styles.btnOutline}`}
                onClick={() => setAttendanceFilter('tidak_hadir')}
              >
                Tidak Hadir
              </button>
            </div>
          </div>

          <div style={{ position: 'relative', width: '280px' }}>
            <input
              type="text"
              placeholder="Cari pengirim atau isi ucapan..."
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
            Memuat buku tamu...
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Pengirim</th>
                <th>Kehadiran (RSVP)</th>
                <th>Isi Doa & Ucapan</th>
                <th>Tanggal Masuk</th>
                <th style={{ textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredMessages.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    style={{ textAlign: 'center', color: '#6b665f', padding: '36px' }}
                  >
                    Tidak ada ucapan tamu yang sesuai.
                  </td>
                </tr>
              ) : (
                filteredMessages.map(msg => {
                  const isTidak = (msg.attendance || '').toLowerCase() === 'tidak_hadir';
                  const badgeClass = isTidak ? styles.badgeDanger : styles.badgeSuccess;
                  const badgeText = isTidak ? 'Tidak Hadir' : 'Hadir';

                  return (
                    <tr key={msg.id}>
                      <td style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{msg.name}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <span className={`${styles.badge} ${badgeClass}`}>{badgeText}</span>
                      </td>
                      <td
                        style={{
                          fontSize: '13px',
                          lineHeight: 1.5,
                          color: '#33312e',
                          minWidth: '240px',
                        }}
                      >
                        {msg.message}
                      </td>
                      <td style={{ color: '#6b665f', fontSize: '12px', whiteSpace: 'nowrap' }}>
                        {new Date(msg.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <button
                          type="button"
                          className={`${styles.btn} ${styles.btnDanger}`}
                          onClick={() => setDeleteTarget(msg)}
                          disabled={deletingId === msg.id}
                        >
                          <Trash2 size={13} strokeWidth={1.75} />
                          <span>Hapus</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Konfirmasi Hapus Ucapan */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Konfirmasi Hapus Ucapan"
        message={`Apakah Anda yakin ingin menghapus ucapan dan konfirmasi kehadiran dari "${deleteTarget?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus Ucapan"
        cancelLabel="Batal"
        loading={Boolean(deletingId)}
        onConfirm={confirmDeleteMessage}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
