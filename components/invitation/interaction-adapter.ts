import type { InvitationInteraction } from './InvitationRenderer';

export type InteractionAdapterContext = {
  onOpenInvitation?: () => void;
  onToggleMusic?: () => void;
  onOpenGallery?: (photo: string) => void;
  onSubmitRsvp?: (payload: { name: string; attendance: string; message: string }) => void;
};

/** Creates the explicit interaction boundary shared by every renderer surface. */
export function createInteractionAdapter(
  context: InteractionAdapterContext = {}
): InvitationInteraction {
  return {
    onOpenInvitation: context.onOpenInvitation,
    onToggleMusic: context.onToggleMusic,
    onOpenGallery: context.onOpenGallery,
    onSubmitRsvp: context.onSubmitRsvp,
  };
}

export const createPublicInteractionAdapter = createInteractionAdapter;
export const createDemoInteractionAdapter = createInteractionAdapter;
export const createPreviewInteractionAdapter = createInteractionAdapter;
