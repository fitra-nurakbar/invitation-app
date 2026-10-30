'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import type { Invitation, Message } from '@/types';
import { AlertCircle, Sparkles, X } from 'lucide-react';
import { InvitationRenderer } from '@/components/invitation/InvitationRenderer';
import { createPublicInteractionAdapter } from '@/components/invitation/interaction-adapter';
import styles from './page.module.css';
import { themeTokens } from './theme-tokens';

const DEFAULT_MUSIC = 'https://assets.mixkit.co/music/preview/mixkit-wedding-waltz-piano-562.mp3';

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
  const [isOpen, setIsOpen] = useState(false);
  const [submittingRsvp, setSubmittingRsvp] = useState(false);
  const [rsvpSuccess, setRsvpSuccess] = useState(false);
  const [rsvpError, setRsvpError] = useState<string | null>(null);
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

  const normalizedInvitation: Invitation = {
    ...invitation,
    detail: {
      ...(invitation.detail || {}),
      music: invitation.detail?.music || DEFAULT_MUSIC,
    },
  };

  const interaction = createPublicInteractionAdapter({
    onOpenInvitation: () => {
      setIsOpen(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    onOpenGallery: photo => setLightboxPhoto(photo),
    onSubmitRsvp: async payload => {
      setSubmittingRsvp(true);
      setRsvpError(null);
      try {
        const res = await api.postMessage(slug, payload);
        if (res.data) {
          setMessages(prev => [res.data, ...prev]);
        }
        setRsvpSuccess(true);
        setTimeout(() => setRsvpSuccess(false), 3000);
      } catch (err: unknown) {
        setRsvpError(err instanceof Error ? err.message : 'Gagal mengirim ucapan');
      } finally {
        setSubmittingRsvp(false);
      }
    },
  });

  return (
    <div
      className={`${styles.wrapper} ${themeClass}`}
      style={themeTokens(invitation.template?.theme_config, invitation.layout?.overrides)}
    >
      <InvitationRenderer
        invitation={normalizedInvitation}
        layout={invitation.layout}
        theme={invitation.template?.theme_config}
        mode="public"
        className={styles.mainContainer}
        themeClassName={themeClass}
        interaction={interaction}
        isOpen={isOpen}
        guestName={guestParam}
        messages={messages}
        rsvpSubmitting={submittingRsvp}
        rsvpError={rsvpError}
        rsvpSuccess={rsvpSuccess}
      />
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
    </div>
  );
}
