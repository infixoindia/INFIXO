import test from 'node:test';
import assert from 'node:assert/strict';
import { WORK_PHOTO_FRAME_RATIO, workPhotoUrl, workPhotoCrop, toWorkPhotoEntry, workPhotoDisplay } from '../lib/workPhoto.mjs';

const url = 'https://example.invalid/original-high-resolution-photo.jpg';
const crop = { x: 0.52, y: 0.37, zoom: 1.6, ar: 1.5 };

test('3:4 crop matches unchanged public work gallery card', () => {
  assert.equal(WORK_PHOTO_FRAME_RATIO, 3 / 4);
});
test('legacy string photo remains a string and displays original', () => {
  assert.equal(workPhotoUrl(url), url);
  assert.equal(workPhotoCrop(url), null);
  assert.equal(toWorkPhotoEntry(url, null), url);
  assert.deepEqual(workPhotoDisplay(url), { src: url, crop: null });
});
test('framed photo retains original image URL for fullscreen viewer', () => {
  const photo = toWorkPhotoEntry(url, crop);
  assert.deepEqual(photo, { image: url, crop });
  assert.equal(workPhotoUrl(photo), url);
  assert.deepEqual(workPhotoCrop(photo), crop);
  assert.deepEqual(workPhotoDisplay(photo), { src: url, crop });
});
test('old array and new array can coexist', () => {
  const items = [url, { image: url, crop }];
  assert.equal(items.map(workPhotoUrl).filter(Boolean).length, 2);
  assert.deepEqual(items.map(workPhotoCrop), [null, crop]);
});
test('unsafe or malformed crop metadata is ignored', () => {
  assert.equal(workPhotoCrop({ image: url, crop: { x: 0.5, y: 0.5, zoom: NaN, ar: 1 } }), null);
  assert.equal(workPhotoCrop({ image: url, crop: { x: -1, y: 0.5, zoom: 1, ar: 1 } }), null);
  assert.equal(workPhotoUrl(null), '');
  assert.throws(() => toWorkPhotoEntry('', null));
});
