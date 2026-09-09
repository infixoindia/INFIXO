"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

// Floating "X" button shown ONLY to the worker themselves (their private
// ?me=<id> link). Customers on the plain /w/[slug] link never see this.
//
// - Uses Pointer Events (unified touch + mouse) with pointer capture for
//   reliable drag AND tap detection on real phones.
// - Draggable anywhere on screen, snaps to the nearest left/right edge on
//   release (never rests in the horizontal middle).
// - Position is tracked with position:fixed + the visualViewport API so it
//   never drifts or gets stuck mid-scroll on mobile browsers.
// - Tapping it (without dragging) expands two sub-buttons: QR and Share.
//   Their pop-out direction adapts to whichever corner it's docked in.
// - Share sub-button always shares the CLEAN profile link (no ?me= token).
const SIZE = 56;
const SUB = 44;
const PAD = 16;
const NAVY = "#1B2A70";
const ORANGE = "#F7941D";
const DRAG_THRESHOLD = 6;

function getViewport() {
  if (typeof window === "undefined") return { width: 0, height: 0 };
  if (window.visualViewport) {
    return { width: window.visualViewport.width, height: window.visualViewport.height };
  }
  return { width: window.innerWidth, height: window.innerHeight };
}

export default function WorkerShareFab({ worker, cleanUrl }) {
  const [pos, setPos] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const posRef = useRef(null);
  const drag = useRef({ dragging: false, moved: false, startX: 0, startY: 0, origLeft: 0, origTop: 0, pointerId: null });

  // Initial placement: bottom-right corner, clear of the footer text.
  useEffect(() => {
    const vp = getViewport();
    const initial = {
      left: vp.width - SIZE - PAD,
      top: vp.height - SIZE - PAD,
    };
    setPos(initial);
    posRef.current = initial;
  }, []);

  // Keep it correctly clamped if the viewport changes (address bar
  // show/hide, keyboard, rotation) — this is what stops it drifting.
  useEffect(() => {
    const onResize = () => {
      if (!posRef.current) return;
      const vp = getViewport();
      const next = clamp(posRef.current.left, posRef.current.top, vp);
      posRef.current = next;
      setPos(next);
    };
    window.visualViewport?.addEventListener("resize", onResize);
    window.addEventListener("resize", onResize);
    return () => {
      window.visualViewport?.removeEventListener("resize", onResize);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  useEffect(() => {
    if (!cleanUrl) return;
    QRCode.toDataURL(cleanUrl, {
      width: 260,
      margin: 1,
      color: { dark: NAVY, light: "#ffffff" },
    })
      .then(setQrDataUrl)
      .catch((err) => console.error("QR generation failed:", err));
  }, [cleanUrl]);

  function clamp(left, top, vp) {
    const v = vp || getViewport();
    const maxLeft = v.width - SIZE - PAD;
    const maxTop = v.height - SIZE - PAD;
    return {
      left: Math.max(PAD, Math.min(left, maxLeft)),
      top: Math.max(PAD, Math.min(top, maxTop)),
    };
  }

  const onPointerDown = (e) => {
    if (!posRef.current) return;
    const btn = e.currentTarget;
    btn.setPointerCapture(e.pointerId);
    const d = drag.current;
    d.dragging = true;
    d.moved = false;
    d.pointerId = e.pointerId;
    d.startX = e.clientX;
    d.startY = e.clientY;
    d.origLeft = posRef.current.left;
    d.origTop = posRef.current.top;
  };

  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d.dragging || d.pointerId !== e.pointerId) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) d.moved = true;
    if (d.moved) {
      const next = clamp(d.origLeft + dx, d.origTop + dy);
      posRef.current = next;
      setPos(next);
    }
  };

  const onPointerUp = (e) => {
    const d = drag.current;
    if (!d.dragging || d.pointerId !== e.pointerId) return;
    d.dragging = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (err) {
      // ignore — capture may already be released
    }
    if (d.moved) {
      const vp = getViewport();
      const current = posRef.current;
      const goRight = current.left + SIZE / 2 > vp.width / 2;
      const finalLeft = goRight ? vp.width - SIZE - PAD : PAD;
      const next = { left: finalLeft, top: current.top };
      posRef.current = next;
      setPos(next);
    } else {
      setIsOpen((v) => !v);
    }
    d.moved = false;
  };

  const handleShare = async () => {
    const shareText = `Namaste! 🙏 Yeh meri Infixo par verified profile hai — mera kaam (photos, videos, details) yahan dekh sakte hain:`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${worker.fullName || "My"} — Infixo Profile`,
          text: shareText,
          url: cleanUrl,
        });
      } catch (err) {
        if (err.name !== "AbortError") console.error("Share failed:", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(cleanUrl);
        alert("Share isn't supported here — link copied instead.");
      } catch (err) {
        console.error("Copy failed:", err);
      }
    }
    setIsOpen(false);
  };

  if (!worker || !pos) return null;

  const vp = getViewport();
  const dockRight = pos.left + SIZE / 2 > vp.width / 2;
  const dockBottom = pos.top + SIZE / 2 > vp.height / 2;

  const nearDx = dockRight ? -60 : 60;
  const nearDy = dockBottom ? -50 : 50;
  const farDx = dockRight ? -10 : 10;
  const farDy = dockBottom ? -95 : 95;

  const qrPos = isOpen ? { left: pos.left + nearDx, top: pos.top + nearDy } : { left: pos.left, top: pos.top };
  const sharePos = isOpen ? { left: pos.left + farDx, top: pos.top + farDy } : { left: pos.left, top: pos.top };

  return (
    <>
      {/* QR sub-button */}
      <button
        type="button"
        onClick={() => {
          setShowQr(true);
          setIsOpen(false);
        }}
        style={{
          position: "fixed",
          left: qrPos.left,
          top: qrPos.top,
          width: SUB,
          height: SUB,
          borderRadius: "50%",
          background: NAVY,
          border: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 3px 10px rgba(27,42,112,0.45)",
          opacity: isOpen ? 1 : 0,
          transform: isOpen ? "scale(1)" : "scale(0.6)",
          transition: "all 0.28s cubic-bezier(.34,1.56,.64,1)",
          pointerEvents: isOpen ? "auto" : "none",
          zIndex: 998,
          cursor: "pointer",
        }}
        aria-label="Show QR code"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      </button>

      {/* Share sub-button */}
      <button
        type="button"
        onClick={handleShare}
        style={{
          position: "fixed",
          left: sharePos.left,
          top: sharePos.top,
          width: SUB,
          height: SUB,
          borderRadius: "50%",
          background: ORANGE,
          border: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 3px 10px rgba(247,148,29,0.45)",
          opacity: isOpen ? 1 : 0,
          transform: isOpen ? "scale(1)" : "scale(0.6)",
          transition: "all 0.32s cubic-bezier(.34,1.56,.64,1)",
          pointerEvents: isOpen ? "auto" : "none",
          zIndex: 998,
          cursor: "pointer",
        }}
        aria-label="Share profile"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1B2A70" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 2 11 13" />
          <path d="M22 2 15 22l-4-9-9-4z" />
        </svg>
      </button>

      {/* Main X button */}
      <button
        type="button"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{
          position: "fixed",
          left: pos.left,
          top: pos.top,
          width: SIZE,
          height: SIZE,
          borderRadius: "50%",
          background: NAVY,
          border: "none",
          boxShadow: "0 0 22px rgba(30,70,220,0.55)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "grab",
          userSelect: "none",
          touchAction: "none",
          zIndex: 999,
        }}
        aria-label="Share this profile"
      >
        <svg width="30" height="30" viewBox="0 0 40 40">
          <polygon points="3,3 15,3 37,29 25,29" fill="none" stroke={ORANGE} strokeWidth="2.6" strokeLinejoin="round" />
          <polygon points="37,3 25,3 3,29 15,29" fill="none" stroke={ORANGE} strokeWidth="2.6" strokeLinejoin="round" />
        </svg>
      </button>

      {/* QR modal */}
      {showQr && qrDataUrl && (
        <div
          onClick={() => setShowQr(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1.5rem",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: "18px",
              padding: "1.5rem",
              textAlign: "center",
              maxWidth: "300px",
              width: "100%",
              boxShadow: "0 20px 45px rgba(0,0,0,0.3)",
            }}
          >
            <p style={{ fontWeight: 700, color: NAVY, marginBottom: "0.75rem" }}>
              Scan to view {worker.fullName || "this"} profile
            </p>
            <img src={qrDataUrl} alt="Profile QR code" style={{ width: "100%", borderRadius: "10px" }} />
            <button
              type="button"
              onClick={() => setShowQr(false)}
              style={{
                marginTop: "1rem",
                border: "none",
                background: NAVY,
                color: "#fff",
                fontWeight: 700,
                padding: "0.6rem 1.5rem",
                borderRadius: "999px",
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
