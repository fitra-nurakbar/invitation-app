'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useToast } from '@/context/ToastContext';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { api } from '@/lib/api';
import type { User } from '@/types';
import {
  Search,
  Trash2,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  User as UserIcon,
} from 'lucide-react';
import styles from '../admin.module.css';

export default function AdminUsersPage() {
  const { token, user: currentAdmin } = useAdminAuth();
  const toast = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  const fetchUsers = useCallback(() => {
    if (!token) return;
    setLoading(true);
    api
      .getAdminUsers(token)
      .then(res => {
        setUsers(res.data || []);
      })
      .catch(err => {
        setError(err.message || 'Gagal memuat daftar pengguna');
      })
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const confirmDeleteUser = async () => {
    if (!deleteTarget || !token) return;
    const id = deleteTarget.id;
    const name = deleteTarget.name || deleteTarget.email;

    setDeletingId(id);
    setError(null);
    setSuccess(null);

    try {
      await api.deleteAdminUser(token, id);
      const successText = `Pengguna "${name}" berhasil dihapus`;
      setSuccess(successText);
      toast.success(successText, 'Pengguna Dihapus');
      setUsers(prev => prev.filter(u => u.id !== id));
      setDeleteTarget(null);
    } catch (err: unknown) {
      const errorText = err instanceof Error ? err.message : 'Gagal menghapus pengguna';
      setError(errorText);
      toast.error(errorText, 'Gagal Menghapus');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredUsers = users.filter(u => {
    const term = searchTerm.toLowerCase();
    return (
      (u.name && u.name.toLowerCase().includes(term)) ||
      (u.email && u.email.toLowerCase().includes(term)) ||
      (u.role && u.role.toLowerCase().includes(term))
    );
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
          Kelola Pengguna
        </h1>
        <p style={{ fontSize: '13px', color: '#6b665f', margin: 0 }}>
          Daftar seluruh akun pengguna dan administrator yang terdaftar pada sistem
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
          <div>
            <h3 className={styles.tableTitle}>Semua Pengguna ({filteredUsers.length})</h3>
          </div>
          <div style={{ position: 'relative', width: '280px' }}>
            <input
              type="text"
              placeholder="Cari nama atau email..."
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
            Memuat data pengguna...
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nama Pengguna</th>
                <th>Alamat Email</th>
                <th>Peran (Role)</th>
                <th>Tanggal Terdaftar</th>
                <th style={{ textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    style={{ textAlign: 'center', color: '#6b665f', padding: '36px' }}
                  >
                    Tidak ada pengguna yang cocok dengan pencarian.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontWeight: 600,
                        }}
                      >
                        {u.role === 'admin' ? (
                          <ShieldCheck size={15} strokeWidth={1.75} style={{ color: '#8a704c' }} />
                        ) : (
                          <UserIcon size={15} strokeWidth={1.75} style={{ color: '#6b665f' }} />
                        )}
                        <span>{u.name || 'Tanpa Nama'}</span>
                      </div>
                    </td>
                    <td style={{ color: '#44403c' }}>{u.email}</td>
                    <td>
                      <span
                        className={`${styles.badge} ${u.role === 'admin' ? styles.badgeSuccess : styles.badgeNeutral}`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td style={{ color: '#6b665f', fontSize: '12.5px' }}>
                      {new Date(u.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {u.id !== currentAdmin?.id ? (
                        <button
                          type="button"
                          className={`${styles.btn} ${styles.btnDanger}`}
                          onClick={() => setDeleteTarget(u)}
                          disabled={deletingId === u.id}
                        >
                          <Trash2 size={13} strokeWidth={1.75} />
                          <span>Hapus</span>
                        </button>
                      ) : (
                        <span style={{ fontSize: '11px', color: '#8a704c', fontWeight: 600 }}>
                          Sesi Aktif
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Konfirmasi Hapus Pengguna */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Konfirmasi Hapus Pengguna"
        message={`Apakah Anda yakin ingin menghapus akun pengguna "${deleteTarget?.name || deleteTarget?.email}"? Tindakan ini permanen dan menghapus seluruh akses akun.`}
        confirmLabel="Hapus Pengguna"
        cancelLabel="Batal"
        loading={Boolean(deletingId)}
        onConfirm={confirmDeleteUser}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
