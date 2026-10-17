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
  assert.equal(manifest.start_url, "/pwa/worker/" + worker.id);
  assert.equal(manifest.scope, "/pwa/worker/" + worker.id);
  assert.notEqual(manifest.scope, "/");
  assert.ok(!"/admin".startsWith(manifest.scope));
  assert.ok(!"/w/rahul-painter".startsWith(manifest.scope));
  assert.equal(manifest.display, "standalone");
  assert.deepEqual(manifest.icons.map(x => x.sizes), ["192x192", "512x512"]);
  assert.equal(manifest.icons[0].purpose, "any");
  assert.ok(manifest.icons[1].src.includes(worker.id));
  assert.notEqual(makeWorkerManifest({ ...worker, id: "other-worker" }).id, manifest.id);
  assert.notEqual(makeWorkerManifest({ ...worker, id: "other-worker" }).scope, manifest.scope);
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

test("worker install prompt is browser-owned and not faked", async () => {
  const { readFileSync } = await import("node:fs");
  const { fileURLToPath } = await import("node:url");
  const editorPath = fileURLToPath(new URL("../app/components/WorkerPwaInstall/WorkerPwaInstall.js", import.meta.url));
  const code = readFileSync(editorPath, "utf8");
  assert.equal(code.includes("beforeinstallprompt"), true);
  assert.equal(code.includes("await activePrompt.prompt()"), true);
  assert.equal(code.includes("syncEarlyPrompt"), true);
  assert.equal(code.includes("saved?.path === window.location.pathname"), true);
  assert.equal(code.includes("scope: current"), true);
  assert.equal(code.includes("Open in Chrome"), true);
  assert.equal(code.includes("package=com.android.chrome"), true);
  assert.equal(code.includes("S.browser_fallback_url"), true);
  assert.equal(code.includes("Checking…"), false);
  assert.equal(code.includes("Install help"), false);
  assert.doesNotMatch(code, /window\.navigator\.install\(/);
});

test("worker service worker uses the network without caching admin or profile data", async () => {
  const { readFileSync } = await import("node:fs");
  const { fileURLToPath } = await import("node:url");
  const swPath = fileURLToPath(new URL("../public/worker-pwa-sw.js", import.meta.url));
  const code = readFileSync(swPath, "utf8");
  assert.match(code, /addEventListener\("fetch"/);
  assert.match(code, /event\.respondWith\(fetch\(request\)\)/);
  assert.match(code, /event\.request/);
  assert.doesNotMatch(code, /caches\.open|CacheStorage|\.put\(/);
});

test("early install capture runs only for worker-owned paths and keeps the browser prompt", async () => {
  const { readFileSync } = await import("node:fs");
  const { fileURLToPath } = await import("node:url");
  const { runInNewContext } = await import("node:vm");
  const filename = fileURLToPath(new URL("../public/worker-pwa-install-early.js", import.meta.url));
  const js = readFileSync(filename, "utf8");
  const simulate = (pathname, search = "") => {
    const listeners = new Map();
    let registeredScope = null;
    const window = {
      location: { pathname, search },
      addEventListener: (name, fn) => listeners.set(name, fn),
      dispatchEvent: () => {},
    };
    const navigator = {
      serviceWorker: { register: async (_script, opts) => { registeredScope = opts.scope; } },
    };
    runInNewContext(js, { window, navigator, URLSearchParams, Event });
    let prevented = false;
    const ev = { preventDefault: () => { prevented = true; }, prompt: async () => {}, userChoice: Promise.resolve({ outcome: "accepted" }) };
    listeners.get("beforeinstallprompt")(ev);
    return { prevented, saved: window.__infixoPwaInstall?.prompt, savedPath: window.__infixoPwaInstall?.path, scope: registeredScope };
  };
  const id = "ff0dd68b-1111-4444-8888-987654321abc";
  const pwa = simulate("/pwa/worker/" + id);
  assert.equal(pwa.prevented, true);
  assert.equal(pwa.savedPath, "/pwa/worker/" + id);
  assert.equal(pwa.scope, "/pwa/worker/" + id);
  const handover = simulate("/w/rahul-painter", "?me=" + id);
  assert.equal(handover.prevented, true);
  assert.ok(handover.saved);
  assert.equal(simulate("/w/rahul-painter/IPUC-CCA17B6F").prevented, true);
  const customer = simulate("/w/rahul-painter");
  assert.equal(customer.prevented, false);
  assert.equal(customer.saved, null);
  assert.equal(simulate("/admin").prevented, false);
  assert.equal(simulate("/").prevented, false);
});
