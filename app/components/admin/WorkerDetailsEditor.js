"use client";

import styles from "./Admin.module.css";

export default function WorkerDetailsEditor({ worker, updateField, onSave, saving, saveMessage, saveError }) {
  const languagesText = Array.isArray(worker.languages) ? worker.languages.join(", ") : worker.languages || "";
  const aboutText = (worker.about || []).join("\n");
  const verifications = worker.verifications || {
    identityVerified: false,
    workVerified: false,
    addressVerified: false,
  };

  const updateVerification = (key, val) => {
    updateField("verifications", { ...verifications, [key]: val });
  };

  return (
    <>
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Worker Details</h3>

        <div className={styles.field}>
          <label className={styles.label}>Full Name</label>
          <input
            className={styles.input}
            value={worker.fullName || ""}
            onChange={(e) => updateField("fullName", e.target.value)}
          />
        </div>

        <div className={styles.row2}>
          <div className={styles.field}>
            <label className={styles.label}>Gender</label>
            <select
              className={styles.select}
              value={worker.gender || "Male"}
              onChange={(e) => updateField("gender", e.target.value)}
            >
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Age</label>
            <input
              className={styles.input}
              value={worker.age || ""}
              onChange={(e) => updateField("age", e.target.value)}
              placeholder="28 Years"
            />
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Address</label>
          <input
            className={styles.input}
            value={worker.address || ""}
            onChange={(e) => updateField("address", e.target.value)}
            placeholder="Indore, Madhya Pradesh"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Languages</label>
          <input
            className={styles.input}
            value={languagesText}
            onChange={(e) =>
              updateField(
                "languages",
                e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
              )
            }
            placeholder="Hindi, English"
          />
        </div>
      </div>

      <div className={styles.card}>
        <h3 className={styles.cardTitle}>About Me</h3>
        <div className={styles.field}>
          <label className={styles.label}>Content (one paragraph per line)</label>
          <textarea
            className={styles.textarea}
            value={aboutText}
            onChange={(e) =>
              updateField(
                "about",
                e.target.value.split("\n").filter((p) => p.trim().length > 0)
              )
            }
            rows={5}
          />
        </div>
      </div>

      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Infixo Verification</h3>
        <div className={styles.checkRow}>
          <input
            type="checkbox"
            checked={!!verifications.identityVerified}
            onChange={(e) => updateVerification("identityVerified", e.target.checked)}
            id="v-identity"
          />
          <label htmlFor="v-identity">Worker Verified</label>
        </div>
        <div className={styles.checkRow}>
          <input
            type="checkbox"
            checked={!!verifications.workVerified}
            onChange={(e) => updateVerification("workVerified", e.target.checked)}
            id="v-work"
          />
          <label htmlFor="v-work">Work Verified</label>
        </div>
        <div className={styles.checkRow}>
          <input
            type="checkbox"
            checked={!!verifications.addressVerified}
            onChange={(e) => updateVerification("addressVerified", e.target.checked)}
            id="v-address"
          />
          <label htmlFor="v-address">Address Verified</label>
        </div>
      </div>

      <div className={styles.saveRow}>
        <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={onSave} disabled={saving}>
          {saving ? "Saving..." : "Save Worker Details"}
        </button>
        {saveMessage && <span className={styles.saveMsg}>{saveMessage}</span>}
        {saveError && <span className={styles.saveMsgError}>{saveError}</span>}
      </div>
    </>
  );
}
