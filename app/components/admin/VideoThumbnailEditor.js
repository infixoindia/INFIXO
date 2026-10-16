'use client';

import { useEffect, useRef, useState } from 'react';
import style from './WorkVideosEditor.module.css';

const W = 360, H = 480;
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
const blobOf = (canvas, quality = .88) => new Promise((resolve, reject) =>
  canvas.toBlob(blob => blob ? resolve(blob) : reject(Error('Thumbnail export failed')), 'image/jpeg', quality)
);

/** Captures a real frame and exports a separate 3:4 JPEG; original video is untouched. */
export default function VideoThumbnailEditor({ src, onConfirm, onClose }) {
  const videoRef = useRef(null);
  const frameRef = useRef(null);
  const stageRef = useRef(null);
  const dragRef = useRef(null);
  const [frameUrl, setFrameUrl] = useState('');
  const [dimensions, setDimensions] = useState({ w: 1, h: 1 });
  const [position, setPosition] = useState({ x: .5, y: .5 });
  const [zoom, setZoom] = useState(1);
  const [error, setError] = useState('');
  const [working, setWorking] = useState(false);
  const [stageWidth, setStageWidth] = useState(280);
  useEffect(() => {
    const node = stageRef.current;
    if (!node) return;
    const update = () => setStageWidth(node.clientWidth || 280);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, [frameUrl]);
  useEffect(() => {
    return () => { if (frameRef.current) URL.revokeObjectURL(frameRef.current); };
  }, []);
  const displayH = stageWidth * 4 / 3;
  const scale = Math.max(stageWidth / dimensions.w, displayH / dimensions.h) * zoom;
  const imageW = dimensions.w * scale, imageH = dimensions.h * scale;
  const bounds = (axis) => {
    const dim = axis === 'x' ? imageW : imageH;
    const view = axis === 'x' ? stageWidth : displayH;
    if (dim <= view) return [.5, .5];
    return [view / (2 * dim), 1 - view / (2 * dim)];
  };
  const startDrag = e => {
    if (!frameUrl) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { x: e.clientX, y: e.clientY, pos: position };
  };
  const moveDrag = e => {
    if (!dragRef.current) return;
    const drag = dragRef.current;
    const [minX, maxX] = bounds('x'), [minY, maxY] = bounds('y');
    setPosition({
      x: clamp(drag.pos.x - (e.clientX - drag.x) / imageW, minX, maxX),
      y: clamp(drag.pos.y - (e.clientY - drag.y) / imageH, minY, maxY),
    });
  };
  const capture = async () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) {
      setError('Video frame abhi ready nahi hai. Video play/seek karke retry karein.');
      return;
    }
    try {
      video.pause();
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw Error('Canvas unavailable');
      ctx.drawImage(video, 0, 0);
      const blob = await blobOf(canvas, .92);
      const localUrl = URL.createObjectURL(blob);
      if (frameRef.current) URL.revokeObjectURL(frameRef.current);
      frameRef.current = localUrl;
      setFrameUrl(localUrl);
      setDimensions({ w: canvas.width, h: canvas.height });
      setPosition({ x: .5, y: .5 });
      setZoom(1);
      setError('');
    } catch (e) { setError('Frame capture blocked or unsupported in this browser: ' + e.message); }
  };
  const confirm = async () => {
    if (!frameUrl) { setError('Pehle video se frame select karein.'); return; }
    setWorking(true);
    try {
      const image = new Image();
      image.src = frameUrl;
      await image.decode();
      const canvas = document.createElement('canvas');
      canvas.width = W; canvas.height = H;
      const ctx = canvas.getContext('2d');
      const sourceScale = Math.max(W / image.width, H / image.height) * zoom;
      const sw = W / sourceScale, sh = H / sourceScale;
      const sx = clamp(position.x * image.width - sw / 2, 0, image.width - sw);
      const sy = clamp(position.y * image.height - sh / 2, 0, image.height - sh);
      ctx.drawImage(image, sx, sy, sw, sh, 0, 0, W, H);
      const blob = await blobOf(canvas);
      if (blob.size > 1_500_000) throw Error('Thumbnail too large');
      onConfirm(blob);
    } catch (e) { setError(e.message || 'Thumbnail export failed'); }
    finally { setWorking(false); }
  };
  const setZoomSafe = value => {
    const next = Number(value);
    const nextScale = Math.max(stageWidth / dimensions.w, displayH / dimensions.h) * next;
    const inW = dimensions.w * nextScale, inH = dimensions.h * nextScale;
    setZoom(next);
    setPosition(pos => ({
      x: clamp(pos.x, stageWidth / (2 * inW), 1 - stageWidth / (2 * inW)),
      y: clamp(pos.y, displayH / (2 * inH), 1 - displayH / (2 * inH)),
    }));
  };
  return (
    <div className={style.overlay} role="dialog" aria-modal="true" aria-label="Choose video thumbnail">
      <div className={style.modal}>
        <div className={style.modalHeader}>
          <strong>Choose Video Thumbnail</strong>
          <button type="button" onClick={onClose} aria-label="Close thumbnail editor">✕</button>
        </div>
        <p className={style.help}>Video play ya timeline seek karein, phir <b>Select This Frame</b> dabayein.</p>
        <video ref={videoRef} src={src} controls playsInline preload="metadata"
          crossOrigin="anonymous" className={style.thumbVideo}
          onError={() => setError('This video cannot be decoded or accessed for frame capture.')}
        />
        <button type="button" className={style.selectFrame} onClick={capture}>Select This Frame</button>
        {frameUrl && <>
          <p className={style.help}>3:4 card framing — drag to move, zoom to adjust.</p>
          <div ref={stageRef} className={style.cropStage}
            onPointerDown={startDrag} onPointerMove={moveDrag}
            onPointerUp={() => { dragRef.current = null; }}
            onPointerCancel={() => { dragRef.current = null; }}>
            <img draggable="false" alt="Selected thumbnail frame" src={frameUrl}
              style={{
                position: 'absolute', width: imageW, height: imageH,
                left: stageWidth / 2 - imageW * position.x,
                top: displayH / 2 - imageH * position.y,
                maxWidth: 'none', touchAction: 'none', userSelect: 'none',
              }}/>
          </div>
          <label className={style.zoomLabel}>Zoom {zoom.toFixed(1)}×
            <input type="range" min="1" max="4" step=".05" value={zoom}
              onChange={e => setZoomSafe(e.target.value)}/>
          </label>
          <button type="button" onClick={() => { setZoom(1); setPosition({ x: .5, y: .5 }); }}>
            Reset Frame
          </button>
        </>}
        {error && <p className={style.error} role="alert">{error}</p>}
        <div className={style.modalActions}>
          <button type="button" onClick={onClose}>Cancel</button>
          <button type="button" disabled={!frameUrl || working} onClick={confirm}>
            {working ? 'Preparing…' : 'Confirm Thumbnail'}
          </button>
        </div>
      </div>
    </div>
  );
}
