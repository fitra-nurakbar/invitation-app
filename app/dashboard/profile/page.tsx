'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/context/ToastContext';
import { api } from '@/lib/api';
import {
  Mail,
  Shield,
  Save,
  CheckCircle2,
  AlertCircle,
  FileText,
  Layers,
  ShoppingBag,
  LogOut,
  KeyRound,
  ExternalLink,
  Trash2,
  Camera,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import styles from './profile.module.css';

export default function ProfilePage() {
  const { user, token, updateUser, logout } = useAuth();
  const toast = useToast();

  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Stats
  const [invitationsCount, setInvitationsCount] = useState(0);
  const [templatesCount, setTemplatesCount] = useState(0);
  const [ordersCount, setOrdersCount] = useState(0);

  useEffect(() => {
    if (!token) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const [meRes, invRes, tmplRes, ordRes] = await Promise.allSettled([
          api.getMe(token),
          api.getInvitations(token),
          api.getMyTemplates(token),
          api.getOrders(token),
        ]);

        if (meRes.status === 'fulfilled' && meRes.value?.data) {
          const u = meRes.value.data;
          setName(u.name || '');
          setAvatar(u.avatar || '');
          updateUser(u);
        } else if (user) {
          setName(user.name || '');
          setAvatar(user.avatar || '');
        }

        if (invRes.status === 'fulfilled' && invRes.value?.data) {
          setInvitationsCount(invRes.value.data.length);
        }
        if (tmplRes.status === 'fulfilled' && tmplRes.value?.data) {
          setTemplatesCount(tmplRes.value.data.length);
        }
        if (ordRes.status === 'fulfilled' && ordRes.value?.data) {
          setOrdersCount(ordRes.value.data.length);
        }
      } catch (err: unknown) {
        console.error('Gagal memuat profil:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const trimmedName = name.trim();
      if (!trimmedName) {
        setErrorMsg('Nama lengkap tidak boleh kosong');
        setSaving(false);
        return;
      }

      const res = await api.updateProfile(token, {
        name: trimmedName,
        avatar: avatar.trim() || '',
      });

      if (res.data) {
        updateUser(res.data);
        setSuccessMsg('Profil berhasil diperbarui');
        toast.success('Informasi profil berhasil diperbarui', 'Profil Tersimpan');
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan perubahan profil';
      setErrorMsg(msg);
      toast.error(msg, 'Gagal Menyimpan');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    e.target.value = '';

    setUploading(true);
    try {
      const result = await api.uploadFile(token, file);
      setAvatar(result.data.url);
      toast.success(
        'Foto profil berhasil diunggah. Klik Simpan Perubahan untuk memperbarui akun.',
        'Foto Terunggah'
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Gagal mengunggah foto profil',
        'Unggah Gagal'
      );
    } finally {
      setUploading(false);
    }
  };

  const handleClearAvatar = () => {
    setAvatar('');
  };

  const formatDate = (isoStr?: string) => {
    if (!isoStr) return '—';
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return isoStr;
    }
  };

  const initials = (name || user?.name || user?.email || 'U').charAt(0).toUpperCase();

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p className={styles.loadingText}>Memuat informasi profil...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Page Header */}
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h1 className={styles.title}>Pengaturan Profil</h1>
          <p className={styles.subtitle}>
            Kelola identitas, informasi akun, dan preferensi profil Anda.
          </p>
        </div>
      </div>

      {/* Alert Notifications */}
      {successMsg && (
        <div className={styles.alertSuccess}>
          <CheckCircle2 size={16} strokeWidth={1.75} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className={styles.alertError}>
          <AlertCircle size={16} strokeWidth={1.75} />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className={styles.layout}>
        {/* Left Column: Form & Identity */}
        <div className={styles.mainColumn}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h2 className={styles.cardTitle}>Informasi Pribadi</h2>
                <p className={styles.cardDescription}>
                  Nama dan avatar akan ditampilkan pada ucapan dan dashboard.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              {/* Avatar Section */}
              <div className={styles.avatarSection}>
                <div className={styles.avatarWrapper}>
                  <label
                    className={`${styles.avatarUploadTarget} ${uploading ? styles.avatarUploading : ''}`}
                    title="Klik untuk mengubah foto profil"
                  >
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,.gif"
                      className={styles.uploadHiddenInput}
                      disabled={uploading}
                      onChange={handleAvatarUpload}
                    />
                    {avatar.trim() ? (
                      <img
                        src={avatar.trim()}
                        alt={name || 'Avatar'}
                        className={styles.avatarImg}
                        onError={e => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className={styles.avatarPlaceholder}>
                        <span>{initials}</span>
                      </div>
                    )}

                    <div className={styles.avatarOverlay} aria-hidden="true">
                      {uploading ? (
                        <>
                          <Loader2 size={20} className={styles.spinnerIcon} />
                          <span className={styles.overlayText}>Mengunggah</span>
                        </>
                      ) : (
                        <>
                          <Camera size={20} strokeWidth={1.75} />
                          <span className={styles.overlayText}>Ubah Foto</span>
                        </>
                      )}
                    </div>

                    {!uploading && (
                      <div className={styles.avatarBadge} aria-hidden="true">
                        <Camera size={12} strokeWidth={2} />
                      </div>
                    )}
                  </label>
                </div>

                <div className={styles.avatarControls}>
                  <div className={styles.avatarHeaderRow}>
                    <label className={styles.label}>Foto Profil</label>
                    {avatar.trim() && (
                      <button
                        type="button"
                        className={styles.removeAvatarBtn}
                        onClick={handleClearAvatar}
                        disabled={uploading}
                        title="Hapus foto profil dan gunakan inisial"
                      >
                        <Trash2 size={13} strokeWidth={1.75} />
                        <span>Hapus Foto</span>
                      </button>
                    )}
                  </div>
                  <p className={styles.helperText}>
                    Klik langsung pada foto profil untuk mengunggah gambar baru dari perangkat.
                    Format: JPG, PNG, atau WebP (maksimal 5MB).
                  </p>
                </div>
              </div>

              {/* Form Fields */}
              <div className={styles.field}>
                <label className={styles.label}>
                  Nama Lengkap <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Masukkan nama lengkap Anda"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
                <span className={styles.helperText}>
                  Nama ini akan terlihat oleh para tamu pada ucapan dan detail undangan.
                </span>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Alamat Email</label>
                <div className={styles.emailWrapper}>
                  <Mail size={16} strokeWidth={1.75} className={styles.fieldIcon} />
                  <input
                    type="email"
                    className={`${styles.input} ${styles.inputLocked}`}
                    value={user?.email || ''}
                    disabled
                    readOnly
                  />
                  <span className={styles.verifiedBadge}>
                    <KeyRound size={12} strokeWidth={1.75} />
                    OTP Aktif
                  </span>
                </div>
                <span className={styles.helperText}>
                  Alamat email terikat pada sistem masuk verifikasi kode OTP dan tidak dapat diubah
                  secara langsung.
                </span>
              </div>

              {/* Action Buttons */}
              <div className={styles.formActions}>
                <button type="submit" className={styles.submitBtn} disabled={saving}>
                  {saving ? (
                    <>
                      <div className={styles.btnSpinner} />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Save size={16} strokeWidth={1.75} />
                      <span>Simpan Perubahan</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Security & Access Section */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardHeaderIcon}>
                <Shield size={18} strokeWidth={1.75} />
              </div>
              <div>
                <h2 className={styles.cardTitle}>Keamanan & Autentikasi</h2>
                <p className={styles.cardDescription}>
                  Metode perlindungan dan sesi login akun Anda.
                </p>
              </div>
            </div>

            <div className={styles.securityBody}>
              <div className={styles.securityItem}>
                <div className={styles.securityInfo}>
                  <p className={styles.securityTitle}>Masuk Tanpa Kata Sandi (Passwordless OTP)</p>
                  <p className={styles.securityDesc}>
                    Akun Anda terlindungi dengan kode verifikasi 6 digit sekali pakai yang
                    dikirimkan langsung ke email Anda setiap kali ingin masuk.
                  </p>
                </div>
                <div className={styles.activePill}>
                  <span className={styles.activeDot} />
                  <span>Aktif</span>
                </div>
              </div>

              <div className={styles.securityDivider} />

              <div className={styles.securityItem}>
                <div className={styles.securityInfo}>
                  <p className={styles.securityTitle}>Sesi Akun</p>
                  <p className={styles.securityDesc}>
                    Keluar dari sesi ini pada peramban yang sedang Anda gunakan saat ini.
                  </p>
                </div>
                <button type="button" className={styles.logoutActionBtn} onClick={logout}>
                  <LogOut size={15} strokeWidth={1.75} />
                  <span>Keluar dari Akun</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Account Meta & Stats */}
        <div className={styles.sideColumn}>
          {/* Account Summary Card */}
          <div className={styles.sideCard}>
            <h3 className={styles.sideCardTitle}>Status Akun</h3>

            <div className={styles.metaList}>
              <div className={styles.metaRow}>
                <span className={styles.metaLabel}>Peran Akun</span>
                <span className={styles.roleBadge}>
                  {user?.role === 'admin' ? 'Administrator' : 'Pengguna'}
                </span>
              </div>

              <div className={styles.metaRow}>
                <span className={styles.metaLabel}>ID Pengguna</span>
                <span className={styles.metaValueMonospace} title={user?.id}>
                  {user?.id ? `${user.id.slice(0, 8)}...` : '—'}
                </span>
              </div>

              <div className={styles.metaRow}>
                <span className={styles.metaLabel}>Bergabung Sejak</span>
                <span className={styles.metaValue}>{formatDate(user?.created_at)}</span>
              </div>
            </div>
          </div>

          {/* Quick Stats Card */}
          <div className={styles.sideCard}>
            <h3 className={styles.sideCardTitle}>Aktivitas Saya</h3>

            <div className={styles.statsList}>
              <Link href="/dashboard/invitations" className={styles.statRow}>
                <div className={styles.statLeft}>
                  <FileText size={16} strokeWidth={1.75} className={styles.statIcon} />
                  <span className={styles.statName}>Total Undangan</span>
                </div>
                <span className={styles.statNumber}>{invitationsCount}</span>
              </Link>

              <Link href="/dashboard/templates" className={styles.statRow}>
                <div className={styles.statLeft}>
                  <Layers size={16} strokeWidth={1.75} className={styles.statIcon} />
                  <span className={styles.statName}>Template Tersedia</span>
                </div>
                <span className={styles.statNumber}>{templatesCount}</span>
              </Link>

              <Link href="/dashboard/orders" className={styles.statRow}>
                <div className={styles.statLeft}>
                  <ShoppingBag size={16} strokeWidth={1.75} className={styles.statIcon} />
                  <span className={styles.statName}>Riwayat Pesanan</span>
                </div>
                <span className={styles.statNumber}>{ordersCount}</span>
              </Link>
            </div>
          </div>

          {/* Shortcut Card */}
          <div className={styles.shortcutCard}>
            <h4 className={styles.shortcutTitle}>Kelola Undangan</h4>
            <p className={styles.shortcutDesc}>
              Ingin membuat undangan baru atau menyesuaikan informasi acara Anda?
            </p>
            <Link href="/dashboard/invitations/create" className={styles.shortcutBtn}>
              <span>Buat Undangan Baru</span>
              <ExternalLink size={14} strokeWidth={1.75} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
