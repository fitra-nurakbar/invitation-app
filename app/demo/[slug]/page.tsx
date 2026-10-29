'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/context/ToastContext';
import type { Message } from '@/types';
import {
  Volume2,
  VolumeX,
  Mail,
  Calendar,
  Clock,
  MapPin,
  Copy,
  Check,
  Send,
  Sparkles,
  Heart,
  CalendarPlus,
  Tv,
  X,
  ArrowLeft,
  ShoppingBag,
  Smartphone,
  Monitor,
  RotateCcw,
} from 'lucide-react';
import pubStyles from '@/app/[slug]/page.module.css';
import demoStyles from './demo.module.css';

interface TemplateInfo {
  slug: string;
  name: string;
  price: number;
  description: string;
}

const TEMPLATE_CATALOG: Record<string, TemplateInfo> = {
  'simple-free': {
    slug: 'simple-free',
    name: 'Simple Free',
    price: 0,
    description: 'Desain bersih dan esensial, cocok untuk pernikahan intim bernuansa hangat.',
  },
  'elegant-rose': {
    slug: 'elegant-rose',
    name: 'Elegant Rose',
    price: 150000,
    description: 'Nuansa mawar romantis nan anggun dengan aksen floral klasik.',
  },
  'modern-minimalist': {
    slug: 'modern-minimalist',
    name: 'Modern Minimalist',
    price: 100000,
    description: 'Tata letak modern garis tegas dengan tipografi kontemporer.',
  },
  'rustic-garden': {
    slug: 'rustic-garden',
    name: 'Rustic Garden',
    price: 200000,
    description: 'Sentuhan alam organik dengan nuansa kertas hangat dan dedaunan.',
  },
  'royal-gold': {
    slug: 'royal-gold',
    name: 'Royal Gold',
    price: 250000,
    description: 'Kemewahan klasik bernuansa emas dan monogram megah.',
  },
};

export default function TemplateDemoPage() {
  const params = useParams();
  const toast = useToast();

  const rawSlug = (params?.slug as string) || 'modern-minimalist';
  const templateSlug = TEMPLATE_CATALOG[rawSlug] ? rawSlug : 'modern-minimalist';
  const currentTemplate = TEMPLATE_CATALOG[templateSlug];

  // Demo bar height calculation for positioning
  const demoBarRef = useRef<HTMLElement | null>(null);
  const [demoBarHeight, setDemoBarHeight] = useState(54);

  useEffect(() => {
    const handleResize = () => {
      if (demoBarRef.current) {
        setDemoBarHeight(demoBarRef.current.offsetHeight);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Cover & Audio state
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Device simulation mode: responsive (full width) or mobile (simulated phone)
  const [deviceMode, setDeviceMode] = useState<'responsive' | 'mobile'>('responsive');

  // Live countdown state (simulated 30 days ahead)
  const [timeLeft, setTimeLeft] = useState({ days: 30, hours: 14, minutes: 25, seconds: 40 });

  useEffect(() => {
    const target = Date.now() + 30 * 24 * 60 * 60 * 1000;
    const interval = setInterval(() => {
      const diff = target - Date.now();
      if (diff <= 0) {
        clearInterval(interval);
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Audio Playback Handlers
  const handleOpenInvitation = () => {
    setIsOpen(true);
    if (audioRef.current) {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(err => {
          console.warn('Autoplay audio blocked or error:', err);
        });
    }
  };

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(console.error);
    }
  };

  // Handle Copy Rekening
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success(`Nomor rekening ${text} berhasil disalin ke clipboard`, 'Berhasil Disalin');
    setTimeout(() => setCopiedIndex(null), 3000);
  };

  // RSVP Form state (Interactive simulation)
  const [guestName, setGuestName] = useState('Budi Santoso');
  const [attendance, setAttendance] = useState('hadir');
  const [guestMessage, setGuestMessage] = useState('');
  const [submittingRsvp, setSubmittingRsvp] = useState(false);

  // Simulated guest messages
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'demo-msg-1',
      invitation_id: 'demo-inv',
      name: 'Keluarga Bpk. Bambang Soediro',
      message:
        'Selamat menempuh hidup baru untuk Arya dan Dian. Semoga menjadi keluarga yang sakinah, mawaddah, warahmah.',
      attendance: 'hadir',
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: 'demo-msg-2',
      invitation_id: 'demo-inv',
      name: 'Anisa & Dimas',
      message:
        'Barakallahu lakum wa baraka alaikum! Bahagia selalu dan senantiasa diberkahi Allah SWT.',
      attendance: 'hadir',
      created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
    },
    {
      id: 'demo-msg-3',
      invitation_id: 'demo-inv',
      name: 'Rudi Hartono (Alumni FTUI 2015)',
      message:
        'Selamat sobatku Arya! Mohon maaf belum bisa hadir langsung karena dinas luar kota, titip doa terbaik untuk kalian berdua.',
      attendance: 'tidak_hadir',
      created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    },
  ]);

  const handleRsvpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) {
      toast.error('Nama tamu wajib diisi', 'Validasi Gagal');
      return;
    }
    if (!guestMessage.trim()) {
      toast.error('Ucapan doa restu wajib diisi', 'Validasi Gagal');
      return;
    }

    setSubmittingRsvp(true);
    setTimeout(() => {
      const newMsg: Message = {
        id: `demo-msg-${Date.now()}`,
        invitation_id: 'demo-inv',
        name: guestName.trim(),
        message: guestMessage.trim(),
        attendance,
        created_at: new Date().toISOString(),
      };
      setMessages([newMsg, ...messages]);
      setGuestMessage('');
      setSubmittingRsvp(false);
      toast.info(
        'Simulasi RSVP berhasil dicatat! Pada undangan asli, ucapan ini akan langsung tersimpan di database.',
        'Pratinjau Interaktif'
      );
    }, 400);
  };

  // Lightbox state
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null);

  // Resolve theme class based on template slug
  const getThemeClass = (tplSlug: string) => {
    switch (tplSlug) {
      case 'elegant-rose':
        return pubStyles.theme_elegant_rose;
      case 'modern-minimalist':
        return pubStyles.theme_modern_minimalist;
      case 'rustic-garden':
        return pubStyles.theme_rustic_garden;
      case 'royal-gold':
        return pubStyles.theme_royal_gold;
      default:
        return '';
    }
  };

  const themeClass = getThemeClass(templateSlug);

  // Sample static data for realistic preview
  const groomName = 'Arya Pratama Wijaya, S.T.';
  const brideName = 'Raden Ajeng Dian Sastrowardoyo';
  const musicUrl =
    'https://assets.mixkit.co/music/preview/mixkit-romantic-wedding-piano-tune-680.mp3';

  const events = [
    {
      name: 'Akad Nikah',
      date: 'Jumat, 20 November 2026',
      time: '08:00 - 10:00 WIB',
      place: 'Masjid Raya Al-Bina Senayan',
      address: 'Jl. Pintu Satu Senayan, Gelora, Tanah Abang, Kota Jakarta Pusat',
      maps_url: 'https://maps.google.com/?q=Masjid+Al-Bina+Senayan',
    },
    {
      name: 'Resepsi Pernikahan',
      date: 'Jumat, 20 November 2026',
      time: '19:00 - 22:00 WIB',
      place: 'Grand Ballroom Hotel Fairmont Jakarta',
      address: 'Jl. Asia Afrika No.8, Gelora, Tanah Abang, Kota Jakarta Pusat',
      maps_url: 'https://maps.google.com/?q=Fairmont+Jakarta',
    },
  ];

  const galleries = [
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=600&q=80',
  ];

  const gifts = [
    {
      platform: 'Bank BCA',
      id: '8830192841',
      name: 'Arya Pratama Wijaya',
    },
    {
      platform: 'Bank Mandiri',
      id: '1370019284918',
      name: 'Raden Ajeng Dian S',
    },
    {
      platform: 'QRIS',
      id: 'NMID: ID102003928194',
      name: 'Arya & Dian Wedding',
      qris_image:
        'https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=https://invitation.example.com/demo/modern-minimalist',
    },
  ];

  const formatPrice = (price: number) => {
    if (price === 0) return 'Gratis';
    return `Rp ${price.toLocaleString('id-ID')}`;
  };

  // Render Inner Invitation Content
  const renderInvitationContent = () => (
    <div
      className={`${pubStyles.wrapper} ${themeClass} ${
        deviceMode === 'mobile'
          ? `${demoStyles.mobileWrapper} ${!isOpen ? demoStyles.mobileWrapperCoverClosed : ''}`
          : ''
      }`}
    >
      {/* Background Audio */}
      <audio ref={audioRef} loop src={musicUrl} />

      {/* Floating Music Toggle Button */}
      {isOpen && (
        <button
          type="button"
          className={pubStyles.musicBtn}
          onClick={toggleAudio}
          title={isPlaying ? 'Matikan Musik' : 'Putar Musik'}
          aria-label={isPlaying ? 'Matikan Musik' : 'Putar Musik'}
        >
          {isPlaying ? (
            <Volume2 size={18} strokeWidth={1.75} />
          ) : (
            <VolumeX size={18} strokeWidth={1.75} />
          )}
        </button>
      )}

      {/* ─── COVER SCREEN / ENVELOPE MODAL ─── */}
      <div
        className={`${pubStyles.coverModal} ${isOpen ? pubStyles.coverModalHidden : ''} ${
          deviceMode === 'mobile' ? demoStyles.demoCoverModalMobile : demoStyles.demoCoverModal
        }`}
      >
        <div className={pubStyles.coverFrame}>
          <div className={pubStyles.coverInner}>
            <span className={pubStyles.coverBadge}>Undangan Pernikahan</span>
            <h1 className={pubStyles.coverNames}>
              Arya{' '}
              <span
                style={{
                  fontStyle: 'italic',
                  fontWeight: 400,
                  margin: '0 6px',
                  color: 'var(--accent-classic, #8a704c)',
                }}
              >
                &amp;
              </span>{' '}
              Dian
            </h1>

            <div className={pubStyles.coverDivider}>
              <Heart size={14} strokeWidth={1.5} />
            </div>

            <div className={pubStyles.coverGuestLabel}>Kepada Yth. Bapak/Ibu/Saudara/i:</div>
            <div className={pubStyles.coverGuestName}>Tamu Undangan Terhormat</div>

            <div>
              <button type="button" className={pubStyles.openButton} onClick={handleOpenInvitation}>
                <Mail size={16} strokeWidth={1.75} />
                <span>Buka Undangan</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── MAIN CONTENT ─── */}
      <main className={pubStyles.mainContainer}>
        {/* HERO SECTION */}
        <section className={pubStyles.hero}>
          <div className={pubStyles.heroFrame}>
            <p className={pubStyles.heroSub}>Walimatul &apos;Urs</p>
            <h1 className={pubStyles.heroTitle}>Arya &amp; Dian</h1>
            <div className={pubStyles.heroDate}>
              <Calendar size={14} strokeWidth={1.75} />
              <span>Jumat, 20 November 2026</span>
            </div>

            {/* Countdown */}
            <div className={pubStyles.countdown}>
              <div className={pubStyles.countdownItem}>
                <span className={pubStyles.countdownValue}>{timeLeft.days}</span>
                <span className={pubStyles.countdownLabel}>Hari</span>
              </div>
              <div className={pubStyles.countdownItem}>
                <span className={pubStyles.countdownValue}>{timeLeft.hours}</span>
                <span className={pubStyles.countdownLabel}>Jam</span>
              </div>
              <div className={pubStyles.countdownItem}>
                <span className={pubStyles.countdownValue}>{timeLeft.minutes}</span>
                <span className={pubStyles.countdownLabel}>Menit</span>
              </div>
              <div className={pubStyles.countdownItem}>
                <span className={pubStyles.countdownValue}>{timeLeft.seconds}</span>
                <span className={pubStyles.countdownLabel}>Detik</span>
              </div>
            </div>
          </div>
        </section>

        {/* QUOTE SECTION */}
        <section className={pubStyles.section}>
          <div className={pubStyles.quoteBox}>
            <p className={pubStyles.quoteText}>
              &quot;Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan
              pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa
              tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang.&quot;
            </p>
            <div className={pubStyles.quoteSource}>QS. Ar-Rum: 21</div>
          </div>
        </section>

        {/* COUPLE PROFILES */}
        <section className={pubStyles.section}>
          <div className={pubStyles.sectionHeader}>
            <span className={pubStyles.sectionTag}>Kedua Mempelai</span>
            <h2 className={pubStyles.sectionTitle}>Mempelai Bahagia</h2>
          </div>

          <div className={pubStyles.coupleGrid}>
            {/* Groom */}
            <div className={pubStyles.coupleCard}>
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80"
                alt={groomName}
                className={pubStyles.couplePhoto}
              />
              <h3 className={pubStyles.coupleName}>{groomName}</h3>
              <div className={pubStyles.coupleOrigin}>Jakarta Selatan</div>
              <p className={pubStyles.coupleParents}>
                Putra pertama dari Bpk. Prof. Dr. Bambang Wijaya &amp; Ibu Hj. Siti Aminah
              </p>
            </div>

            <div className={pubStyles.coupleDivider}>
              <span>&amp;</span>
            </div>

            {/* Bride */}
            <div className={pubStyles.coupleCard}>
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
                alt={brideName}
                className={pubStyles.couplePhoto}
              />
              <h3 className={pubStyles.coupleName}>{brideName}</h3>
              <div className={pubStyles.coupleOrigin}>D.I. Yogyakarta</div>
              <p className={pubStyles.coupleParents}>
                Putri kedua dari Bpk. Ir. Hendra Sastrowardoyo &amp; Ibu Dra. Ratna Dewi
              </p>
            </div>
          </div>
        </section>

        {/* LOVE STORY SECTION */}
        <section className={pubStyles.section}>
          <div className={pubStyles.sectionHeader}>
            <span className={pubStyles.sectionTag}>Perjalanan Kami</span>
            <h2 className={pubStyles.sectionTitle}>Kisah Cinta</h2>
          </div>
          <div className={pubStyles.storyBox}>
            <h3 className={pubStyles.storyTitle}>Pertemuan Pertama Hingga Janji Suci</h3>
            <p className={pubStyles.storyBody}>
              Takdir mempertemukan kami dalam satu proyek desain di Jakarta Selatan. Tiga tahun
              saling menguatkan dan bertumbuh dalam kebaikan, kini kami memantapkan langkah menuju
              ikatan pernikahan yang suci dan diridhai Allah SWT.
            </p>
          </div>
        </section>

        {/* EVENT SCHEDULE SECTION */}
        <section className={pubStyles.section}>
          <div className={pubStyles.sectionHeader}>
            <span className={pubStyles.sectionTag}>Rangkaian Acara</span>
            <h2 className={pubStyles.sectionTitle}>Waktu &amp; Lokasi</h2>
          </div>

          <div className={pubStyles.eventGrid}>
            {events.map((evt, idx) => (
              <div key={idx} className={pubStyles.eventCard}>
                <h3 className={pubStyles.eventName}>{evt.name}</h3>
                <div className={pubStyles.eventDetail}>
                  <div className={pubStyles.eventDetailRow}>
                    <Calendar size={14} strokeWidth={1.75} className={pubStyles.eventIcon} />
                    <span>{evt.date}</span>
                  </div>
                  <div className={pubStyles.eventDetailRow}>
                    <Clock size={14} strokeWidth={1.75} className={pubStyles.eventIcon} />
                    <span>{evt.time}</span>
                  </div>
                  <div className={pubStyles.eventDetailRow}>
                    <MapPin size={14} strokeWidth={1.75} className={pubStyles.eventIcon} />
                    <strong>{evt.place}</strong>
                  </div>
                  <p className={pubStyles.eventAddress}>{evt.address}</p>
                </div>

                <div className={pubStyles.eventActionRow}>
                  <a
                    href={evt.maps_url}
                    target="_blank"
                    rel="noreferrer"
                    className={pubStyles.mapsButton}
                  >
                    <MapPin size={13} strokeWidth={1.75} />
                    <span>Petunjuk Google Maps</span>
                  </a>
                  <a
                    href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(evt.name + ' - Arya & Dian')}&location=${encodeURIComponent(evt.place)}`}
                    target="_blank"
                    rel="noreferrer"
                    className={pubStyles.calendarButton}
                  >
                    <CalendarPlus size={13} strokeWidth={1.75} />
                    <span>Simpan ke Kalender</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* GALLERY SECTION */}
        <section className={pubStyles.section}>
          <div className={pubStyles.sectionHeader}>
            <span className={pubStyles.sectionTag}>Momen Bahagia</span>
            <h2 className={pubStyles.sectionTitle}>Galeri Foto</h2>
          </div>
          <div className={pubStyles.galleryGrid}>
            {galleries.map((photo, idx) => (
              <div
                key={idx}
                className={pubStyles.galleryItem}
                onClick={() => setLightboxPhoto(photo)}
              >
                <img src={photo} alt={`Galeri ${idx + 1}`} className={pubStyles.galleryImg} />
              </div>
            ))}
          </div>
        </section>

        {/* LIVE STREAMING */}
        <section className={pubStyles.section}>
          <div className={pubStyles.sectionHeader}>
            <span className={pubStyles.sectionTag}>Virtual Event</span>
            <h2 className={pubStyles.sectionTitle}>Siaran Langsung</h2>
          </div>
          <div className={pubStyles.streamingCard}>
            <Tv
              size={28}
              strokeWidth={1.5}
              style={{ color: 'var(--accent-classic, #8a704c)', marginBottom: '12px' }}
            />
            <p className={pubStyles.streamingDesc}>
              Bagi keluarga dan kerabat yang berhalangan hadir secara langsung, Anda dapat
              menyaksikan prosesi pernikahan kami secara virtual melalui tautan berikut:
            </p>
            <div>
              <a
                href="https://youtube.com/live"
                target="_blank"
                rel="noreferrer"
                className={pubStyles.streamingBtn}
              >
                <Tv size={14} strokeWidth={1.75} />
                <span>Tonton Siaran Langsung</span>
              </a>
            </div>
          </div>
        </section>

        {/* DIGITAL GIFTS / AMPLOP DIGITAL */}
        <section className={pubStyles.section}>
          <div className={pubStyles.sectionHeader}>
            <span className={pubStyles.sectionTag}>Tanda Kasih</span>
            <h2 className={pubStyles.sectionTitle}>Amplop Digital</h2>
            <p className={pubStyles.giftSubtitle}>
              Doa restu Anda merupakan karunia terindah bagi kami. Namun jika Anda bermaksud memberi
              tanda kasih, dapat mengirimkan melalui tautan berikut:
            </p>
          </div>

          <div className={pubStyles.giftList}>
            {gifts.map((gift, idx) => {
              const isQris = gift.platform?.toUpperCase().includes('QRIS');
              return (
                <div key={idx} className={pubStyles.giftCard}>
                  <div className={pubStyles.giftBank}>{gift.platform}</div>

                  {gift.qris_image && (
                    <div className={pubStyles.giftQrisWrap}>
                      <img
                        src={gift.qris_image}
                        alt={`QRIS ${gift.name}`}
                        className={pubStyles.giftQrisImg}
                      />
                    </div>
                  )}

                  <div className={pubStyles.giftNumber}>{gift.id}</div>
                  <div className={pubStyles.giftHolder}>a.n {gift.name}</div>
                  <button
                    className={pubStyles.copyBtn}
                    onClick={() => handleCopy(gift.id, idx)}
                    type="button"
                  >
                    {copiedIndex === idx ? (
                      <>
                        <Check size={13} strokeWidth={2} />
                        <span>Tersalin ke Clipboard</span>
                      </>
                    ) : (
                      <>
                        <Copy size={13} strokeWidth={1.75} />
                        <span>{isQris ? 'Salin Kode / NMID QRIS' : 'Salin Nomor Rekening'}</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* GUESTBOOK & RSVP SECTION */}
        <section className={pubStyles.section}>
          <div className={pubStyles.sectionHeader}>
            <span className={pubStyles.sectionTag}>Buku Tamu</span>
            <h2 className={pubStyles.sectionTitle}>Doa &amp; Ucapan Restu</h2>
          </div>

          {/* Form */}
          <form onSubmit={handleRsvpSubmit} className={pubStyles.rsvpForm}>
            <div className={pubStyles.formGroup}>
              <label className={pubStyles.label}>Nama Tamu</label>
              <input
                type="text"
                className={pubStyles.input}
                placeholder="Nama Anda"
                value={guestName}
                onChange={e => setGuestName(e.target.value)}
                required
              />
            </div>

            <div className={pubStyles.formGroup}>
              <label className={pubStyles.label}>Konfirmasi Kehadiran</label>
              <select
                className={pubStyles.select}
                value={attendance}
                onChange={e => setAttendance(e.target.value)}
              >
                <option value="hadir">Hadir</option>
                <option value="tidak_hadir">Tidak Hadir</option>
              </select>
            </div>

            <div className={pubStyles.formGroup}>
              <label className={pubStyles.label}>Ucapan &amp; Doa Restu</label>
              <textarea
                className={pubStyles.textarea}
                placeholder="Tuliskan ucapan dan doa terbaik untuk kedua mempelai..."
                value={guestMessage}
                onChange={e => setGuestMessage(e.target.value)}
                rows={3}
                required
              />
            </div>

            <button type="submit" className={pubStyles.submitRsvp} disabled={submittingRsvp}>
              <Send size={14} strokeWidth={1.75} />
              <span>{submittingRsvp ? 'Mengirim...' : 'Kirim Ucapan & Doa'}</span>
            </button>
          </form>

          {/* Messages Feed */}
          <div className={pubStyles.messageList}>
            {messages.map(msg => {
              const isTidak = msg.attendance === 'tidak_hadir';
              const badgeClass = isTidak ? pubStyles.attendanceTidak : pubStyles.attendanceHadir;
              const badgeText = isTidak ? 'Tidak Hadir' : 'Hadir';

              return (
                <div key={msg.id} className={pubStyles.messageCard}>
                  <div className={pubStyles.messageHeader}>
                    <span className={pubStyles.messageAuthor}>{msg.name}</span>
                    <span className={`${pubStyles.attendanceBadge} ${badgeClass}`}>
                      {badgeText}
                    </span>
                  </div>
                  <p className={pubStyles.messageContent}>{msg.message}</p>
                  <span className={pubStyles.messageTime}>
                    {new Date(msg.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* FOOTER */}
        <footer className={pubStyles.footer}>
          <div className={pubStyles.footerNames}>Arya &amp; Dian</div>
          <p className={pubStyles.footerThanks}>Terima kasih atas doa dan restu Anda</p>
          <div className={pubStyles.footerApp}>Invitation App</div>
        </footer>
      </main>

      {/* Lightbox Modal */}
      {lightboxPhoto && (
        <div className={pubStyles.lightbox} onClick={() => setLightboxPhoto(null)}>
          <button
            className={pubStyles.lightboxClose}
            onClick={() => setLightboxPhoto(null)}
            type="button"
          >
            <X size={20} strokeWidth={2} />
          </button>
          <img
            src={lightboxPhoto}
            alt="Perbesar Foto"
            className={pubStyles.lightboxImg}
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );

  return (
    <div style={{ '--demo-bar-height': `${demoBarHeight}px` } as React.CSSProperties}>
      {/* ─── FLOATING TOP DEMO CONTROLS ─── */}
      <header ref={demoBarRef} className={demoStyles.demoBar}>
        <div className={demoStyles.demoInfo}>
          <div className={demoStyles.demoBadge}>
            <Sparkles size={12} strokeWidth={2} />
            <span>Mode Demo</span>
          </div>

          <div>
            <span className={demoStyles.demoTemplateName}>{currentTemplate.name}</span>
            <span className={demoStyles.demoLabel}> ({formatPrice(currentTemplate.price)})</span>
          </div>
        </div>

        {/* Quick Theme Switcher */}
        <div className={demoStyles.switcher}>
          {Object.values(TEMPLATE_CATALOG).map(t => (
            <Link
              key={t.slug}
              href={`/demo/${t.slug}`}
              className={`${demoStyles.switcherBtn} ${
                templateSlug === t.slug ? demoStyles.switcherBtnActive : ''
              }`}
            >
              {t.name}
            </Link>
          ))}
        </div>

        {/* Device View Toggle */}
        <div className={demoStyles.deviceToggle}>
          <button
            type="button"
            className={`${demoStyles.deviceToggleBtn} ${
              deviceMode === 'responsive' ? demoStyles.deviceToggleBtnActive : ''
            }`}
            onClick={() => setDeviceMode('responsive')}
            title="Tampilan Penuh Layar"
          >
            <Monitor size={13} strokeWidth={1.75} />
            <span>Layar Penuh</span>
          </button>
          <button
            type="button"
            className={`${demoStyles.deviceToggleBtn} ${
              deviceMode === 'mobile' ? demoStyles.deviceToggleBtnActive : ''
            }`}
            onClick={() => setDeviceMode('mobile')}
            title="Simulasi Tampilan Ponsel (430px)"
          >
            <Smartphone size={13} strokeWidth={1.75} />
            <span>Ponsel</span>
          </button>
        </div>

        {/* Demo Call-to-actions */}
        <div className={demoStyles.demoActions}>
          {isOpen && (
            <button
              type="button"
              className={demoStyles.actionBtnOutline}
              onClick={() => {
                setIsOpen(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              title="Tutup kembali dan lihat sampul pembuka"
            >
              <RotateCcw size={13} strokeWidth={1.75} />
              <span>Sampul Depan</span>
            </button>
          )}

          <Link href="/dashboard/templates" className={demoStyles.actionBtnBack}>
            <ArrowLeft size={13} strokeWidth={1.75} />
            <span>Katalog Template</span>
          </Link>

          <Link href="/dashboard/templates" className={demoStyles.actionBtnSelect}>
            <ShoppingBag size={13} strokeWidth={1.75} />
            <span>Pesan Template Ini</span>
          </Link>
        </div>
      </header>

      {/* ─── INVITATION CONTAINER (RESPONSIVE OR PHONE FRAME) ─── */}
      {deviceMode === 'mobile' ? (
        <div className={demoStyles.mobileBackdrop}>
          <div className={demoStyles.mobileFrameContainer}>{renderInvitationContent()}</div>
        </div>
      ) : (
        renderInvitationContent()
      )}
    </div>
  );
}
