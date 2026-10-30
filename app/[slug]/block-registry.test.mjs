import assert from 'node:assert/strict';
import test from 'node:test';
import { resolvePublicBlockOrder } from './block-registry-model.mjs';

test('uses legacy block order when no layout exists', () => {
  assert.deepEqual(resolvePublicBlockOrder(undefined), [
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
  ]);
});

test('respects configured section order and visibility', () => {
  const layout = {
    version: 1,
    sections: [
      { id: 'event-1', type: 'event', visible: true },
      { id: 'quote-1', type: 'quote', visible: false },
      { id: 'cover-1', type: 'cover', visible: true },
    ],
  };

  assert.deepEqual(resolvePublicBlockOrder(layout), ['event', 'cover']);
});

test('ignores unknown blocks and duplicate block types', () => {
  const layout = {
    version: 1,
    sections: [
      { id: 'event-1', type: 'event', visible: true },
      { id: 'unsafe-1', type: 'custom_html', visible: true },
      { id: 'event-2', type: 'event', visible: true },
    ],
  };

  assert.deepEqual(resolvePublicBlockOrder(layout), ['event']);
});

test('treats an explicitly empty layout as empty rather than falling back', () => {
  assert.deepEqual(resolvePublicBlockOrder({ version: 1, sections: [] }), []);
});
