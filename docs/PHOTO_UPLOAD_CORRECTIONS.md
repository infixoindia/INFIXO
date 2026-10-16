# INFIXO Admin — Work Photos corrections (isolated candidate)

Status: prepared patch only; **not deployed or applied to production**.

## Scope (Work Photos only)
- Multi-select 1–6 work photos in the Admin editor (MAX 6; database restricts linked FREE plans to 2).
- Individual 3:4 crop/zoom/drag for the **existing 3:4 public gallery card**. Original bytes are uploaded untouched. The public full-screen viewer opens the ORIGINAL image, preserving existing swipe/zoom UI.
- Each photo can be replaced, removed, reordered, or recropped. The Admin Live Preview updates immediately from temporary browser previews; those blob URLs are never written to the database. Unsaved photo edits warn before tab switch/browser exit.
- Browser upload progress via XHR; file-level retry. Save All uploads originals sequentially before updating the database. A failed upload or failed DB save does **not** partially update the worker's `photos` record. The uploaded URL is reused on Save retry.
- Existing `string[]` work photos remain valid and render unmodified. New cropped images use `{image: originalUrl, crop: {x,y,zoom,ar}}`; uncropped images still save as strings. No database migration.
- Old work-photo storage objects are removed **only after** a successful profile save, and only if no longer referenced in the work photo list. A crop-only edit does not delete the original.
- Photo processing uses the existing Supabase `worker-media` admin API; Cloudflare R2 is NOT part of this patch. Proxy upload limit is 4 MiB/image (room under Vercel's 4.5 MB request ceiling). No client compression, because original images must be preserved.

## Out of scope
- Identity slider design and video editor; original Identity crop defaults to its established 16:10 frame.
- Public gallery layout or styling, Landing Page, Admin Leads, Map, login, worker status, Supabase policies/migrations, and existing media.
- R2, paid plans/subscriptions or a new payment provider.

## Acceptance QA (on isolated STAGING only)
1. Mobile Admin → draft synthetic worker → Work Photos; select 2/4/6 compatible photos (each under 4 MB). Check gallery previews and per-photo crop.
2. Crop one portrait and one landscape; drag/pinch/zoom; Apply. Other photo crops unaffected.
3. Before Save All: verify no live profile change. Save All; check all original URLs stored and 3:4 framing in gallery.
4. Tap a cropped gallery card; full-screen viewer must show full original photo, with the pre-existing swipe/zoom intact.
5. Replace one image and remove another; Save All; previous image storage deletion must occur only after successful DB save.
6. Simulate a network upload failure and Retry. Simulate a DB-save rejection (linked FREE with >2): existing profile photos stay unchanged.
7. Test legacy URL-only photos, identity photo cropper, videos, Admin Leads, login, homepage and profile routes for regression.
8. `node --test tests/work-photo.test.mjs` and `npm run build` must pass in Codespaces. Run hosted Android visual QA before any merge.

## Production safety
- Installer aborts on any baseline file mismatch or dirty worktree.
- Installer refuses to apply to `main` or a detached head; create `feat/admin-photo-corrections` first.
- `vercel.json` disables auto preview deployments for this feature branch until a separately verified INFIXO-STAGING preview can be configured.
- Do not merge to `main`, deploy to production, or create real worker uploads as part of testing without a separate approval and successful QA.
