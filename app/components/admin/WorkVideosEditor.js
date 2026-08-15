"use client";

import { useState } from "react";
import styles from "./Admin.module.css";
import { uploadWorkerFile, deleteWorkerFile } from "@/lib/storageService";

// Reads a video file's real length in the browser and formats it as MM:SS.
// This removes the need to type duration manually.
function getVideoDurationLabel(file) {
  return new Promise((resolve) => {
    const videoEl = document.createElement("video");
    videoEl.preload = "metadata";
    videoEl.onloadedmetadata = () => {
      window.URL.revokeObjectURL(videoEl.src);
      const totalSeconds = Math.round(videoEl.duration || 0);
      const mins = Math.floor(totalSeconds / 60);
      const secs = totalSeconds % 60;
      resolve(`${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`);
    };
    videoEl.onerror = () => resolve("00:00");
    videoEl.src = URL.createObjectURL(file);
  });
}

export default function WorkVideosEditor({ worker, updateField, onSave, saving, saveMessage, saveError }) {
  const videos = worker.videos || [];
  const [newVideoFile, setNewVideoFile] = useState(null);
  const [newThumbFile, setNewThumbFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  // Bumping this key remounts the file inputs so their "chosen file" text
  // clears after a successful add, making it obvious they're ready for
  // a new upload again.
  const [fileInputKey, setFileInputKey] = useState(0);

  const handleAddVideo = async () => {
    if (!newVideoFile || !newThumbFile) {
      alert("Please choose both a video file and a thumbnail image.");
      return;
    }
    setUploading(true);
    try {
      const durationLabel = await getVideoDurationLabel(newVideoFile);
      const videoUrl = await uploadWorkerFile(newVideoFile, { workerId: worker.id, section: "videos" });
      const thumbUrl = await uploadWorkerFile(newThumbFile, { workerId: worker.id, section: "video-thumbs" });
      updateField("videos", [
        ...videos,
        { video: videoUrl, thumbnail: thumbUrl, duration: durationLabel },
      ]);
      setNewVideoFile(null);
      setNewThumbFile(null);
      setFileInputKey((k) => k + 1); // reset the file pickers
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

      <div className={styles.card} style={{ background: "#f9fafb" }}>
        <p className={styles.label} style={{ marginBottom: "0.5rem" }}>Add New Video</p>

        <div className={styles.field}>
          <label className={styles.label}>Video File</label>
          <input
            key={`video-${fileInputKey}`}
            type="file"
            accept="video/*"
            onChange={(e) => setNewVideoFile(e.target.files?.[0] || null)}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Thumbnail Image</label>
          <input
            key={`thumb-${fileInputKey}`}
            type="file"
            accept="image/*"
            onChange={(e) => setNewThumbFile(e.target.files?.[0] || null)}
          />
        </div>
        <p className={styles.hint} style={{ marginBottom: "0.5rem" }}>
          Duration is detected automatically from the video file — no need to type it.
        </p>
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
