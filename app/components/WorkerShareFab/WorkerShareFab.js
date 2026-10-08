"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();
  const [pos, setPos] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [qrDragY, setQrDragY] = useState(0);
  const qrDrag = useRef(null);

  const closeQr = () => { setShowQr(false); setQrDragY(0); };
  const startQrDrag = (e) => {
    qrDrag.current = { y: e.clientY, moved: false };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const moveQrDrag = (e) => {
    const d = qrDrag.current;
    if (!d) return;
    const dy = e.clientY - d.y;
    if (Math.abs(dy) > 6) d.moved = true;
    setQrDragY(Math.max(0, dy));
  };
  const endQrDrag = (e) => {
    const d = qrDrag.current;
    qrDrag.current = null;
    if (!d) return;
    if (!d.moved || e.clientY - d.y > 90) closeQr();
    else setQrDragY(0);
  };
  const cancelQrDrag = () => { qrDrag.current = null; setQrDragY(0); };

  // While the sheet is open, stop the browser's pull-to-refresh from firing
  // when the sheet is dragged down.
  useEffect(() => {
    if (!showQr) return undefined;
    const h = document.documentElement, b = document.body;
    const ph = h.style.overscrollBehaviorY, pb = b.style.overscrollBehaviorY;
    h.style.overscrollBehaviorY = "contain";
    b.style.overscrollBehaviorY = "contain";
    return () => { h.style.overscrollBehaviorY = ph; b.style.overscrollBehaviorY = pb; };
  }, [showQr]);
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

  // Auto-collapse the QR/Share action buttons after 5 seconds.
  // The main X button stays visible; only the expanded action buttons close.
  useEffect(() => {
    if (!isOpen) return;
    const timer = window.setTimeout(() => {
      setIsOpen(false);
    }, 5000);
    return () => window.clearTimeout(timer);
  }, [isOpen]);

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

  // The FAB is a worker-only control. It is allowed on the private home
  // profile (/w/slug?me=...) and on the IPUC private home profile
  // (/w/slug/IPUC-XXXXXX), but never on detail routes.
  const rootPath = worker?.slug ? `/w/${worker.slug}` : null;
  const ipucHomePath = worker?.slug && worker?.ipuc
    ? `/w/${worker.slug}/${worker.ipuc}`
    : null;
  const normalizedPath = (pathname || "").replace(/\/$/, "");
  const isAllowedHomePath = normalizedPath === rootPath || normalizedPath === ipucHomePath;
  if (!isAllowedHomePath) return null;

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
          padding: 0,
          borderRadius: "50%",
          background: "transparent",
          border: "none",
          overflow: "hidden",
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
        <img
          src="/images/worker-fab-x.png"
          alt=""
          draggable="false"
          style={{
            width: "100%",
            height: "100%",
            display: "block",
            objectFit: "cover",
            objectPosition: "center",
            borderRadius: "50%",
            pointerEvents: "none",
          }}
        />
      </button>

      {/* QR share sheet — styled to match the supplied Wi-Fi QR reference. */}
      {showQr && qrDataUrl && (
        <div
          style={{
            touchAction: "none",
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
            aria-label="Scan this QR code to view my profile"
            style={{
              width: "100%",
              maxWidth: "760px",
              maxHeight: "92vh",
              display: "flex",
              flexDirection: "column",
              animation: "infixoQrSheetUp 0.32s cubic-bezier(.2,.8,.2,1) both",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                minHeight: 0,
                transform: `translateY(${qrDragY}px)`,
                transition: qrDrag.current ? "none" : "transform 0.22s ease",
              }}
            >
              {/* Top edge: rounded corners + smooth wave scoop; the grey handle sits INSIDE the scoop.
                  Drag/tap here to close. Pieces overlap by 1px so no seam line shows. */}
              <div
                style={{ position: "relative", display: "flex", height: "36px", touchAction: "none", flexShrink: 0 }}
              >
                <div style={{ position: "absolute", left: 0, right: 0, top: "26px", bottom: 0, background: "#ffffff" }} />
                <div style={{ flex: 1, background: "#ffffff", borderTopLeftRadius: "28px", marginRight: "-1px" }} />
                <svg width="192" height="36" viewBox="0 0 192 36" style={{ display: "block", flexShrink: 0, position: "relative" }} aria-hidden="true">
                  <path d="M0 0 C32 0 46 22 96 22 C146 22 160 0 192 0 L192 36 L0 36 Z" fill="#ffffff" />
                </svg>
                <div style={{ flex: 1, background: "#ffffff", borderTopRightRadius: "28px", marginLeft: "-1px" }} />
                <div
                  role="button"
                  aria-label="Close"
                  onPointerDown={startQrDrag}
                  onPointerMove={moveQrDrag}
                  onPointerUp={endQrDrag}
                  onPointerCancel={cancelQrDrag}
                  style={{ position: "absolute", left: "50%", top: 0, width: "88px", height: "30px", marginLeft: "-44px", touchAction: "none", cursor: "grab" }}
                >
                  <div style={{ position: "absolute", left: "50%", top: "8px", width: "40px", height: "5px", marginLeft: "-20px", borderRadius: "999px", background: "#dcdee2" }} />
                </div>
              </div>

              <div
                style={{
                  background: "#ffffff",
                  overflowY: "auto",
                  overscrollBehavior: "contain",
                  padding: "2px 22px calc(18px + env(safe-area-inset-bottom, 0px))",
                  textAlign: "center",
                }}
              >
                <p
                  style={{
                    margin: "0 auto 16px",
                    maxWidth: "260px",
                    fontSize: "18px",
                    lineHeight: 1.25,
                    fontWeight: 600,
                    color: "#1b1b1f",
                  }}
                >
                  Scan this QR code to view my profile
                </p>

                <div style={{ width: "min(46vw, 210px)", margin: "0 auto 12px", background: "#ffffff" }}>
                  <img
                    src={qrDataUrl}
                    alt="Identity & Skill Profile QR code"
                    style={{ width: "100%", display: "block", aspectRatio: "1 / 1" }}
                  />
                </div>

                <p
                  style={{
                    margin: "0 auto 20px",
                    maxWidth: "230px",
                    fontSize: "11.5px",
                    lineHeight: 1.4,
                    color: "#a3a7ae",
                  }}
                >
                  Place your camera over the entire QR code to start scanning
                </p>

                <button
                  type="button"
                  onClick={closeQr}
                  style={{
                    display: "block",
                    width: "88%",
                    margin: "0 auto",
                    border: "none",
                    background: "#0b0b0d",
                    color: "#ffffff",
                    fontSize: "15px",
                    fontWeight: 700,
                    padding: "14px 14px",
                    borderRadius: "999px",
                    cursor: "pointer",
                  }}
                >
                  Close
                </button>
              </div>
            </div>

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
