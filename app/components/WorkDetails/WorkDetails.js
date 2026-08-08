"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./WorkDetails.module.css";
import EditableText from "@/app/components/EditableText/EditableText";


export default function WorkDetails() {
  const [data, setData] = useState({
    primarySkill: "Painter",
    services: ["Putty Work", "Texture Finish", "Waterproofing", "Interior Paints"],
    experience: "8+ Years of experience in painting work",
    workingHours: "9:00 AM – 7:00 PM",
    serviceArea: "Indore",
    whyBadges: [
      "Clean & Professional Work",
      "Premium Paint Finish",
      "On Time Work",
      "Reasonable Pricing",
      "8+ Years Trusted Experience",
      "Customer Satisfaction",
    ],
  });

  const updateField = (key, value) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const updateService = (index, value) => {
    const updated = [...data.services];
    updated[index] = value;
    setData((prev) => ({ ...prev, services: updated }));
  };

  const updateWhyBadge = (index, value) => {
    const updated = [...data.whyBadges];
    updated[index] = value;
    setData((prev) => ({ ...prev, whyBadges: updated }));
  };

  return (
    <section className={styles.wrapper}>
      <div className={styles.header}>
        <Link href="/" className={styles.backLink}>
          <svg className={styles.backArrow} viewBox="0 0 24 24" fill="none">
            <path d="M15 5L8 12L15 19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <h2>Work Details</h2>
        <p>Everything about the work.</p>
      </div>

      <div className={styles.card}>
        {/* Primary Skill */}
        <div className={styles.row}>
          <div className={styles.label}>Primary Skill</div>
          <div className={styles.value}>
            <div className={styles.primaryBadge}>
              <svg className={styles.skillIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="3" width="16" height="5" rx="1.5" />
                <path d="M20 5.5h2v5a2 2 0 0 1-2 2h-8v3" />
                <path d="M12 15.5v5" strokeWidth="2.8" />
              </svg>
              <span>
                <EditableText value={data.primarySkill} onSave={(val) => updateField("primarySkill", val)} />
              </span>
            </div>
          </div>
        </div>

        {/* Services */}
        <div className={styles.row}>
          <div className={styles.label}>Services</div>
          <div className={styles.value}>
            {data.services.map((service, idx) => (
              <div key={idx} className={styles.serviceChip}>
                <span className={styles.tick}>✓</span>
                <span className={styles.serviceText}>
                  <EditableText value={service} onSave={(val) => updateService(idx, val)} />
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Experience */}
        <div className={styles.row}>
          <div className={styles.label}>Experience</div>
          <div className={styles.value}>
            <div className={styles.experienceBadge}>
              <span>
                <EditableText value={data.experience} onSave={(val) => updateField("experience", val)} multiline={true} />
              </span>
            </div>
          </div>
        </div>

        {/* Working Hours */}
        <div className={styles.row}>
          <div className={styles.label}>Working Hours</div>
          <div className={styles.value}>
            <div className={styles.workingHoursBadge}>
              <svg className={styles.workingHoursIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
              <span className={styles.workingHoursText}>
                <EditableText value={data.workingHours} onSave={(val) => updateField("workingHours", val)} />
              </span>
            </div>
          </div>
        </div>

        {/* Service Area */}
        <div className={styles.row}>
          <div className={styles.label}>Service Area</div>
          <div className={styles.value}>
            <div className={styles.serviceAreaBadge}>
              <span>
                <EditableText value={data.serviceArea} onSave={(val) => updateField("serviceArea", val)} />
              </span>
            </div>
          </div>
        </div>

        {/* Why Choose Me */}
        <div className={styles.whyCard}>
          <div className={styles.whyHeader}>
            <div className={styles.whyTitle}>Why Choose Me</div>
            <div className={styles.whySubtitle}>Reasons to choose this worker</div>
          </div>
          <div className={styles.whyBody}>
            <div className={styles.whyList}>
              {data.whyBadges.map((badge, idx) => (
                <div key={idx} className={styles.whyBadge}>
                  <EditableText value={badge} onSave={(val) => updateWhyBadge(idx, val)} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
