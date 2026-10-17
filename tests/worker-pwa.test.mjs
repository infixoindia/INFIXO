import test from "node:test";
import assert from "node:assert/strict";
import { pickWorkerIconSlide, iconRevision, makeWorkerManifest, isSafeProfilePhotoUrl } from "../lib/workerPwa.mjs";

const worker = {
  id: "ff0dd68b-1111-4444-8888-987654321abc",
  slug: "rahul-painter",
  full_name: "Rahul Painter",
  hero_slides: [
    { image: "https://vemezdbssynachculphi.supabase.co/storage/v1/object/public/worker-media/photo1.jpg" },
    { image: "https://vemezdbssynachculphi.supabase.co/storage/v1/object/public/worker-media/photo2.jpg", pwaIcon: true, pwaCrop: { x: 0.5, y: 0.4, zoom: 1.2, ar: 0.75 } },
  ],
};

test("preferred icon comes from existing Identity photo; original photo is unchanged", () => {
  const slides = structuredClone(worker.hero_slides);
  assert.equal(pickWorkerIconSlide(slides), slides[1]);
  assert.deepEqual(slides, worker.hero_slides);
  assert.equal(pickWorkerIconSlide([slides[0]]), slides[0]);
  assert.equal(pickWorkerIconSlide([]), null);
});

test("manifest identifies each worker independently and opens by permanent ID", () => {
  const manifest = makeWorkerManifest(worker);
  assert.equal(manifest.id, "/pwa/worker/" + worker.id);
  assert.equal(manifest.start_url, "/pwa/open/" + worker.id);
  assert.equal(manifest.display, "standalone");
  assert.deepEqual(manifest.icons.map(x => x.sizes), ["192x192", "512x512"]);
  assert.equal(manifest.icons[0].purpose, "any");
  assert.ok(manifest.icons[1].src.includes(worker.id));
  assert.notEqual(makeWorkerManifest({ ...worker, id: "other-worker" }).id, manifest.id);
});

test("icon revision changes on photo/framing changes, not profile name changes", () => {
  const selected = pickWorkerIconSlide(worker.hero_slides);
  assert.notEqual(iconRevision(selected), iconRevision({ ...selected, pwaCrop: { ...selected.pwaCrop, zoom: 1.3 } }));
  assert.notEqual(iconRevision(selected), iconRevision({ ...selected, image: "another-image.jpg" }));
  assert.equal(iconRevision(selected), iconRevision(structuredClone(selected)));
});

test("reject arbitrary outbound photo URLs and production project media", () => {
  const stage = "https://vemezdbssynachculphi.supabase.co";
  assert.equal(isSafeProfilePhotoUrl(worker.hero_slides[0].image, stage), true);
  assert.equal(isSafeProfilePhotoUrl("https://xyplrbzyqershqngrjwo.supabase.co/storage/v1/object/public/worker-media/photo1.jpg", stage), false);
  assert.equal(isSafeProfilePhotoUrl("https://evil.example.com/photo.jpg", stage), false);
  assert.equal(isSafeProfilePhotoUrl("https://vemezdbssynachculphi.supabase.co.evil.com/storage/v1/object/public/worker-media/x", stage), false);
  assert.equal(isSafeProfilePhotoUrl("http://vemezdbssynachculphi.supabase.co/storage/v1/object/public/worker-media/x", stage), false);
  assert.equal(isSafeProfilePhotoUrl("https://vemezdbssynachculphi.supabase.co/storage/v1/object/sign/worker-media/x", stage), false);
});

test("invalid or unpublished worker cannot have install manifest", () => {
  assert.throws(() => makeWorkerManifest(null));
  assert.throws(() => makeWorkerManifest({ slug: "somebody" }));
});
