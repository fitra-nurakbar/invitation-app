'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/context/ToastContext';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { api } from '@/lib/api';
import type { Invitation, InvitationDetail } from '@/types';
import {
  Plus,
  Calendar,
  Globe,
  MapPin,
  Edit3,
  ExternalLink,
  Trash2,
  FileText,
  MessageSquare,
  Share2,
  MoreVertical,
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

function getVenue(detail?: InvitationDetail): string | null {
  if (!detail) return null;
  if (detail.venue) return detail.venue;
  if (Array.isArray(detail.wedding_event) && detail.wedding_event.length > 0) {
    return detail.wedding_event[0].place || detail.wedding_event[0].address || null;
  }
  return null;
}

export default function InvitationsPage() {
  const { token } = useAuth();
  const toast = useToast();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Invitation | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-inv-menu]')) {
        setOpenMenuId(null);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenMenuId(null);
    };
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (!token) return;
    api
      .getInvitations(token)
      .then(res => setInvitations(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  const confirmDelete = async () => {
    if (!token || !deleteTarget) return;
    const id = deleteTarget.id;
    setDeleting(id);
    try {
      await api.deleteInvitation(token, id);
      setInvitations(prev => prev.filter(i => i.id !== id));
      toast.success('Undangan berhasil dihapus', 'Berhasil Dihapus');
      setDeleteTarget(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menghapus undangan';
      toast.error(msg, 'Gagal Menghapus');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Daftar Undangan</h1>
          <p className={styles.subtitle}>Kelola semua undangan pernikahan yang telah Anda buat</p>
        </div>
        <Link href="/dashboard/invitations/create" className={styles.createBtn}>
          <Plus size={16} strokeWidth={1.75} />
          <span>Buat Undangan</span>
        </Link>
      </div>

      {/* Content */}
      {loading ? (
        <div className={styles.loadingList}>
          {[...Array(3)].map((_, i) => (
            <div key={i} className={styles.skeleton} />
          ))}
        </div>
      ) : invitations.length === 0 ? (
        <EmptyState />
      ) : (
        <div className={styles.list}>
          {invitations.map(inv => {
            const isMenuOpen = openMenuId === inv.id;
            return (
              <div
                key={inv.id}
                className={`${styles.card} ${isMenuOpen ? styles.cardWithOpenMenu : ''}`}
              >
                <div className={styles.cardLeft}>
                  <div className={styles.cardNames}>
                    {getPersonName(inv.detail?.groom)} & {getPersonName(inv.detail?.bride)}
                  </div>
                  <div className={styles.cardMeta}>
                    <span>
                      <Calendar size={13} strokeWidth={1.75} />
                      {new Date(inv.event_date).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                    <span>
                      <Globe size={13} strokeWidth={1.75} />/{inv.slug}
                    </span>
                    {getVenue(inv.detail) && (
                      <span>
                        <MapPin size={13} strokeWidth={1.75} />
                        {getVenue(inv.detail)}
                      </span>
                    )}
                    <span title="Jumlah ucapan & konfirmasi kehadiran">
                      <MessageSquare size={13} strokeWidth={1.75} />
                      {Array.isArray(inv.messages) ? inv.messages.length : 0} Respon
                    </span>
                  </div>
                </div>

                <div className={styles.cardRight}>
                  <StatusBadge status={inv.status} />

                  <div className={styles.actionMenuWrapper} data-inv-menu={inv.id}>
                    <button
                      type="button"
                      className={`${styles.dotsBtn} ${isMenuOpen ? styles.dotsBtnActive : ''}`}
                      onClick={() => setOpenMenuId(isMenuOpen ? null : inv.id)}
                      aria-label="Pilihan aksi undangan"
                      title="Menu Aksi"
                    >
                      <MoreVertical size={16} strokeWidth={1.75} />
                    </button>

                    {isMenuOpen && (
                      <div className={styles.dropdownMenu}>
                        <Link
                          href={`/dashboard/invitations/${inv.id}`}
                          className={styles.menuItem}
                          onClick={() => setOpenMenuId(null)}
                        >
                          <Edit3 size={14} strokeWidth={1.75} />
                          <span>Edit Undangan</span>
                        </Link>
                        <Link
                          href={`/dashboard/invitations/${inv.id}?tab=rsvp`}
                          className={styles.menuItem}
                          onClick={() => setOpenMenuId(null)}
                        >
                          <MessageSquare size={14} strokeWidth={1.75} />
                          <span>Buku Tamu & RSVP</span>
                        </Link>
                        <Link
                          href={`/dashboard/invitations/${inv.id}?tab=share`}
                          className={styles.menuItem}
                          onClick={() => setOpenMenuId(null)}
                        >
                          <Share2 size={14} strokeWidth={1.75} />
                          <span>Bagikan Undangan</span>
                        </Link>
                        <Link
                          href={`/${inv.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className={styles.menuItem}
                          onClick={() => setOpenMenuId(null)}
                        >
                          <ExternalLink size={14} strokeWidth={1.75} />
                          <span>Lihat Halaman Publik</span>
                        </Link>
                        <div className={styles.menuDivider} />
                        <button
                          type="button"
                          className={`${styles.menuItem} ${styles.menuItemDanger}`}
                          onClick={() => {
                            setOpenMenuId(null);
                            setDeleteTarget(inv);
                          }}
                          disabled={deleting === inv.id}
                        >
                          <Trash2 size={14} strokeWidth={1.75} />
                          <span>Hapus Undangan</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Konfirmasi Hapus Undangan */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Konfirmasi Hapus Undangan"
        message={`Apakah Anda yakin ingin menghapus undangan "${getPersonName(deleteTarget?.detail?.groom)} & ${getPersonName(deleteTarget?.detail?.bride)}"? Seluruh data ucapan dan RSVP terkait juga akan dihapus.`}
        confirmLabel="Hapus Undangan"
        cancelLabel="Batal"
        loading={Boolean(deleting)}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
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

function EmptyState() {
  return (
    <div className={styles.empty}>
      <FileText size={40} strokeWidth={1.5} className={styles.emptyIcon} />
      <h3 className={styles.emptyTitle}>Belum Ada Undangan</h3>
      <p className={styles.emptyText}>
        Mulai buat undangan pernikahan digital elegan pertama Anda.
      </p>
      <Link href="/dashboard/invitations/create" className={styles.emptyBtn}>
        <Plus size={16} strokeWidth={1.75} />
        <span>Buat Undangan Sekarang</span>
      </Link>
    </div>
  );
}
