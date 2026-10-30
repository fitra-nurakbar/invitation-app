'use client';

import type { ReactNode } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BatteryFull,
  Info,
  Languages,
  MoreHorizontal,
  Plus,
  Share,
  Signal,
  Wifi,
} from 'lucide-react';
import styles from '@/app/dashboard/invitations/form.module.css';

export function InvitationPreviewFrame({
  children,
  isCoverOpen = false,
  onResetCover,
  className,
}: {
  children: ReactNode;
  isCoverOpen?: boolean;
  onResetCover?: () => void;
  className?: string;
}) {
  return (
    <div className={[styles.phoneMockup, className].filter(Boolean).join(' ')}>
      <span className={styles.phoneBtnMute} aria-hidden="true" />
      <span className={styles.phoneBtnVolUp} aria-hidden="true" />
      <span className={styles.phoneBtnVolDown} aria-hidden="true" />
      <span className={styles.phoneBtnPower} aria-hidden="true" />

      <div className={styles.phoneBezel}>
        <div className={styles.phoneScreenFrame}>
          <div className={styles.phoneStatusBar}>
            <span className={styles.phoneTime}>14:37</span>
            <div className={styles.phoneNotch} aria-hidden="true">
              <span className={styles.phoneCamera} />
              <span className={styles.phoneSpeaker} />
            </div>
            <div className={styles.phoneStatusIcons} aria-hidden="true">
              <Signal size={11} strokeWidth={2.25} />
              <Wifi size={11} strokeWidth={2.25} />
              <BatteryFull size={13} strokeWidth={2.25} />
            </div>
          </div>

          <div className={styles.phoneAddressBar}>
            <div className={styles.phoneUrlPill}>
              <Languages size={12} strokeWidth={1.9} className={styles.phoneUrlIcon} />
              <div className={styles.phoneUrlCenter}>
                <Info size={11} strokeWidth={2} />
                <span>localhost</span>
              </div>
              <button
                type="button"
                className={styles.phoneShareBtn}
                onClick={onResetCover}
                title="Ulangi tampilan sampul"
                aria-label="Ulangi tampilan sampul"
              >
                <Share size={11} strokeWidth={2} />
              </button>
            </div>
          </div>

          <div
            className={`${styles.previewWebview} ${!isCoverOpen ? styles.previewWebviewLocked : ''}`}
          >
            {children}
          </div>

          <div className={styles.phoneBottomBar} aria-hidden="true">
            <div className={styles.phoneNavRow}>
              <button
                type="button"
                className={styles.phoneNavBtn}
                onClick={onResetCover}
                tabIndex={-1}
              >
                <ArrowLeft size={15} strokeWidth={2} />
              </button>
              <ArrowRight size={15} strokeWidth={2} className={styles.phoneNavIconMuted} />
              <span className={styles.phoneNewTabBtn}>
                <Plus size={14} strokeWidth={2.5} />
              </span>
              <span className={styles.phoneTabBadge}>1</span>
              <MoreHorizontal size={16} strokeWidth={2} />
            </div>
            <div className={styles.phoneHomeIndicator} />
          </div>
        </div>
      </div>
    </div>
  );
}
