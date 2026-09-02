'use client';

import { useState } from "react";
import Link from "next/link";
import styles from './NavigationTabs.module.css';

// Keeps digits and a leading + only, for the tel: link.
function normalizeForCall(phone) {
  const trimmed = (phone || "").trim();
  const digits = trimmed.replace(/[^\d+]/g, "");
  return digits;
}

// WhatsApp's wa.me links need digits only, with country code.
// If it looks like a plain 10-digit Indian number, prefix 91.
function normalizeForWhatsApp(phone) {
  let digits = (phone || "").replace(/\D/g, "");
  if (digits.length === 10) digits = `91${digits}`;
  return digits;
}

export default function NavigationTabs({ worker, basePath = "", queryString = "" }) {
  const photoCount = worker?.photos?.length || 0;
  const videoCount = worker?.videos?.length || 0;
  const phone = worker?.phone?.trim();

  const [confirmAction, setConfirmAction] = useState(null); // "call" | "chat" | null

  const handleConfirm = () => {
    if (confirmAction === "call") {
      window.location.href = `tel:${normalizeForCall(phone)}`;
    } else if (confirmAction === "chat") {
      window.open(`https://wa.me/${normalizeForWhatsApp(phone)}`, "_blank");
    }
    setConfirmAction(null);
  };

  return (
    <div className={styles.grid}>
      {/* Work Details */}
      <Link href={`${basePath}/work-details${queryString}`} className={`${styles.card} ${styles.blue}`}>
        <div className={styles.glassShine} />
        <div className={styles.iconBox}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
        </div>
        <div className={styles.textGroup}>
          <span>Work</span>
          <span>Details</span>
        </div>
      </Link>

      {/* Worker Details */}
      <Link href={`${basePath}/worker-details${queryString}`} className={`${styles.card} ${styles.orange}`}>
        <div className={styles.glassShine} />
        <div className={styles.iconBox}>
          <svg viewBox="0 0 24 24" fill="#EA580C">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </div>
        <div className={styles.textGroup}>
          <span>Worker</span>
          <span>Details</span>
        </div>
      </Link>

      {/* Work Photos */}
      <Link href={`${basePath}/work-photos${queryString}`} className={`${styles.card} ${styles.green}`}>
        <div className={styles.glassShine} />
        <div className={styles.iconBox}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="3" />
            <circle cx="8.5" cy="8.5" r="1.5" fill="#059669" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
        </div>
        <div className={styles.textGroup}>
          <span>Work</span>
          <span>Photos</span>
        </div>
        <div className={styles.badge}>
          <span>{photoCount}</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
        </div>
      </Link>

      {/* Work Videos */}
      <Link href={`${basePath}/work-videos${queryString}`} className={`${styles.card} ${styles.purple}`}>
        <div className={styles.glassShine} />
        <div className={styles.iconBox}>
          <svg viewBox="0 0 24 24" fill="#9333EA">
            <rect x="3" y="3" width="18" height="18" rx="4" />
            <polygon points="10,8 16,12 10,16" fill="#FFF" />
          </svg>
        </div>
        <div className={styles.textGroup}>
          <span>Work</span>
          <span>Videos</span>
        </div>
        <div className={styles.badge}>
          <span>{videoCount}</span>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
          </svg>
        </div>
      </Link>

      {/* NEW — Contact & Chat (only shown if a phone number exists) */}
      {phone && (
        <>
          <button
            type="button"
            onClick={() => setConfirmAction("call")}
            className={`${styles.card} ${styles.contact}`}
          >
            <div className={styles.glassShine} />
            <div className={styles.iconBox}>
              <svg viewBox="0 0 24 24" fill="#2563EB">
                <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24 11.36 11.36 0 0 0 3.58.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.4 21 3 13.6 3 4.5a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.36 11.36 0 0 0 .57 3.58 1 1 0 0 1-.25 1.02z" />
              </svg>
            </div>
            <div className={styles.textGroup}>
              <span>Contact</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setConfirmAction("chat")}
            className={`${styles.card} ${styles.chat}`}
          >
            <div className={styles.glassShine} />
            <div className={styles.iconBox}>
              <svg viewBox="0 0 24 24" fill="#22C35E">
                <path d="M12 2a10 10 0 0 0-8.6 15.06L2 22l5.06-1.33A10 10 0 1 0 12 2zm5.62 14.24c-.24.67-1.4 1.28-1.93 1.33-.5.05-.99.24-3.34-.7-2.82-1.13-4.66-3.98-4.8-4.17-.14-.19-1.15-1.53-1.15-2.93s.72-2.08.98-2.36c.24-.27.53-.34.71-.34h.5c.16 0 .38-.06.6.45.24.56.8 1.95.87 2.1.07.15.12.32.02.51-.09.19-.14.31-.28.48-.14.17-.29.37-.42.5-.14.14-.29.29-.12.57.16.28.72 1.19 1.55 1.93 1.06.95 1.96 1.24 2.24 1.38.28.14.44.12.61-.07.16-.19.7-.82.89-1.1.19-.28.37-.23.62-.14.26.09 1.63.77 1.9.91.28.14.46.21.53.33.07.12.07.68-.17 1.36z"/>
              </svg>
            </div>
            <div className={styles.textGroup}>
              <span>Chat</span>
            </div>
          </button>
        </>
      )}

      {confirmAction && (
        <div className={styles.modalOverlay} onClick={() => setConfirmAction(null)}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <p className={styles.modalTitle}>
              {confirmAction === "call"
                ? "Do you want to call this worker?"
                : "Do you want to open WhatsApp chat?"}
            </p>
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.modalCancelBtn}
                onClick={() => setConfirmAction(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={
                  confirmAction === "call" ? styles.modalCallBtn : styles.modalChatBtn
                }
                onClick={handleConfirm}
              >
                {confirmAction === "call" ? "Call" : "Chat"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
