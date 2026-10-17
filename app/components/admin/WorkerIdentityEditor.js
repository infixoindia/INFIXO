"use client";

import { useState } from "react";
import styles from "./Admin.module.css";
import { uploadWorkerFile, deleteWorkerFile } from "@/lib/storageService";
import { SKILL_CATEGORIES, resolveSkillCategory } from "@/lib/skillCategories";
import PhotoCropper from "./PhotoCropper";
import CroppedImage from "../CroppedImage/CroppedImage";

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
  const [cropIdx, setCropIdx] = useState(null);
  const [iconCropIdx, setIconCropIdx] = useState(null);
  const heroSlides = worker.heroSlides || [];
  const chosenIcon = heroSlides.findIndex(slide => slide?.pwaIcon && slide?.image);
  const iconIndex = chosenIcon < 0 ? 0 : chosenIcon;
  const iconSlide = heroSlides[iconIndex];
  const chooseIconPhoto = index => updateField("heroSlides", heroSlides.map((slide, i) => ({ ...slide, pwaIcon: i === index })));


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
      const added = [...heroSlides, { image: url }];
      updateField("heroSlides", added);
      setCropIdx(added.length - 1);
    } catch (err) {
      console.error(err);
      alert(`Image upload failed: ${err?.message || "Please try again."}`);
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
      next[index] = { image: url, ...(heroSlides[index]?.pwaIcon ? { pwaIcon: true } : {}) };
      updateField("heroSlides", next);
      setCropIdx(index);
      if (oldUrl) deleteWorkerFile(oldUrl);
    } catch (err) {
      console.error(err);
      alert(`Image upload failed: ${err?.message || "Please try again."}`);
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
        <select
          className={styles.select}
          value={resolveSkillCategory(worker.profession)?.label || ""}
          onChange={(e) => updateField("profession", e.target.value)}
        >
          <option value="" disabled>
            Select a profession…
          </option>
          {SKILL_CATEGORIES.map((cat) => (
            <option key={cat.slug} value={cat.label}>
              {cat.label}
            </option>
          ))}
        </select>
        <p className={styles.hint}>
          This also sets the "Primary Skill" shown in Work Details automatically.
        </p>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Phone Number (for Contact / WhatsApp buttons)</label>
        <input
          type="tel"
          className={styles.input}
          value={worker.phone || ""}
          onChange={(e) => updateField("phone", e.target.value)}
          placeholder="9876543210 or +91 9876543210"
        />
        <p className={styles.hint}>
          Used for the public "Contact" and "Chat" buttons. Leave empty to hide those buttons.
        </p>
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
              {slide.crop ? <CroppedImage src={slide.image} crop={slide.crop} alt={`Slide ${idx + 1}`} /> : <img src={slide.image} alt={`Slide ${idx + 1}`} />}
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
                style={{ zIndex: 2 }}
              >
                ✕
              </button>
              <button
                type="button"
                onClick={() => setCropIdx(idx)}
                style={{ position: "absolute", bottom: 4, right: 4, zIndex: 2, border: "none", borderRadius: 5, background: "rgba(0,0,0,0.55)", color: "#fff", fontSize: "0.7rem", padding: "2px 7px", cursor: "pointer" }}
              >
                Crop
              </button>
              <div className={styles.mediaReorderBtns} style={{ zIndex: 2 }}>
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
        <p className={styles.hint}>Tap a photo to replace it. Use ↑ ↓ to reorder. Use Crop to set what shows in the Identity Profile (original photo is kept).</p>

        {iconSlide?.image && (
          <div style={{ marginTop: 16, padding: 14, border: "1px solid #d9e3f4", borderRadius: 14, background: "#f5f8ff" }}>
            <strong style={{ display: "block", fontSize: 15, marginBottom: 4 }}>Home Screen App Icon</strong>
            <p className={styles.hint} style={{ marginTop: 0 }}>
              Same Identity photo, but separate square framing. Original photo and Identity crop never change.
            </p>
            <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ position: "relative", width: 136, height: 136, flexShrink: 0, borderRadius: 26, overflow: "hidden", background: "#002D97" }}>
                {iconSlide.pwaCrop ? (
                  <CroppedImage src={iconSlide.image} crop={iconSlide.pwaCrop} alt="PWA icon preview" />
                ) : (
                  <img src={iconSlide.image} alt="PWA icon preview" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 35%" }} />
                )}
                <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "37%", background: "linear-gradient(180deg, transparent, rgba(3,19,43,.78))", pointerEvents: "none" }} />
                <img src="/images/logo.png" alt="INFIXO" style={{ position: "absolute", left: "14%", bottom: "4.5%", width: "72%", height: "22%", objectFit: "contain", pointerEvents: "none" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 9, minWidth: 170, flex: 1 }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                  {heroSlides.map((slide, i) => slide?.image && (
                    <button type="button" key={i} onClick={() => chooseIconPhoto(i)}
                      style={{ border: i === iconIndex ? "2px solid #002D97" : "1px solid #cbd5e1", background: i === iconIndex ? "#e4eeff" : "#fff", color: "#173264", padding: "7px 10px", borderRadius: 9, cursor: "pointer" }}>
                      Photo {i + 1}{i === iconIndex ? " ✓" : ""}
                    </button>
                  ))}
                </div>
                <button type="button" onClick={() => setIconCropIdx(iconIndex)}
                  style={{ background: "#002D97", border: 0, color: "#fff", fontWeight: 700, borderRadius: 10, padding: "11px 12px", cursor: "pointer", textAlign: "center" }}>
                  Adjust App Icon (1:1)
                </button>
                <small style={{ color: "#64748b" }}>Official INFIXO logo + subtle dark gradient. Save Identity to publish.</small>
              </div>
            </div>
          </div>
        )}
        {iconCropIdx !== null && heroSlides[iconCropIdx]?.image && (
          <PhotoCropper
            src={heroSlides[iconCropIdx].image}
            initialCrop={heroSlides[iconCropIdx].pwaCrop}
            frameRatio={1}
            context="Home Screen App Icon"
            onCancel={() => setIconCropIdx(null)}
            onApply={crop => {
              updateField("heroSlides", heroSlides.map((slide, i) => i === iconCropIdx ? { ...slide, pwaCrop: crop } : slide));
              setIconCropIdx(null);
            }}
          />
        )}

      </div>

      {cropIdx !== null && heroSlides[cropIdx] && (
        <PhotoCropper
          src={heroSlides[cropIdx].image}
          initialCrop={heroSlides[cropIdx].crop}
          onCancel={() => setCropIdx(null)}
          onApply={(crop) => {
            updateField("heroSlides", heroSlides.map((s, i) => (i === cropIdx ? { ...s, crop } : s)));
            setCropIdx(null);
          }}
        />
      )}

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
