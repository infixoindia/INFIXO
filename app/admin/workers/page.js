"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "../../components/admin/Admin.module.css";
import { listWorkers } from "@/lib/workerService";

export default function WorkersListPage() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  const [profileTab, setProfileTab] = useState("active");
  const activeWorkers = workers.filter(w => w.isActive !== false);
  const inactiveWorkers = workers.filter(w => w.isActive === false);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await listWorkers();
        if (active) setWorkers(data);
      } catch (err) {
        if (active) {
          setWorkers([]);
          setError(err?.message || "Worker profiles could not be loaded.");
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [revision]);

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Workers</h1>

        </div>
      </div>

      <Link href="/admin/workers/new" className={styles.fabAdd}>
        + Add New Worker
      </Link>

      <Link href="/admin/map" className={styles.fabAdd}>
        🗺️ INFIXO MAP
      </Link>

      <Link href="/admin/leads" className={styles.fabAdd}>
        Worker Acquisition Leads
      </Link>

      <div className={styles.profileTabs} role="tablist" aria-label="Worker profile status">
        <button type="button" role="tab" id="active-profiles-tab" aria-controls="worker-profiles-list"
          aria-selected={profileTab === "active"}
          className={`${styles.profileTab} ${profileTab === "active" ? styles.profileTabActive : ""}`}
          onClick={() => setProfileTab("active")}
        >
          Active Profiles ({activeWorkers.length})
        </button>
        <button type="button" role="tab" id="inactive-profiles-tab" aria-controls="worker-profiles-list"
          aria-selected={profileTab === "inactive"}
          className={`${styles.profileTab} ${profileTab === "inactive" ? styles.profileTabActive : ""}`}
          onClick={() => setProfileTab("inactive")}
        >
          Inactive Profiles ({inactiveWorkers.length})
        </button>
      </div>

      {loading && <p role="status">Loading worker profiles…</p>}

      {!loading && error && (
        <div role="alert">
          <p className={styles.errorText}>
            Worker profiles could not be loaded: {error}
          </p>
          <button
            type="button"
            className={styles.btn + " " + styles.btnSecondary}
            onClick={() => setRevision(v => v + 1)}
          >
            Retry loading
          </button>
        </div>
      )}

      {!loading && !error && (
        <section
          id="worker-profiles-list"
          role="tabpanel"
          aria-labelledby={profileTab === "active" ? "active-profiles-tab" : "inactive-profiles-tab"}
          className={styles.profileResults}
        >
          {profileTab === "active" ? (
            activeWorkers.length > 0
              ? activeWorkers.map(w => <WorkerListRow key={w.id} worker={w} />)
              : <p className={styles.emptyProfileList}>No active profiles yet.</p>
          ) : (
            inactiveWorkers.length > 0
              ? inactiveWorkers.map(w => <WorkerListRow key={w.id} worker={w} />)
              : <p className={styles.emptyProfileList}>No inactive profiles yet.</p>
          )}
        </section>
      )}
    </div>
  );
}

function WorkerListRow({ worker: w }) {
  return (
    <Link
      href={`/admin/workers/${w.id}/share`}
      className={styles.workerListItem}
    >
      <div>
        <div className={styles.workerListName}>{w.fullName || "Untitled Worker"}</div>
        <div className={styles.workerListMeta}>
          {w.profession || "—"} · {w.isActive === false ? "Draft / Inactive" : "Active profile"}
        </div>
      </div>
      <span aria-hidden="true">›</span>
    </Link>
  );
}
