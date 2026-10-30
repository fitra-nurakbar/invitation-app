export const PUBLIC_BLOCK_TYPES = [
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

export function resolvePublicBlockOrder(layout) {
  if (!layout || !Array.isArray(layout.sections)) return [...PUBLIC_BLOCK_TYPES];

  const seen = new Set();
  const order = [];
  for (const section of layout.sections) {
    if (section.visible && PUBLIC_BLOCK_TYPES.includes(section.type) && !seen.has(section.type)) {
      seen.add(section.type);
      order.push(section.type);
    }
  }
  return order;
}
