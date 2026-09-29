"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import QRCode from "qrcode";
import styles from "./Admin.module.css";
import { deleteWorker, setWorkerActive } from "@/lib/workerService";

// Shows Edit / copyable links / QR code / Share — used on the worker's
// dedicated "share" page (not inline in the list).
//
// Two different links are shown on purpose:
//  - "Customer Link" (plain /w/slug) — safe to send to anyone, never shows
//    any Share/Edit button on the public page.
//  - "Worker's Own Link" (/w/slug/IPUC-XXXXXX) — give this ONLY to the worker.
//    Opening it shows them a "Share My Profile" button so they can easily
//    re-share their profile with new customers themselves.
export default function WorkerShareCard({ worker }) {
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [copiedCustomer, setCopiedCustomer] = useState(false);
  const [copiedWorker, setCopiedWorker] = useState(false);
  const [customerUrl, setCustomerUrl] = useState("");
  const [workerOwnUrl, setWorkerOwnUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const base = `${window.location.origin}/w/${worker.slug}`;
    setCustomerUrl(base);
    setWorkerOwnUrl(`${base}/${worker.ipuc}`);

    // Generate the QR code entirely in the browser — no external service,
    // no network call, works even if the phone is offline afterwards.
    // The QR points to the plain customer link.
    QRCode.toDataURL(base, {
      width: 220,
      margin: 1,
      color: { dark: "#1f2937", light: "#ffffff" },
    })
      .then(setQrDataUrl)
      .catch((err) => console.error("QR generation failed:", err));
  }, [worker.slug, worker.id, worker.ipuc]);

  const copyText = async (text, setFlag) => {
    try {
      await navigator.clipboard.writeText(text);
      setFlag(true);
      setTimeout(() => setFlag(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  const handleBlockToggle = async () => {
    const nextActive = worker.isActive === false;
    const action = nextActive ? "unblock" : "block";
    if (!window.confirm(nextActive
      ? `Unblock ${worker.fullName || "this worker"}? Their two profile links will work again.`
      : `Block ${worker.fullName || "this worker"}? Both the customer link and worker link will stop opening, but the worker data will remain saved.`)) return;
    setBusy(true);
    try {
      const updated = await setWorkerActive(worker.id, nextActive);
      window.location.reload();
    } catch (err) {
      alert(err?.message || `Failed to ${action} worker.`);
    } finally {
      setBusy(false);
    }
  };

  const handlePermanentDelete = async () => {
    if (!window.confirm(`Permanently delete ${worker.fullName || "this worker"}? This will remove the worker record and uploaded worker media from Supabase. This cannot be undone.`)) return;
    setBusy(true);
    try {
      await deleteWorker(worker.id);
      router.replace("/admin/workers");
    } catch (err) {
      alert(err?.message || "Failed to delete worker.");
      setBusy(false);
    }
  };

  const handleShare = async () => {
    const shareText = [
      `Hello ${worker.fullName || "there"} 👋`,
      "",
      "Aapki INFIXO Profile Ready Hai! 🎉",
      "Ab aap apni profile customers ke saath share karke apne kaam aur contact details dikha sakte hain.",
      "",
      "🔗 Profile Dekhein:",
      workerOwnUrl,
      "",
      "INFIXO — Apno Se Judne Ka Naya Tarika.",
      "",
      "— Team INFIXO",
    ].join("\n");

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${worker.fullName || "Worker"} — Infixo Profile`,
          text: shareText,
        });
      } catch (err) {
        if (err.name !== "AbortError") console.error("Share failed:", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        setCopiedWorker(true);
        setTimeout(() => setCopiedWorker(false), 2000);
        alert("Share isn't supported on this browser — the message was copied instead.");
      } catch (err) {
        console.error("Copy failed:", err);
      }
    }
  };

  return (
    <div className={styles.workerCard}>
      <div className={styles.workerCardHeader}>
        <div className={styles.workerListName}>{worker.fullName || "Untitled Worker"}</div>
        <div className={styles.workerListMeta}>{worker.profession || "—"}</div>
      </div>

      <Link href={`/admin/workers/${worker.id}`} className={styles.workerEditBtn}>
        ✏️ Edit Profile
      </Link>

      <p className={styles.label} style={{ marginBottom: "0.35rem" }}>Customer Link</p>
      <p className={styles.hint} style={{ marginTop: 0, marginBottom: "0.4rem" }}>
        Safe to send to anyone — no buttons show up for them.
      </p>
      <div className={styles.workerLinkRow}>
        <span className={styles.workerLinkText}>{customerUrl || "Loading link…"}</span>
        <button type="button" className={styles.workerCopyBtn} onClick={() => copyText(customerUrl, setCopiedCustomer)}>
          {copiedCustomer ? "Copied!" : "Copy"}
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

      <div style={{ marginTop: "1.25rem", paddingTop: "1rem", borderTop: "1px dashed #e5e7eb" }}>
        <p className={styles.label} style={{ marginBottom: "0.35rem" }}>Worker's Own Link</p>
        <p className={styles.hint} style={{ marginTop: 0, marginBottom: "0.4rem" }}>
          Give this ONLY to {worker.fullName || "the worker"} — it shows them their own
          "Share My Profile" button so they can send it to new customers themselves.
        </p>
        <div className={styles.workerLinkRow}>
          <span className={styles.workerLinkText}>{workerOwnUrl || "Loading link…"}</span>
          <button type="button" className={styles.workerCopyBtn} onClick={() => copyText(workerOwnUrl, setCopiedWorker)}>
            {copiedWorker ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>

      <div style={{ marginTop: "1.25rem", paddingTop: "1rem", borderTop: "1px solid #e5e7eb" }}>
        <p className={styles.label} style={{ marginBottom: "0.35rem" }}>Profile Status</p>
        <p className={styles.hint} style={{ marginTop: 0, marginBottom: "0.7rem" }}>
          {worker.isActive === false
            ? "Blocked — customer and worker links are currently off."
            : "Active — both customer and worker links are live."}
        </p>
        <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
          <button type="button" className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSmall}`} onClick={handleBlockToggle} disabled={busy}>
            {worker.isActive === false ? "Unblock Profile" : "Block Profile"}
          </button>
          <button type="button" className={`${styles.btn} ${styles.btnDanger} ${styles.btnSmall}`} onClick={handlePermanentDelete} disabled={busy}>
            Permanently Delete
          </button>
        </div>
      </div>
    </div>
  );
}
