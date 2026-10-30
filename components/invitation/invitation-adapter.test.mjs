import test from 'node:test';
import assert from 'node:assert/strict';

function createPreviewInvitation(input = {}) {
  return {
    event_date: input.date || '',
    detail: {
      groom: { name: input.groom || 'Mempelai Pria' },
      bride: { name: input.bride || 'Mempelai Wanita' },
      wedding_event: [],
    },
  };
}

test('preview adapter provides safe defaults', () => {
  const result = createPreviewInvitation({});
  assert.equal(result.detail.groom.name, 'Mempelai Pria');
  assert.equal(result.detail.bride.name, 'Mempelai Wanita');
  assert.deepEqual(result.detail.wedding_event, []);
});

test('preview adapter preserves form values', () => {
  const result = createPreviewInvitation({ groom: 'Andi', bride: 'Sari', date: '2027-01-01' });
  assert.equal(result.detail.groom.name, 'Andi');
  assert.equal(result.detail.bride.name, 'Sari');
  assert.equal(result.event_date, '2027-01-01');
});
