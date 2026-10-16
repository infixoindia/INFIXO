'use client';

import { useEffect, useRef, useState } from 'react';
import style from './WorkVideosEditor.module.css';

const W = 360, H = 480;
const FRAME_COUNT = 9;
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
const blobOf = (canvas, quality = .88) => new Promise((resolve, reject) =>
  canvas.toBlob(blob => blob ? resolve(blob) : reject(Error('Thumbnail export failed')), 'image/jpeg', quality)
);
const formatTime = seconds => {
  const s = Number.isFinite(seconds) ? Math.max(0, seconds) : 0;
  return String(Math.floor(s / 60)).padStart(2, '0') + ':' +
    String(Math.floor(s % 60)).padStart(2, '0') + '.' + Math.floor((s % 1) * 10);
};
const frameTimes = (duration, count = FRAME_COUNT) => {
  if (!Number.isFinite(duration) || duration <= 0) return [];
  const last = Math.max(.01, duration - .06);
  return Array.from({ length: count }, (_, i) => clamp((i + .5) / count * duration, .01, last));
};

/**
 * An offline filmstrip decoder: the main displayed video is NEVER played.
 * A separate muted <video> seeks through 9 moments and renders small JPEGs in memory.
 * The original video bytes and public Worker gallery are not modified.
 */
function useFilmstrip(src) {
  const [frames, setFrames] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    let waitClean = null;
    const decoder = document.createElement('video');
    decoder.crossOrigin = 'anonymous';
    decoder.preload = 'auto';
    decoder.muted = true;
    decoder.playsInline = true;
    setFrames([]);
    setLoading(true);
    const waitFor = (event, timeout = 7500) => new Promise((resolve, reject) => {
      let timer;
      const clean = () => {
        decoder.removeEventListener(event, ok);
        decoder.removeEventListener('error', fail);
        clearTimeout(timer);
        if (waitClean === clean) waitClean = null;
      };
      const ok = () => { clean(); resolve(); };
      const fail = () => { clean(); reject(Error('Could not decode this video')); };
      timer = setTimeout(() => { clean(); reject(Error('Video frame seek timed out')); }, timeout);
      waitClean = clean;
      decoder.addEventListener(event, ok, { once: true });
      decoder.addEventListener('error', fail, { once: true });
    });
    const generate = async () => {
      try {
        decoder.src = src;
        const metadata = waitFor('loadedmetadata', 12000);
        decoder.load();
        await metadata;
        if (cancelled || !Number.isFinite(decoder.duration) || decoder.duration <= 0) return;
        const canvas = document.createElement('canvas');
        canvas.width = 72;
        canvas.height = 96;
        const context = canvas.getContext('2d');
        if (!context) return;
        for (const t of frameTimes(decoder.duration)) {
          if (cancelled) return;
          const seeked = waitFor('seeked');
          decoder.currentTime = t;
          await seeked;
          if (cancelled) return;
          // Cover-crop each mini frame to match the existing 3:4 worker media card.
          const vw = decoder.videoWidth, vh = decoder.videoHeight;
          if (!vw || !vh) throw Error('Video frame not available');
          const scale = Math.max(canvas.width / vw, canvas.height / vh);
          const w = vw * scale, h = vh * scale;
          context.clearRect(0, 0, canvas.width, canvas.height);
          context.drawImage(decoder, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
          const image = canvas.toDataURL('image/jpeg', .65);
          setFrames(prev => [...prev, { time: t, image }]);
        }
      } catch {
        // Filmstrip is best-effort on Android. The precise slider and main preview
        // remain usable even when a browser cannot decode background thumbnails.
      } finally {
        if (!cancelled) setLoading(false);
        if (waitClean) waitClean();
        decoder.removeAttribute('src');
        decoder.load();
      }
    };
    void generate();
    return () => {
      cancelled = true;
      if (waitClean) waitClean();
      decoder.pause();
      decoder.removeAttribute('src');
      decoder.load();
    };
  }, [src]);
  return { frames, loading };
}

/** YouTube-style pause-only frame scrubbing + unchanged original 3:4 crop/export. */
export default function VideoThumbnailEditor({ src, onConfirm, onClose }) {
  const videoRef = useRef(null);
  const frameRef = useRef(null);
  const captureSerial = useRef(0);
  const requestedRef = useRef(0);
  const stageRef = useRef(null);
  const dragRef = useRef(null);
  const [duration, setDuration] = useState(0);
  const [selectedTime, setSelectedTime] = useState(0);
  const [capturedTime, setCapturedTime] = useState(null);
  const [locked, setLocked] = useState(false);
  const [frameUrl, setFrameUrl] = useState('');
  const [dimensions, setDimensions] = useState({ w: 1, h: 1 });
  const [position, setPosition] = useState({ x: .5, y: .5 });
  const [zoom, setZoom] = useState(1);
  const [error, setError] = useState('');
  const [working, setWorking] = useState(false);
  const [stageWidth, setStageWidth] = useState(280);
  const { frames, loading: stripLoading } = useFilmstrip(src);

  const maxTime = Math.max(0, duration - .04);
  const frameIsReady = frameUrl && capturedTime !== null &&
    Math.abs(capturedTime - selectedTime) <= .16;
  const showCrop = locked && Boolean(frameIsReady);

  useEffect(() => {
    const node = stageRef.current;
    if (!node) return;
    const update = () => setStageWidth(node.clientWidth || 280);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, [showCrop]);
  useEffect(() => {
    // Never leak local object URLs or let late frame captures update a closed editor.
    return () => {
      captureSerial.current += 1;
      if (frameRef.current) URL.revokeObjectURL(frameRef.current);
    };
  }, []);

  // All scrubbing is paused. No native video controls/play overlay at any point.
  const seekTo = (t) => {
    const video = videoRef.current;
    if (!video || !duration || working) return;
    const next = clamp(Number(t), 0, maxTime);
    if (!Number.isFinite(next)) return;
    requestedRef.current = next;
    captureSerial.current += 1;
    setSelectedTime(next);
    setLocked(false);
    setError('');
    video.pause();
    if (Math.abs(video.currentTime - next) <= .012 && video.readyState >= 2) {
      void captureFrame(video);
    } else {
      video.currentTime = next;
    }
  };

  const captureFrame = async video => {
    if (!video || !video.videoWidth || !video.videoHeight) return;
    if (Math.abs(video.currentTime - requestedRef.current) > .16) return;
    const serial = ++captureSerial.current;
    try {
      const sourceW = video.videoWidth, sourceH = video.videoHeight;
      const scale = Math.min(1, 1280 / Math.max(sourceW, sourceH));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(sourceW * scale));
      canvas.height = Math.max(1, Math.round(sourceH * scale));
      const ctx = canvas.getContext('2d');
      if (!ctx) throw Error('Canvas unavailable');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const blob = await blobOf(canvas, .93);
      if (serial !== captureSerial.current) return;
      const imageUrl = URL.createObjectURL(blob);
      if (frameRef.current) URL.revokeObjectURL(frameRef.current);
      frameRef.current = imageUrl;
      setFrameUrl(imageUrl);
      setDimensions({ w: canvas.width, h: canvas.height });
      setCapturedTime(video.currentTime);
      setPosition({ x: .5, y: .5 });
      setZoom(1);
    } catch {
      if (serial === captureSerial.current)
        setError('Frame capture unavailable. Please use an MP4 video supported by this browser.');
    }
  };

  const displayH = stageWidth * 4 / 3;
  const scale = Math.max(stageWidth / dimensions.w, displayH / dimensions.h) * zoom;
  const imageW = dimensions.w * scale, imageH = dimensions.h * scale;
  const bounds = axis => {
    const dim = axis === 'x' ? imageW : imageH;
    const view = axis === 'x' ? stageWidth : displayH;
    if (dim <= view) return [.5, .5];
    return [view / (2 * dim), 1 - view / (2 * dim)];
  };
  const startDrag = e => {
    if (!showCrop) return;
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
  const confirm = async () => {
    if (!showCrop) { setError('Please confirm a video frame first.'); return; }
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
  const startVideo = e => {
    const video = e.currentTarget;
    video.pause();
    if (!Number.isFinite(video.duration) || video.duration <= 0) {
      setError('This video has no readable timeline.');
      return;
    }
    setDuration(video.duration);
    requestedRef.current = Math.min(.1, Math.max(0, video.duration - .04));
    setSelectedTime(requestedRef.current);
    video.currentTime = requestedRef.current;
  };
  const stripPlaceholder = Array.from({ length: FRAME_COUNT }, (_, n) => n);
  return (
    <div className={style.overlay} role="dialog" aria-modal="true" aria-label="Choose video thumbnail">
      <div className={style.modal}>
        <div className={style.modalHeader}>
          <strong>Choose Video Thumbnail</strong>
          <button type="button" onClick={onClose} aria-label="Close thumbnail editor">✕</button>
        </div>
        <p className={style.help}>Neeche filmstrip timeline par finger slide karke exact video frame select karein. Video paused rahegi.</p>
        <div className={style.pausedVideoShell}>
          <video ref={videoRef} src={src} playsInline muted preload="auto"
            crossOrigin="anonymous" className={style.thumbVideo}
            onLoadedMetadata={startVideo}
            onLoadedData={e => { e.currentTarget.pause(); void captureFrame(e.currentTarget); }}
            onSeeked={e => { e.currentTarget.pause(); void captureFrame(e.currentTarget); }}
            onPlay={e => e.currentTarget.pause()}
            onError={() => setError('This video cannot be decoded or accessed for frame capture.')}
          />
          <span className={style.pauseCaption}>Paused frame preview</span>
        </div>
        <div className={style.timelineLabel}>
          <strong>{formatTime(selectedTime)} <span>/ {formatTime(duration)}</span></strong>
          <span>{stripLoading ? 'Loading frames…' : 'Slide to choose frame'}</span>
        </div>
        <div className={style.filmstrip} aria-label="Video frame timeline">
          {stripPlaceholder.map(i => (
            <div className={style.filmCell} key={i}>
              {frames[i]?.image
                ? <img src={frames[i].image} alt="" draggable={false}/>
                : <span className={style.filmShimmer} />}
            </div>
          ))}
          <span className={style.filmMarker} style={{
            left: (duration ? Math.min(100, Math.max(0, selectedTime / duration * 100)) : 0) + '%',
          }} aria-hidden="true" />
          <input className={style.filmRange} type="range"
            aria-label="Seek video frame" min="0" max={Math.max(.1, maxTime)}
            step=".05" value={selectedTime} disabled={!duration || working}
            onChange={e => seekTo(e.target.value)}
          />
        </div>
        <button type="button" className={style.selectFrame}
          disabled={!frameIsReady || working}
          onClick={() => { setLocked(true); setError(''); }}>
          {locked ? '✓ Frame Selected' : 'Confirm Frame'}
        </button>
        {showCrop && <>
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
          <button type="button" disabled={!showCrop || working} onClick={confirm}>
            {working ? 'Preparing…' : 'Confirm Thumbnail'}
          </button>
        </div>
      </div>
    </div>
  );
}
