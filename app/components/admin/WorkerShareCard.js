"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import styles from "./Admin.module.css";

export default function WorkerShareCard({ worker }) {
  const [isOpen, setIsOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [copied, setCopied] = useState(false);
  const [profileUrl, setProfileUrl] = useState("");

  useEffect(() => {
    if (!isOpen) return; // only generate once the card is actually expanded

    const url = `${window.location.origin}/w/${worker.slug}`;
    setProfileUrl(url);

    // Generate the QR code entirely in the browser — no external service,
    // no network call, works even if the phone is offline afterwards.
    QRCode.toDataURL(url, {
      width: 220,
      margin: 1,
      color: { dark: "#1f2937", light: "#ffffff" },
    })
      .then(setQrDataUrl)
      .catch((err) => console.error("QR generation failed:", err));
  }, [isOpen, worker.slug]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  const handleShare = async () => {
    // TODO: share message wording is being finalized with the admin —
    // placeholder text for now.
    const shareText = `${worker.fullName || "Worker"} ki Infixo profile:`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${worker.fullName || "Worker"} — Infixo Profile`,
          text: shareText,
          url: profileUrl,
        });
      } catch (err) {
        if (err.name !== "AbortError") console.error("Share failed:", err);
      }
    } else {
      handleCopy();
      alert("Share isn't supported on this browser — the link was copied instead.");
    }
  };

  return (
    <div className={styles.workerCard}>
      <button
        type="button"
        className={styles.workerCardHeader}
        onClick={() => setIsOpen((v) => !v)}
        style={{
          width: "100%",
          border: "none",
          background: "none",
          textAlign: "left",
          padding: 0,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div className={styles.workerListName}>{worker.fullName || "Untitled Worker"}</div>
          <div className={styles.workerListMeta}>{worker.profession || "—"}</div>
        </div>
        <span style={{ fontSize: "1.1rem", color: "#9ca3af" }}>{isOpen ? "▲" : "▼"}</span>
      </button>

      {isOpen && (
        <div style={{ marginTop: "0.85rem" }}>
          <Link href={`/admin/workers/${worker.id}`} className={styles.workerEditBtn}>
            ✏️ Edit Profile
          </Link>

          <div className={styles.workerLinkRow}>
            <span className={styles.workerLinkText}>{profileUrl || "Loading link…"}</span>
            <button type="button" className={styles.workerCopyBtn} onClick={handleCopy}>
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>

          {qrDataUrl && (
            <div className={styles.workerQrBox}>
              <img src={qrDataUrl} alt={`QR code for ${worker.fullName}'s profile`} />
            </div>
          )}

          <button type="button" className={styles.workerShareBtn} onClick={handleShare}>
            📤 Share Profile
          </button>
        </div>
      )}
    </div>
  );
}
