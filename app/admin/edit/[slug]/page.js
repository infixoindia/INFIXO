"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../../../lib/supabaseClient";
import { mapDatabaseToWorker, mapWorkerToDatabase } from "../../../../lib/workerService";
import WorkerAdminForm from "../../components/WorkerAdminForm";

export default function EditWorkerPage() {
  const { slug } = useParams();
  const router = useRouter();

  const [workerData, setWorkerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (slug) {
      fetchWorkerBySlug();
    }
  }, [slug]);

  const fetchWorkerBySlug = async () => {
    setLoading(true);
    setErrorMsg("");

    const { data, error } = await supabase
      .from("workers")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) {
      console.error("Error fetching worker:", error.message);
      setErrorMsg("Worker record not found.");
    } else if (data) {
      // Map Supabase snake_case to UI camelCase
      const mappedWorker = mapDatabaseToWorker(data);
      setWorkerData(mappedWorker);
    }
    setLoading(false);
  };

  const handleSave = async (updatedFormData) => {
    setSaving(true);
    setErrorMsg("");

    // Map UI camelCase back to Supabase snake_case
    const dbPayload = mapWorkerToDatabase(updatedFormData);

    const { error } = await supabase
      .from("workers")
      .update(dbPayload)
      .eq("slug", slug);

    if (error) {
      console.error("Error updating worker:", error.message);
      setErrorMsg("Failed to save worker profile.");
    } else {
      alert("Worker profile updated successfully!");
      router.push("/admin");
    }
    setSaving(false);
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "1000px", margin: "0 auto", fontFamily: "sans-serif" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <Link href="/admin" style={{ color: "#2563eb", textDecoration: "none", fontSize: "14px", fontWeight: "600" }}>
          ← Back to Dashboard
        </Link>
      </div>

      {loading && <p style={{ textAlign: "center", color: "#666" }}>Loading worker profile...</p>}

      {errorMsg && (
        <div style={{ background: "#fef2f2", color: "#dc2626", padding: "12px", borderRadius: "8px", marginBottom: "1rem" }}>
          {errorMsg}
        </div>
      )}

      {!loading && workerData && (
        <WorkerAdminForm
          initialData={workerData}
          onSave={handleSave}
          isLoading={saving}
        />
      )}
    </div>
  );
}
