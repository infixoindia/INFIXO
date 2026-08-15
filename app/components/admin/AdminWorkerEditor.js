"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./Admin.module.css";
import WorkerIdentityEditor from "./WorkerIdentityEditor";
import WorkDetailsEditor from "./WorkDetailsEditor";
import WorkerDetailsEditor from "./WorkerDetailsEditor";
import WorkPhotosEditor from "./WorkPhotosEditor";
import WorkVideosEditor from "./WorkVideosEditor";

import WorkerIdentityCard from "../WorkerIdentityCard/WorkerIdentityCard";
import WorkDetails from "../WorkDetails/WorkDetails";
import WorkerDetails from "../WorkerDetails/WorkerDetails";
import WorkPhotos from "../WorkPhotos/WorkPhotos";
import WorkVideos from "../WorkVideos/WorkVideos";

import {
  EMPTY_WORKER_SCHEMA,
  getWorkerById,
  createWorker,
  updateWorker,
  generateUniqueSlug,
} from "@/lib/workerService";

const TABS = [
  { key: "work", label: "Work Details" },
  { key: "worker", label: "Worker Details" },
  { key: "photos", label: "Work Photos" },
  { key: "videos", label: "Work Videos" },
];

export default function AdminWorkerEditor({ workerId = null }) {
  const router = useRouter();
  const isNew = !workerId;

  const [worker, setWorker] = useState({ ...EMPTY_WORKER_SCHEMA });
  const [loading, setLoading] = useState(!isNew);
  const [activeTab, setActiveTab] = useState("work");
  const [showPreview, setShowPreview] = useState(true);

  const [savingSection, setSavingSection] = useState(null);
  const [saveMsg, setSaveMsg] = useState({});
  const [saveErr, setSaveErr] = useState({});

  useEffect(() => {
    if (isNew) return;
    let active = true;
    (async () => {
      try {
        const data = await getWorkerById(workerId);
        if (active && data) setWorker(data);
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [workerId, isNew]);

  const updateField = (key, value) => {
    setWorker((prev) => ({ ...prev, [key]: value }));
  };

  const flashMessage = (section, text, isError = false) => {
    if (isError) {
      setSaveErr((prev) => ({ ...prev, [section]: text }));
      setSaveMsg((prev) => ({ ...prev, [section]: "" }));
    } else {
      setSaveMsg((prev) => ({ ...prev, [section]: text }));
      setSaveErr((prev) => ({ ...prev, [section]: "" }));
    }
    setTimeout(() => {
      setSaveMsg((prev) => ({ ...prev, [section]: "" }));
      setSaveErr((prev) => ({ ...prev, [section]: "" }));
    }, 2500);
  };

  // Identity save — creates the worker on first save (new), or updates (existing)
  const saveIdentity = async () => {
    if (!worker.fullName || !worker.fullName.trim()) {
      flashMessage("identity", "Name is required.", true);
      return;
    }
    setSavingSection("identity");
    try {
      if (isNew) {
        const slug = await generateUniqueSlug(worker.fullName);
        const created = await createWorker({
          ...EMPTY_WORKER_SCHEMA,
          ...worker,
          slug,
        });
        flashMessage("identity", "Saved! Redirecting…");
        router.push(`/admin/workers/${created.id}`);
        return;
      }
      const patch = {
        fullName: worker.fullName,
        profession: worker.profession,
        experience: worker.experience,
        serviceArea: worker.serviceArea,
        heroSlides: worker.heroSlides,
      };
      const updated = await updateWorker(worker.id, patch);
      setWorker(updated);
      flashMessage("identity", "Saved!");
    } catch (err) {
      console.error(err);
      flashMessage("identity", "Save failed. Try again.", true);
    } finally {
      setSavingSection(null);
    }
  };

  const saveSection = async (section, fields) => {
    setSavingSection(section);
    try {
      const patch = {};
      fields.forEach((f) => (patch[f] = worker[f]));
      const updated = await updateWorker(worker.id, patch);
      setWorker(updated);
      flashMessage(section, "Saved!");
    } catch (err) {
      console.error(err);
      flashMessage(section, "Save failed. Try again.", true);
    } finally {
      setSavingSection(null);
    }
  };

  const saveWorkDetails = () =>
    saveSection("work", [
      "primarySkill",
      "services",
      "experience",
      "workingHours",
      "workingShift",
      "serviceArea",
      "whyChooseMe",
    ]);

  const saveWorkerDetails = () =>
    saveSection("worker", ["fullName", "gender", "age", "address", "languages", "about", "verifications"]);

  const savePhotos = () => saveSection("photos", ["photos"]);
  const saveVideos = () => saveSection("videos", ["videos"]);

  if (loading) {
    return (
      <div className={styles.page}>
        <p>Loading worker…</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>{isNew ? "Add New Worker" : `Edit: ${worker.fullName || "Worker"}`}</h1>
          <p className={styles.pageSubtitle}>
            {isNew ? "Fill identity details to create the profile." : `/w/${worker.slug}`}
          </p>
        </div>
        <Link href="/admin/workers" className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSmall}`}>
          ← Workers
        </Link>
      </div>

      <WorkerIdentityEditor
        worker={worker}
        updateField={updateField}
        onSave={saveIdentity}
        saving={savingSection === "identity"}
        saveMessage={saveMsg.identity}
        saveError={saveErr.identity}
        saveLabel={isNew ? "Save Identity & Continue" : "Save Identity"}
      />

      {isNew ? (
        <p className={styles.hint}>
          Save the worker's identity first — Work Details, Worker Details, Photos and Videos unlock right after.
        </p>
      ) : (
        <>
          <div className={styles.tabGrid}>
            {TABS.map((tab) => (
              <button
                key={tab.key}
                className={`${styles.tabButton} ${activeTab === tab.key ? styles.tabButtonActive : ""}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "work" && (
            <WorkDetailsEditor
              worker={worker}
              updateField={updateField}
              onSave={saveWorkDetails}
              saving={savingSection === "work"}
              saveMessage={saveMsg.work}
              saveError={saveErr.work}
            />
          )}

          {activeTab === "worker" && (
            <WorkerDetailsEditor
              worker={worker}
              updateField={updateField}
              onSave={saveWorkerDetails}
              saving={savingSection === "worker"}
              saveMessage={saveMsg.worker}
              saveError={saveErr.worker}
            />
          )}

          {activeTab === "photos" && (
            <WorkPhotosEditor
              worker={worker}
              updateField={updateField}
              onSave={savePhotos}
              saving={savingSection === "photos"}
              saveMessage={saveMsg.photos}
              saveError={saveErr.photos}
            />
          )}

          {activeTab === "videos" && (
            <WorkVideosEditor
              worker={worker}
              updateField={updateField}
              onSave={saveVideos}
              saving={savingSection === "videos"}
              saveMessage={saveMsg.videos}
              saveError={saveErr.videos}
            />
          )}

          <button
            className={`${styles.btn} ${styles.btnSecondary}`}
            style={{ width: "100%", marginTop: "0.5rem" }}
            onClick={() => setShowPreview((v) => !v)}
          >
            {showPreview ? "Hide Live Preview ▲" : "Show Live Preview ▼"}
          </button>

          {showPreview && (
            <div className={styles.previewWrapper}>
              <div className={styles.previewLabel}>
                Live Preview — this is the exact public profile UI
              </div>
              <div className={styles.previewInner}>
                <div style={{ padding: "1.5rem 1rem 0 1rem" }}>
                  <WorkerIdentityCard worker={worker} />
                </div>
                <div style={{ padding: "0.5rem 0" }}>
                  {activeTab === "work" && <WorkDetails worker={worker} backHref="#" />}
                  {activeTab === "worker" && <WorkerDetails worker={worker} backHref="#" />}
                  {activeTab === "photos" && <WorkPhotos worker={worker} backHref="#" />}
                  {activeTab === "videos" && <WorkVideos worker={worker} backHref="#" />}
                </div>
              </div>
            </div>
          )}

          {worker.slug && (
            <Link
              href={`/w/${worker.slug}?admin=${worker.id}`}
              target="_blank"
              className={`${styles.btn} ${styles.btnSecondary}`}
              style={{ display: "block", textAlign: "center", marginTop: "1rem", textDecoration: "none" }}
            >
              🔗 Open Live Public Profile
            </Link>
          )}
        </>
      )}
    </div>
  );
}
