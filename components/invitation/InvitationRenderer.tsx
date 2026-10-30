'use client';

import type { CSSProperties, ReactNode } from 'react';
import type { BlockType, Invitation, InvitationLayout, Message, ThemeConfig } from '@/types';
import { BlockRegistry, BlockRenderer } from '@/app/[slug]/block-registry';
import { InvitationBlock } from './blocks/InvitationBlocks';
import { AudioBlock } from './blocks/AudioBlock';
import { resolveThemeConfig } from './theme-defaults';

export type InvitationRenderMode = 'public' | 'demo' | 'preview';

export type InvitationInteraction = {
  onOpenInvitation?: () => void;
  onToggleMusic?: () => void;
  onOpenGallery?: (photo: string) => void;
  onSubmitRsvp?: (payload: { name: string; attendance: string; message: string }) => void;
};

const FALLBACK_ORDER: BlockType[] = [
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
];

type InvitationRendererProps = {
  invitation: Partial<Invitation>;
  layout?: InvitationLayout | null;
  theme?: ThemeConfig | null;
  renderBlock?: (type: BlockType, invitation: Partial<Invitation>) => ReactNode;
  interaction?: InvitationInteraction;
  mode?: InvitationRenderMode;
  className?: string;
  themeClassName?: string;
  coverModalClassName?: string;
  isOpen?: boolean;
  guestName?: string;
  messages?: Message[];
  rsvpSubmitting?: boolean;
  rsvpError?: string | null;
  rsvpSuccess?: boolean;
};

/** Shared schema-driven shell for public, demo, and editor previews. */
export function InvitationRenderer({
  invitation,
  layout,
  theme,
  renderBlock,
  interaction,
  mode = 'public',
  className,
  themeClassName,
  coverModalClassName,
  isOpen = false,
  guestName,
  messages,
  rsvpSubmitting,
  rsvpError,
  rsvpSuccess,
}: InvitationRendererProps) {
  const resolvedTheme = resolveThemeConfig(theme);
  const colors = resolvedTheme.colors;
  const style = {
    '--invitation-background': colors?.background || '#faf9f6',
    '--invitation-text': colors?.text || '#181716',
    '--invitation-primary': colors?.primary || '#8a704c',
    '--invitation-width': `${resolvedTheme.layout.content_width}px`,
    '--invitation-font-heading': `'${resolvedTheme.fonts.heading}', Georgia, serif`,
    '--invitation-font-body': `'${resolvedTheme.fonts.body}', Arial, sans-serif`,
    '--invitation-font-accent': `'${resolvedTheme.fonts.accent}', cursive`,
    '--invitation-section-spacing': `${resolvedTheme.layout.section_spacing}px`,
    background: theme?.colors?.background
      ? resolvedTheme.background.color || colors.background
      : 'var(--bg-primary, var(--invitation-background, #faf9f6))',
    color: theme?.colors?.text ? colors.text : 'var(--text-main, var(--invitation-text, #181716))',
  } as CSSProperties;

  return (
    <main
      className={[className, themeClassName].filter(Boolean).join(' ') || undefined}
      style={style}
      data-invitation-renderer
      data-render-mode={mode}
      data-theme-version={resolvedTheme.version}
    >
      <AudioBlock invitation={invitation} interaction={interaction} isOpen={isOpen} />
      <BlockRegistry layout={layout} fallbackOrder={FALLBACK_ORDER}>
        {FALLBACK_ORDER.map(type => (
          <BlockRenderer key={type} type={type}>
            {renderBlock ? (
              renderBlock(type, invitation)
            ) : (
              <InvitationBlock
                type={type}
                invitation={invitation}
                interaction={interaction}
                mode={mode}
                isOpen={isOpen}
                guestName={guestName}
                coverModalClassName={coverModalClassName}
                messages={messages}
                rsvpSubmitting={rsvpSubmitting}
                rsvpError={rsvpError}
                rsvpSuccess={rsvpSuccess}
              />
            )}
          </BlockRenderer>
        ))}
      </BlockRegistry>
    </main>
  );
}
