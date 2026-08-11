'use client';

import { useState, useEffect } from "react";
import WorkDetails from "../components/WorkDetails/WorkDetails";
import dummyWorker from "../data/dummyWorker";
import { supabase } from "@/lib/supabaseClient";
import { mapDatabaseToWorker } from "@/lib/workerService";

export default function WorkDetailsPage() {
  const [workerData, setWorkerData] = useState(dummyWorker);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await supabase
          .from("workers")
          .select("*")
          .eq("slug", "rahul-sharma")
          .maybeSingle();
        if (data) setWorkerData(mapDatabaseToWorker(data));
      } catch (err) {
        console.error("Error loading worker data:", err);
      }
    }
    load();
  }, []);

  return (
    <main>
      <div style={{ padding: "1rem" }}>
        <WorkDetails worker={workerData} backHref="/" />
      </div>
    </main>
  );
}
