'use client';
// GENERATED from app/components/WorkerDetails/WorkerDetails.js. See scripts/generate-demo-components.py.
import {useDemoText} from '../DemoLocale';
import { useState, useRef, useEffect, useLayoutEffect } from "react";
import Link from "next/link";
import styles from "../../../components/WorkerDetails/WorkerDetails.module.css";

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;
const ABOUT_POINTS = 3;   // points shown before "Show more"
const ABOUT_LINES = 10;   // ...and never more than ~10 lines in the collapsed view

export default function WorkerDetails({ worker, backHref = "/" }) {
  const tr = useDemoText();
  const [workerOpen, setWorkerOpen] = useState(false);
  const [workOpen, setWorkOpen] = useState(false);
  const [addressOpen, setAddressOpen] = useState(false);

  const languages = Array.isArray(worker?.languages)
    ? worker.languages.join(", ")
    : worker?.languages || "";

  const aboutParagraphs = worker?.about || [];

  const aboutRef = useRef(null);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [aboutFit, setAboutFit] = useState({ count: Math.min(ABOUT_POINTS, aboutParagraphs.length), height: null });

  // How many of the first 3 points fit in ~10 lines (a point is never cut in the middle).
  useIsoLayoutEffect(() => {
    const root = aboutRef.current;
    if (!root) return undefined;
    const measure = () => {
      const ps = Array.from(root.querySelectorAll("p")).slice(0, ABOUT_POINTS);
      if (!ps.length) return;
      const top0 = ps[0].getBoundingClientRect().top;
      const lh = parseFloat(getComputedStyle(ps[0]).lineHeight) || 28;
      let lines = 0, count = 0, height = null;
      for (let i = 0; i < ps.length; i++) {
        const r = ps[i].getBoundingClientRect();
        const l = Math.max(1, Math.round(r.height / lh));
        if (i > 0 && lines + l > ABOUT_LINES) break;
        lines += l; count = i + 1; height = r.bottom - top0;
      }
      setAboutFit((prev) => (prev.count === count && prev.height === height ? prev : { count, height }));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [aboutParagraphs.length, aboutOpen]);

  const verifications = worker?.verifications || {
    identityVerified: false,
    workVerified: false,
    addressVerified: false,
  };

  return (
    <section className={styles.wrapper}>
      <div className={styles.header}>
        <Link href={backHref} className={styles.backLink}>
          <svg className={styles.backArrow} viewBox="0 0 24 24" fill="none">
            <path d="M15 5L8 12L15 19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <h2>{tr("Worker Details")}</h2>
        <p>{tr("Everything about the worker.")}</p>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3>{tr("Professional Details")}</h3>
          <p>{tr("Basic information about the worker")}</p>
        </div>
        <div className={styles.detailsBody}>
          <div className={styles.detailRow}>
            <div className={styles.label}>{tr("Full Name")}</div>
            <div className={styles.value}><span className={styles.detailText}>{worker?.demoFullName}</span></div>
          </div>
          <div className={styles.detailRow}>
            <div className={styles.label}>{tr("Gender")}</div>
            <div className={styles.value}><span className={styles.detailText}>{worker?.gender}</span></div>
          </div>
          <div className={styles.detailRow}>
            <div className={styles.label}>{tr("Age")}</div>
            <div className={styles.value}><span className={styles.detailText}>{worker?.age}</span></div>
          </div>
          <div className={styles.detailRow}>
            <div className={styles.label}>{tr("Address")}</div>
            <div className={styles.value}><span className={styles.detailText}>{worker?.address}</span></div>
          </div>
          <div className={styles.detailRow}>
            <div className={styles.label}>{tr("Languages")}</div>
            <div className={styles.value}><span className={styles.detailText}>{languages}</span></div>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3>{tr("About Me")}</h3>
          <p>{tr("A short introduction about the worker.")}</p>
        </div>
        <div className={styles.aboutBody}>
          <div ref={aboutRef} style={aboutOpen || aboutFit.height == null ? undefined : { maxHeight: aboutFit.height, overflow: "hidden" }}>
            {(aboutOpen ? aboutParagraphs : aboutParagraphs.slice(0, ABOUT_POINTS)).map((para, idx) => (
              <p key={idx}>{para}</p>
            ))}
          </div>
          {aboutParagraphs.length > aboutFit.count && (
            <button type="button" className={styles.aboutMore} onClick={() => setAboutOpen((v) => !v)} aria-expanded={aboutOpen}>
              {aboutOpen ? tr("Show less") : tr("Show more")}
            </button>
          )}
        </div>
      </div>

    </section>
  );
}
