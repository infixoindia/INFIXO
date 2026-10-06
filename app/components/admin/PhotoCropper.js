'use client';

import { useEffect, useRef, useState } from 'react';
import { FRAME_RATIO, clampCrop, coverSize, defaultCrop, layoutCrop, sanitizeCrop, validCrop } from '@/lib/photoCrop';

const MARGIN = 26;
const MAX_ZOOM = 5;

// Crop & Adjust popup. It only produces crop metadata; the uploaded original is never touched.
export default function PhotoCropper({ src, initialCrop, onApply, onCancel }) {
  const [stageW, setStageW] = useState(340);
  const [ar, setAr] = useState(validCrop(initialCrop) ? initialCrop.ar : null);
  const [view, setView] = useState(validCrop(initialCrop) ? { x: initialCrop.x, y: initialCrop.y, zoom: initialCrop.zoom } : null);
  const viewRef = useRef(view);
  const pointers = useRef(new Map());
  const pinch = useRef(0);

  const fw = stageW - MARGIN * 2;
  const fh = fw / FRAME_RATIO;

  useEffect(() => {
    const fit = () => setStageW(Math.max(260, Math.min(window.innerWidth - 40, 460)));
    fit();
    window.addEventListener('resize', fit);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('resize', fit); document.body.style.overflow = prev; };
  }, []);

  const update = next => {
    if (!ar) return;
    const c = clampCrop(fw, fh, { ...next, ar });
    const v = { x: c.x, y: c.y, zoom: c.zoom };
    viewRef.current = v;
    setView(v);
  };

  const onImgLoad = e => {
    const a = e.currentTarget.naturalWidth / e.currentTarget.naturalHeight;
    if (!a) return;
    setAr(a);
    if (!view) { const d = defaultCrop(fw, fh, a); const v = { x: d.x, y: d.y, zoom: 1 }; viewRef.current = v; setView(v); }
  };

  const size = () => { const { w, h } = coverSize(fw, fh, ar); const z = viewRef.current.zoom; return { W: w * z, H: h * z }; };

  const down = e => {
    if (!ar || !viewRef.current) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) { const [a, b] = [...pointers.current.values()]; pinch.current = Math.hypot(a.x - b.x, a.y - b.y); }
  };
  const move = e => {
    const p = pointers.current.get(e.pointerId);
    if (!p || !ar || !viewRef.current) return;
    const v = viewRef.current;
    if (pointers.current.size === 1) {
      const { W, H } = size();
      update({ ...v, x: v.x - (e.clientX - p.x) / W, y: v.y - (e.clientY - p.y) / H });
    } else if (pointers.current.size === 2) {
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      const [a, b] = [...pointers.current.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinch.current) update({ ...v, zoom: Math.min(MAX_ZOOM, Math.max(1, v.zoom * (d / pinch.current))) });
      pinch.current = d;
      return;
    }
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
  };
  const up = e => { pointers.current.delete(e.pointerId); pinch.current = 0; };
  const wheel = e => { const v = viewRef.current; if (v) update({ ...v, zoom: Math.min(MAX_ZOOM, Math.max(1, v.zoom * Math.exp(-e.deltaY * 0.0015))) }); };

  const ready = !!(ar && view);
  const l = ready ? layoutCrop(fw, fh, { ...view, ar }) : null;
  const imgStyle = (dx, dy) => ({ position: 'absolute', left: l.left + dx, top: l.top + dy, width: l.width, height: l.height, maxWidth: 'none', maxHeight: 'none', display: 'block', userSelect: 'none', pointerEvents: 'none' });

  const apply = () => { if (ready) onApply(sanitizeCrop({ ...view, ar })); };
  const reset = () => { if (ar) { const d = defaultCrop(fw, fh, ar); update({ x: d.x, y: d.y, zoom: 1 }); } };

  const btn = { border: 'none', borderRadius: 9, padding: '10px 16px', fontWeight: 700, fontSize: 14, cursor: 'pointer' };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,.78)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 12 }}>
      <div style={{ background: '#fff', borderRadius: 14, padding: 14, width: stageW + 28, maxWidth: '100%' }}>
        <div style={{ fontWeight: 800, fontSize: 16, color: '#0f172a' }}>Crop &amp; Adjust</div>
        <div style={{ fontSize: 12, color: '#64748b', margin: '2px 0 10px' }}>Drag to move • Pinch / slider to zoom. Bright box = visible in Identity Profile. Original photo is not changed.</div>

        <div
          onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onWheel={wheel}
          style={{ position: 'relative', width: stageW, height: fh + MARGIN * 2, background: '#0b1220', borderRadius: 10, overflow: 'hidden', touchAction: 'none', cursor: 'grab' }}
        >
          {!ready && <img src={src} alt="" onLoad={onImgLoad} style={{ position: 'absolute', opacity: 0, width: 1, height: 1 }} />}
          {ready && (
            <>
              <img src={src} alt="" draggable={false} style={{ ...imgStyle(MARGIN, MARGIN), opacity: 0.35 }} />
              <div style={{ position: 'absolute', left: MARGIN, top: MARGIN, width: fw, height: fh, overflow: 'hidden', outline: '2px solid #fff', boxShadow: '0 0 0 1px rgba(0,0,0,.4)' }}>
                <img src={src} alt="" draggable={false} style={imgStyle(0, 0)} />
                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(to right, transparent 33.2%, rgba(255,255,255,.35) 33.3%, transparent 33.5%, transparent 66.5%, rgba(255,255,255,.35) 66.6%, transparent 66.8%), linear-gradient(to bottom, transparent 33.2%, rgba(255,255,255,.35) 33.3%, transparent 33.5%, transparent 66.5%, rgba(255,255,255,.35) 66.6%, transparent 66.8%)', pointerEvents: 'none' }} />
              </div>
            </>
          )}
          {!ready && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 13 }}>Loading photo…</div>}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '12px 0' }}>
          <span style={{ fontSize: 12, color: '#475569' }}>Zoom</span>
          <input type="range" min="1" max={MAX_ZOOM} step="0.01" value={view?.zoom ?? 1} disabled={!ready} onChange={e => view && update({ ...view, zoom: Number(e.target.value) })} style={{ flex: 1 }} />
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button type="button" onClick={onCancel} style={{ ...btn, background: '#f1f5f9', color: '#334155' }}>Cancel</button>
          <button type="button" onClick={reset} disabled={!ready} style={{ ...btn, background: '#f1f5f9', color: '#334155' }}>Reset</button>
          <button type="button" onClick={apply} disabled={!ready} style={{ ...btn, background: '#0b2e8a', color: '#fff', opacity: ready ? 1 : 0.5 }}>Apply</button>
        </div>
      </div>
    </div>
  );
}
