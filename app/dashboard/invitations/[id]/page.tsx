'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/context/ToastContext';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { api } from '@/lib/api';
import type {
  Invitation,
  InvitationDetail,
  InvitationLayout,
  Message,
  WeddingGift,
  WeddingEvent,
} from '@/types';
import { LayoutEditor } from './layout-editor';
import { LivePreview } from '../create/live-preview';
import {
  ArrowLeft,
  ExternalLink,
  AlertCircle,
  User,
  Gift,
  Music,
  Image as ImageIcon,
  Heart,
  Settings,
  LayoutDashboard,
  Users,
  Share2,
  Trash2,
  Copy,
  Check,
  MessageSquare,
  Download,
  Search,
  Plus,
  QrCode,
  Upload,
  Loader2,
} from 'lucide-react';
import styles from '../form.module.css';

const DEFAULT_LAYOUT: InvitationLayout = {
  version: 1,
  sections: [
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
  ].map(type => ({
    id: type,
    type: type as InvitationLayout['sections'][number]['type'],
    visible: true,
  })),
};

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

export default function EditInvitationPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { token } = useAuth();
  const toast = useToast();
  const id = params?.id as string;

  const initialTab = searchParams?.get('tab');
  const [activeTab, setActiveTab] = useState<'details' | 'layout' | 'rsvp' | 'share'>(
    initialTab === 'rsvp' || initialTab === 'share' || initialTab === 'layout'
      ? initialTab
      : 'layout'
  );
  const [layout, setLayout] = useState<InvitationLayout>(DEFAULT_LAYOUT);
  const [layoutVersion, setLayoutVersion] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Messages list state
  const [messages, setMessages] = useState<Message[]>([]);
  const [deletingMsgId, setDeletingMsgId] = useState<string | null>(null);
  const [deleteMsgTarget, setDeleteMsgTarget] = useState<Message | null>(null);
  const [rsvpFilter, setRsvpFilter] = useState<'all' | 'hadir' | 'tidak_hadir'>('all');
  const [rsvpSearch, setRsvpSearch] = useState('');

  // Form states
  const [status, setStatus] = useState<'draft' | 'active' | 'expired'>('active');
  const [template, setTemplate] = useState<Invitation['template']>();
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
  const [quoteText, setQuoteText] = useState('');
  const [quoteAttribution, setQuoteAttribution] = useState('');

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

  // Media, Story & Music
  const [musicUrl, setMusicUrl] = useState('');
  const [streamingPlatform, setStreamingPlatform] = useState('');
  const [galleryUrls, setGalleryUrls] = useState('');
  const [storyTitle, setStoryTitle] = useState('');
  const [storyText, setStoryText] = useState('');

  // WhatsApp Generator states
  const [guestName, setGuestName] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  useEffect(() => {
    if (!token || !id) return;

    api
      .getInvitationById(token, id)
      .then(res => {
        const inv: Invitation = res.data;
        const loadedLayout =
          inv.layout && Array.isArray(inv.layout.sections) ? inv.layout : DEFAULT_LAYOUT;
        setLayout(loadedLayout);
        setLayoutVersion(inv.layout_version || 1);
        setStatus(inv.status);
        setTemplate(inv.template);
        setSlug(inv.slug);
        if (inv.event_date) {
          setEventDate(inv.event_date.split('T')[0]);
        }

        if (Array.isArray(inv.messages)) {
          setMessages(inv.messages);
        }

        const d = (inv.detail || {}) as InvitationDetail;
        // Groom
        if (typeof d.groom === 'object' && d.groom) {
          setGroomName(d.groom.name || '');
          setGroomBirth(d.groom.place_of_birth || '');
          setGroomParents(d.groom.parent || '');
          setGroomPhoto(d.groom.photo || '');
        } else if (typeof d.groom === 'string') {
          setGroomName(d.groom);
        }

        // Bride
        if (typeof d.bride === 'object' && d.bride) {
          setBrideName(d.bride.name || '');
          setBrideBirth(d.bride.place_of_birth || '');
          setBrideParents(d.bride.parent || '');
          setBridePhoto(d.bride.photo || '');
        } else if (typeof d.bride === 'string') {
          setBrideName(d.bride);
        }

        // Events
        if (Array.isArray(d.wedding_event) && d.wedding_event.length > 0) {
          setEvents(
            d.wedding_event.map((ev: WeddingEvent) => ({
              name: ev.name || 'Acara Pernikahan',
              date: ev.date ? ev.date.split('T')[0] : '',
              time: ev.time || '',
              place: ev.place || '',
              address: ev.address || '',
              maps_url: ev.maps_url || '',
            }))
          );
        } else {
          setEvents([
            {
              name: 'Akad Nikah',
              date: inv.event_date ? inv.event_date.split('T')[0] : '',
              time: '08:00 - 10:00 WIB',
              place: '',
              address: '',
              maps_url: '',
            },
            {
              name: 'Resepsi Pernikahan',
              date: inv.event_date ? inv.event_date.split('T')[0] : '',
              time: '11:00 - 14:00 WIB',
              place: '',
              address: '',
              maps_url: '',
            },
          ]);
        }

        // Quotes
        if (d.quotes) {
          setQuoteText(d.quotes.quote || '');
          setQuoteAttribution(d.quotes.attribution || '');
        }

        // Gifts
        if (Array.isArray(d.wedding_gift) && d.wedding_gift.length > 0) {
          setGifts(
            d.wedding_gift.map((g: WeddingGift) => ({
              platform: g.platform || 'BCA',
              name: g.name || '',
              id: g.id || '',
              qris_image: g.qris_image || '',
            }))
          );
        } else {
          setGifts([{ platform: 'BCA', name: '', id: '', qris_image: '' }]);
        }

        // Media & Story
        if (d.cover_image) setCoverImage(d.cover_image);
        if (d.music) setMusicUrl(d.music);
        if (d.streaming_platform) setStreamingPlatform(d.streaming_platform);
        if (d.gallery && Array.isArray(d.gallery.photos)) {
          setGalleryUrls(d.gallery.photos.join('\n'));
        }
        if (d.love_story) {
          setStoryTitle(d.love_story.title || '');
          setStoryText(d.love_story.story || '');
        }
      })
      .catch(err => {
        setError(err.message || 'Gagal memuat data undangan');
      })
      .finally(() => setLoading(false));
  }, [token, id]);

  // RSVP statistics calculation
  const rsvpStats = useMemo(() => {
    let hadir = 0;
    let tidakHadir = 0;

    messages.forEach(m => {
      const att = (m.attendance || 'hadir').toLowerCase();
      if (att === 'tidak_hadir') tidakHadir++;
      else hadir++;
    });

    return {
      total: messages.length,
      hadir,
      tidakHadir,
    };
  }, [messages]);

  // Delete guest message handler
  const confirmDeleteMessage = async () => {
    if (!token || !deleteMsgTarget) return;
    const msgId = deleteMsgTarget.id;
    setDeletingMsgId(msgId);
    try {
      await api.deleteMyInvitationMessage(token, id, msgId);
      setMessages(prev => prev.filter(m => m.id !== msgId));
      toast.success('Pesan ucapan tamu berhasil dihapus', 'Berhasil Dihapus');
      setDeleteMsgTarget(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menghapus pesan ucapan';
      toast.error(msg, 'Gagal Menghapus');
    } finally {
      setDeletingMsgId(null);
    }
  };

  // Export CSV handler
  const handleExportCSV = () => {
    if (messages.length === 0) return;
    const headers = ['No', 'Nama Tamu', 'Konfirmasi Kehadiran', 'Ucapan dan Doa', 'Waktu Masuk'];
    const rows = messages.map((m, idx) => {
      const att = m.attendance === 'tidak_hadir' ? 'Tidak Hadir' : 'Hadir';
      const cleanName = `"${(m.name || '').replace(/"/g, '""')}"`;
      const cleanMsg = `"${(m.message || '').replace(/"/g, '""')}"`;
      const dateStr = `"${new Date(m.created_at).toLocaleString('id-ID')}"`;
      return [idx + 1, cleanName, att, cleanMsg, dateStr].join(',');
    });
    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `rekap-rsvp-${slug || 'undangan'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(
      `Rekap ${messages.length} data ucapan dan RSVP berhasil diunduh`,
      'Unduh Selesai'
    );
  };

  // Filtered messages for Tab RSVP
  const filteredMessages = useMemo(() => {
    return messages.filter(m => {
      const isTidak = (m.attendance || '').toLowerCase() === 'tidak_hadir';
      const attKey = isTidak ? 'tidak_hadir' : 'hadir';
      const matchesFilter = rsvpFilter === 'all' || attKey === rsvpFilter;
      const term = rsvpSearch.toLowerCase().trim();
      const matchesSearch =
        !term ||
        (m.name && m.name.toLowerCase().includes(term)) ||
        (m.message && m.message.toLowerCase().includes(term));
      return matchesFilter && matchesSearch;
    });
  }, [messages, rsvpFilter, rsvpSearch]);

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) return;

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
      await api.updateInvitation(token, id, {
        slug: slug.trim().toLowerCase(),
        event_date: eventDate,
        status: status,
        detail: detailPayload,
      });

      toast.success('Perubahan detail undangan berhasil disimpan', 'Tersimpan');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memperbarui undangan';
      setError(msg);
      toast.error(msg, 'Gagal Menyimpan');
    } finally {
      setSubmitting(false);
    }
  };

  // WhatsApp Share Generator computed texts
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const generatedUrl = guestName.trim()
    ? `${origin}/${slug}?to=${encodeURIComponent(guestName.trim())}`
    : `${origin}/${slug}`;

  const generatedWaText = `Kepada Yth. ${guestName.trim() || 'Bapak/Ibu/Saudara/i'},\n\nTanpa mengurangi rasa hormat, perkenankan kami mengundang Anda untuk hadir pada acara pernikahan kami:\n\n${groomName || 'Mempelai Pria'} & ${brideName || 'Mempelai Wanita'}\n\nDetail informasi acara dan konfirmasi kehadiran (RSVP) dapat diakses melalui tautan undangan berikut:\n${generatedUrl}\n\nMerupakan suatu kehormatan dan kebahagiaan bagi kami apabila Anda berkenan hadir dan memberikan doa restu kepada kami berdua.\n\nTerima kasih.`;

  const copyToClipboard = (text: string, type: 'link' | 'text') => {
    navigator.clipboard.writeText(text);
    if (type === 'link') {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
      toast.info('Tautan undangan berhasil disalin ke clipboard', 'Tautan Disalin');
    } else {
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
      toast.info('Teks pesan WhatsApp siap kirim berhasil disalin', 'Teks Disalin');
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <p>Memuat data undangan...</p>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${activeTab === 'details' ? styles.createContainer : ''}`}>
      <div className={styles.header}>
        <Link href="/dashboard/invitations" className={styles.backLink}>
          <ArrowLeft size={14} strokeWidth={1.75} />
          <span>Kembali ke Daftar Undangan</span>
        </Link>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <h1 className={styles.title}>Kelola Undangan</h1>
            <p className={styles.subtitle}>
              Atur data mempelai, pantau konfirmasi kehadiran tamu, dan bagikan tautan
            </p>
          </div>
          <Link href={`/${slug}`} target="_blank" rel="noreferrer" className={styles.previewTopBtn}>
            <span>Buka Undangan Publik</span>
            <ExternalLink size={13} strokeWidth={1.75} />
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'details' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('details')}
        >
          <Settings size={15} strokeWidth={1.75} />
          <span>Detail & Desain</span>
        </button>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'layout' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('layout')}
        >
          <LayoutDashboard size={15} strokeWidth={1.75} />
          <span>Susunan Layout</span>
        </button>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'rsvp' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('rsvp')}
        >
          <Users size={15} strokeWidth={1.75} />
          <span>Buku Tamu & RSVP ({messages.length})</span>
        </button>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'share' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('share')}
        >
          <Share2 size={15} strokeWidth={1.75} />
          <span>Tautan Tamu & WhatsApp</span>
        </button>
      </div>

      {error && (
        <div className={styles.errorBanner}>
          <AlertCircle size={16} strokeWidth={1.75} />
          <span>{error}</span>
        </div>
      )}

      {activeTab === 'layout' && (
        <LayoutEditor
          initial={layout}
          onSave={async nextLayout => {
            if (!token) return;
            const response = await api.updateInvitation(token, id, {
              layout: nextLayout,
              status: 'active',
              expected_layout_version: layoutVersion,
            });
            setLayout(nextLayout);
            setLayoutVersion(response.data.layout_version || layoutVersion + 1);
            setStatus('active');
            toast.success('Susunan layout berhasil disimpan', 'Tersimpan');
          }}
        />
      )}

      {/* TAB 1: Detail & Desain */}
      {activeTab === 'details' && (
        <div className={styles.createWorkspace}>
          <form onSubmit={handleSubmit} className={styles.form}>
            {/* Status Undangan */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>1. Status & Tautan</h2>
              <div className={styles.grid3}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Status Undangan</label>
                  <select
                    className={styles.select}
                    value={status}
                    onChange={e => setStatus(e.target.value as Invitation['status'])}
                  >
                    <option value="active">Aktif (Dapat diakses publik)</option>
                    <option value="draft">Draf (Hanya pemilik)</option>
                    <option value="expired">Kedaluwarsa (Nonaktif)</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Slug URL Undangan</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={slug}
                    onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    required
                  />
                  <div className={styles.slugPreview}>Preview: /{slug}</div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Tanggal Acara Utama</label>
                  <input
                    type="date"
                    className={styles.input}
                    value={eventDate}
                    onChange={e => setEventDate(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.formGroup} style={{ gridColumn: 'span 3' }}>
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

            {/* Profil Mempelai */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>2. Profil Mempelai</h2>
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
                    <label className={styles.label}>Nama Lengkap</label>
                    <input
                      type="text"
                      className={styles.input}
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
                      value={groomBirth}
                      onChange={e => setGroomBirth(e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Nama Orang Tua</label>
                    <input
                      type="text"
                      className={styles.input}
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
                    <label className={styles.label}>Nama Lengkap</label>
                    <input
                      type="text"
                      className={styles.input}
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
                      value={brideBirth}
                      onChange={e => setBrideBirth(e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Nama Orang Tua</label>
                    <input
                      type="text"
                      className={styles.input}
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

            {/* Rangkaian Acara Fleksibel */}
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
                  <h2 className={styles.sectionTitle}>3. Rangkaian Acara Fleksibel</h2>
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

            {/* Quotes & Amplop Digital */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>4. Kutipan & Amplop Digital</h2>
              <div className={styles.formGroup}>
                <label className={styles.label}>Kutipan Doa / Kata Mutiara</label>
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
                              gift.platform === 'QRIS'
                                ? 'NMID / Kode Merchant'
                                : 'misal: 1234567890'
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

            {/* Media, Galeri & Musik */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>5. Musik, Galeri Foto & Kisah Cinta</h2>
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
                Kembali
              </Link>
              <button type="submit" className={styles.submitBtn} disabled={submitting}>
                {submitting ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </form>
          <LivePreview template={template} groom={groomName} bride={brideName} date={eventDate} />
        </div>
      )}

      {/* TAB 2: Buku Tamu & Rekap RSVP */}
      {activeTab === 'rsvp' && (
        <div>
          {/* Stat Cards */}
          <div className={styles.statGrid}>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{rsvpStats.total}</div>
              <div className={styles.statLabel}>Total Ucapan Masuk</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue} style={{ color: '#166534' }}>
                {rsvpStats.hadir}
              </div>
              <div className={styles.statLabel}>Konfirmasi Hadir</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue} style={{ color: '#991b1b' }}>
                {rsvpStats.tidakHadir}
              </div>
              <div className={styles.statLabel}>Berhalangan Hadir</div>
            </div>
          </div>

          {/* Toolbar: Filter, Search & Export */}
          {messages.length > 0 && (
            <div className={styles.rsvpToolbar}>
              <div className={styles.rsvpFilterGroup}>
                <button
                  type="button"
                  className={`${styles.filterBtn} ${rsvpFilter === 'all' ? styles.filterBtnActive : ''}`}
                  onClick={() => setRsvpFilter('all')}
                >
                  Semua ({rsvpStats.total})
                </button>
                <button
                  type="button"
                  className={`${styles.filterBtn} ${rsvpFilter === 'hadir' ? styles.filterBtnActive : ''}`}
                  onClick={() => setRsvpFilter('hadir')}
                >
                  Hadir ({rsvpStats.hadir})
                </button>
                <button
                  type="button"
                  className={`${styles.filterBtn} ${rsvpFilter === 'tidak_hadir' ? styles.filterBtnActive : ''}`}
                  onClick={() => setRsvpFilter('tidak_hadir')}
                >
                  Tidak Hadir ({rsvpStats.tidakHadir})
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <div className={styles.rsvpSearchWrap}>
                  <input
                    type="text"
                    placeholder="Cari nama atau ucapan..."
                    value={rsvpSearch}
                    onChange={e => setRsvpSearch(e.target.value)}
                    className={styles.input}
                    style={{ paddingLeft: '32px', height: '36px', fontSize: '12.5px' }}
                  />
                  <Search
                    size={15}
                    style={{
                      position: 'absolute',
                      left: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted, #6b665f)',
                      pointerEvents: 'none',
                    }}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleExportCSV}
                  className={styles.exportBtn}
                  title="Unduh rekap RSVP sebagai file CSV untuk katering atau panitia"
                >
                  <Download size={14} />
                  <span>Unduh CSV</span>
                </button>
              </div>
            </div>
          )}

          {/* List Messages */}
          {messages.length === 0 ? (
            <div className={styles.section} style={{ textAlign: 'center', padding: '48px 20px' }}>
              <MessageSquare
                size={36}
                strokeWidth={1.5}
                style={{ color: 'var(--text-muted, #6b665f)', marginBottom: '12px' }}
              />
              <p style={{ margin: 0, fontWeight: 500, color: 'var(--text-main, #181716)' }}>
                Belum ada ucapan atau konfirmasi kehadiran dari tamu.
              </p>
              <p
                style={{ margin: '6px 0 0', fontSize: '13px', color: 'var(--text-muted, #6b665f)' }}
              >
                Bagikan tautan undangan Anda ke kerabat agar mereka dapat mengisi buku tamu.
              </p>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className={styles.section} style={{ textAlign: 'center', padding: '40px 20px' }}>
              <p style={{ margin: 0, fontWeight: 500, color: 'var(--text-main, #181716)' }}>
                Tidak ada ucapan yang cocok dengan filter atau kata pencarian.
              </p>
              <button
                type="button"
                onClick={() => {
                  setRsvpFilter('all');
                  setRsvpSearch('');
                }}
                className={styles.filterBtn}
                style={{ marginTop: '12px' }}
              >
                Reset Filter
              </button>
            </div>
          ) : (
            <div className={styles.messageList}>
              {filteredMessages.map(msg => {
                const isTidak = (msg.attendance || '').toLowerCase() === 'tidak_hadir';
                const badgeClass = isTidak ? styles.badgeTidakHadir : styles.badgeHadir;
                const badgeText = isTidak ? 'Tidak Hadir' : 'Akan Hadir';

                return (
                  <div key={msg.id} className={styles.messageItem}>
                    <div className={styles.messageTop}>
                      <div className={styles.messageSender}>
                        <span>{msg.name}</span>
                        <span className={badgeClass}>{badgeText}</span>
                      </div>
                      <span className={styles.messageDate}>
                        {new Date(msg.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <div className={styles.messageBody}>{msg.message}</div>
                    <div className={styles.messageActions}>
                      <button
                        type="button"
                        onClick={() => setDeleteMsgTarget(msg)}
                        className={styles.deleteMsgBtn}
                        disabled={deletingMsgId === msg.id}
                      >
                        <Trash2 size={13} strokeWidth={1.75} />
                        <span>Hapus Ucapan</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Tautan Tamu & WhatsApp Share Generator */}
      {activeTab === 'share' && (
        <div className={styles.waBox}>
          <div>
            <h2 className={styles.sectionTitle} style={{ marginBottom: '6px' }}>
              Generator Tautan Undangan Personal
            </h2>
            <p className={styles.sectionDesc} style={{ marginBottom: '16px' }}>
              Buat tautan undangan khusus per nama tamu dan draf pesan WhatsApp siap kirim yang rapi
              dan sopan.
            </p>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Nama Tamu yang Diundang</label>
            <input
              type="text"
              className={styles.input}
              placeholder="misal: Bapak Bambang & Keluarga / Sahabat SMA"
              value={guestName}
              onChange={e => setGuestName(e.target.value)}
            />
            <span className={styles.hint}>
              Nama ini akan disisipkan ke ucapan pembuka pada amplop sampul undangan (&quot;Kepada
              Yth. ...&quot;).
            </span>
          </div>

          <div>
            <label className={styles.label} style={{ marginBottom: '8px' }}>
              Tautan Undangan Tamu
            </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <input
                type="text"
                readOnly
                value={generatedUrl}
                className={styles.input}
                style={{ flex: 1, minWidth: '240px', background: 'var(--bg-primary, #faf9f6)' }}
              />
              <button
                type="button"
                className={`${styles.waBtn} ${styles.waBtnOutline}`}
                onClick={() => copyToClipboard(generatedUrl, 'link')}
              >
                {copiedLink ? (
                  <Check size={14} strokeWidth={2} />
                ) : (
                  <Copy size={14} strokeWidth={1.75} />
                )}
                <span>{copiedLink ? 'Tersalin' : 'Salin Tautan'}</span>
              </button>
            </div>
          </div>

          <div>
            <label className={styles.label} style={{ marginBottom: '8px' }}>
              Draf Pesan WhatsApp Resmi
            </label>
            <div className={styles.waPreviewCard}>{generatedWaText}</div>
          </div>

          <div className={styles.waBtnRow}>
            <button
              type="button"
              className={`${styles.waBtn} ${styles.waBtnOutline}`}
              onClick={() => copyToClipboard(generatedWaText, 'text')}
            >
              {copiedText ? (
                <Check size={14} strokeWidth={2} />
              ) : (
                <Copy size={14} strokeWidth={1.75} />
              )}
              <span>{copiedText ? 'Teks Tersalin' : 'Salin Teks WhatsApp'}</span>
            </button>

            <a
              href={`https://wa.me/?text=${encodeURIComponent(generatedWaText)}`}
              target="_blank"
              rel="noreferrer"
              className={`${styles.waBtn} ${styles.waBtnPrimary}`}
            >
              <Share2 size={14} strokeWidth={1.75} />
              <span>Buka WhatsApp Sekarang</span>
            </a>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Pesan Ucapan */}
      <ConfirmModal
        isOpen={Boolean(deleteMsgTarget)}
        title="Konfirmasi Hapus Ucapan"
        message={`Apakah Anda yakin ingin menghapus ucapan dan konfirmasi kehadiran dari "${deleteMsgTarget?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus Ucapan"
        cancelLabel="Batal"
        loading={Boolean(deletingMsgId)}
        onConfirm={confirmDeleteMessage}
        onCancel={() => setDeleteMsgTarget(null)}
      />
    </div>
  );
}
