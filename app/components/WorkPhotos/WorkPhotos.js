"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import styles from "./WorkPhotos.module.css";

export default function WorkPhotos() {

  const images = [
    "/images/work1.png",
    "/images/work2.png",
    "/images/work3.png",
    "/images/work4.png",
    "/images/work5.png",
    "/images/work6.png",
  ];


  const [viewerOpen, setViewerOpen] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);


  // Zoom system
  const [zoom, setZoom] = useState(1);

  const [position, setPosition] = useState({
    x: 0,
    y: 0,
  });


  // Touch refs

  const pinchStartDistance = useRef(null);

  const pinchStartZoom = useRef(1);


  const lastTapTime = useRef(0);


  const dragStart = useRef({
    x: 0,
    y: 0,
  });


  const positionStart = useRef({
    x: 0,
    y: 0,
  });


  // Swipe

  const [touchStartX, setTouchStartX] = useState(0);

  const [touchEndX, setTouchEndX] = useState(0);


  const isSwiping = useRef(false);
  
    useEffect(() => {

    if (viewerOpen) {

      document.body.style.overflow = "hidden";

    } else {

      document.body.style.overflow = "";

    }


    return () => {

      document.body.style.overflow = "";

    };

  }, [viewerOpen]);



  const openViewer = (index) => {

    setCurrentIndex(index);

    setZoom(1);

    setPosition({
      x: 0,
      y: 0,
    });

    pinchStartDistance.current = null;

    setViewerOpen(true);

  };



  const closeViewer = () => {

    setViewerOpen(false);

    setZoom(1);

    setPosition({
      x: 0,
      y: 0,
    });

    pinchStartDistance.current = null;

  };

  const getDistance = (touches) => {

    const touch1 = touches[0];
    const touch2 = touches[1];

    return Math.hypot(
      touch2.clientX - touch1.clientX,
      touch2.clientY - touch1.clientY
    );

  };



  const handleTouchStart = (e) => {


    // Double tap

    if (e.touches.length === 1) {

      const now = Date.now();


      if (now - lastTapTime.current < 280) {


        if (zoom === 1) {

          setZoom(2);


        } else {

          setZoom(1);

          setPosition({
            x:0,
            y:0
          });

        }

      }


      lastTapTime.current = now;

    }



    // Pinch start

    if (e.touches.length === 2) {


      pinchStartDistance.current =
        getDistance(e.touches);


      pinchStartZoom.current = zoom;


      return;

    }



    // Drag start when zoomed

    if (zoom > 1) {


      dragStart.current = {

        x:e.touches[0].clientX,

        y:e.touches[0].clientY,

      };


      positionStart.current = {

        x:position.x,

        y:position.y,

      };


      return;

    }



    // Normal swipe start

    isSwiping.current = false;


    setTouchStartX(e.touches[0].clientX);

    setTouchEndX(e.touches[0].clientX);


  };

  const handleTouchMove = (e) => {


    // Pinch Zoom

    if (
      e.touches.length === 2 &&
      pinchStartDistance.current
    ) {


      const currentDistance =
        getDistance(e.touches);



      let newZoom =
        pinchStartZoom.current *
        (
          currentDistance /
          pinchStartDistance.current
        );



      newZoom = Math.max(
        1,
        Math.min(4, newZoom)
      );



      setZoom(newZoom);


      return;

    }



    // Drag image when zoomed

    if (
      zoom > 1 &&
      e.touches.length === 1
    ) {


      const moveX =
        e.touches[0].clientX -
        dragStart.current.x;



      const moveY =
        e.touches[0].clientY -
        dragStart.current.y;



      setPosition({

        x:
          positionStart.current.x +
          moveX,


        y:
          positionStart.current.y +
          moveY,

      });


      return;

    }



    // Normal swipe

    isSwiping.current = true;


    setTouchEndX(
      e.touches[0].clientX
    );


  };

  const handleTouchEnd = () => {


    // Pinch finish

    pinchStartDistance.current = null;



    // Zoomed image me swipe disable

    if (zoom > 1) {

      isSwiping.current = false;

      return;

    }



    if (!isSwiping.current) {


      setTouchStartX(0);

      setTouchEndX(0);


      return;

    }



    const distance =
      touchStartX - touchEndX;



    // Small movement ignore

    if (Math.abs(distance) < 80) {


      setTouchStartX(0);

      setTouchEndX(0);

      isSwiping.current = false;


      return;

    }



    // Left swipe

    if (
      distance > 80 &&
      currentIndex < images.length - 1
    ) {


      setCurrentIndex(
        (prev) => prev + 1
      );


    }



    // Right swipe

    if (
      distance < -80 &&
      currentIndex > 0
    ) {


      setCurrentIndex(
        (prev) => prev - 1
      );


    }



    setTouchStartX(0);

    setTouchEndX(0);

    isSwiping.current = false;


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

          <h2>
            Work Gallery
          </h2>


          <p>
            Professional work photos.
          </p>


        </div>


      </div>



      <div className={styles.gallery}>


        {images.map((image, index) => (


          <div
            key={index}
            className={styles.photoItem}
            onClick={() => openViewer(index)}
          >


            <img
              src={image}
              alt={`Work ${index + 1}`}
            />


          </div>


        ))}


      </div>



      {viewerOpen && (


        <div className={styles.viewer}>


          <div className={styles.imageCounter}>

            {currentIndex + 1} / {images.length}

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



<div
  className={styles.sliderViewport}
  onTouchStart={handleTouchStart}
  onTouchMove={handleTouchMove}
  onTouchEnd={handleTouchEnd}
>


  <div
    className={styles.sliderTrack}
    style={{
      transform:`translateX(-${currentIndex * 100}%)`
    }}
  >


    {images.map((image,index)=>(


      <div
        key={index}
        className={styles.slide}
      >


        <img
          src={image}
          alt={`Work ${index + 1}`}
          className={styles.viewerImage}
          draggable={false}
          style={{
            transform:`
              translate(${position.x}px, ${position.y}px)
              scale(${zoom})
            `
          }}
        />


      </div>


    ))}


  </div>


</div>

        <div
          className={`${styles.arrow} ${styles.leftArrow} ${
            currentIndex === 0 ? styles.disabled : ""
          }`}
        >

          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
          >

            <path
              d="M15 5L8 12L15 19"
              stroke="currentColor"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

          </svg>

        </div>



        <div
          className={`${styles.arrow} ${styles.rightArrow} ${
            currentIndex === images.length - 1 ? styles.disabled : ""
          }`}
        >

          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
          >

            <path
              d="M9 5L16 12L9 19"
              stroke="currentColor"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

          </svg>

        </div>


      </div>


    )}


  </section>


  );


}
