"use client";

import { useState } from "react";

import { useRef } from "react";

import { useEffect } from "react";

import Link from "next/link";
import styles from "./WorkVideos.module.css";

export default function WorkVideos() {
  
const videos = [
  {
    video: "/videos/work1.mp4",
  },
  {
    video: "/videos/work2.mp4",
  },
  {
    video: "/videos/work3.mp4",
  },
  {
    video: "/videos/work4.mp4",
  },
];
  
const [viewerOpen, setViewerOpen] = useState(false);

const [isLoading, setIsLoading] = useState(true);
  
const [currentIndex, setCurrentIndex] = useState(0);

const [currentTime, setCurrentTime] = useState(0);

const [duration, setDuration] = useState(0);

const [isPaused, setIsPaused] = useState(false);
  
const videoRef = useRef(null); 

const trackRef = useRef(null);

const [isDragging, setIsDragging] = useState(false);

const formatTime = (t) => {
  const safe = isNaN(t) ? 0 : t;
  return `${Math.floor(safe / 60)}:${String(Math.floor(safe % 60)).padStart(2,"0")}`;
};

const seekToClientX = (clientX) => {
  const track = trackRef.current;
  const video = videoRef.current;
  if (!track || !video || !duration) return;
  const rect = track.getBoundingClientRect();
  const fraction = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
  const newTime = fraction * duration;
  video.currentTime = newTime;
  setCurrentTime(newTime);
};

const handleSeekStart = (e) => {
  e.preventDefault();
  setIsDragging(true);
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  seekToClientX(clientX);
};

useEffect(() => {
  if (!isDragging) return;

  const handleMove = (e) => {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    seekToClientX(clientX);
  };
  const handleUp = () => setIsDragging(false);

  window.addEventListener("mousemove", handleMove);
  window.addEventListener("mouseup", handleUp);
  window.addEventListener("touchmove", handleMove, { passive:false });
  window.addEventListener("touchend", handleUp);

  return () => {
    window.removeEventListener("mousemove", handleMove);
    window.removeEventListener("mouseup", handleUp);
    window.removeEventListener("touchmove", handleMove);
    window.removeEventListener("touchend", handleUp);
  };
}, [isDragging, duration]);

const openViewer = (index) => {

  setCurrentIndex(index);

  setIsLoading(true);

  setViewerOpen(true);

};

const closeViewer = () => {
  setViewerOpen(false);
};
  
  return (
    <section className={styles.wrapper}>

      <div className={styles.header}>

        <Link
          href="/"
          className={styles.backLink}
        >
          <svg
            className={styles.backArrow}
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M15 5L8 12L15 19"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>

        <div className={styles.headerText}>
          <h2>Work Videos</h2>
          <p>Professional work videos.</p>
        </div>

      </div>

                      <div className={styles.gallery}>

  {videos.map((item, index) => (

          <div
  key={index}
  className={styles.videoCard}
  onClick={() => openViewer(index)}
>

            <div className={styles.thumbnail}>

  <video
    src={item.video}
    muted
    playsInline
  />

  <span className={styles.duration}>
    00:28
  </span>

</div>

          </div>

        ))}

      </div>


{viewerOpen && (

  <div className={styles.viewer}>

    <div className={styles.imageCounter}>
      {currentIndex + 1} / 4
    </div>

    <button
      className={styles.closeButton}
      onClick={closeViewer}
      aria-label="Close"
    >

      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
      >

        <path
          d="M6 6L18 18M18 6L6 18"
          stroke="white"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

      </svg>

    </button>

    <div className={styles.viewerContent}>

  <div className={styles.videoWrapper}>
            
  {isLoading && (
    <div className={styles.videoLoader}></div>
  )}

<video
  ref={videoRef}
  className={styles.viewerVideo}
  src={videos[currentIndex].video}
  autoPlay
  muted
  playsInline
  controls={false}
  onPlay={() => setIsPaused(false)}
  onPause={() => setIsPaused(true)}
  onLoadedData={() => setIsLoading(false)}
  onLoadedMetadata={(e)=>{
    setDuration(e.target.duration);
  }}
  onTimeUpdate={(e)=>{
    setCurrentTime(e.target.currentTime);
  }}
  style={{
    opacity:isLoading ? 0 : 1
  }}

/>

 {isPaused && (

<div
  className={styles.centerPlay}
  onClick={()=>{
    if(!videoRef.current) return;

    videoRef.current.play();
  }}
>

  <svg viewBox="0 0 24 24" fill="white">
    <path d="M6.5 5v14l11-7z" />
  </svg>

</div>

)}
  
<div className={styles.videoControls}>

  <span className={styles.timeLabel}>
    {formatTime(currentTime)}
  </span>

  <div
    className={styles.progressTrack}
    ref={trackRef}
    onMouseDown={handleSeekStart}
    onTouchStart={handleSeekStart}
  >

    <div
      className={styles.progressFill}
      style={{
        width: `${duration ? (currentTime / duration) * 100 : 0}%`,
        transition: isDragging ? "none" : "width .15s linear"
      }}
    />

    <div
      className={styles.progressThumb}
      style={{
        left: `${duration ? (currentTime / duration) * 100 : 0}%`,
        transition: isDragging ? "none" : "left .15s linear"
      }}
    />

  </div>

  <span className={styles.timeLabel}>
    {formatTime(duration)}
  </span>

</div>
    
</div>

</div>

</div>

)}

  
    </section>
  );
}
