'use client';

import { useState, useEffect } from "react";
import WorkerDetails from "../components/WorkerDetails/WorkerDetails";
import dummyWorker from "../data/dummyWorker";
import { supabase } from "@/lib/supabaseClient";
import { mapDatabaseToWorker } from "@/lib/workerService";

export default function Page() {
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

  return <WorkerDetails worker={workerData} backHref="/" />;
}
