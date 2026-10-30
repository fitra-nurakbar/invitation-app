'use client';

import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import type { Invitation } from '@/types';
import type { InvitationInteraction } from '../InvitationRenderer';
import styles from '@/app/[slug]/page.module.css';

type AudioBlockProps = {
  invitation: Partial<Invitation>;
  interaction?: InvitationInteraction;
  isOpen?: boolean;
  audioUrl?: string;
};

export function AudioBlock({ invitation, interaction, isOpen = true, audioUrl }: AudioBlockProps) {
  const source = invitation as Partial<Invitation> & { music?: string; music_url?: string };
  const url = audioUrl || invitation.detail?.music || source.music || source.music_url;
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !url) return;
    if (isOpen) {
      audio
        .play()
        .then(() => setPlaying(true))
        .catch(() => setPlaying(false));
    } else {
      audio.pause();
      setPlaying(false);
    }
    return () => {
      audio.pause();
    };
  }, [isOpen, url]);

  if (!url) return null;
  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio
        .play()
        .then(() => setPlaying(true))
        .catch(() => setPlaying(false));
    }
    interaction?.onToggleMusic?.();
  };
  return (
    <>
      <audio ref={audioRef} loop src={url} />
      {isOpen && (
        <button
          type="button"
          className={styles.musicBtn}
          onClick={toggle}
          aria-label={playing ? 'Heningkan Musik' : 'Putar Musik'}
        >
          {playing ? (
            <Volume2 size={18} strokeWidth={1.75} />
          ) : (
            <VolumeX size={18} strokeWidth={1.75} />
          )}
        </button>
      )}
    </>
  );
}
