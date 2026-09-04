"use client";

import { useState } from "react";
import styles from "./Admin.module.css";
import { SKILL_CATEGORIES, resolveSkillCategory } from "@/lib/skillCategories";

function ChipListField({ label, hint, items, onChange, placeholder }) {
  const [draft, setDraft] = useState("");

  const addItem = () => {
    const val = draft.trim();
    if (!val) return;
    if (items.includes(val)) {
      setDraft("");
      return;
    }
    onChange([...items, val]);
    setDraft("");
  };

  const removeItem = (idx) => {
    onChange(items.filter((_, i) => i !== idx));
  };

  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>
      {hint && <p className={styles.hint} style={{ marginTop: 0, marginBottom: "0.4rem" }}>{hint}</p>}
      <div className={styles.chipList}>
        {items.map((item, idx) => (
          <div className={styles.chip} key={idx}>
            <span>{item}</span>
            <button type="button" className={styles.chipRemove} onClick={() => removeItem(idx)}>
              ✕
            </button>
          </div>
        ))}
      </div>
      <div className={styles.addRow}>
        <input
          className={styles.input}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addItem())}
          placeholder={placeholder}
        />
        <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={addItem}>
          Add
        </button>
      </div>
    </div>
  );
}

export default function WorkDetailsEditor({ worker, updateField, onSave, saving, saveMessage, saveError }) {
  const services = worker.services || [];
  const whyChooseMe = worker.whyChooseMe || [];
  const shift = worker.workingShift || { day: false, night: false };

  const serviceAreaText = Array.isArray(worker.serviceArea)
    ? worker.serviceArea.join(", ")
    : worker.serviceArea || "";

  return (
    <div className={styles.card}>
      <h3 className={styles.cardTitle}>Work Details</h3>

      <div className={styles.field}>
        <label className={styles.label}>Primary Skill</label>
        <select
          className={styles.select}
          value={resolveSkillCategory(worker.primarySkill)?.slug || ""}
          onChange={(e) => updateField("primarySkill", e.target.value)}
        >
          <option value="" disabled>
            Select a category…
          </option>
          {SKILL_CATEGORIES.map((cat) => (
            <option key={cat.slug} value={cat.slug}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      <ChipListField
        label="Services"
        items={services}
        onChange={(next) => updateField("services", next)}
        placeholder="e.g. Waterproofing"
      />

      <div className={styles.field}>
        <label className={styles.label}>Experience (Years)</label>
        <input
          type="number"
          min="0"
          className={styles.input}
          value={worker.experience ?? ""}
          onChange={(e) => updateField("experience", e.target.value)}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Working Hours</label>
        <input
          className={styles.input}
          value={worker.workingHours || ""}
          onChange={(e) => updateField("workingHours", e.target.value)}
          placeholder="9:00 AM – 7:00 PM"
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Working Shift</label>
        <div className={styles.checkRow}>
          <input
            type="checkbox"
            checked={!!shift.day}
            onChange={(e) => updateField("workingShift", { ...shift, day: e.target.checked })}
            id="shift-day"
          />
          <label htmlFor="shift-day">Day</label>
        </div>
        <div className={styles.checkRow}>
          <input
            type="checkbox"
            checked={!!shift.night}
            onChange={(e) => updateField("workingShift", { ...shift, night: e.target.checked })}
            id="shift-night"
          />
          <label htmlFor="shift-night">Night</label>
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Service Area</label>
        <input
          className={styles.input}
          value={serviceAreaText}
          onChange={(e) =>
            updateField(
              "serviceArea",
              e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
            )
          }
          placeholder="Indore"
        />
      </div>

      <ChipListField
        label="Why Choose Me"
        hint="Reasons to choose this worker"
        items={whyChooseMe}
        onChange={(next) => updateField("whyChooseMe", next)}
        placeholder="e.g. On Time Work"
      />

      <div className={styles.saveRow}>
        <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={onSave} disabled={saving}>
          {saving ? "Saving..." : "Save Work Details"}
        </button>
        {saveMessage && <span className={styles.saveMsg}>{saveMessage}</span>}
        {saveError && <span className={styles.saveMsgError}>{saveError}</span>}
      </div>
    </div>
  );
}
