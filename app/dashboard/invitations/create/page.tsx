'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/context/ToastContext';
import { api } from '@/lib/api';
import type { UserTemplate, WeddingGift, WeddingEvent } from '@/types';
import {
  ArrowLeft,
  AlertCircle,
  Check,
  User,
  Gift,
  Music,
  Image as ImageIcon,
  Heart,
  Plus,
  Trash2,
  QrCode,
  Upload,
  Loader2,
} from 'lucide-react';
import styles from '../form.module.css';
import { LivePreview } from './live-preview';

const AUDIO_PRESETS = [
  {
    name: 'Canon in D (Pachelbel)',
    desc: 'Piano & Strings Klasik Romantis',
    url: 'https://cdn.pixabay.com/download/audio/2022/05/16/audio_db6591201e.mp3',
  },
  {
    name: 'Acoustic Wedding Love',
    desc: 'Petikan Gitar Akustik Hangat',
    url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3',
  },
  {
    name: 'Mendelssohn March',
    desc: 'Prosesi Masuk Klasik Tradisional',
    url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73507.mp3',
  },
  {
    name: 'Peaceful Ambient Piano',
    desc: 'Sentuhan Piano Khidmat & Syahdu',
    url: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_12b0c7443c.mp3',
  },
];

export default function CreateInvitationPage() {
  const router = useRouter();
  const { token } = useAuth();
  const toast = useToast();

  const [myTemplates, setMyTemplates] = useState<UserTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [templateId, setTemplateId] = useState('');
  const selectedTemplate = myTemplates.find(item => item.template_id === templateId)?.template;
  const [slug, setSlug] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [coverImage, setCoverImage] = useState('');

  // Groom
  const [groomName, setGroomName] = useState('');
  const [groomBirth, setGroomBirth] = useState('');
  const [groomParents, setGroomParents] = useState('');
  const [groomPhoto, setGroomPhoto] = useState('');

  // Bride
  const [brideName, setBrideName] = useState('');
  const [brideBirth, setBrideBirth] = useState('');
  const [brideParents, setBrideParents] = useState('');
  const [bridePhoto, setBridePhoto] = useState('');

  // Media, Story & Music
  const [musicUrl, setMusicUrl] = useState('');
  const [streamingPlatform, setStreamingPlatform] = useState('');
  const [galleryUrls, setGalleryUrls] = useState('');
  const [storyTitle, setStoryTitle] = useState('');
  const [storyText, setStoryText] = useState('');

  // Events (Dynamic Multi-Events)
  const [events, setEvents] = useState<WeddingEvent[]>([
    {
      name: 'Akad Nikah',
      date: '',
      time: '08:00 - 10:00 WIB',
      place: '',
      address: '',
      maps_url: '',
    },
    {
      name: 'Resepsi Pernikahan',
      date: '',
      time: '11:00 - 14:00 WIB',
      place: '',
      address: '',
      maps_url: '',
    },
  ]);

  const handleAddEvent = () => {
    setEvents(prev => [
      ...prev,
      {
        name: 'Sesi Acara Tambahan',
        date: eventDate || '',
        time: '19:00 - 21:00 WIB',
        place: '',
        address: '',
        maps_url: '',
      },
    ]);
  };

  const handleRemoveEvent = (index: number) => {
    if (events.length <= 1) {
      toast.error('Minimal satu rangkaian acara wajib diisi');
      return;
    }
    setEvents(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleUpdateEvent = (index: number, field: keyof WeddingEvent, val: string) => {
    setEvents(prev => prev.map((ev, idx) => (idx === index ? { ...ev, [field]: val } : ev)));
  };

  // Uploading state & handlers
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldKey: string,
    onSuccess: (url: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    setUploadingField(fieldKey);
    try {
      const res = await api.uploadFile(token, file);
      onSuccess(res.data.url);
      toast.success('File berhasil diunggah');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mengunggah file';
      toast.error(msg);
    } finally {
      setUploadingField(null);
      e.target.value = '';
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !token) return;

    setUploadingField('gallery');
    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const res = await api.uploadFile(token, files[i]);
        uploadedUrls.push(res.data.url);
      }
      setGalleryUrls(prev => {
        const existing = prev ? prev.trim() : '';
        const addition = uploadedUrls.join('\n');
        return existing ? `${existing}\n${addition}` : addition;
      });
      toast.success(`${files.length} foto berhasil diunggah ke galeri`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mengunggah beberapa foto';
      toast.error(msg);
    } finally {
      setUploadingField(null);
      e.target.value = '';
    }
  };

  // Quote
  const [quoteText, setQuoteText] = useState(
    'Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang.'
  );
  const [quoteAttribution, setQuoteAttribution] = useState('QS. Ar-Rum: 21');

  // Gift / Multi-Rekening & QRIS
  const [gifts, setGifts] = useState<WeddingGift[]>([
    { platform: 'BCA', name: '', id: '', qris_image: '' },
  ]);

  const handleAddGift = () => {
    setGifts(prev => [...prev, { platform: 'BCA', name: '', id: '', qris_image: '' }]);
  };

  const handleRemoveGift = (index: number) => {
    setGifts(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleUpdateGift = (index: number, field: keyof WeddingGift, val: string) => {
    setGifts(prev => prev.map((g, idx) => (idx === index ? { ...g, [field]: val } : g)));
  };

  useEffect(() => {
    if (!token) return;
    api
      .getMyTemplates(token)
      .then(res => {
        const templates = res.data || [];
        setMyTemplates(templates);
        if (templates.length > 0 && templates[0].template_id) {
          setTemplateId(templates[0].template_id);
        }
      })
      .catch(err => console.error('Failed to load templates:', err))
      .finally(() => setLoadingTemplates(false));
  }, [token]);

  // Helper auto slug generator from groom & bride
  const handleGenerateSlug = () => {
    const groomClean = groomName.trim().split(' ')[0] || 'pria';
    const brideClean = brideName.trim().split(' ')[0] || 'wanita';
    const generated = `pernikahan-${groomClean}-${brideClean}`
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '');
    setSlug(generated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('Sesi login telah berakhir, silakan login kembali');
      return;
    }

    if (!templateId) {
      setError('Pilih template undangan terlebih dahulu');
      return;
    }

    if (!slug.trim()) {
      setError('Slug undangan wajib diisi');
      return;
    }

    if (!eventDate) {
      setError('Tanggal acara utama wajib diisi');
      return;
    }

    if (!groomName.trim() || !brideName.trim()) {
      setError('Nama kedua mempelai wajib diisi');
      return;
    }

    setSubmitting(true);

    const photoList = galleryUrls
      .split('\n')
      .map(u => u.trim())
      .filter(u => u.length > 0);

    const detailPayload = {
      cover_image: coverImage.trim(),
      groom: {
        name: groomName.trim(),
        place_of_birth: groomBirth.trim(),
        parent: groomParents.trim(),
        photo: groomPhoto.trim(),
      },
      bride: {
        name: brideName.trim(),
        place_of_birth: brideBirth.trim(),
        parent: brideParents.trim(),
        photo: bridePhoto.trim(),
      },
      quotes: {
        quote: quoteText.trim(),
        attribution: quoteAttribution.trim(),
      },
      wedding_event:
        events.length > 0
          ? events.map(ev => ({
              name: ev.name.trim() || 'Rangkaian Acara',
              date: ev.date || eventDate,
              time: ev.time.trim() || 'Waktu Menyesuaikan',
              place: ev.place.trim() || 'Lokasi Acara',
              address: ev.address ? ev.address.trim() : '',
              maps_url: ev.maps_url ? ev.maps_url.trim() : '',
            }))
          : [
              {
                name: 'Akad Nikah & Resepsi',
                date: eventDate,
                time: '08:00 - Selesai',
                place: 'Lokasi Acara',
                address: '',
                maps_url: '',
              },
            ],
      wedding_gift: gifts
        .filter(g => g.id.trim() || g.name.trim() || (g.qris_image && g.qris_image.trim()))
        .map(g => ({
          platform: g.platform.trim(),
          name: g.name.trim() || groomName.trim(),
          id: g.id.trim(),
          ...(g.qris_image?.trim() ? { qris_image: g.qris_image.trim() } : {}),
        })),
      music: musicUrl.trim(),
      streaming_platform: streamingPlatform.trim(),
      gallery: photoList.length > 0 ? { photos: photoList } : {},
      love_story:
        storyTitle.trim() || storyText.trim()
          ? {
              title: storyTitle.trim(),
              story: storyText.trim(),
            }
          : {},
    };

    try {
      await api.createInvitation(token, {
        template_id: templateId,
        slug: slug.trim().toLowerCase(),
        event_date: eventDate,
        detail: detailPayload,
      });

      toast.success('Undangan pernikahan berhasil dibuat', 'Berhasil Dibuat');
      router.push('/dashboard/invitations');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal membuat undangan baru';
      setError(msg);
      toast.error(msg, 'Gagal Membuat');
      setSubmitting(false);
    }
  };

  return (
    <div className={`${styles.container} ${styles.createContainer}`}>
      <div className={styles.header}>
        <Link href="/dashboard/invitations" className={styles.backLink}>
          <ArrowLeft size={14} strokeWidth={1.75} />
          <span>Kembali ke Daftar Undangan</span>
        </Link>
        <h1 className={styles.title}>Buat Undangan Baru</h1>
        <p className={styles.subtitle}>
          Isi informasi detail acara pernikahan untuk membuat tautan undangan digital
        </p>
      </div>

      {error && (
        <div className={styles.errorBanner}>
          <AlertCircle size={16} strokeWidth={1.75} />
          <span>{error}</span>
        </div>
      )}

      <div className={styles.createWorkspace}>
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Step 1: Pilih Template */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>1. Pilih Desain Template</h2>
            <p className={styles.sectionDesc}>
              Pilih dari template yang sudah kamu miliki di akunmu
            </p>

            {loadingTemplates ? (
              <p>Memuat template...</p>
            ) : myTemplates.length === 0 ? (
              <div className={styles.emptyTemplates}>
                Kamu belum memiliki template.{' '}
                <Link href="/dashboard/templates">
                  Beli atau aktifkan template gratis terlebih dahulu
                </Link>
              </div>
            ) : (
              <div className={styles.templateSelect}>
                {myTemplates.map(ut => {
                  const tmpl = ut.template;
                  const isSelected = templateId === ut.template_id;
                  return (
                    <div
                      key={ut.id}
                      className={`${styles.templateOption} ${isSelected ? styles.templateOptionSelected : ''}`}
                      onClick={() => setTemplateId(ut.template_id)}
                    >
                      <span className={styles.templateName}>{tmpl?.name || 'Template'}</span>
                      <span className={styles.templateMeta}>
                        Aktif {tmpl?.active_days_after || 30} hari pasca acara
                      </span>
                      {isSelected && (
                        <span className={styles.templateSelectedBadge}>
                          <Check size={13} strokeWidth={2} /> Terpilih
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Step 2: Info Dasar */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>2. Tautan & Tanggal Acara</h2>
            <p className={styles.sectionDesc}>
              Atur alamat URL unik dan tanggal puncak acara pernikahan
            </p>

            <div className={styles.grid2}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Slug URL Undangan <span className={styles.required}>*</span>
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="misal: budi-dan-ani"
                    value={slug}
                    onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    required
                  />
                  <button
                    type="button"
                    onClick={handleGenerateSlug}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #d1d5db',
                      background: '#f3f4f6',
                      cursor: 'pointer',
                      fontSize: '12px',
                      whiteSpace: 'nowrap',
                    }}
                    title="Generate otomatis dari nama mempelai"
                  >
                    Otomatis
                  </button>
                </div>
                <div className={styles.slugPreview}>Preview link: /{slug || 'nama-slug'}</div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Tanggal Acara Utama <span className={styles.required}>*</span>
                </label>
                <input
                  type="date"
                  className={styles.input}
                  value={eventDate}
                  onChange={e => {
                    setEventDate(e.target.value);
                    setEvents(prev =>
                      prev.map(ev => (!ev.date ? { ...ev, date: e.target.value } : ev))
                    );
                  }}
                  required
                />
                <span className={styles.hint}>
                  Tanggal yang digunakan untuk hitung mundur acara
                </span>
              </div>

              <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
                <label className={styles.label}>
                  <span>Foto Sampul / Banner Cover (Opsional)</span>
                </label>
                <div className={styles.uploadRow}>
                  <label className={styles.uploadBtn}>
                    {uploadingField === 'cover' ? (
                      <Loader2 size={13} className={styles.spinner} />
                    ) : (
                      <Upload size={13} strokeWidth={1.75} />
                    )}
                    <span>{uploadingField === 'cover' ? 'Mengunggah...' : 'Unggah Cover'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className={styles.uploadHiddenInput}
                      disabled={uploadingField === 'cover'}
                      onChange={e => handleFileUpload(e, 'cover', setCoverImage)}
                    />
                  </label>
                </div>
                <span className={styles.hint}>
                  Foto sampul utama yang digunakan pada preview Open Graph dan header undangan.
                </span>
              </div>
            </div>
          </div>

          {/* Step 3: Profil Mempelai */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>3. Profil Mempelai</h2>
            <p className={styles.sectionDesc}>Informasi kedua calon mempelai beserta orang tua</p>

            <div className={styles.grid2}>
              {/* Groom */}
              <div
                style={{
                  padding: '16px',
                  background: 'var(--bg-primary, #faf9f6)',
                  border: '1px solid var(--border-light, #e4dfd5)',
                }}
              >
                <h3
                  style={{
                    fontSize: '14.5px',
                    fontWeight: 600,
                    margin: '0 0 12px',
                    color: 'var(--text-main, #181716)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <User size={15} strokeWidth={1.75} />
                  <span>Mempelai Pria</span>
                </h3>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Nama Lengkap <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="misal: Budi Santoso, S.Kom"
                    value={groomName}
                    onChange={e => setGroomName(e.target.value)}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Kota Asal / Lahir</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="misal: Jakarta"
                    value={groomBirth}
                    onChange={e => setGroomBirth(e.target.value)}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Nama Orang Tua</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="misal: Putra dari Bpk. Hendra & Ibu Dewi"
                    value={groomParents}
                    onChange={e => setGroomParents(e.target.value)}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Foto Mempelai Pria (Opsional)</label>
                  <div className={styles.uploadRow}>
                    <label className={styles.uploadBtn}>
                      {uploadingField === 'groom' ? (
                        <Loader2 size={13} className={styles.spinner} />
                      ) : (
                        <Upload size={13} strokeWidth={1.75} />
                      )}
                      <span>{uploadingField === 'groom' ? 'Mengunggah...' : 'Unggah'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className={styles.uploadHiddenInput}
                        disabled={uploadingField === 'groom'}
                        onChange={e => handleFileUpload(e, 'groom', setGroomPhoto)}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Bride */}
              <div
                style={{
                  padding: '16px',
                  background: 'var(--bg-primary, #faf9f6)',
                  border: '1px solid var(--border-light, #e4dfd5)',
                }}
              >
                <h3
                  style={{
                    fontSize: '14.5px',
                    fontWeight: 600,
                    margin: '0 0 12px',
                    color: 'var(--text-main, #181716)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <User size={15} strokeWidth={1.75} />
                  <span>Mempelai Wanita</span>
                </h3>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Nama Lengkap <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="misal: Ani Lestari, S.E"
                    value={brideName}
                    onChange={e => setBrideName(e.target.value)}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Kota Asal / Lahir</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="misal: Bandung"
                    value={brideBirth}
                    onChange={e => setBrideBirth(e.target.value)}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Nama Orang Tua</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="misal: Putri dari Bpk. Surya & Ibu Ratna"
                    value={brideParents}
                    onChange={e => setBrideParents(e.target.value)}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Foto Mempelai Wanita (Opsional)</label>
                  <div className={styles.uploadRow}>
                    <label className={styles.uploadBtn}>
                      {uploadingField === 'bride' ? (
                        <Loader2 size={13} className={styles.spinner} />
                      ) : (
                        <Upload size={13} strokeWidth={1.75} />
                      )}
                      <span>{uploadingField === 'bride' ? 'Mengunggah...' : 'Unggah'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className={styles.uploadHiddenInput}
                        disabled={uploadingField === 'bride'}
                        onChange={e => handleFileUpload(e, 'bride', setBridePhoto)}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 4: Rangkaian Acara Fleksibel */}
          <div className={styles.section}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '10px',
              }}
            >
              <div>
                <h2 className={styles.sectionTitle}>4. Rangkaian Acara Fleksibel</h2>
                <p className={styles.sectionDesc}>
                  Atur jadwal dan lokasi prosesi pernikahan (Akad, Resepsi, Siraman, Unduh Mantu,
                  dll.)
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddEvent}
                className={styles.btnAddEvent}
                style={{ marginTop: 0 }}
              >
                <Plus size={13} strokeWidth={2} />
                <span>Tambah Acara</span>
              </button>
            </div>

            <div className={styles.eventCardList}>
              {events.map((evt, idx) => (
                <div key={idx} className={styles.eventCardItem}>
                  <div className={styles.eventCardHeader}>
                    <div className={styles.eventCardHeaderTitle}>
                      <span className={styles.eventCardIndex}>Acara #{idx + 1}</span>
                      <span>{evt.name || `Rangkaian Acara ${idx + 1}`}</span>
                    </div>
                    {events.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveEvent(idx)}
                        className={styles.btnRemoveEvent}
                        title="Hapus Acara Ini"
                      >
                        <Trash2 size={12} strokeWidth={1.75} />
                        <span>Hapus</span>
                      </button>
                    )}
                  </div>

                  <div className={styles.grid3}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>
                        Nama Acara <span className={styles.required}>*</span>
                      </label>
                      <input
                        type="text"
                        className={styles.input}
                        placeholder="misal: Akad Nikah, Resepsi, Siraman"
                        value={evt.name}
                        onChange={e => handleUpdateEvent(idx, 'name', e.target.value)}
                        required
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>Tanggal Acara</label>
                      <input
                        type="date"
                        className={styles.input}
                        value={evt.date}
                        onChange={e => handleUpdateEvent(idx, 'date', e.target.value)}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>Waktu Acara</label>
                      <input
                        type="text"
                        className={styles.input}
                        placeholder="misal: 08:00 - 10:00 WIB"
                        value={evt.time}
                        onChange={e => handleUpdateEvent(idx, 'time', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className={styles.grid3}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Nama Tempat / Gedung</label>
                      <input
                        type="text"
                        className={styles.input}
                        placeholder="misal: Masjid Al-Ikhlas"
                        value={evt.place}
                        onChange={e => handleUpdateEvent(idx, 'place', e.target.value)}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>Alamat Lengkap</label>
                      <input
                        type="text"
                        className={styles.input}
                        placeholder="misal: Jl. Melati No. 10, Jakarta Selatan"
                        value={evt.address || ''}
                        onChange={e => handleUpdateEvent(idx, 'address', e.target.value)}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>Tautan Google Maps</label>
                      <input
                        type="url"
                        className={styles.input}
                        placeholder="https://maps.google.com/..."
                        value={evt.maps_url || ''}
                        onChange={e => handleUpdateEvent(idx, 'maps_url', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button type="button" onClick={handleAddEvent} className={styles.btnAddEvent}>
              <Plus size={13} strokeWidth={2} />
              <span>Tambah Rangkaian Acara Lainnya</span>
            </button>
          </div>

          {/* Step 5: Quotes & Hadiah */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>5. Kutipan / Doa & Amplop Digital</h2>
            <p className={styles.sectionDesc}>
              Kutipan ayat suci dan rekening untuk kado pernikahan digital
            </p>

            <div className={styles.formGroup}>
              <label className={styles.label}>Kutipan Kata Mutiara / Doa</label>
              <textarea
                className={styles.textarea}
                value={quoteText}
                onChange={e => setQuoteText(e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Sumber / Tokoh / Ayat</label>
              <input
                type="text"
                className={styles.input}
                placeholder="misal: QS. Ar-Rum: 21"
                value={quoteAttribution}
                onChange={e => setQuoteAttribution(e.target.value)}
              />
            </div>

            <div
              style={{
                marginTop: '20px',
                paddingTop: '16px',
                borderTop: '1px solid var(--border-light, #e4dfd5)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '12px',
                }}
              >
                <h3
                  style={{
                    fontSize: '14.5px',
                    fontWeight: 600,
                    color: 'var(--text-main, #181716)',
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <Gift size={15} strokeWidth={1.75} />
                  <span>Amplop Digital &amp; Multi-Rekening (Opsional)</span>
                </h3>
                <button
                  type="button"
                  onClick={handleAddGift}
                  className={styles.btnAddGift}
                  style={{ margin: 0 }}
                >
                  <Plus size={13} strokeWidth={2} />
                  <span>Tambah Rekening / QRIS</span>
                </button>
              </div>

              <p
                style={{
                  fontSize: '12.5px',
                  color: 'var(--text-muted, #6b665f)',
                  marginBottom: '14px',
                }}
              >
                Anda dapat menambahkan beberapa rekening bank atau QRIS donasi sekaligus agar
                memudahkan tamu memberikan tanda kasih.
              </p>

              <div className={styles.giftCardList}>
                {gifts.map((gift, idx) => (
                  <div key={idx} className={styles.giftCardItem}>
                    <div className={styles.giftCardHeader}>
                      <span className={styles.giftCardIndex}>Rekening / QRIS #{idx + 1}</span>
                      {gifts.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveGift(idx)}
                          className={styles.btnRemoveGift}
                          title="Hapus Rekening Ini"
                        >
                          <Trash2 size={12} strokeWidth={1.75} />
                          <span>Hapus</span>
                        </button>
                      )}
                    </div>

                    <div className={styles.grid3}>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Penyedia Layanan / Platform</label>
                        <select
                          className={styles.select}
                          value={gift.platform}
                          onChange={e => handleUpdateGift(idx, 'platform', e.target.value)}
                        >
                          <option value="BCA">BCA (Bank Central Asia)</option>
                          <option value="Mandiri">Bank Mandiri</option>
                          <option value="BRI">Bank BRI</option>
                          <option value="BNI">Bank BNI</option>
                          <option value="BSI">Bank Syariah Indonesia (BSI)</option>
                          <option value="Bank Jago">Bank Jago</option>
                          <option value="CIMB">CIMB Niaga</option>
                          <option value="GoPay">GoPay</option>
                          <option value="OVO">OVO</option>
                          <option value="DANA">DANA</option>
                          <option value="ShopeePay">ShopeePay</option>
                          <option value="QRIS">QRIS Standar</option>
                        </select>
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.label}>Atas Nama Rekening</label>
                        <input
                          type="text"
                          className={styles.input}
                          placeholder="misal: Budi Santoso"
                          value={gift.name}
                          onChange={e => handleUpdateGift(idx, 'name', e.target.value)}
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.label}>
                          {gift.platform === 'QRIS'
                            ? 'Nomor / Kode QRIS'
                            : 'Nomor Rekening / No. HP'}
                        </label>
                        <input
                          type="text"
                          className={styles.input}
                          placeholder={
                            gift.platform === 'QRIS' ? 'NMID / Kode Merchant' : 'misal: 1234567890'
                          }
                          value={gift.id}
                          onChange={e => handleUpdateGift(idx, 'id', e.target.value)}
                        />
                      </div>
                    </div>

                    {gift.platform === 'QRIS' && (
                      <div className={styles.formGroup} style={{ marginTop: '10px' }}>
                        <label
                          className={styles.label}
                          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          <QrCode size={13} strokeWidth={1.75} />
                          <span>Gambar Barcode QRIS</span>
                        </label>
                        <div className={styles.uploadRow}>
                          <label className={styles.uploadBtn}>
                            {uploadingField === `gift_${idx}` ? (
                              <Loader2 size={13} className={styles.spinner} />
                            ) : (
                              <Upload size={13} strokeWidth={1.75} />
                            )}
                            <span>
                              {uploadingField === `gift_${idx}`
                                ? 'Mengunggah...'
                                : 'Unggah Barcode'}
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              className={styles.uploadHiddenInput}
                              disabled={uploadingField === `gift_${idx}`}
                              onChange={e =>
                                handleFileUpload(e, `gift_${idx}`, url =>
                                  handleUpdateGift(idx, 'qris_image', url)
                                )
                              }
                            />
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Step 6: Media, Galeri & Musik */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>6. Musik, Galeri Foto & Kisah Cinta</h2>
            <p className={styles.sectionDesc}>
              Tambahkan musik latar kustom, tautan galeri foto, siaran langsung, dan kisah cinta
            </p>

            <div className={styles.grid2}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <Music size={14} strokeWidth={1.75} />
                    <span>Musik Latar (MP3 / Audio)</span>
                  </span>
                </label>
                <div className={styles.uploadRow}>
                  <input
                    type="url"
                    className={styles.input}
                    placeholder="https://example.com/audio/song.mp3 atau unggah"
                    value={musicUrl}
                    onChange={e => setMusicUrl(e.target.value)}
                  />
                  <label className={styles.uploadBtn}>
                    {uploadingField === 'music' ? (
                      <Loader2 size={13} className={styles.spinner} />
                    ) : (
                      <Upload size={13} strokeWidth={1.75} />
                    )}
                    <span>{uploadingField === 'music' ? 'Mengunggah...' : 'Unggah'}</span>
                    <input
                      type="file"
                      accept="audio/*"
                      className={styles.uploadHiddenInput}
                      disabled={uploadingField === 'music'}
                      onChange={e => handleFileUpload(e, 'music', setMusicUrl)}
                    />
                  </label>
                </div>
                <span className={styles.hint}>Format .mp3, .m4a, .wav, .aac. Maksimal 15MB.</span>

                <div style={{ marginTop: '12px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#181716' }}>
                    Pilihan Lagu Siap Pakai:
                  </span>
                  <div className={styles.presetMusicGrid}>
                    {AUDIO_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className={`${styles.presetMusicCard} ${musicUrl === preset.url ? styles.presetMusicCardActive : ''}`}
                        onClick={() => setMusicUrl(preset.url)}
                      >
                        <div className={styles.presetMusicTitle}>
                          <span>{preset.name}</span>
                          {musicUrl === preset.url && (
                            <Check size={13} strokeWidth={2.5} color="#8a704c" />
                          )}
                        </div>
                        <div className={styles.presetMusicArtist}>{preset.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <span>URL Siaran Langsung (YouTube Live / Zoom)</span>
                </label>
                <input
                  type="url"
                  className={styles.input}
                  placeholder="https://youtube.com/live/..."
                  value={streamingPlatform}
                  onChange={e => setStreamingPlatform(e.target.value)}
                />
                <span className={styles.hint}>
                  Tautan live streaming bagi tamu yang mengikuti secara virtual.
                </span>
              </div>
            </div>

            <div className={styles.formGroup} style={{ marginTop: '16px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '6px',
                }}
              >
                <label className={styles.label} style={{ margin: 0 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <ImageIcon size={14} strokeWidth={1.75} />
                    <span>Daftar Galeri Foto (Satu URL per baris)</span>
                  </span>
                </label>
                <label className={styles.uploadBtn}>
                  {uploadingField === 'gallery' ? (
                    <Loader2 size={13} className={styles.spinner} />
                  ) : (
                    <Upload size={13} strokeWidth={1.75} />
                  )}
                  <span>{uploadingField === 'gallery' ? 'Mengunggah...' : 'Unggah Foto'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className={styles.uploadHiddenInput}
                    disabled={uploadingField === 'gallery'}
                    onChange={handleGalleryUpload}
                  />
                </label>
              </div>
            </div>

            <div
              style={{
                marginTop: '20px',
                paddingTop: '16px',
                borderTop: '1px solid var(--border-light, #e4dfd5)',
              }}
            >
              <h3
                style={{
                  fontSize: '14.5px',
                  fontWeight: 600,
                  color: 'var(--text-main, #181716)',
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Heart size={15} strokeWidth={1.75} />
                <span>Kisah Cinta (Love Story)</span>
              </h3>
              <div className={styles.formGroup}>
                <label className={styles.label}>Judul Kisah</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="misal: Awal Pertemuan hingga Janji Suci"
                  value={storyTitle}
                  onChange={e => setStoryTitle(e.target.value)}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Cerita Cinta</label>
                <textarea
                  className={styles.textarea}
                  placeholder="Tuliskan kisah perjalanan cinta singkat Anda berdua..."
                  rows={3}
                  value={storyText}
                  onChange={e => setStoryText(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className={styles.actionBar}>
            <Link href="/dashboard/invitations" className={styles.cancelBtn}>
              Batal
            </Link>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={submitting || myTemplates.length === 0}
            >
              {submitting ? 'Menyimpan...' : 'Simpan & Buat Undangan'}
            </button>
          </div>
        </form>
        <LivePreview
          template={selectedTemplate}
          groom={groomName}
          bride={brideName}
          date={eventDate}
        />
      </div>
    </div>
  );
}
