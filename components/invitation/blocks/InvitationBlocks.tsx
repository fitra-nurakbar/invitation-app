'use client';

import { Calendar, CalendarPlus, Clock, MapPin } from 'lucide-react';
import type { BlockType, Invitation, Message, WeddingEvent } from '@/types';
import { CoverBlock } from './CoverBlock';
import { CoupleBlock } from './CoupleBlock';
import { InteractiveBlock } from './InteractiveBlocks';
import styles from '@/app/[slug]/page.module.css';
import type { InvitationInteraction, InvitationRenderMode } from '../InvitationRenderer';

type Props = {
  type: BlockType;
  invitation: Partial<Invitation>;
  interaction?: InvitationInteraction;
  mode?: InvitationRenderMode;
  isOpen?: boolean;
  guestName?: string;
  coverModalClassName?: string;
  messages?: Message[];
  rsvpSubmitting?: boolean;
  rsvpError?: string | null;
  rsvpSuccess?: boolean;
};

function coupleNames(invitation: Partial<Invitation>) {
  const detail = invitation.detail;
  const groom =
    (typeof detail?.groom === 'string' ? detail.groom : detail?.groom?.name) || 'Mempelai Pria';
  const bride =
    (typeof detail?.bride === 'string' ? detail.bride : detail?.bride?.name) || 'Mempelai Wanita';
  return { groom, bride };
}

function googleCalendarUrl(invitation: Partial<Invitation>, evt: WeddingEvent) {
  const { groom, bride } = coupleNames(invitation);
  const title = `${evt.name}: ${groom} & ${bride}`;
  const rawDate = evt.date || invitation.event_date || '';
  const isoDate = /^\d{4}-\d{2}-\d{2}/.test(rawDate) ? rawDate.split('T')[0].replace(/-/g, '') : '';
  const dates = isoDate ? `&dates=${isoDate}T020000Z/${isoDate}T060000Z` : '';
  const location = [evt.place, evt.address].filter(Boolean).join(', ');
  const detailsText = `Undangan Pernikahan ${groom} & ${bride}. Acara ${evt.name} bertempat di ${location}.`;
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}${dates}&details=${encodeURIComponent(detailsText)}&location=${encodeURIComponent(location)}`;
}

function formatEventDate(raw?: string, fallback?: string) {
  const source = raw || fallback;
  if (!source) return '';
  if (!/^\d{4}-\d{2}-\d{2}/.test(source)) return source;
  return new Date(source).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function InvitationBlock({
  type,
  invitation,
  interaction,
  mode = 'public',
  isOpen = false,
  guestName,
  coverModalClassName,
  messages,
  rsvpSubmitting,
  rsvpError,
  rsvpSuccess,
}: Props) {
  const detail = invitation.detail;
  if (type === 'cover')
    return (
      <CoverBlock
        invitation={invitation}
        mode={mode}
        interaction={interaction}
        isOpen={isOpen}
        guestName={guestName}
        coverModalClassName={coverModalClassName}
      />
    );
  if (type === 'couple') return <CoupleBlock invitation={invitation} />;
  if (type === 'quote') {
    const quote =
      detail?.quotes?.quote ||
      'Dan di antara tanda-tanda kebesaran-Nya ialah Dia menciptakan pasangan-pasangan untukmu...';
    const attribution = detail?.quotes?.attribution || 'QS. Ar-Rum: 21';
    return (
      <section className={styles.section} data-shared-block="quote">
        <div className={styles.quoteBox}>
          <p className={styles.quoteText}>&quot;{quote}&quot;</p>
          {attribution && <div className={styles.quoteSource}>{attribution}</div>}
        </div>
      </section>
    );
  }
  if (type === 'event') {
    const events: WeddingEvent[] =
      detail?.wedding_event && detail.wedding_event.length > 0
        ? detail.wedding_event
        : [
            {
              name: 'Akad Nikah',
              date: invitation.event_date || '',
              time: '08:00 - 10:00 WIB',
              place: detail?.akad?.place || 'Lokasi Akad',
              address: 'Alamat lengkap lokasi acara',
              maps_url: detail?.venue_maps_url || '',
            },
            {
              name: 'Resepsi Pernikahan',
              date: invitation.event_date || '',
              time: '11:00 - 14:00 WIB',
              place: detail?.resepsi?.place || 'Lokasi Resepsi',
              address: 'Alamat lengkap lokasi acara',
              maps_url: detail?.venue_maps_url || '',
            },
          ];
    return (
      <section className={styles.section} data-shared-block="event">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTag}>Rangkaian Acara</span>
          <h2 className={styles.sectionTitle}>Waktu &amp; Lokasi</h2>
        </div>
        <div className={styles.eventGrid}>
          {events.map((evt, index) => {
            const eventDateStr = formatEventDate(evt.date, invitation.event_date);
            return (
              <div className={styles.eventCard} key={`${evt.name}-${index}`}>
                <h3 className={styles.eventName}>{evt.name}</h3>
                <div className={styles.eventDetail}>
                  {eventDateStr && (
                    <div className={styles.eventDetailRow}>
                      <Calendar size={14} strokeWidth={1.75} className={styles.eventIcon} />
                      <span>{eventDateStr}</span>
                    </div>
                  )}
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
                    href={googleCalendarUrl(invitation, evt)}
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
    );
  }
  if (type === 'love_story' && (detail?.love_story?.title || detail?.love_story?.story))
    return (
      <section className={styles.section} data-shared-block="love_story">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTag}>Perjalanan Kami</span>
          <h2 className={styles.sectionTitle}>Kisah Cinta</h2>
        </div>
        <div className={styles.storyBox}>
          {detail.love_story.title && (
            <h3 className={styles.storyTitle}>{detail.love_story.title}</h3>
          )}
          {detail.love_story.story && <p className={styles.storyBody}>{detail.love_story.story}</p>}
        </div>
      </section>
    );
  if (type === 'gallery' && detail?.gallery?.photos?.length)
    return (
      <section className={styles.section} data-shared-block="gallery">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTag}>Momen Bahagia</span>
          <h2 className={styles.sectionTitle}>Galeri Foto</h2>
        </div>
        <div className={styles.galleryGrid}>
          {detail.gallery.photos.map((photo, idx) => (
            <button
              key={`${photo}-${idx}`}
              type="button"
              className={styles.galleryItem}
              onClick={() => interaction?.onOpenGallery?.(photo)}
            >
              <img
                src={photo}
                alt={`Galeri ${idx + 1}`}
                className={`${styles.galleryImg} ${styles.galleryImage}`}
              />
            </button>
          ))}
        </div>
      </section>
    );
  if (type === 'gift' || type === 'streaming' || type === 'rsvp') {
    return (
      <InteractiveBlock
        type={type}
        invitation={invitation}
        interaction={interaction}
        guestName={guestName}
        messages={messages}
        rsvpSubmitting={rsvpSubmitting}
        rsvpError={rsvpError}
        rsvpSuccess={rsvpSuccess}
      />
    );
  }
  if (type === 'footer') {
    const { groom, bride } = coupleNames(invitation);
    return (
      <footer className={styles.footer} data-shared-block="footer">
        <div className={styles.footerNames}>
          {groom.split(' ')[0]} &amp; {bride.split(' ')[0]}
        </div>
        <p className={styles.footerThanks}>Terima kasih atas doa dan restu Anda</p>
        <div className={styles.footerApp}>Invitation App</div>
      </footer>
    );
  }
  return null;
}
