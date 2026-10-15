"use client";

import { useEffect, useState } from "react";
import { normalizePhone } from "@/lib/acquisition/config.mjs";

/**
 * Admin-only worker selector for linking a lead to an existing worker profile.
 * Uses the already-protected /api/admin/workers endpoint, never a public worker
 * list. Only exact normalized phone + profession matches are suggested.
 * Server-side /api/admin/leads validation remains the source of truth.
 */
export default function WorkerProfilePicker({ lead }) {
  const [workers, setWorkers] = useState([]);
  const [workerId, setWorkerId] = useState(lead.worker_id || "");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    let live = true;
    async function load() {
      try {
        const response = await fetch("/api/admin/workers", {
          cache: "no-store",
          signal: controller.signal,
          credentials: "same-origin",
        });
        if (response.status === 401) {
          window.location.href = "/admin/login";
          return;
        }
        const body = await response.json();
        if (!response.ok || !Array.isArray(body.workers)) {
          throw new Error(body.error || "Worker list could not be loaded.");
        }
        const leadPhone = normalizePhone(lead.phone);
        const matching = body.workers.filter(
          (w) =>
            w.profession === lead.profession &&
            !!leadPhone &&
            normalizePhone(w.phone) === leadPhone
        );
        if (!live) return;
        setWorkers(matching);
        setWorkerId((current) => {
          if (current) return current;
          const active = matching.filter((w) => w.is_active !== false);
          return active.length === 1 ? active[0].id : "";
        });
      } catch (e) {
        if (live && e.name !== "AbortError") {
          setError(e.message || "Could not load matching profiles.");
        }
      } finally {
        if (live) setLoading(false);
      }
    }
    load();
    return () => {
      live = false;
      controller.abort();
    };
  }, [lead.id, lead.phone, lead.profession]);

  const chosen = workers.find((w) => w.id === workerId);
  const orphan = workerId && !chosen;
  const validMatches = workers.filter((w) => w.is_active !== false);

  return (
    <>
      <label>
        Matching Worker Profile
        <select
          name="worker_id"
          value={workerId}
          onChange={(e) => setWorkerId(e.target.value)}
          disabled={loading || !!error}
        >
          <option value="">{loading ? "Loading workers…" : "Not linked — select a profile"}</option>
          {orphan && (
            <option value={workerId}>Previously linked worker ({workerId.slice(0, 8)}…) — review</option>
          )}
          {workers.map((worker) => (
            <option key={worker.id} value={worker.id}>
              {worker.full_name || "Unnamed worker"} — {worker.slug || worker.id.slice(0, 8)}{worker.is_active === false ? " (Inactive)" : ""}
            </option>
          ))}
        </select>
      </label>
      {error && <p role="alert">{error} Please refresh and try again.</p>}
      {!loading && !error && validMatches.length === 0 && (
        <p>
          No active worker profile with the same phone and profession.
          {" "}<a href="/admin/workers/new" target="_blank" rel="noopener noreferrer">Create Worker Profile ↗</a>
          {" "}and reopen this lead to link it.
        </p>
      )}
      {!loading && !error && validMatches.length > 0 && (
        <p>
          Matching profiles are filtered by the registered phone and category.
          Review the selected profile before approving onboarding.
          {chosen?.slug && (
            <>{" "}<a href={`/w/${encodeURIComponent(chosen.slug)}`} target="_blank" rel="noopener noreferrer">Open selected profile ↗</a></>
          )}
        </p>
      )}
    </>
  );
}
