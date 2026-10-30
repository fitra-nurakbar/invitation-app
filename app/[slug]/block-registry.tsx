'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { BlockType, InvitationLayout } from '@/types';
import { resolvePublicBlockOrder } from './block-registry-model';

export { PUBLIC_BLOCK_TYPES, resolvePublicBlockOrder } from './block-registry-model';

type BlockRegistryProps = {
  layout?: InvitationLayout | null;
  fallbackOrder: BlockType[];
  children: ReactNode;
};

type BlockRendererProps = {
  type: BlockType;
  children: ReactNode;
};

type RegistryState = {
  order: Map<BlockType, number>;
  visible: Set<BlockType>;
};

const RegistryContext = createContext<RegistryState | null>(null);

export function BlockRegistry({ layout, fallbackOrder, children }: BlockRegistryProps) {
  const configuredOrder = resolvePublicBlockOrder(layout);
  const blockOrder = layout?.sections ? configuredOrder : fallbackOrder;
  const visible = new Set(blockOrder);
  const order = new Map(blockOrder.map((type, index) => [type, index]));

  return <RegistryContext.Provider value={{ order, visible }}>{children}</RegistryContext.Provider>;
}

/** Render a registered block in its schema-defined order; omitted blocks stay hidden. */
export function BlockRenderer({ type, children }: BlockRendererProps) {
  const registry = useContext(RegistryContext);
  if (!registry?.visible.has(type)) return null;

  return (
    <div data-block-type={type} style={{ order: registry.order.get(type) ?? 0 }}>
      {children}
    </div>
  );
}

export function isPublicBlockVisible(layout: InvitationLayout | null | undefined, type: BlockType) {
  return resolvePublicBlockOrder(layout).includes(type);
}
