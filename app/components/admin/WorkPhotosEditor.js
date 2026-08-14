"use client";

import { useState } from "react";
import styles from "./Admin.module.css";
import { uploadWorkerFile, deleteWorkerFile } from "@/lib/storageService";

export default function WorkPhotosEditor({ worker, updateField, onSave, saving, saveMessage, saveError }) {
  const [uploading, setUploading] = useState(false);
  const photos = worker.photos || [];

  const handleAdd = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadWorkerFile(file, { workerId: worker.id, section: "photos" });
      updateField("photos", [...photos, url]);
    } catch (err) {
      console.error(err);
      alert("Photo upload failed. Please try again.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleReplace = async (idx, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadWorkerFile(file, { workerId: worker.id, section: "photos" });
      const oldUrl = photos[idx];
      const next = [...photos];
      next[idx] = url;
      updateField("photos", next);
      if (oldUrl) deleteWorkerFile(oldUrl);
    } catch (err) {
      console.error(err);
      alert("Photo upload failed. Please try again.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleRemove = (idx) => {
    const oldUrl = photos[idx];
    updateField("photos", photos.filter((_, i) => i !== idx));
    if (oldUrl) deleteWorkerFile(oldUrl);
  };

  return (
    <div className={styles.card}>
      <h3 className={styles.cardTitle}>Work Photos</h3>
      <p className={styles.hint} style={{ marginBottom: "0.75rem" }}>
        Tap a photo to replace it, or use ✕ to remove it.
      </p>

      <div className={styles.mediaGrid}>
        {photos.map((url, idx) => (
          <div className={styles.mediaItem} key={idx}>
            <img src={url} alt={`Work photo ${idx + 1}`} />
            <label style={{ position: "absolute", inset: 0, opacity: 0, zIndex: 1 }}>
              <input type="file" accept="image/*" onChange={(e) => handleReplace(idx, e)} />
            </label>
            <button
              type="button"
              className={styles.mediaRemoveBtn}
              onClick={() => handleRemove(idx)}
              aria-label="Remove photo"
              style={{ position: "relative", zIndex: 2 }}
            >
              ✕
            </button>
          </div>
        ))}

        <label className={styles.uploadBox}>
          {uploading ? "Uploading..." : "+ Add Photo"}
          <input type="file" accept="image/*" onChange={handleAdd} />
        </label>
      </div>

      <div className={styles.saveRow}>
        <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={onSave} disabled={saving}>
          {saving ? "Saving..." : "Save Photos"}
        </button>
        {saveMessage && <span className={styles.saveMsg}>{saveMessage}</span>}
        {saveError && <span className={styles.saveMsgError}>{saveError}</span>}
      </div>
    </div>
  );
}
