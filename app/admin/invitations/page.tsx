'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useToast } from '@/context/ToastContext';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { api } from '@/lib/api';
import type { Invitation } from '@/types';
import {
  Mail,
  Search,
  Trash2,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Calendar,
  User as UserIcon,
  Globe,
  Layers,
  X,
  Eye,
  Copy,
  Check,
  Heart,
  MapPin,
  Gift,
  Image as ImageIcon,
  Shield,
} from 'lucide-react';
import styles from './invitations.module.css';

function getPersonName(person: unknown): string {
  if (!person) return '—';
  if (typeof person === 'string') return person;
  if (typeof person === 'object' && person !== null && 'name' in person) {
    return String((person as { name?: unknown }).name || '—');
  }
  return '—';
}

function getPersonParents(person: unknown, fallback?: string): string {
  if (typeof person === 'object' && person !== null && 'parent' in person) {
    return String((person as { parent?: unknown }).parent || fallback || '—');
  }
  if (fallback) return fallback;
  return '—';
}

export default function AdminInvitationsPage() {
  const { token } = useAdminAuth();
  const toast = useToast();

  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'draft' | 'expired'>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Invitation | null>(null);
  const [selectedInvitation, setSelectedInvitation] = useState<Invitation | null>(null);
  const [copiedSlug, setCopiedSlug] = useState(false);

  const handleCopyLink = (slug: string) => {
    const url = `${window.location.origin}/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(true);
    toast.success('Tautan undangan berhasil disalin ke clipboard', 'Tersalin');
    setTimeout(() => setCopiedSlug(false), 2000);
  };

  const fetchInvitations = useCallback(() => {
    if (!token) return;
    setLoading(true);
    api
      .getAdminInvitations(token)
      .then(res => {
        setInvitations(res.data || []);
      })
      .catch(err => {
        setError(err.message || 'Gagal memuat daftar undangan');
      })
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  const confirmDeleteInvitation = async () => {
    if (!token || !deleteTarget) return;
    const id = deleteTarget.id;
    const slug = deleteTarget.slug;
    setDeletingId(id);
    setError(null);
    setSuccess(null);

    try {
      await api.deleteAdminInvitation(token, id);
      const msg = `Undangan "/${slug}" berhasil dihapus secara permanen`;
      setSuccess(msg);
      toast.success(msg, 'Undangan Dihapus');
      setInvitations(prev => prev.filter(inv => inv.id !== id));
      setDeleteTarget(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menghapus undangan';
      setError(msg);
      toast.error(msg, 'Gagal Menghapus');
    } finally {
      setDeletingId(null);
    }
  };

  // Filter & Search logic
  const filteredInvitations = useMemo(() => {
    return invitations.filter(inv => {
      const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
      const term = searchTerm.toLowerCase().trim();
      if (!term) return matchesStatus;

      const groom = getPersonName(inv.detail?.groom).toLowerCase();
      const bride = getPersonName(inv.detail?.bride).toLowerCase();
      const slug = (inv.slug || '').toLowerCase();
      const userName = (inv.user?.name || '').toLowerCase();
      const userEmail = (inv.user?.email || '').toLowerCase();

      const matchesSearch =
        groom.includes(term) ||
        bride.includes(term) ||
        slug.includes(term) ||
        userName.includes(term) ||
        userEmail.includes(term);

      return matchesStatus && matchesSearch;
    });
  }, [invitations, statusFilter, searchTerm]);

  const stats = useMemo(() => {
    let active = 0;
    let draft = 0;
    let expired = 0;

    invitations.forEach(inv => {
      if (inv.status === 'active') active++;
      else if (inv.status === 'draft') draft++;
      else if (inv.status === 'expired') expired++;
    });

    return { total: invitations.length, active, draft, expired };
  }, [invitations]);

  const resetFilters = () => {
    setStatusFilter('all');
    setSearchTerm('');
  };

  return (
    <div className={styles.container}>
      {/* Header Halaman */}
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>Manajemen Undangan</h1>
          <p className={styles.subtitle}>
            Monitoring, pratinjau langsung, dan administrasi seluruh undangan digital pernikahan
            pengguna platform
          </p>
        </div>
      </div>

      {/* Banner Notifikasi Error / Sukses */}
      {error && (
        <div className={styles.bannerError}>
          <AlertCircle size={16} strokeWidth={2} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className={styles.bannerSuccess}>
          <CheckCircle2 size={16} strokeWidth={2} />
          <span>{success}</span>
        </div>
      )}

      {/* Grid Ringkasan Statistik */}
      <div className={styles.statGrid}>
        <div className={styles.statCard}>
          <div className={styles.statTop}>
            <span className={styles.statLabel}>Total Undangan</span>
            <div className={styles.statIconWrap}>
              <Mail size={16} strokeWidth={1.75} />
            </div>
          </div>
          <p className={styles.statValue}>{stats.total}</p>
          <p className={styles.statSub}>Seluruh undangan tersimpan</p>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statTop}>
            <span className={styles.statLabel}>Undangan Aktif</span>
            <div
              className={styles.statIconWrap}
              style={{ background: '#ecfdf5', color: '#166534', borderColor: '#bbf7d0' }}
            >
              <CheckCircle2 size={16} strokeWidth={1.75} />
            </div>
          </div>
          <p className={styles.statValue} style={{ color: '#166534' }}>
            {stats.active}
          </p>
          <p className={styles.statSub}>Dapat diakses publik</p>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statTop}>
            <span className={styles.statLabel}>Draf Undangan</span>
            <div className={styles.statIconWrap}>
              <Layers size={16} strokeWidth={1.75} />
            </div>
          </div>
          <p className={styles.statValue} style={{ color: '#55504a' }}>
            {stats.draft}
          </p>
          <p className={styles.statSub}>Belum dipublikasikan</p>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statTop}>
            <span className={styles.statLabel}>Kedaluwarsa</span>
            <div
              className={styles.statIconWrap}
              style={{ background: '#fef2f2', color: '#991b1b', borderColor: '#fecaca' }}
            >
              <AlertCircle size={16} strokeWidth={1.75} />
            </div>
          </div>
          <p className={styles.statValue} style={{ color: '#991b1b' }}>
            {stats.expired}
          </p>
          <p className={styles.statSub}>Masa aktif terlewati</p>
        </div>
      </div>

      {/* Main Card Berisi Toolbar & Tabel */}
      <div className={styles.mainCard}>
        {/* Toolbar Filter & Pencarian */}
        <div className={styles.toolbar}>
          <div className={styles.toolbarTitleGroup}>
            <h2 className={styles.cardTitle}>Daftar Undangan Terdaftar</h2>
            <span className={styles.countBadge}>
              {filteredInvitations.length} / {invitations.length}
            </span>
          </div>

          <div className={styles.controlsGroup}>
            {/* Filter Status Segmented */}
            <div
              className={styles.filterSegmented}
              role="group"
              aria-label="Filter status undangan"
            >
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`${styles.filterBtn} ${statusFilter === 'all' ? styles.filterBtnActive : ''}`}
              >
                Semua ({stats.total})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('active')}
                className={`${styles.filterBtn} ${statusFilter === 'active' ? styles.filterBtnActive : ''}`}
              >
                Aktif ({stats.active})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('draft')}
                className={`${styles.filterBtn} ${statusFilter === 'draft' ? styles.filterBtnActive : ''}`}
              >
                Draf ({stats.draft})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('expired')}
                className={`${styles.filterBtn} ${statusFilter === 'expired' ? styles.filterBtnActive : ''}`}
              >
                Kedaluwarsa ({stats.expired})
              </button>
            </div>

            {/* Input Pencarian */}
            <div className={styles.searchWrapper}>
              <Search size={14} strokeWidth={2} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Cari mempelai, slug, pemilik..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className={styles.clearSearchBtn}
                  title="Hapus kata kunci pencarian"
                  aria-label="Bersihkan pencarian"
                >
                  <X size={13} strokeWidth={2} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Konten Tabel / State */}
        {loading ? (
          <div className={styles.stateBox}>
            <p className={styles.stateTitle}>Memuat Data Undangan</p>
            <p className={styles.stateText}>
              Mohon tunggu, sedang mengambil data seluruh undangan dari server...
            </p>
          </div>
        ) : filteredInvitations.length === 0 ? (
          <div className={styles.stateBox}>
            <Mail size={32} strokeWidth={1.5} className={styles.stateIcon} />
            <p className={styles.stateTitle}>Tidak Ada Undangan yang Sesuai</p>
            <p className={styles.stateText}>
              {searchTerm || statusFilter !== 'all'
                ? 'Tidak ditemukan undangan yang cocok dengan filter atau kata kunci pencarian Anda.'
                : 'Belum ada undangan yang dibuat oleh pengguna di platform.'}
            </p>
            {(searchTerm || statusFilter !== 'all') && (
              <button type="button" onClick={resetFilters} className={styles.btnReset}>
                Reset Filter & Pencarian
              </button>
            )}
          </div>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th style={{ width: '26%' }}>Mempelai & Tautan</th>
                  <th style={{ width: '22%' }}>Pemilik Akun</th>
                  <th style={{ width: '16%' }}>Desain Template</th>
                  <th style={{ width: '16%' }}>Tanggal Acara</th>
                  <th style={{ width: '12%' }}>Status</th>
                  <th style={{ width: '8%', textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvitations.map(inv => {
                  const groom = getPersonName(inv.detail?.groom);
                  const bride = getPersonName(inv.detail?.bride);

                  let badgeClass = styles.badgeDraft;
                  let badgeLabel = 'Draf';
                  if (inv.status === 'active') {
                    badgeClass = styles.badgeActive;
                    badgeLabel = 'Aktif';
                  } else if (inv.status === 'expired') {
                    badgeClass = styles.badgeExpired;
                    badgeLabel = 'Kedaluwarsa';
                  }

                  return (
                    <tr key={inv.id}>
                      {/* Kolom 1: Mempelai & Slug Chip */}
                      <td>
                        <div className={styles.coupleTitle}>
                          {groom} & {bride}
                        </div>
                        <a
                          href={`/${inv.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className={styles.slugChip}
                          title="Buka pratinjau halaman undangan"
                        >
                          <Globe size={11} strokeWidth={1.75} />
                          <span>/{inv.slug}</span>
                        </a>
                      </td>

                      {/* Kolom 2: Pemilik Akun */}
                      <td>
                        {inv.user ? (
                          <div>
                            <div className={styles.userName}>
                              <UserIcon size={12} strokeWidth={1.75} style={{ color: '#8a704c' }} />
                              <span>{inv.user.name}</span>
                            </div>
                            <div className={styles.userEmail}>{inv.user.email}</div>
                          </div>
                        ) : (
                          <span className={styles.userFallback}>
                            ID: {inv.user_id ? inv.user_id.slice(0, 8) : '—'}...
                          </span>
                        )}
                      </td>

                      {/* Kolom 3: Desain Template */}
                      <td>
                        <span className={styles.templateTag}>
                          <Layers size={11} strokeWidth={1.75} style={{ color: '#8a704c' }} />
                          <span>{inv.template?.name || 'Default'}</span>
                        </span>
                      </td>

                      {/* Kolom 4: Tanggal Acara */}
                      <td>
                        <div className={styles.dateDisplay}>
                          <Calendar size={13} strokeWidth={1.75} style={{ color: '#8a704c' }} />
                          <span>
                            {new Date(inv.event_date).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </td>

                      {/* Kolom 5: Status Badge */}
                      <td>
                        <span className={`${styles.badge} ${badgeClass}`}>
                          <span className={styles.badgeDot} />
                          <span>{badgeLabel}</span>
                        </span>
                      </td>

                      {/* Kolom 6: Aksi */}
                      <td style={{ textAlign: 'right' }}>
                        <div className={styles.actionGroup}>
                          <button
                            type="button"
                            onClick={() => setSelectedInvitation(inv)}
                            className={styles.btnAction}
                            title="Lihat Detail Lengkap Undangan"
                          >
                            <Eye size={13} strokeWidth={1.75} />
                          </button>
                          <Link
                            href={`/${inv.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className={styles.btnAction}
                            title="Lihat Pratinjau Publik"
                          >
                            <ExternalLink size={13} strokeWidth={1.75} />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(inv)}
                            disabled={deletingId === inv.id}
                            className={styles.btnActionDanger}
                            title="Hapus Undangan Permanen"
                          >
                            <Trash2 size={13} strokeWidth={1.75} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Drawer Detail Undangan Admin */}
      {selectedInvitation && (
        <div className={styles.drawerOverlay} onClick={() => setSelectedInvitation(null)}>
          <div className={styles.drawerPanel} onClick={e => e.stopPropagation()}>
            {/* Drawer Header */}
            <div className={styles.drawerHeader}>
              <div className={styles.drawerHeaderInfo}>
                <h2 className={styles.drawerSlug}>
                  <span>/{selectedInvitation.slug}</span>
                  <span
                    className={`${styles.badge} ${
                      selectedInvitation.status === 'active'
                        ? styles.badgeActive
                        : selectedInvitation.status === 'draft'
                          ? styles.badgeDraft
                          : styles.badgeExpired
                    }`}
                  >
                    <span className={styles.badgeDot} />
                    <span>
                      {selectedInvitation.status === 'active'
                        ? 'Aktif'
                        : selectedInvitation.status === 'draft'
                          ? 'Draf'
                          : 'Kedaluwarsa'}
                    </span>
                  </span>
                </h2>
                <p className={styles.drawerSub}>ID: {selectedInvitation.id}</p>
              </div>
              <button
                type="button"
                className={styles.drawerCloseBtn}
                onClick={() => setSelectedInvitation(null)}
                title="Tutup Panel Detail"
              >
                <X size={16} strokeWidth={1.75} />
              </button>
            </div>

            {/* Drawer Body */}
            <div className={styles.drawerBody}>
              {/* 1. Pengantin & Pasangan */}
              <div className={styles.drawerSection}>
                <h3 className={styles.drawerSectionTitle}>
                  <Heart size={14} strokeWidth={1.75} />
                  <span>Informasi Mempelai</span>
                </h3>
                <div className={styles.drawerGrid2}>
                  <div className={styles.infoBlock}>
                    <span className={styles.infoBlockLabel}>Mempelai Pria</span>
                    <span className={styles.infoBlockValue}>
                      {getPersonName(selectedInvitation.detail?.groom)}
                    </span>
                    <span style={{ fontSize: '11px', color: '#6b665f' }}>
                      Orang Tua:{' '}
                      {getPersonParents(
                        selectedInvitation.detail?.groom,
                        selectedInvitation.detail?.groom_parents
                      )}
                    </span>
                  </div>
                  <div className={styles.infoBlock}>
                    <span className={styles.infoBlockLabel}>Mempelai Wanita</span>
                    <span className={styles.infoBlockValue}>
                      {getPersonName(selectedInvitation.detail?.bride)}
                    </span>
                    <span style={{ fontSize: '11px', color: '#6b665f' }}>
                      Orang Tua:{' '}
                      {getPersonParents(
                        selectedInvitation.detail?.bride,
                        selectedInvitation.detail?.bride_parents
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. Tanggal & Lokasi Acara */}
              <div className={styles.drawerSection}>
                <h3 className={styles.drawerSectionTitle}>
                  <Calendar size={14} strokeWidth={1.75} />
                  <span>Jadwal &amp; Rangkaian Acara</span>
                </h3>
                <div className={styles.infoBlock}>
                  <span className={styles.infoBlockLabel}>Tanggal Utama</span>
                  <span className={styles.infoBlockValue}>
                    {new Date(selectedInvitation.event_date).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                {Array.isArray(selectedInvitation.detail?.wedding_event) &&
                selectedInvitation.detail.wedding_event.length > 0 ? (
                  <div className={styles.drawerGrid2}>
                    {selectedInvitation.detail.wedding_event.map((ev, i) => (
                      <div key={i} className={styles.infoBlock}>
                        <span className={styles.infoBlockLabel}>
                          {ev.name || `Sesi Acara #${i + 1}`}
                        </span>
                        <span className={styles.infoBlockValue} style={{ fontSize: '12.5px' }}>
                          {ev.time ? `Waktu: ${ev.time}` : ''}
                        </span>
                        <span style={{ fontSize: '12px', color: '#55504a', marginTop: '2px' }}>
                          Lokasi: {ev.place || '—'}
                        </span>
                        {ev.address && (
                          <span style={{ fontSize: '11.5px', color: '#8c827a' }}>{ev.address}</span>
                        )}
                        {ev.maps_url && (
                          <a
                            href={ev.maps_url}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              fontSize: '11.5px',
                              color: '#8a704c',
                              textDecoration: 'underline',
                              marginTop: '4px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <MapPin size={11} />
                            <span>Buka Google Maps</span>
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.drawerGrid2}>
                    <div className={styles.infoBlock}>
                      <span className={styles.infoBlockLabel}>Akad Nikah / Pemberkatan</span>
                      <span className={styles.infoBlockValue}>
                        {selectedInvitation.detail?.akad?.time || '—'}
                      </span>
                      <span style={{ fontSize: '11.5px', color: '#6b665f' }}>
                        {selectedInvitation.detail?.akad?.place || '—'}
                      </span>
                    </div>
                    <div className={styles.infoBlock}>
                      <span className={styles.infoBlockLabel}>Resepsi Pernikahan</span>
                      <span className={styles.infoBlockValue}>
                        {selectedInvitation.detail?.resepsi?.time || '—'}
                      </span>
                      <span style={{ fontSize: '11.5px', color: '#6b665f' }}>
                        {selectedInvitation.detail?.resepsi?.place || '—'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Amplop Digital & QRIS */}
              <div className={styles.drawerSection}>
                <h3 className={styles.drawerSectionTitle}>
                  <Gift size={14} strokeWidth={1.75} />
                  <span>Amplop Digital &amp; Hadiah</span>
                </h3>
                {Array.isArray(selectedInvitation.detail?.wedding_gift) &&
                selectedInvitation.detail.wedding_gift.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {selectedInvitation.detail.wedding_gift.map((gift, idx) => (
                      <div key={idx} className={styles.drawerGiftItem}>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <strong style={{ fontSize: '13px', color: '#181716' }}>
                            {gift.platform}
                          </strong>
                          <span style={{ fontSize: '12px', color: '#8a704c', fontWeight: 600 }}>
                            #{idx + 1}
                          </span>
                        </div>
                        <div style={{ fontSize: '12.5px', color: '#55504a' }}>
                          No. Rekening / ID: <strong>{gift.id}</strong>
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b665f' }}>
                          Atas Nama: {gift.name}
                        </div>
                        {gift.qris_image && (
                          <div style={{ marginTop: '6px' }}>
                            <a
                              href={gift.qris_image}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                fontSize: '11.5px',
                                color: '#8a704c',
                                textDecoration: 'underline',
                              }}
                            >
                              Lihat Gambar QRIS
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p
                    style={{ fontSize: '12.5px', color: '#8c827a', margin: 0, fontStyle: 'italic' }}
                  >
                    Tidak ada rekening amplop digital yang didaftarkan.
                  </p>
                )}
              </div>

              {/* 4. Media, Galeri & Musik */}
              <div className={styles.drawerSection}>
                <h3 className={styles.drawerSectionTitle}>
                  <ImageIcon size={14} strokeWidth={1.75} />
                  <span>Media, Galeri &amp; Tambahan</span>
                </h3>
                <div className={styles.drawerGrid2}>
                  <div className={styles.infoBlock}>
                    <span className={styles.infoBlockLabel}>Musik Latar</span>
                    <span className={styles.infoBlockValue} style={{ fontSize: '12px' }}>
                      {selectedInvitation.detail?.music ? (
                        <a
                          href={selectedInvitation.detail.music}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: '#8a704c', textDecoration: 'underline' }}
                        >
                          Tautan Audio Musik
                        </a>
                      ) : (
                        '—'
                      )}
                    </span>
                  </div>
                  <div className={styles.infoBlock}>
                    <span className={styles.infoBlockLabel}>Live Streaming</span>
                    <span className={styles.infoBlockValue} style={{ fontSize: '12px' }}>
                      {selectedInvitation.detail?.streaming_platform ? (
                        <a
                          href={selectedInvitation.detail.streaming_platform}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: '#8a704c', textDecoration: 'underline' }}
                        >
                          Tautan Siaran Langsung
                        </a>
                      ) : (
                        '—'
                      )}
                    </span>
                  </div>
                </div>

                {selectedInvitation.detail?.gallery?.photos &&
                  Array.isArray(selectedInvitation.detail.gallery.photos) &&
                  selectedInvitation.detail.gallery.photos.length > 0 && (
                    <div className={styles.infoBlock}>
                      <span className={styles.infoBlockLabel}>
                        Galeri Foto ({selectedInvitation.detail.gallery.photos.length} Foto)
                      </span>
                      <div
                        style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}
                      >
                        {selectedInvitation.detail.gallery.photos
                          .slice(0, 6)
                          .map((url: string, i: number) => (
                            <a
                              key={i}
                              href={url}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                display: 'block',
                                width: '48px',
                                height: '48px',
                                border: '1px solid #e4dfd5',
                              }}
                            >
                              <img
                                src={url}
                                alt={`Galeri ${i + 1}`}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            </a>
                          ))}
                        {selectedInvitation.detail.gallery.photos.length > 6 && (
                          <div
                            style={{
                              width: '48px',
                              height: '48px',
                              background: '#faf9f6',
                              border: '1px solid #e4dfd5',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '11px',
                              color: '#6b665f',
                            }}
                          >
                            +{selectedInvitation.detail.gallery.photos.length - 6}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
              </div>

              {/* 5. Informasi Akun & Sistem */}
              <div className={styles.drawerSection}>
                <h3 className={styles.drawerSectionTitle}>
                  <Shield size={14} strokeWidth={1.75} />
                  <span>Akun Pengguna &amp; Sistem</span>
                </h3>
                <div className={styles.drawerGrid2}>
                  <div className={styles.infoBlock}>
                    <span className={styles.infoBlockLabel}>Pemilik Akun</span>
                    <span className={styles.infoBlockValue}>
                      {selectedInvitation.user?.name || '—'}
                    </span>
                    <span style={{ fontSize: '11.5px', color: '#6b665f' }}>
                      {selectedInvitation.user?.email || '—'}
                    </span>
                  </div>
                  <div className={styles.infoBlock}>
                    <span className={styles.infoBlockLabel}>Template Desain</span>
                    <span className={styles.infoBlockValue}>
                      {selectedInvitation.template?.name || selectedInvitation.template_id}
                    </span>
                    <span style={{ fontSize: '11.5px', color: '#6b665f' }}>
                      Slug: {selectedInvitation.template?.slug || '—'}
                    </span>
                  </div>
                  <div className={styles.infoBlock}>
                    <span className={styles.infoBlockLabel}>User ID</span>
                    <span
                      className={styles.infoBlockValue}
                      style={{ fontSize: '11px', fontFamily: 'monospace' }}
                    >
                      {selectedInvitation.user_id}
                    </span>
                  </div>
                  <div className={styles.infoBlock}>
                    <span className={styles.infoBlockLabel}>Masa Berlaku</span>
                    <span className={styles.infoBlockValue} style={{ fontSize: '12px' }}>
                      {selectedInvitation.expires_at
                        ? new Date(selectedInvitation.expires_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '—'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className={styles.drawerFooter}>
              <div className={styles.drawerActionsLeft}>
                <Link
                  href={`/${selectedInvitation.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className={`${styles.drawerBtnAction} ${styles.drawerBtnPrimary}`}
                >
                  <ExternalLink size={13} strokeWidth={1.75} />
                  <span>Lihat Halaman Publik</span>
                </Link>

                <button
                  type="button"
                  onClick={() => handleCopyLink(selectedInvitation.slug)}
                  className={`${styles.drawerBtnAction} ${styles.drawerBtnOutline}`}
                >
                  {copiedSlug ? (
                    <>
                      <Check size={13} strokeWidth={2} />
                      <span>Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} strokeWidth={1.75} />
                      <span>Salin Link</span>
                    </>
                  )}
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setDeleteTarget(selectedInvitation);
                  setSelectedInvitation(null);
                }}
                className={`${styles.drawerBtnAction} ${styles.drawerBtnDanger}`}
              >
                <Trash2 size={13} strokeWidth={1.75} />
                <span>Hapus Undangan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Undangan */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Konfirmasi Hapus Undangan"
        message={`Apakah Anda yakin ingin menghapus undangan "/${deleteTarget?.slug}"? Seluruh pesan buku tamu, konfirmasi RSVP, dan data terkait akan dihapus secara permanen.`}
        confirmLabel="Hapus Undangan"
        cancelLabel="Batal"
        variant="danger"
        loading={Boolean(deletingId)}
        onConfirm={confirmDeleteInvitation}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
