"use client";

import { useState } from "react";
import styles from "./Admin.module.css";
import { uploadWorkerFile, deleteWorkerFile } from "@/lib/storageService";

export default function WorkVideosEditor({ worker, updateField, onSave, saving, saveMessage, saveError }) {
  const videos = worker.videos || [];
  const [newVideoFile, setNewVideoFile] = useState(null);
  const [newThumbFile, setNewThumbFile] = useState(null);
  const [newDuration, setNewDuration] = useState("00:10");
  const [uploading, setUploading] = useState(false);

  const handleAddVideo = async () => {
    if (!newVideoFile || !newThumbFile) {
      alert("Please choose both a video file and a thumbnail image.");
      return;
    }
    setUploading(true);
    try {
      const videoUrl = await uploadWorkerFile(newVideoFile, { workerId: worker.id, section: "videos" });
      const thumbUrl = await uploadWorkerFile(newThumbFile, { workerId: worker.id, section: "video-thumbs" });
      updateField("videos", [
        ...videos,
        { video: videoUrl, thumbnail: thumbUrl, duration: newDuration || "00:10" },
      ]);
      setNewVideoFile(null);
      setNewThumbFile(null);
      setNewDuration("00:10");
    } catch (err) {
      console.error(err);
      alert("Video upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = (idx) => {
    const item = videos[idx];
    updateField("videos", videos.filter((_, i) => i !== idx));
    if (item?.video) deleteWorkerFile(item.video);
    if (item?.thumbnail) deleteWorkerFile(item.thumbnail);
  };

  const handleDurationChange = (idx, val) => {
    const next = [...videos];
    next[idx] = { ...next[idx], duration: val };
    updateField("videos", next);
  };

  return (
    <div className={styles.card}>
      <h3 className={styles.cardTitle}>Work Videos</h3>

      <div className={styles.mediaGrid}>
        {videos.map((item, idx) => (
          <div className={styles.mediaItem} key={idx}>
            <img src={item.thumbnail} alt={`Video ${idx + 1}`} />
            <button
              type="button"
              className={styles.mediaRemoveBtn}
              onClick={() => handleRemove(idx)}
              aria-label="Remove video"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {videos.map((item, idx) => (
        <div className={styles.field} key={`dur-${idx}`}>
          <label className={styles.label}>Video {idx + 1} — duration label</label>
          <input
            className={styles.input}
            value={item.duration || ""}
            onChange={(e) => handleDurationChange(idx, e.target.value)}
            placeholder="00:10"
          />
        </div>
      ))}

      <div className={styles.card} style={{ background: "#f9fafb" }}>
        <p className={styles.label} style={{ marginBottom: "0.5rem" }}>Add New Video</p>

        <div className={styles.field}>
          <label className={styles.label}>Video File</label>
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setNewVideoFile(e.target.files?.[0] || null)}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Thumbnail Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setNewThumbFile(e.target.files?.[0] || null)}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Duration Label</label>
          <input
            className={styles.input}
            value={newDuration}
            onChange={(e) => setNewDuration(e.target.value)}
            placeholder="00:10"
          />
        </div>
        <button
          type="button"
          className={`${styles.btn} ${styles.btnSecondary}`}
          onClick={handleAddVideo}
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "+ Add Video"}
        </button>
      </div>

      <div className={styles.saveRow}>
        <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={onSave} disabled={saving}>
          {saving ? "Saving..." : "Save Videos"}
        </button>
        {saveMessage && <span className={styles.saveMsg}>{saveMessage}</span>}
        {saveError && <span className={styles.saveMsgError}>{saveError}</span>}
      </div>
    </div>
  );
}
