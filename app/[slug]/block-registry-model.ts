import type { BlockType, InvitationLayout } from '@/types';
import {
  PUBLIC_BLOCK_TYPES as JS_PUBLIC_BLOCK_TYPES,
  resolvePublicBlockOrder as jsResolvePublicBlockOrder,
} from './block-registry-model.mjs';

export const PUBLIC_BLOCK_TYPES: BlockType[] = JS_PUBLIC_BLOCK_TYPES as BlockType[];

export function resolvePublicBlockOrder(layout?: InvitationLayout | null): BlockType[] {
  return jsResolvePublicBlockOrder(layout) as BlockType[];
}
