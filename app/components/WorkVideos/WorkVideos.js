"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import styles from "./WorkVideos.module.css";

export default function WorkVideos() {
  // Static dataset: Sabhi videos 10 sec ki hain
  const videos = [
    {
      video: "/videos/work1.mp4",
      thumbnail: "/images/video-thumb-1.png",
      duration: "00:10",
    },
    {
      video: "/videos/work2.mp4",
      thumbnail: "/images/video-thumb-2.png",
      duration: "00:10",
    },
    {
      video: "/videos/work3.mp4",
      thumbnail: "/images/video-thumb-3.png",
      duration: "00:10",
    },
    {
      video: "/videos/work4.mp4",
      thumbnail: "/images/video-thumb-4.png",
      duration: "00:10",
    },
  ];

  const [viewerOpen, setViewerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Swipe State
  const [dragOffset, setDragOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const startX = useRef(0);
  const currentX = useRef(0);

  // Controls, Timer & Playback States
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const videoRef = useRef(null);
  const trackRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const formatTime = (t) => {
    const safe = isNaN(t) ? 0 : t;
    return `${Math.floor(safe / 60)}:${String(Math.floor(safe % 60)).padStart(2, "0")}`;
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
    window.addEventListener("touchmove", handleMove, { passive: false });
    window.addEventListener("touchend", handleUp);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleUp);
    };
  }, [isDragging, duration]);

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  useEffect(() => {
    setIsMuted(true);
  }, [currentIndex]);

  const openViewer = (index) => {
    setCurrentIndex(index);
    setIsLoading(true);
    setIsMuted(true);
    setIsPaused(false);
    setIsEnded(false);
    setViewerOpen(true);
  };

  const closeViewer = () => {
    setViewerOpen(false);
  };

  // --- SWIPE HANDLERS ---
  const handleTouchStart = (e) => {
    startX.current = e.touches[0].clientX;
    currentX.current = startX.current;
    setIsSwiping(true);
  };

  const handleTouchMove = (e) => {
    if (!isSwiping) return;
    currentX.current = e.touches[0].clientX;
    let delta = currentX.current - startX.current;

    const isFirst = currentIndex === 0 && delta > 0;
    const isLast = currentIndex === videos.length - 1 && delta < 0;

    if (isFirst || isLast) {
      delta = delta * 0.3;
    }

    setDragOffset(delta);
  };

  const handleTouchEnd = () => {
    if (!isSwiping) return;
    setIsSwiping(false);

    const delta = currentX.current - startX.current;
    const threshold = 70;

    if (delta < -threshold && currentIndex < videos.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      resetVideoStateForSwipe();
    } else if (delta > threshold && currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      resetVideoStateForSwipe();
    }

    setDragOffset(0);
  };

  const resetVideoStateForSwipe = () => {
    setIsPaused(true);
    setIsEnded(false);
    setCurrentTime(0);
    setDuration(0);
    setIsLoading(true);
  };

  const handleCenterButtonClick = () => {
    if (!videoRef.current) return;

    if (isEnded) {
      videoRef.current.currentTime = 0;
      setCurrentTime(0);
      setIsEnded(false);
      setIsPaused(false);
      videoRef.current.play();
    } else if (isPaused) {
      setIsPaused(false);
      videoRef.current.play();
    }
  };

  return (
    <section className={styles.wrapper}>
      {/* Background Preloader */}
      {viewerOpen && (
        <div style={{ display: "none" }}>
          {currentIndex > 0 && (
            <video src={videos[currentIndex - 1].video} preload="auto" muted />
          )}
          {currentIndex < videos.length - 1 && (
            <video src={videos[currentIndex + 1].video} preload="auto" muted />
          )}
        </div>
      )}

      <div className={styles.header}>
        <Link href="/" className={styles.backLink}>
          <svg className={styles.backArrow} viewBox="0 0 24 24" fill="none">
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

      {/* GALLERY GRID */}
      <div className={styles.gallery}>
        {videos.map((item, index) => (
          <div
            key={index}
            className={styles.videoCard}
            onClick={() => openViewer(index)}
          >
            <div className={styles.thumbnail}>
              <img
                src={item.thumbnail}
                alt={`Video Thumbnail ${index + 1}`}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <span className={styles.duration}>{item.duration}</span>
            </div>
          </div>
        ))}
      </div>

      {/* FULLSCREEN VIEWER */}
      {viewerOpen && (
        <div className={styles.viewer}>
          <div className={styles.imageCounter}>
            {currentIndex + 1} / {videos.length}
          </div>

          <button
            className={styles.closeButton}
            onClick={closeViewer}
            aria-label="Close"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
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
              style={{
                touchAction: "pan-y",
                overflow: "hidden",
                width: "100%",
                height: "100%",
                position: "relative",
              }}
            >
              <div
                className={styles.videoSlider}
                style={{
                  display: "flex",
                  width: "100%",
                  height: "100%",
                  transform: `translateX(calc(-${currentIndex * 100}% + ${dragOffset}px))`,
                  transition: isSwiping
                    ? "none"
                    : "transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)",
                }}
              >
                {videos.map((item, index) => {
                  const isCurrent = index === currentIndex;

                  return (
                    <div
                      key={index}
                      className={styles.slide}
                      style={{
                        minWidth: "100%",
                        height: "100%",
                        position: "relative",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {isCurrent && (
                        <>
                          {isLoading && <div className={styles.videoLoader}></div>}

                          <video
                            ref={videoRef}
                            className={styles.viewerVideo}
                            src={item.video}
                            autoPlay={!isPaused}
                            muted={isMuted}
                            playsInline
                            controls={false}
                            preload="auto"
                            onPlay={() => {
                              setIsPaused(false);
                              setIsEnded(false);
                            }}
                            onPause={() => setIsPaused(true)}
                            onLoadedData={() => setIsLoading(false)}
                            onLoadedMetadata={(e) => {
                              setDuration(e.target.duration);
                            }}
                            onTimeUpdate={(e) => {
                              setCurrentTime(e.target.currentTime);
                            }}
                            onEnded={() => {
                              setIsEnded(true);
                              setIsPaused(true);
                            }}
                            style={{
                              opacity: isLoading ? 0 : 1,
                            }}
                          />

                          {isPaused && (
                            <div
                              className={styles.centerPlay}
                              onClick={handleCenterButtonClick}
                            >
                              {isEnded ? (
                                <svg
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  width="40"
                                  height="40"
                                >
                                  <path
                                    d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46A7.93 7.93 0 0020 12c0-4.42-3.58-8-8-8zm-6 8c0-1.01.25-1.97.7-2.8L5.24 7.74A7.93 7.93 0 004 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3c-3.31 0-6-2.69-6-6z"
                                    fill="white"
                                  />
                                </svg>
                              ) : (
                                <svg
                                  viewBox="0 0 24 24"
                                  fill="white"
                                  width="40"
                                  height="40"
                                >
                                  <path d="M6.5 5v14l11-7z" />
                                </svg>
                              )}
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
                                  transition: isDragging
                                    ? "none"
                                    : "width .15s linear",
                                }}
                              />

                              <div
                                className={styles.progressThumb}
                                style={{
                                  left: `${duration ? (currentTime / duration) * 100 : 0}%`,
                                  transition: isDragging
                                    ? "none"
                                    : "left .15s linear",
                                }}
                              />
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
                                  <path
                                    d="M4 9v6h4l5 5V4L8 9H4z"
                                    fill="white"
                                  />
                                  <path
                                    d="M16 9l5 5M21 9l-5 5"
                                    stroke="white"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                  />
                                </svg>
                              ) : (
                                <svg viewBox="0 0 24 24" fill="none">
                                  <path
                                    d="M4 9v6h4l5 5V4L8 9H4z"
                                    fill="white"
                                  />
                                  <path
                                    d="M16.3 8.5c1.5 1.1 1.5 5.9 0 7M18.8 6c2.6 2.2 2.6 9.8 0 12"
                                    stroke="white"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                  />
                                </svg>
                              )}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
