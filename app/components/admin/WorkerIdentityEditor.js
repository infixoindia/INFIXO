"use client";

import { useState } from "react";
import styles from "./Admin.module.css";
import { uploadWorkerFile, deleteWorkerFile } from "@/lib/storageService";

export default function WorkerIdentityEditor({
  worker,
  updateField,
  onSave,
  saving,
  saveMessage,
  saveError,
  saveLabel = "Save Identity",
}) {
  const [uploading, setUploading] = useState(false);
  const heroSlides = worker.heroSlides || [];

  const serviceAreaText = Array.isArray(worker.serviceArea)
    ? worker.serviceArea.join(", ")
    : worker.serviceArea || "";

  const handleServiceAreaChange = (val) => {
    const arr = val
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    updateField("serviceArea", arr);
  };

  const handleAddImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadWorkerFile(file, {
        workerId: worker.id,
        section: "slider",
      });
      updateField("heroSlides", [...heroSlides, { image: url }]);
    } catch (err) {
      console.error(err);
      alert("Image upload failed. Please try again.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleReplaceImage = async (index, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadWorkerFile(file, {
        workerId: worker.id,
        section: "slider",
      });
      const oldUrl = heroSlides[index]?.image;
      const next = [...heroSlides];
      next[index] = { image: url };
      updateField("heroSlides", next);
      if (oldUrl) deleteWorkerFile(oldUrl);
    } catch (err) {
      console.error(err);
      alert("Image upload failed. Please try again.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleRemoveImage = (index) => {
    const oldUrl = heroSlides[index]?.image;
    const next = heroSlides.filter((_, i) => i !== index);
    updateField("heroSlides", next);
    if (oldUrl) deleteWorkerFile(oldUrl);
  };

  const handleMove = (index, dir) => {
    const target = index + dir;
    if (target < 0 || target >= heroSlides.length) return;
    const next = [...heroSlides];
    [next[index], next[target]] = [next[target], next[index]];
    updateField("heroSlides", next);
  };

  return (
    <div className={styles.card}>
      <h3 className={styles.cardTitle}>Worker Identity</h3>

      <div className={styles.field}>
        <label className={styles.label}>Name</label>
        <input
          className={styles.input}
          value={worker.fullName || ""}
          onChange={(e) => updateField("fullName", e.target.value)}
          placeholder="e.g. Rahul Sharma"
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Profession</label>
        <input
          className={styles.input}
          value={worker.profession || ""}
          onChange={(e) => updateField("profession", e.target.value)}
          placeholder="e.g. Electrician"
        />
      </div>

      <div className={styles.row2}>
        <div className={styles.field}>
          <label className={styles.label}>Experience (Years)</label>
          <input
            type="number"
            min="0"
            className={styles.input}
            value={worker.experience ?? ""}
            onChange={(e) => updateField("experience", e.target.value)}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Service Area</label>
          <input
            className={styles.input}
            value={serviceAreaText}
            onChange={(e) => handleServiceAreaChange(e.target.value)}
            placeholder="Indore, Dewas"
          />
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Slider Images</label>
        <div className={styles.mediaGrid}>
          {heroSlides.map((slide, idx) => (
            <div className={styles.mediaItem} key={idx}>
              <img src={slide.image} alt={`Slide ${idx + 1}`} />
              <label
                className={styles.uploadBox}
                style={{ position: "absolute", inset: 0, opacity: 0, zIndex: 1 }}
              >
                <input type="file" accept="image/*" onChange={(e) => handleReplaceImage(idx, e)} />
              </label>
              <button
                type="button"
                className={styles.mediaRemoveBtn}
                onClick={() => handleRemoveImage(idx)}
                aria-label="Remove image"
                style={{ position: "relative", zIndex: 2 }}
              >
                ✕
              </button>
              <div className={styles.mediaReorderBtns} style={{ position: "relative", zIndex: 2 }}>
                <button type="button" onClick={() => handleMove(idx, -1)} disabled={idx === 0}>
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => handleMove(idx, 1)}
                  disabled={idx === heroSlides.length - 1}
                >
                  ↓
                </button>
              </div>
            </div>
          ))}

          <label className={styles.uploadBox}>
            {uploading ? "Uploading..." : "+ Add Image"}
            <input type="file" accept="image/*" onChange={handleAddImage} />
          </label>
        </div>
        <p className={styles.hint}>Tap a photo to replace it. Use ↑ ↓ to reorder.</p>
      </div>

      <div className={styles.saveRow}>
        <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={onSave} disabled={saving}>
          {saving ? "Saving..." : saveLabel}
        </button>
        {saveMessage && <span className={styles.saveMsg}>{saveMessage}</span>}
        {saveError && <span className={styles.saveMsgError}>{saveError}</span>}
      </div>
    </div>
  );
}
