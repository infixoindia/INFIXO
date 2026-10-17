"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import styles from "./[[...section]]/WorkerPwa.module.css";

// Lives in the persistent [id] layout instead of the navigated page.
// React keeps this component mounted while switching Work Details/Photos/Videos.
// It is therefore an actual APP-LAUNCH animation, never a tab transition.
export default function PwaLaunchSplash() {
  const { id } = useParams();
  const workerId = typeof id === "string" ? id : "";
  const [leaving, setLeaving] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const ready = (event) => {
      const resolvedId = event?.detail?.id || window.__infixoPwaReady;
      if (resolvedId === workerId) setLeaving(true);
    };
    window.addEventListener("infixo:pwa-ready", ready);
    if (window.__infixoPwaReady === workerId) ready();
    return () => window.removeEventListener("infixo:pwa-ready", ready);
  }, [workerId]);

  useEffect(() => {
    if (!leaving) return undefined;
    const timer = window.setTimeout(() => setDone(true), 260);
    return () => window.clearTimeout(timer);
  }, [leaving]);

  if (done) return null;
  return (
    <div className={[`${styles.splash}`, leaving && styles.leaving].filter(Boolean).join(" ")}
      role="status" aria-label="Opening INFIXO worker profile" aria-live="polite">
      <div className={styles.aura} aria-hidden="true" />
      <div className={styles.brand}>
        <div className={styles.logoWrap}>
          <img className={styles.logo} src="/images/logo.png" alt="INFIXO" />
          <div className={styles.sweep} aria-hidden="true" />
        </div>
        <p className={styles.tagline}>Apno Se Judne Ka Naya Tarika</p>
      </div>
      <span className={styles.progress} aria-hidden="true" />
    </div>
  );
}
