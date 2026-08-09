"use client";

import { useState } from "react";
import styles from "./WorkerAdminForm.module.css";

export default function WorkerAdminForm({ initialData, onSave, isLoading }) {
  const [formData, setFormData] = useState(initialData);

  // General Field Handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Array Handlers (Comma Separated Strings to Array)
  const handleArrayChange = (field, value) => {
    const arrayValues = value.split(",").map((item) => item.trim());
    setFormData((prev) => ({ ...prev, [field]: arrayValues }));
  };

  // Working Shift Handler
  const handleShiftChange = (shiftType) => {
    setFormData((prev) => ({
      ...prev,
      workingShift: {
        ...prev.workingShift,
        [shiftType]: !prev.workingShift?.[shiftType],
      },
    }));
  };

  // Form Submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSave) {
      onSave(formData);
    }
  };

  return (
    <form className={styles.formContainer} onSubmit={handleSubmit}>
      <div className={styles.formHeader}>
        <h2>Edit Worker Profile</h2>
        <button type="submit" className={styles.saveBtn} disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* SECTION 1: BASIC INFORMATION */}
      <div className={styles.sectionCard}>
        <h3>1. Basic Information</h3>
        
        <div className={styles.fieldGrid}>
          <div className={styles.fieldGroup}>
            <label>Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName || ""}
              onChange={handleChange}
              placeholder="e.g. Rahul Sharma"
              required
            />
          </div>

          <div className={styles.fieldGroup}>
            <label>Profession</label>
            <input
              type="text"
              name="profession"
              value={formData.profession || ""}
              onChange={handleChange}
              placeholder="e.g. Painter / Electrician"
              required
            />
          </div>

          <div className={styles.fieldGroup}>
            <label>Worker Code</label>
            <input
              type="text"
              name="workerCode"
              value={formData.workerCode || ""}
              onChange={handleChange}
              placeholder="e.g. WRK-1024"
            />
          </div>

          <div className={styles.fieldGroup}>
            <label>Category</label>
            <input
              type="text"
              name="category"
              value={formData.category || ""}
              onChange={handleChange}
              placeholder="e.g. Home Services"
            />
          </div>

          <div className={styles.fieldGroup}>
            <label>Gender</label>
            <select name="gender" value={formData.gender || "Male"} onChange={handleChange}>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className={styles.fieldGroup}>
            <label>Age</label>
            <input
              type="text"
              name="age"
              value={formData.age || ""}
              onChange={handleChange}
              placeholder="e.g. 28 Years"
            />
          </div>

          <div className={styles.fieldGroup}>
            <label>Location / City</label>
            <input
              type="text"
              name="location"
              value={formData.location || ""}
              onChange={handleChange}
              placeholder="e.g. Indore, MP"
            />
          </div>

          <div className={styles.fieldGroup}>
            <label>Full Address</label>
            <input
              type="text"
              name="address"
              value={formData.address || ""}
              onChange={handleChange}
              placeholder="e.g. Vijay Nagar, Indore, Madhya Pradesh"
            />
          </div>

          <div className={styles.fieldGroup}>
            <label>Languages (Comma Separated)</label>
            <input
              type="text"
              value={(formData.languages || []).join(", ")}
              onChange={(e) => handleArrayChange("languages", e.target.value)}
              placeholder="Hindi, English"
            />
          </div>

          <div className={styles.fieldGroup}>
            <label>Profile Image URL</label>
            <input
              type="text"
              name="profileImage"
              value={formData.profileImage || ""}
              onChange={handleChange}
              placeholder="/images/avatar.jpg"
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: WORK DETAILS */}
      <div className={styles.sectionCard}>
        <h3>2. Work Details</h3>

        <div className={styles.fieldGrid}>
          <div className={styles.fieldGroup}>
            <label>Primary Skill</label>
            <input
              type="text"
              name="primarySkill"
              value={formData.primarySkill || ""}
              onChange={handleChange}
              placeholder="e.g. Painter / Wiring"
            />
          </div>

          <div className={styles.fieldGroup}>
            <label>Experience (in Years)</label>
            <input
              type="number"
              name="experience"
              value={formData.experience || 0}
              onChange={handleChange}
              placeholder="8"
            />
          </div>

          <div className={styles.fieldGroup}>
            <label>Working Hours</label>
            <input
              type="text"
              name="workingHours"
              value={formData.workingHours || ""}
              onChange={handleChange}
              placeholder="09:00 AM – 07:00 PM"
            />
          </div>

          <div className={styles.fieldGroup}>
            <label>Services Offered (Comma Separated)</label>
            <input
              type="text"
              value={(formData.services || []).join(", ")}
              onChange={(e) => handleArrayChange("services", e.target.value)}
              placeholder="Putty Work, Texture Finish, Waterproofing"
            />
          </div>

          <div className={styles.fieldGroup}>
            <label>Service Area / Cities (Comma Separated)</label>
            <input
              type="text"
              value={(formData.serviceArea || []).join(", ")}
              onChange={(e) => handleArrayChange("serviceArea", e.target.value)}
              placeholder="Indore, Ujjain, Dewas"
            />
          </div>

          <div className={styles.fieldGroup}>
            <label>Why Choose Me Badges (Comma Separated)</label>
            <input
              type="text"
              value={(formData.whyChooseMe || []).join(", ")}
              onChange={(e) => handleArrayChange("whyChooseMe", e.target.value)}
              placeholder="Clean Work, Reasonable Pricing, On Time"
            />
          </div>
        </div>

        {/* Working Shift Options */}
        <div className={styles.shiftContainer}>
          <label className={styles.shiftLabel}>Working Shift:</label>
          <div className={styles.checkboxGroup}>
            <label>
              <input
                type="checkbox"
                checked={!!formData.workingShift?.day}
                onChange={() => handleShiftChange("day")}
              />
              Day Shift
            </label>
            <label>
              <input
                type="checkbox"
                checked={!!formData.workingShift?.night}
                onChange={() => handleShiftChange("night")}
              />
              Night Shift
            </label>
          </div>
        </div>
      </div>

      {/* SECTION 3: ABOUT WORKER */}
      <div className={styles.sectionCard}>
        <h3>3. About Me</h3>
        <div className={styles.fieldGroup}>
          <label>Bio Paragraphs (Comma or Line Separated)</label>
          <textarea
            rows={4}
            value={(formData.about || []).join("\n")}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                about: e.target.value.split("\n").filter((p) => p.trim() !== ""),
              }))
            }
            placeholder="Enter each about paragraph in a new line..."
          />
        </div>
      </div>

      {/* FOOTER FIXED VERIFICATION BANNER */}
      <div className={styles.infoBox}>
        <p>🔒 <strong>Infixo Verification Badges:</strong> Verification status is non-editable from this form as per safety policies.</p>
      </div>
    </form>
  );
}
