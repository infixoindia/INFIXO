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

const [translateX, setTranslateX] = useState(0);
  
const [direction, setDirection] = useState(null);

const [isAnimating, setIsAnimating] = useState(false);

const startX = useRef(0);

const currentX = useRef(0);

const isSwiping = useRef(false);

const [currentTime, setCurrentTime] = useState(0);

const [duration, setDuration] = useState(0);

const [isPaused, setIsPaused] = useState(false);

const [isMuted, setIsMuted] = useState(true);

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

const toggleMute = () => {
  setIsMuted(prev => !prev);
};

  
const handleTouchStart = (e) => {
  startX.current = e.touches[0].clientX;
  currentX.current = startX.current;
  isSwiping.current = true;
};

const handleTouchMove = (e) => {
  if (!isSwiping.current) return;

  currentX.current = e.touches[0].clientX;
  const delta = currentX.current - startX.current;

  setTranslateX(delta);
};

const handleTouchEnd = () => {
  if (!isSwiping.current) return;

  isSwiping.current = false;

  const delta = currentX.current - startX.current;
  const threshold = 80;

  if (Math.abs(delta) > threshold) {

  setIsAnimating(true);

  if (delta < 0 && currentIndex < videos.length - 1) {

    setDirection("left");

  } else if (delta > 0 && currentIndex > 0) {

    setDirection("right");

  } else {

    setTranslateX(0);

    setIsAnimating(false);

  }

} else {

  setTranslateX(0);

  }
  
  };
  
useEffect(() => {
  setIsMuted(true);
}, [currentIndex]);

const openViewer = (index) => {

  setCurrentIndex(index);

  setIsLoading(true);

  setIsMuted(true);

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

<div
  className={styles.videoWrapper}
  onTouchStart={handleTouchStart}
  onTouchMove={handleTouchMove}
  onTouchEnd={handleTouchEnd}

  onTransitionEnd={() => {

  if (!isAnimating) return;

  if (direction === "left") {
    setCurrentIndex(prev => prev + 1);
  } else if (direction === "right") {
    setCurrentIndex(prev => prev - 1);
  }

  setDirection(null);
  setTranslateX(0);
  setIsAnimating(false);

  setIsPaused(true);
  setCurrentTime(0);
  setDuration(0);
  setIsLoading(true);

}}
style={{
  transform: isAnimating
    ? direction === "left"
      ? "translateX(-100%)"
      : "translateX(100%)"
    : `translateX(${translateX}px)`,

  transition: isSwiping.current
    ? "none"
    : "transform .30s ease",
}}
>
    <div
  className={styles.videoSlider}
  style={{
    transform: `translateX(calc(-100% + ${translateX}px))`,
  }}
>
  
<div className={styles.slide}>
</div>

<div className={styles.slide}>

  {isLoading && (
    <div className={styles.videoLoader}></div>
  )}

<video
  ref={videoRef}
  className={styles.viewerVideo}
  src={videos[currentIndex].video}
  autoPlay
  muted={isMuted}
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
  
</div>

<div className={styles.slide}>
</div>


  <span className={styles.timeLabel}>
    {formatTime(duration)}
  </span>

  <button
    className={styles.muteButton}
    onClick={toggleMute}
    aria-label={isMuted ? "Unmute" : "Mute"}
  >
    {isMuted ? (
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M4 9v6h4l5 5V4L8 9H4z" fill="white" />
        <path d="M16 9l5 5M21 9l-5 5" stroke="white" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ) : (
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M4 9v6h4l5 5V4L8 9H4z" fill="white" />
        <path d="M16.3 8.5c1.5 1.1 1.5 5.9 0 7M18.8 6c2.6 2.2 2.6 9.8 0 12" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    )}
  </button>

</div>
    
</div>

</div>

</div>

</div>

)}

  
    </section>
  );
}
