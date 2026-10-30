'use client';

import { useState } from 'react';
import type { UserTemplate } from '@/types';
import styles from '../form.module.css';
import publicStyles from '@/app/[slug]/page.module.css';
import { createPreviewInteractionAdapter } from '@/components/invitation/interaction-adapter';
import { useToast } from '@/context/ToastContext';
import { InvitationRenderer } from '@/components/invitation/InvitationRenderer';
import { InvitationPreviewFrame } from '@/components/invitation/InvitationPreviewFrame';
import { createPreviewInvitation } from '@/components/invitation/invitation-adapter';

function themeClass(slug?: string) {
  const classes: Record<string, string | undefined> = {
    'elegant-rose': publicStyles.theme_elegant_rose,
    'modern-minimalist': publicStyles.theme_modern_minimalist,
    'rustic-garden': publicStyles.theme_rustic_garden,
    'royal-gold': publicStyles.theme_royal_gold,
  };
  return classes[slug || 'elegant-rose'] || publicStyles.theme_elegant_rose;
}

export function LivePreview({
  template,
  groom,
  bride,
  date,
}: {
  template?: UserTemplate['template'];
  groom: string;
  bride: string;
  date: string;
}) {
  const toast = useToast();
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const previewInvitation = createPreviewInvitation({ groom, bride, date });
  const interaction = createPreviewInteractionAdapter({
    onOpenInvitation: () => {
      setIsPreviewOpen(true);
      toast.info('Cover dibuka dalam simulasi preview.', 'Preview');
    },
    onOpenGallery: photo => setLightboxPhoto(photo),
    onSubmitRsvp: () => toast.info('RSVP hanya simulasi pada live preview.', 'Preview'),
  });
  return (
    <aside className={styles.livePreviewPanel} aria-label="Live preview undangan">
      <InvitationPreviewFrame
        isCoverOpen={isPreviewOpen}
        onResetCover={() => setIsPreviewOpen(false)}
      >
        <InvitationRenderer
          invitation={previewInvitation}
          theme={template?.theme_config}
          mode="preview"
          themeClassName={themeClass(template?.slug)}
          interaction={interaction}
          isOpen={isPreviewOpen}
        />
      </InvitationPreviewFrame>
      {lightboxPhoto && (
        <button
          type="button"
          className={styles.previewLightbox}
          onClick={() => setLightboxPhoto(null)}
        >
          <img src={lightboxPhoto} alt="Pratinjau galeri" />
        </button>
      )}
      <p className={styles.previewCaption}>
        {template?.name || 'Pilih template untuk melihat preview'}
      </p>
    </aside>
  );
}
