import test from 'node:test';
import assert from 'node:assert/strict';
import { activationError } from '../lib/workerPublication.mjs';

const worker = {
  slug: 'synthetic-worker',
  full_name: 'Synthetic Worker',
  profession: 'Painter',
  service_area: ['Indore'],
  hero_slides: [], // Media remains optional; current real legacy worker has no slider.
  phone: null,
};

test('complete identity and service area are publishable; optional media and phone remain optional', () => {
  assert.equal(activationError(worker), null);
});

test('empty drafts cannot be activated by forged Admin PATCH', () => {
  for (const patch of [
    { full_name: '' },
    { full_name: 'A' },
    { slug: '' },
    { slug: 'INVALID SLUG' },
    { profession: '' },
    { service_area: [] },
    { service_area: [' '] },
    { service_area: 'Indore' },
  ]) {
    assert.equal(typeof activationError({ ...worker, ...patch }), 'string', JSON.stringify(patch));
  }
});

test('draft model is not itself an approval or a plan entitlement', () => {
  assert.equal(activationError({ ...worker, is_active: false }), null);
  assert.equal(activationError({ ...worker, is_active: true }), null);
});

test('malformed or missing worker object cannot be published', () => {
  assert.equal(typeof activationError(null), 'string');
  assert.equal(typeof activationError({}), 'string');
});
