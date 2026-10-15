'use client';
// GENERATED from app/components/WorkDetails/ServiceChips.js. See scripts/generate-demo-components.py.
import {useDemoText} from '../DemoLocale';
import { useState } from "react";
import styles from "../../../components/WorkDetails/WorkDetails.module.css";

const VISIBLE_CHIPS = 4;

// First 4 service chips; with more, a chip-style "Show more / Show less" button.
export default function ServiceChips({ services = [] }) {
  const tr = useDemoText();
  const [open, setOpen] = useState(false);
  const list = open ? services : services.slice(0, VISIBLE_CHIPS);

  return (
    <>
      {list.map((service, idx) => (
        <div className={styles.serviceChip} key={idx}>
          <span className={styles.tick}>✓</span>
          <span className={styles.serviceText}>{service}</span>
        </div>
      ))}
      {services.length > VISIBLE_CHIPS && (
        <button
          type="button"
          className={`${styles.serviceChip} ${styles.moreChip}`}
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          {open ? tr("Show less") : tr("Show more")}
        </button>
      )}
    </>
  );
}
