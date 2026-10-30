'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useToast } from '@/context/ToastContext';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { api } from '@/lib/api';
import type { Template } from '@/types';
import { ThemeBuilder, type ThemeBuilderValue } from './theme-builder';

const DEFAULT_BUILDER_VALUE: ThemeBuilderValue = {
  theme_config: {
    version: 1,
    colors: {
      primary: '#8a704c',
      secondary: '#c7b89d',
      background: '#faf9f6',
      surface: '#ffffff',
      text: '#181716',
      muted: '#6b665f',
      border: '#e4dfd5',
    },
    fonts: { heading: 'Cormorant Garamond', body: 'Plus Jakarta Sans', accent: 'Alex Brush' },
    layout: { content_width: 720, section_spacing: 80, border_radius: 0 },
    background: { type: 'color', color: '#faf9f6' },
  },
  block_config: {
    allowed_blocks: [
      'cover',
      'quote',
      'couple',
      'love_story',
      'event',
      'gallery',
      'streaming',
      'gift',
      'rsvp',
      'footer',
    ],
    default_order: [
      'cover',
      'quote',
      'couple',
      'love_story',
      'event',
      'gallery',
      'streaming',
      'gift',
      'rsvp',
      'footer',
    ],
    locked_blocks: [],
  },
};
import Link from 'next/link';
import { Palette, Plus, Edit2, Trash2, AlertCircle, CheckCircle2, X, Eye } from 'lucide-react';
import styles from '../admin.module.css';

export default function AdminTemplatesPage() {
  const { token } = useAdminAuth();
  const toast = useToast();

  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Modal form states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Confirm delete modal state
  const [deleteTarget, setDeleteTarget] = useState<Template | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formPrice, setFormPrice] = useState(0);
  const [formIsActive, setFormIsActive] = useState(true);
  const [formDeadlineDays, setFormDeadlineDays] = useState(30);
  const [formActiveDaysAfter, setFormActiveDaysAfter] = useState(7);
  const [builderValue, setBuilderValue] = useState<ThemeBuilderValue>(DEFAULT_BUILDER_VALUE);

  const normalizeBuilder = (tmpl?: Template | null): ThemeBuilderValue => ({
    theme_config: tmpl?.theme_config || DEFAULT_BUILDER_VALUE.theme_config,
    block_config: tmpl?.block_config || DEFAULT_BUILDER_VALUE.block_config,
  });

  const fetchTemplates = useCallback(() => {
    if (!token) return;
    setLoading(true);
    api
      .getAdminTemplates(token)
      .then(res => {
        setTemplates(res.data || []);
      })
      .catch(err => {
        setError(err.message || 'Gagal memuat katalog template');
      })
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const openCreateModal = () => {
    setEditingTemplate(null);
    setFormName('');
    setFormSlug('');
    setFormPrice(0);
    setFormIsActive(true);
    setFormDeadlineDays(30);
    setFormActiveDaysAfter(7);
    setBuilderValue(normalizeBuilder());
    setModalOpen(true);
    setError(null);
  };

  const openEditModal = (tmpl: Template) => {
    setEditingTemplate(tmpl);
    setFormName(tmpl.name);
    setFormSlug(tmpl.slug);
    setFormPrice(tmpl.price);
    setFormIsActive(tmpl.is_active);
    setFormDeadlineDays(tmpl.order_deadline_days);
    setFormActiveDaysAfter(tmpl.active_days_after);
    setBuilderValue(normalizeBuilder(tmpl));
    setModalOpen(true);
    setError(null);
  };

  const handleSubmitModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setSubmitting(true);
    setError(null);

    const payload = {
      name: formName.trim(),
      slug: formSlug.trim().toLowerCase(),
      price: Number(formPrice),
      is_active: Boolean(formIsActive),
      order_deadline_days: Number(formDeadlineDays),
      active_days_after: Number(formActiveDaysAfter),
      theme_config: builderValue.theme_config,
      block_config: builderValue.block_config,
    };

    try {
      if (editingTemplate) {
        await api.updateAdminTemplate(token, editingTemplate.id, payload);
        setSuccess(`Template "${payload.name}" berhasil diperbarui`);
        toast.success(`Template "${payload.name}" berhasil diperbarui`, 'Pembaruan Berhasil');
      } else {
        await api.createAdminTemplate(token, payload);
        setSuccess(`Template "${payload.name}" berhasil ditambahkan`);
        toast.success(`Template "${payload.name}" berhasil ditambahkan`, 'Template Ditambahkan');
      }
      setModalOpen(false);
      fetchTemplates();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan template';
      setError(msg);
      toast.error(msg, 'Gagal Menyimpan');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDeleteTemplate = async () => {
    if (!deleteTarget || !token) return;
    setDeleting(true);
    setError(null);
    setSuccess(null);

    try {
      await api.deleteAdminTemplate(token, deleteTarget.id);
      const msg = `Template "${deleteTarget.name}" berhasil dihapus`;
      setSuccess(msg);
      toast.success(msg, 'Berhasil Dihapus');
      setTemplates(prev => prev.filter(t => t.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menghapus template';
      setError(msg);
      toast.error(msg, 'Gagal Menghapus');
    } finally {
      setDeleting(false);
    }
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: 'var(--font-serif, Georgia, serif)',
              fontSize: '24px',
              fontWeight: 600,
              margin: '0 0 6px',
            }}
          >
            Katalog Template
          </h1>
          <p style={{ fontSize: '13px', color: '#6b665f', margin: 0 }}>
            Kelola desain tema undangan digital, tarif harga, dan durasi masa aktif
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className={`${styles.btn} ${styles.btnPrimary}`}
        >
          <Plus size={14} strokeWidth={2} />
          <span>Tambah Template Baru</span>
        </button>
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
          <h3 className={styles.tableTitle}>Daftar Template Tersedia ({templates.length})</h3>
        </div>

        {loading ? (
          <div style={{ padding: '32px', textAlign: 'center', color: '#6b665f', fontSize: '13px' }}>
            Memuat data template...
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nama Template</th>
                <th>Slug Identitas</th>
                <th>Harga Paket</th>
                <th>Masa Aktif</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {templates.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{ textAlign: 'center', color: '#6b665f', padding: '36px' }}
                  >
                    Belum ada template yang terdaftar.
                  </td>
                </tr>
              ) : (
                templates.map(tmpl => (
                  <tr key={tmpl.id}>
                    <td>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontWeight: 600,
                        }}
                      >
                        <Palette size={15} strokeWidth={1.75} style={{ color: '#8a704c' }} />
                        <span>{tmpl.name}</span>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '12.5px', color: '#55504a' }}>
                      {tmpl.slug}
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      {tmpl.price === 0 ? 'Gratis' : formatRupiah(tmpl.price)}
                    </td>
                    <td style={{ fontSize: '12.5px', color: '#6b665f' }}>
                      {tmpl.active_days_after} hari setelah acara
                    </td>
                    <td>
                      <span
                        className={`${styles.badge} ${tmpl.is_active ? styles.badgeSuccess : styles.badgeNeutral}`}
                      >
                        {tmpl.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <Link
                          href={`/demo/${tmpl.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`${styles.btn} ${styles.btnOutline}`}
                          title="Lihat Pratinjau Desain"
                        >
                          <Eye size={13} strokeWidth={1.75} />
                          <span>Demo</span>
                        </Link>
                        <button
                          type="button"
                          className={`${styles.btn} ${styles.btnOutline}`}
                          onClick={() => openEditModal(tmpl)}
                        >
                          <Edit2 size={13} strokeWidth={1.75} />
                          <span>Ubah</span>
                        </button>
                        <button
                          type="button"
                          className={`${styles.btn} ${styles.btnDanger}`}
                          onClick={() => setDeleteTarget(tmpl)}
                        >
                          <Trash2 size={13} strokeWidth={1.75} />
                          <span>Hapus</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Tambah / Edit Template */}
      {modalOpen && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalBox}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
              }}
            >
              <h3 className={styles.modalTitle}>
                {editingTemplate ? 'Ubah Template Undangan' : 'Tambah Template Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
              >
                <X size={18} strokeWidth={1.75} />
              </button>
            </div>

            <form onSubmit={handleSubmitModal}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Nama Template</label>
                <input
                  type="text"
                  required
                  placeholder="misal: Classic Ivory"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Slug (Kode Desain Unik)</label>
                <input
                  type="text"
                  required
                  placeholder="misal: classic-ivory"
                  value={formSlug}
                  onChange={e =>
                    setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))
                  }
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Harga Paket (IDR, 0 = Gratis)</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formPrice}
                  onChange={e => setFormPrice(Number(e.target.value))}
                  className={styles.input}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Batas Order (Hari)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formDeadlineDays}
                    onChange={e => setFormDeadlineDays(Number(e.target.value))}
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Aktif Pasca Acara (Hari)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formActiveDaysAfter}
                    onChange={e => setFormActiveDaysAfter(Number(e.target.value))}
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Status Template</label>
                <select
                  value={formIsActive ? 'true' : 'false'}
                  onChange={e => setFormIsActive(e.target.value === 'true')}
                  className={styles.select}
                >
                  <option value="true">Aktif (Dapat dipilih pengguna)</option>
                  <option value="false">Nonaktif (Disembunyikan)</option>
                </select>
              </div>

              <ThemeBuilder value={builderValue} onChange={setBuilderValue} />

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className={`${styles.btn} ${styles.btnOutline}`}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`${styles.btn} ${styles.btnPrimary}`}
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Template */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Konfirmasi Hapus Template"
        message={`Apakah Anda yakin ingin menghapus template "${deleteTarget?.name}"? Tindakan ini permanen dan template tidak akan tersedia lagi untuk pengguna baru.`}
        confirmLabel="Hapus Template"
        cancelLabel="Batal"
        loading={deleting}
        onConfirm={confirmDeleteTemplate}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
