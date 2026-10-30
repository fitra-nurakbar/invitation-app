'use client';

import type { CSSProperties } from 'react';
import type { Invitation } from '@/types';
import { Calendar, Heart, Mail } from 'lucide-react';
import { CountdownBlock } from './CountdownBlock';
import type { InvitationInteraction, InvitationRenderMode } from '../InvitationRenderer';
import styles from '@/app/[slug]/page.module.css';

type CoverBlockProps = {
  invitation: Partial<Invitation>;
  compact?: boolean;
  className?: string;
  coverModalClassName?: string;
  mode?: InvitationRenderMode;
  interaction?: InvitationInteraction;
  guestName?: string;
  isOpen?: boolean;
};

export function CoverBlock({
  invitation,
  compact = false,
  className,
  coverModalClassName,
  interaction,
  guestName = 'Tamu Undangan',
  isOpen = false,
}: CoverBlockProps) {
  const source = invitation as Partial<Invitation> & { groom_name?: string; bride_name?: string };
  const groom =
    source.groom_name ||
    (typeof invitation.detail?.groom === 'string'
      ? invitation.detail.groom
      : invitation.detail?.groom?.name) ||
    'Mempelai Pria';
  const bride =
    source.bride_name ||
    (typeof invitation.detail?.bride === 'string'
      ? invitation.detail.bride
      : invitation.detail?.bride?.name) ||
    'Mempelai Wanita';
  const date = invitation.event_date
    ? new Date(invitation.event_date).toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'Tanggal acara';
  const classNames = compact ? className : `${styles.hero} ${className || ''}`;
  const modalClass = [styles.coverModal, isOpen ? styles.coverModalHidden : '', coverModalClassName]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      {!compact && (
        <div className={modalClass}>
          <div className={styles.coverFrame}>
            <div className={styles.coverInner}>
              <span className={styles.coverBadge}>Undangan Pernikahan</span>
              <h1 className={styles.coverNames}>
                {groom.split(' ')[0]} &amp; {bride.split(' ')[0]}
              </h1>
              <div className={styles.coverDivider}>
                <Heart size={14} strokeWidth={1.5} />
              </div>
              <div className={styles.coverGuestLabel}>Kepada Yth. Bapak/Ibu/Saudara/i:</div>
              <div className={styles.coverGuestName}>{guestName}</div>
              <div>
                <button
                  className={styles.openButton}
                  onClick={interaction?.onOpenInvitation}
                  type="button"
                >
                  <Mail size={16} strokeWidth={1.75} />
                  <span>Buka Undangan</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <section className={classNames} data-shared-block="cover">
        <div className={compact ? undefined : styles.heroFrame}>
          <p className={styles.heroSub}>Walimatul &apos;Urs</p>
          <h1 className={styles.heroTitle}>
            {groom.split(' ')[0]} &amp; {bride.split(' ')[0]}
          </h1>
          <div className={styles.heroDate}>
            <Calendar size={14} strokeWidth={1.75} />
            <span>{date}</span>
          </div>
          <CountdownBlock invitation={invitation} />
        </div>
      </section>
    </>
  );
}

export function previewCoverStyle(background: string, color: string): CSSProperties {
  return { background, color };
}
