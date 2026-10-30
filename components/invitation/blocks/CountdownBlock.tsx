'use client';

import { useEffect, useState } from 'react';
import type { Invitation } from '@/types';
import styles from '@/app/[slug]/page.module.css';

type CountdownBlockProps = { invitation: Partial<Invitation> };

const empty = { days: 0, hours: 0, minutes: 0, seconds: 0 };

export function CountdownBlock({ invitation }: CountdownBlockProps) {
  const [time, setTime] = useState(empty);

  useEffect(() => {
    if (!invitation.event_date) return;
    const target = new Date(invitation.event_date).getTime();
    const update = () => {
      const diff = target - Date.now();
      if (diff <= 0) return setTime(empty);
      setTime({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [invitation.event_date]);

  return (
    <div
      className={styles.countdown}
      data-shared-block="countdown"
      aria-label="Hitung mundur acara"
    >
      {(['days', 'hours', 'minutes', 'seconds'] as const).map((key, index) => (
        <div className={styles.countdownItem} key={key}>
          <span className={styles.countdownValue}>{time[key]}</span>
          <span className={styles.countdownLabel}>{['Hari', 'Jam', 'Menit', 'Detik'][index]}</span>
        </div>
      ))}
    </div>
  );
}
