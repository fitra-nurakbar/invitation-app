import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createPublicInteractionAdapter,
  createDemoInteractionAdapter,
  createPreviewInteractionAdapter,
} from './interaction-adapter.ts';

const modes = ['public', 'demo', 'preview'];

test('all renderer modes share one registered block contract', () => {
  assert.deepEqual(modes, ['public', 'demo', 'preview']);
  for (const mode of modes) {
    assert.match(`<main data-render-mode="${mode}">`, /data-render-mode/);
  }
});

test('all modes expose and invoke the same interaction adapter contract', () => {
  for (const factory of [
    createPublicInteractionAdapter,
    createDemoInteractionAdapter,
    createPreviewInteractionAdapter,
  ]) {
    const events = [];
    const adapter = factory({
      onOpenInvitation: () => events.push('open'),
      onToggleMusic: () => events.push('music'),
      onOpenGallery: photo => events.push(`gallery:${photo}`),
      onSubmitRsvp: payload =>
        events.push(`${payload.name}:${payload.attendance}:${payload.message}`),
    });
    adapter.onOpenInvitation?.();
    adapter.onToggleMusic?.();
    adapter.onOpenGallery?.('/uploads/sample.jpg');
    adapter.onSubmitRsvp?.({ name: 'Siti', attendance: 'hadir', message: 'Selamat berbahagia' });
    assert.deepEqual(events, [
      'open',
      'music',
      'gallery:/uploads/sample.jpg',
      'Siti:hadir:Selamat berbahagia',
    ]);
  }
});
