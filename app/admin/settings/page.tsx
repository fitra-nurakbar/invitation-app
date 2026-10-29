'use client';

import { useState } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useToast } from '@/context/ToastContext';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { api } from '@/lib/api';
import { KeyRound, UserPlus, ShieldCheck, Eye, EyeOff, Lock } from 'lucide-react';
import styles from './settings.module.css';

export default function AdminSettingsPage() {
  const { user, token } = useAdminAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<'password' | 'create_admin'>('password');

  // Change Password state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Create Admin state
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [savingAdmin, setSavingAdmin] = useState(false);
  const [confirmCreateOpen, setConfirmCreateOpen] = useState(false);

  // Handle Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!oldPassword) {
      toast.error('Password lama wajib diisi', 'Validasi Gagal');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Password baru minimal 8 karakter', 'Validasi Gagal');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Konfirmasi password baru tidak cocok', 'Validasi Gagal');
      return;
    }

    setSavingPassword(true);
    try {
      const res = await api.changeAdminPassword(token, {
        old_password: oldPassword,
        new_password: newPassword,
      });
      toast.success(res.message || 'Password admin berhasil diperbarui', 'Sukses');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mengubah password admin';
      toast.error(msg, 'Terjadi Kesalahan');
    } finally {
      setSavingPassword(false);
    }
  };

  // Handle Create Admin (Trigger Confirmation Modal)
  const handleOpenCreateModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!adminName.trim()) {
      toast.error('Nama staf admin wajib diisi', 'Validasi Gagal');
      return;
    }

    if (!adminEmail.trim() || !adminEmail.includes('@')) {
      toast.error('Email staf admin tidak valid', 'Validasi Gagal');
      return;
    }

    if (adminPassword.length < 8) {
      toast.error('Password awal staf minimal 8 karakter', 'Validasi Gagal');
      return;
    }

    setConfirmCreateOpen(true);
  };

  // Execute Create Admin
  const executeCreateAdmin = async () => {
    if (!token) return;

    setSavingAdmin(true);
    try {
      const res = await api.createAdmin(token, {
        name: adminName.trim(),
        email: adminEmail.trim(),
        password: adminPassword,
      });
      toast.success(
        res.message || `Akun admin untuk ${adminName.trim()} berhasil dibuat!`,
        'Admin Baru Terdaftar'
      );
      setAdminName('');
      setAdminEmail('');
      setAdminPassword('');
      setConfirmCreateOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mendaftarkan staf admin baru';
      toast.error(msg, 'Terjadi Kesalahan');
    } finally {
      setSavingAdmin(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Pengaturan & Keamanan</h1>
        <p className={styles.subtitle}>
          Kelola kredensial akun administrator dan pendaftaran staf pengelola backoffice.
        </p>
      </div>

      {/* Tabs */}
      <div className={styles.tabNav}>
        <button
          type="button"
          onClick={() => setActiveTab('password')}
          className={`${styles.tabBtn} ${activeTab === 'password' ? styles.tabBtnActive : ''}`}
        >
          <KeyRound size={15} strokeWidth={1.75} />
          <span>Ganti Password Admin</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('create_admin')}
          className={`${styles.tabBtn} ${activeTab === 'create_admin' ? styles.tabBtnActive : ''}`}
        >
          <UserPlus size={15} strokeWidth={1.75} />
          <span>Tambah Akun Staf Admin</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className={styles.grid}>
        {/* Left Form */}
        {activeTab === 'password' ? (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Ganti Password Administrator</h2>
            <p className={styles.cardDesc}>
              Pastikan password baru Anda kuat, mengandung kombinasi huruf besar, angka, dan simbol
              untuk keamanan maksimal.
            </p>

            <form onSubmit={handleChangePassword} className={styles.form}>
              <div className={styles.field}>
                <label className={styles.label}>Password Lama</label>
                <div className={styles.inputWrap}>
                  <input
                    type={showOldPassword ? 'text' : 'password'}
                    value={oldPassword}
                    onChange={e => setOldPassword(e.target.value)}
                    placeholder="Masukkan password saat ini"
                    className={`${styles.input} ${styles.inputPassword}`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className={styles.toggleEyeBtn}
                    aria-label="Toggle password visibility"
                  >
                    {showOldPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Password Baru</label>
                <div className={styles.inputWrap}>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Minimal 8 karakter"
                    className={`${styles.input} ${styles.inputPassword}`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className={styles.toggleEyeBtn}
                    aria-label="Toggle password visibility"
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <span className={styles.hint}>
                  Panjang minimum 8 karakter. Hindari menggunakan nama atau tanggal lahir.
                </span>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Konfirmasi Password Baru</label>
                <div className={styles.inputWrap}>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi password baru"
                    className={`${styles.input} ${styles.inputPassword}`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className={styles.toggleEyeBtn}
                    aria-label="Toggle password visibility"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={savingPassword} className={styles.submitBtn}>
                <Lock size={15} strokeWidth={1.75} />
                <span>{savingPassword ? 'Menyimpan Perubahan...' : 'Simpan Password Baru'}</span>
              </button>
            </form>
          </div>
        ) : (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Daftarkan Akun Admin Baru</h2>
            <p className={styles.cardDesc}>
              Akun yang didaftarkan melalui form ini akan memiliki wewenang administrator penuh
              terhadap seluruh data undangan, pengguna, transaksi, dan moderasi pesan.
            </p>

            <form onSubmit={handleOpenCreateModal} className={styles.form}>
              <div className={styles.field}>
                <label className={styles.label}>Nama Lengkap Staf Admin</label>
                <input
                  type="text"
                  value={adminName}
                  onChange={e => setAdminName(e.target.value)}
                  placeholder="Contoh: Sarah Anindita"
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Email Akun Administrator</label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={e => setAdminEmail(e.target.value)}
                  placeholder="admin.sarah@invitation.com"
                  className={styles.input}
                  required
                />
                <span className={styles.hint}>
                  Email ini akan digunakan untuk login ke portal backoffice.
                </span>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Password Awal</label>
                <div className={styles.inputWrap}>
                  <input
                    type={showAdminPassword ? 'text' : 'password'}
                    value={adminPassword}
                    onChange={e => setAdminPassword(e.target.value)}
                    placeholder="Minimal 8 karakter"
                    className={`${styles.input} ${styles.inputPassword}`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    className={styles.toggleEyeBtn}
                    aria-label="Toggle password visibility"
                  >
                    {showAdminPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <span className={styles.hint}>
                  Berikan password ini kepada staf bersangkutan untuk pertama kali masuk.
                </span>
              </div>

              <button type="submit" disabled={savingAdmin} className={styles.submitBtn}>
                <UserPlus size={15} strokeWidth={1.75} />
                <span>{savingAdmin ? 'Mendaftarkan...' : 'Daftarkan Administrator Baru'}</span>
              </button>
            </form>
          </div>
        )}

        {/* Right Info Card */}
        <div className={styles.sideCard}>
          <h3 className={styles.sideTitle}>
            <ShieldCheck size={17} strokeWidth={1.75} className={styles.sideIcon} />
            <span>Pedoman Keamanan</span>
          </h3>

          <ul className={styles.sideList}>
            <li className={styles.sideItem}>
              <span className={styles.sideIcon}>•</span>
              <span>
                Hak akses admin bersifat global dan dapat mengelola seluruh entitas sistem.
              </span>
            </li>
            <li className={styles.sideItem}>
              <span className={styles.sideIcon}>•</span>
              <span>Selalu gunakan kata sandi yang unik dan perbarui secara berkala.</span>
            </li>
            <li className={styles.sideItem}>
              <span className={styles.sideIcon}>•</span>
              <span>
                Jangan membagikan kredensial login admin kepada pihak yang tidak berwenang.
              </span>
            </li>
          </ul>

          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>Administrator Aktif</span>
            <span className={styles.metaValue}>{user?.name || 'Super Admin'}</span>
          </div>

          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>Email Terhubung</span>
            <span className={styles.metaValue}>{user?.email || 'admin@invitation.com'}</span>
          </div>

          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>Tingkat Wewenang</span>
            <span className={styles.metaValue}>Super Administrator (Root)</span>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Creating Admin */}
      <ConfirmModal
        isOpen={confirmCreateOpen}
        title="Daftarkan Administrator Baru"
        message={`Apakah Anda yakin ingin mendaftarkan akun "${adminName.trim()}" (${adminEmail.trim()}) sebagai administrator baru? Akun ini akan memiliki akses penuh ke seluruh data sistem.`}
        confirmLabel="Ya, Daftarkan Admin"
        cancelLabel="Batalkan"
        variant="default"
        loading={savingAdmin}
        onConfirm={executeCreateAdmin}
        onCancel={() => setConfirmCreateOpen(false)}
      />
    </div>
  );
}
