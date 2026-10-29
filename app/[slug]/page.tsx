'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import type { Invitation, InvitationDetail, Message, WeddingEvent, WeddingGift } from '@/types';
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
  AlertCircle,
  CheckCircle2,
  Sparkles,
  User,
  Heart,
  CalendarPlus,
  Tv,
  X,
} from 'lucide-react';
import styles from './page.module.css';

export default function PublicInvitationPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params?.slug as string;
  const rawGuestParam = searchParams.get('to');
  const guestParam = rawGuestParam?.trim() || 'Tamu Undangan';

  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Cover state
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Countdown state
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // RSVP Form state (pre-fill with guestParam if provided)
  const [guestName, setGuestName] = useState(rawGuestParam ? rawGuestParam.trim() : '');
  const [attendance, setAttendance] = useState('hadir');
  const [guestMessage, setGuestMessage] = useState('');
  const [submittingRsvp, setSubmittingRsvp] = useState(false);
  const [rsvpSuccess, setRsvpSuccess] = useState(false);
  const [rsvpError, setRsvpError] = useState<string | null>(null);

  // Copy rekening state
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Lightbox state
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    Promise.all([api.getInvitationBySlug(slug), api.getMessages(slug).catch(() => ({ data: [] }))])
      .then(([invRes, msgRes]) => {
        if (!invRes.data) {
          setNotFound(true);
        } else {
          setInvitation(invRes.data);
          setMessages(msgRes.data || []);
        }
      })
      .catch(err => {
        console.error(err);
        setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  // Sync guest name when rawGuestParam is available
  useEffect(() => {
    if (rawGuestParam && rawGuestParam.trim()) {
      setGuestName(rawGuestParam.trim());
    }
  }, [rawGuestParam]);

  // Countdown effect
  useEffect(() => {
    if (!invitation?.event_date) return;

    const target = new Date(invitation.event_date).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(interval);
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [invitation?.event_date]);

  const handleOpenInvitation = () => {
    setIsOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (audioRef.current) {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(err => {
          console.log('Audio autoplay prevented:', err);
        });
    }
  };

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !guestMessage.trim()) return;

    setSubmittingRsvp(true);
    setRsvpError(null);

    try {
      const res = await api.postMessage(slug, {
        name: guestName.trim(),
        message: guestMessage.trim(),
        attendance,
      });

      if (res.data) {
        setMessages(prev => [res.data, ...prev]);
      }
      setGuestMessage('');
      setRsvpSuccess(true);
      setTimeout(() => setRsvpSuccess(false), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mengirim ucapan';
      setRsvpError(msg);
    } finally {
      setSubmittingRsvp(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingWrapper}>
        <div className={styles.loadingContent}>
          <Sparkles size={28} strokeWidth={1.5} className={styles.loadingIcon} />
          <p className={styles.loadingText}>Memuat Undangan...</p>
        </div>
      </div>
    );
  }

  if (notFound || !invitation) {
    return (
      <div className={styles.notFoundWrapper}>
        <div className={styles.notFoundContent}>
          <AlertCircle size={40} strokeWidth={1.5} className={styles.notFoundIcon} />
          <h1 className={styles.notFoundTitle}>Undangan Tidak Ditemukan</h1>
          <p className={styles.notFoundText}>
            Tautan undangan ini tidak ditemukan atau masa aktifnya telah berakhir.
          </p>
        </div>
      </div>
    );
  }

  // Parse detail
  const detail = (invitation.detail || {}) as InvitationDetail;
  const groomName =
    typeof detail.groom === 'object' ? detail.groom?.name : detail.groom || 'Mempelai Pria';
  const groomOrigin = typeof detail.groom === 'object' ? detail.groom?.place_of_birth : '';
  const groomParents =
    typeof detail.groom === 'object' ? detail.groom?.parent : detail.groom_parents || '';
  const groomPhoto = typeof detail.groom === 'object' ? detail.groom?.photo : '';

  const brideName =
    typeof detail.bride === 'object' ? detail.bride?.name : detail.bride || 'Mempelai Wanita';
  const brideOrigin = typeof detail.bride === 'object' ? detail.bride?.place_of_birth : '';
  const brideParents =
    typeof detail.bride === 'object' ? detail.bride?.parent : detail.bride_parents || '';
  const bridePhoto = typeof detail.bride === 'object' ? detail.bride?.photo : '';

  const quote =
    detail.quotes?.quote ||
    'Dan di antara tanda-tanda kebesaran-Nya ialah Dia menciptakan pasangan-pasangan untukmu...';
  const quoteAttribution = detail.quotes?.attribution || 'QS. Ar-Rum: 21';

  const musicUrl =
    detail.music || 'https://assets.mixkit.co/music/preview/mixkit-wedding-waltz-piano-562.mp3';

  const events: WeddingEvent[] =
    Array.isArray(detail.wedding_event) && detail.wedding_event.length > 0
      ? detail.wedding_event
      : [
          {
            name: 'Akad Nikah',
            date: invitation.event_date,
            time: '08:00 - 10:00 WIB',
            place: detail.akad?.place || 'Lokasi Akad',
            address: 'Alamat lengkap lokasi acara',
            maps_url: detail.venue_maps_url || '',
          },
          {
            name: 'Resepsi Pernikahan',
            date: invitation.event_date,
            time: '11:00 - 14:00 WIB',
            place: detail.resepsi?.place || 'Lokasi Resepsi',
            address: 'Alamat lengkap lokasi acara',
            maps_url: detail.venue_maps_url || '',
          },
        ];

  const gifts: WeddingGift[] = Array.isArray(detail.wedding_gift) ? detail.wedding_gift : [];
  const galleryPhotos: string[] =
    detail.gallery && Array.isArray(detail.gallery.photos) ? detail.gallery.photos : [];

  const formattedEventDate = new Date(invitation.event_date).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Multi-theme class resolver
  const templateSlug = invitation.template?.slug || 'simple-free';
  const themeClass =
    templateSlug === 'elegant-rose'
      ? styles.theme_elegant_rose
      : templateSlug === 'modern-minimalist'
        ? styles.theme_modern_minimalist
        : templateSlug === 'rustic-garden'
          ? styles.theme_rustic_garden
          : templateSlug === 'royal-gold'
            ? styles.theme_royal_gold
            : '';

  // Google Calendar URL Generator
  const getGoogleCalendarUrl = (evt: WeddingEvent) => {
    const title = `${evt.name}: ${groomName} & ${brideName}`;
    let dateStr = evt.date ? evt.date.split('T')[0].replace(/-/g, '') : '';
    if (!dateStr && invitation.event_date) {
      dateStr = invitation.event_date.split('T')[0].replace(/-/g, '');
    }
    const dates = `${dateStr}T020000Z/${dateStr}T060000Z`;
    const location = [evt.place, evt.address].filter(Boolean).join(', ');
    const detailsText = `Undangan Pernikahan ${groomName} & ${brideName}. Acara ${evt.name} bertempat di ${location}.`;
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${dates}&details=${encodeURIComponent(detailsText)}&location=${encodeURIComponent(location)}`;
  };

  return (
    <div className={`${styles.wrapper} ${themeClass}`}>
      {/* Background Audio */}
      <audio ref={audioRef} loop src={musicUrl} />

      {/* Floating Music Button */}
      {isOpen && (
        <button
          className={styles.musicBtn}
          onClick={toggleMusic}
          title={isPlaying ? 'Heningkan Musik' : 'Putar Musik'}
          type="button"
        >
          {isPlaying ? (
            <Volume2 size={18} strokeWidth={1.75} />
          ) : (
            <VolumeX size={18} strokeWidth={1.75} />
          )}
        </button>
      )}

      {/* Lightbox Modal */}
      {lightboxPhoto && (
        <div className={styles.lightbox} onClick={() => setLightboxPhoto(null)}>
          <button
            className={styles.lightboxClose}
            type="button"
            onClick={() => setLightboxPhoto(null)}
          >
            <X size={24} strokeWidth={2} />
          </button>
          <img
            src={lightboxPhoto}
            alt="Foto Galeri Penuh"
            className={styles.lightboxImg}
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}

      {/* ─── Cover Modal ─── */}
      <div className={`${styles.coverModal} ${isOpen ? styles.coverModalHidden : ''}`}>
        <div className={styles.coverFrame}>
          <div className={styles.coverInner}>
            <span className={styles.coverBadge}>Undangan Pernikahan</span>
            <h1 className={styles.coverNames}>
              {groomName.split(' ')[0]} & {brideName.split(' ')[0]}
            </h1>
            <div className={styles.coverDivider}>
              <Heart size={14} strokeWidth={1.5} />
            </div>
            <div className={styles.coverGuestLabel}>Kepada Yth. Bapak/Ibu/Saudara/i:</div>
            <div className={styles.coverGuestName}>{guestParam}</div>
            <div>
              <button className={styles.openButton} onClick={handleOpenInvitation} type="button">
                <Mail size={16} strokeWidth={1.75} />
                <span>Buka Undangan</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Main Content ─── */}
      <main className={styles.mainContainer}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroFrame}>
            <p className={styles.heroSub}>Walimatul &apos;Urs</p>
            <h1 className={styles.heroTitle}>
              {groomName.split(' ')[0]} & {brideName.split(' ')[0]}
            </h1>
            <div className={styles.heroDate}>
              <Calendar size={14} strokeWidth={1.75} />
              <span>{formattedEventDate}</span>
            </div>

            {/* Countdown */}
            <div className={styles.countdown}>
              <div className={styles.countdownItem}>
                <span className={styles.countdownValue}>{timeLeft.days}</span>
                <span className={styles.countdownLabel}>Hari</span>
              </div>
              <div className={styles.countdownItem}>
                <span className={styles.countdownValue}>{timeLeft.hours}</span>
                <span className={styles.countdownLabel}>Jam</span>
              </div>
              <div className={styles.countdownItem}>
                <span className={styles.countdownValue}>{timeLeft.minutes}</span>
                <span className={styles.countdownLabel}>Menit</span>
              </div>
              <div className={styles.countdownItem}>
                <span className={styles.countdownValue}>{timeLeft.seconds}</span>
                <span className={styles.countdownLabel}>Detik</span>
              </div>
            </div>
          </div>
        </section>

        {/* Quotes Section */}
        <section className={styles.section}>
          <div className={styles.quoteBox}>
            <p className={styles.quoteText}>&quot;{quote}&quot;</p>
            {quoteAttribution && <div className={styles.quoteSource}>{quoteAttribution}</div>}
          </div>
        </section>

        {/* Couple Section */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTag}>Kedua Mempelai</span>
            <h2 className={styles.sectionTitle}>Mempelai Bahagia</h2>
          </div>

          <div className={styles.coupleGrid}>
            {/* Groom */}
            <div className={styles.coupleCard}>
              {groomPhoto ? (
                <img src={groomPhoto} alt={groomName} className={styles.couplePhoto} />
              ) : (
                <div className={styles.coupleAvatar}>
                  <User size={24} strokeWidth={1.5} />
                </div>
              )}
              <h3 className={styles.coupleName}>{groomName}</h3>
              {groomOrigin && <div className={styles.coupleOrigin}>{groomOrigin}</div>}
              {groomParents && <p className={styles.coupleParents}>{groomParents}</p>}
            </div>

            <div className={styles.coupleDivider}>
              <span>&</span>
            </div>

            {/* Bride */}
            <div className={styles.coupleCard}>
              {bridePhoto ? (
                <img src={bridePhoto} alt={brideName} className={styles.couplePhoto} />
              ) : (
                <div className={styles.coupleAvatar}>
                  <User size={24} strokeWidth={1.5} />
                </div>
              )}
              <h3 className={styles.coupleName}>{brideName}</h3>
              {brideOrigin && <div className={styles.coupleOrigin}>{brideOrigin}</div>}
              {brideParents && <p className={styles.coupleParents}>{brideParents}</p>}
            </div>
          </div>
        </section>

        {/* Love Story Section (if available) */}
        {detail.love_story && (detail.love_story.title || detail.love_story.story) && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTag}>Perjalanan Kami</span>
              <h2 className={styles.sectionTitle}>Kisah Cinta</h2>
            </div>
            <div className={styles.storyBox}>
              {detail.love_story.title && (
                <h3 className={styles.storyTitle}>{detail.love_story.title}</h3>
              )}
              {detail.love_story.story && (
                <p className={styles.storyBody}>{detail.love_story.story}</p>
              )}
            </div>
          </section>
        )}

        {/* Event Schedule Section */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTag}>Rangkaian Acara</span>
            <h2 className={styles.sectionTitle}>Waktu & Lokasi</h2>
          </div>

          <div className={styles.eventGrid}>
            {events.map((evt, idx) => {
              const eventDateStr = evt.date
                ? new Date(evt.date).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })
                : formattedEventDate;

              return (
                <div key={idx} className={styles.eventCard}>
                  <h3 className={styles.eventName}>{evt.name}</h3>
                  <div className={styles.eventDetail}>
                    <div className={styles.eventDetailRow}>
                      <Calendar size={14} strokeWidth={1.75} className={styles.eventIcon} />
                      <span>{eventDateStr}</span>
                    </div>
                    {evt.time && (
                      <div className={styles.eventDetailRow}>
                        <Clock size={14} strokeWidth={1.75} className={styles.eventIcon} />
                        <span>{evt.time}</span>
                      </div>
                    )}
                    {evt.place && (
                      <div className={styles.eventDetailRow}>
                        <MapPin size={14} strokeWidth={1.75} className={styles.eventIcon} />
                        <strong>{evt.place}</strong>
                      </div>
                    )}
                    {evt.address && <p className={styles.eventAddress}>{evt.address}</p>}
                  </div>

                  <div className={styles.eventActionRow}>
                    {evt.maps_url && (
                      <a
                        href={evt.maps_url}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.mapsButton}
                      >
                        <MapPin size={13} strokeWidth={1.75} />
                        <span>Petunjuk Lokasi Google Maps</span>
                      </a>
                    )}
                    <a
                      href={getGoogleCalendarUrl(evt)}
                      target="_blank"
                      rel="noreferrer"
                      className={styles.calendarButton}
                    >
                      <CalendarPlus size={13} strokeWidth={1.75} />
                      <span>Simpan ke Google Calendar</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Gallery Section (if available) */}
        {galleryPhotos.length > 0 && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTag}>Momen Bahagia</span>
              <h2 className={styles.sectionTitle}>Galeri Foto</h2>
            </div>
            <div className={styles.galleryGrid}>
              {galleryPhotos.map((photo, idx) => (
                <div
                  key={idx}
                  className={styles.galleryItem}
                  onClick={() => setLightboxPhoto(photo)}
                >
                  <img src={photo} alt={`Galeri ${idx + 1}`} className={styles.galleryImg} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Live Streaming Section (if available) */}
        {detail.streaming_platform && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTag}>Virtual Event</span>
              <h2 className={styles.sectionTitle}>Siaran Langsung</h2>
            </div>
            <div className={styles.streamingCard}>
              <Tv
                size={28}
                strokeWidth={1.5}
                style={{ color: 'var(--accent-classic, #8a704c)', marginBottom: '12px' }}
              />
              <p className={styles.streamingDesc}>
                Bagi keluarga dan kerabat yang berhalangan hadir secara langsung, Anda dapat
                menyaksikan prosesi pernikahan kami secara virtual melalui tautan berikut:
              </p>
              <div>
                <a
                  href={detail.streaming_platform}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.streamingBtn}
                >
                  <Tv size={14} strokeWidth={1.75} />
                  <span>Tonton Siaran Langsung</span>
                </a>
              </div>
            </div>
          </section>
        )}

        {/* Wedding Gift Section (if any) */}
        {gifts.length > 0 && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTag}>Tanda Kasih</span>
              <h2 className={styles.sectionTitle}>Amplop Digital</h2>
              <p className={styles.giftSubtitle}>
                Doa restu Anda merupakan karunia terindah bagi kami. Namun jika Anda bermaksud
                memberi tanda kasih, dapat mengirimkan melalui tautan berikut:
              </p>
            </div>

            <div className={styles.giftList}>
              {gifts.map((gift, idx) => {
                const isQris = gift.platform?.toUpperCase() === 'QRIS';
                const qrisSrc = gift.qris_image || (gift.id?.startsWith('http') ? gift.id : '');

                return (
                  <div key={idx} className={styles.giftCard}>
                    <div className={styles.giftBank}>{gift.platform}</div>

                    {qrisSrc && (
                      <div className={styles.giftQrisWrap}>
                        <img
                          src={qrisSrc}
                          alt={`QRIS ${gift.name}`}
                          className={styles.giftQrisImg}
                        />
                      </div>
                    )}

                    <div className={styles.giftNumber}>{gift.id}</div>
                    <div className={styles.giftHolder}>a.n {gift.name}</div>
                    <button
                      className={styles.copyBtn}
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
        )}

        {/* Guestbook & RSVP Section */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTag}>Buku Tamu</span>
            <h2 className={styles.sectionTitle}>Doa & Ucapan Restu</h2>
          </div>

          {/* Form */}
          <form onSubmit={handleRsvpSubmit} className={styles.rsvpForm}>
            {rsvpError && (
              <div className={styles.rsvpAlertError}>
                <AlertCircle size={14} strokeWidth={1.75} />
                <span>{rsvpError}</span>
              </div>
            )}
            {rsvpSuccess && (
              <div className={styles.rsvpAlertSuccess}>
                <CheckCircle2 size={14} strokeWidth={1.75} />
                <span>Terima kasih. Doa restu Anda telah terkirim.</span>
              </div>
            )}

            <div className={styles.formGroup}>
              <label className={styles.label}>Nama Tamu</label>
              <input
                type="text"
                className={styles.input}
                placeholder="Nama Anda"
                value={guestName}
                onChange={e => setGuestName(e.target.value)}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Konfirmasi Kehadiran</label>
              <select
                className={styles.select}
                value={attendance}
                onChange={e => setAttendance(e.target.value)}
              >
                <option value="hadir">Hadir</option>
                <option value="tidak_hadir">Tidak Hadir</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Ucapan & Doa Restu</label>
              <textarea
                className={styles.textarea}
                placeholder="Tuliskan ucapan dan doa terbaik untuk kedua mempelai..."
                value={guestMessage}
                onChange={e => setGuestMessage(e.target.value)}
                rows={3}
                required
              />
            </div>

            <button type="submit" className={styles.submitRsvp} disabled={submittingRsvp}>
              <Send size={14} strokeWidth={1.75} />
              <span>{submittingRsvp ? 'Mengirim...' : 'Kirim Ucapan & Doa'}</span>
            </button>
          </form>

          {/* Messages Feed */}
          <div className={styles.messageList}>
            {messages.length === 0 ? (
              <p className={styles.emptyMessageText}>
                Belum ada ucapan. Jadilah yang pertama memberikan doa restu.
              </p>
            ) : (
              messages.map(msg => {
                const isTidak = msg.attendance === 'tidak_hadir';
                const badgeClass = isTidak ? styles.attendanceTidak : styles.attendanceHadir;
                const badgeText = isTidak ? 'Tidak Hadir' : 'Hadir';

                return (
                  <div key={msg.id} className={styles.messageCard}>
                    <div className={styles.messageHeader}>
                      <span className={styles.messageAuthor}>{msg.name}</span>
                      <span className={`${styles.attendanceBadge} ${badgeClass}`}>{badgeText}</span>
                    </div>
                    <p className={styles.messageContent}>{msg.message}</p>
                    <span className={styles.messageTime}>
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
              })
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className={styles.footer}>
          <div className={styles.footerNames}>
            {groomName.split(' ')[0]} & {brideName.split(' ')[0]}
          </div>
          <p className={styles.footerThanks}>Terima kasih atas doa dan restu Anda</p>
          <div className={styles.footerApp}>Invitation App</div>
        </footer>
      </main>
    </div>
  );
}
