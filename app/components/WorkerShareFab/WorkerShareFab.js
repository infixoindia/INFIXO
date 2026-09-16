"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

// Floating "X" button shown ONLY to the worker themselves (their private
// ?me=<id> link). Customers on the plain /w/[slug] link never see this.
const SIZE = 56;
const SUB = 44;
const PAD = 16;
const GAP = 14;
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

  // Initial placement: bottom-right corner, every time the page loads.
  useEffect(() => {
    const vp = getViewport();
    const initial = {
      left: vp.width - SIZE - PAD,
      top: vp.height - SIZE - PAD,
    };
    setPos(initial);
    posRef.current = initial;
  }, []);

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
      color: { dark: "#000000", light: "#ffffff" },
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
      // ignore
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
    // Exact approved wording — the link is embedded directly inside the
    // text on its own line (not passed as a separate `url`), so WhatsApp
    // never re-appends it somewhere else and the spacing stays exact.
    const shareText = [
      "Hello 👋",
      "",
      "Ye meri INFIXO Worker Profile hai.",
      "Aap yahan mera kaam, profile aur contact details dekh sakte hain.",
      "",
      "🔗 Meri Profile:",
      cleanUrl,
      "",
      "INFIXO — Apno Se Judne Ka Naya Tarika.",
    ].join("\n");

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${worker.fullName || "My"} — Infixo Profile`,
          text: shareText,
        });
      } catch (err) {
        if (err.name !== "AbortError") console.error("Share failed:", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        alert("Share isn't supported here — message copied instead.");
      } catch (err) {
        console.error("Copy failed:", err);
      }
    }
    setIsOpen(false);
  };

  if (!worker || !pos) return null;

  const vp = getViewport();
  const dockBottom = pos.top + SIZE / 2 > vp.height / 2;

  // The expanded buttons form a directional fan around X.
  // Right side: QR is upper-left of X and Share is above X, matching
  // the existing reference layout. Left side: mirror that same geometry
  // horizontally, so QR and Share stay inside the viewport instead of
  // escaping off-screen. Blue QR remains position #1 and orange Share #2.
  const onLeft = pos.left + SIZE / 2 <= vp.width / 2;
  const side = onLeft ? 1 : -1;
  const baseQrOffset = dockBottom
    ? { dx: side * (SUB + 17), dy: -50 }
    : { dx: side * (SUB + 17), dy: 50 };
  const baseShareOffset = dockBottom
    ? { dx: side * 10, dy: -96 }
    : { dx: side * 10, dy: 96 };

  // On the left side, keep the exact same two physical positions but
  // exchange which action occupies them: QR takes Share's position and
  // Share takes QR's position. Right side remains unchanged.
  const qrOffset = onLeft ? baseShareOffset : baseQrOffset;
  const shareOffset = onLeft ? baseQrOffset : baseShareOffset;

  const qrPos = isOpen
    ? { left: pos.left + qrOffset.dx, top: pos.top + qrOffset.dy }
    : { left: pos.left, top: pos.top };
  const sharePos = isOpen
    ? { left: pos.left + shareOffset.dx, top: pos.top + shareOffset.dy }
    : { left: pos.left, top: pos.top };

  return (
    <>
      {/* QR sub-button — navy blue, upper-left in the expanded fan */}
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

      {/* Share sub-button — orange, above the X in the expanded fan */}
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

      {/* QR share sheet — styled to match the supplied Wi-Fi QR reference. */}
      {showQr && qrDataUrl && (
        <div
          onClick={() => setShowQr(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.58)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            zIndex: 1000,
            overflow: "hidden",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Share Identity & Skill Profile"
            style={{
              width: "100%",
              maxWidth: "760px",
              maxHeight: "84vh",
              overflowY: "auto",
              background: "#242424",
              borderRadius: "28px 28px 0 0",
              padding: "28px 18px 72px",
              textAlign: "center",
              boxShadow: "0 -12px 40px rgba(0,0,0,0.35)",
              animation: "infixoQrSheetUp 0.32s cubic-bezier(.2,.8,.2,1) both",
            }}
          >
            <p
              style={{
                margin: "0 0 20px",
                fontSize: "17px",
                lineHeight: 1.2,
                fontWeight: 700,
                color: "#f5f5f5",
              }}
            >
              Share Identity &amp; Skill Profile
            </p>

            <div
              style={{
                width: "min(58vw, 270px)",
                margin: "0 auto 22px",
                padding: "11px",
                background: "#ffffff",
              }}
            >
              <img
                src={qrDataUrl}
                alt="Identity & Skill Profile QR code"
                style={{ width: "100%", display: "block", aspectRatio: "1 / 1" }}
              />
            </div>

            <button
              type="button"
              onClick={() => setShowQr(false)}
              style={{
                display: "block",
                width: "min(52%, 190px)",
                maxWidth: "190px",
                margin: "0 auto",
                border: "none",
                background: "#087FE5",
                color: "#ffffff",
                fontSize: "15px",
                fontWeight: 700,
                padding: "8px 14px",
                borderRadius: "999px",
                cursor: "pointer",
              }}
            >
              Done
            </button>

            <style>{`
              @keyframes infixoQrSheetUp {
                from { transform: translateY(100%); }
                to { transform: translateY(0); }
              }
            `}</style>
          </div>
        </div>
      )}
    </>
  );
}
