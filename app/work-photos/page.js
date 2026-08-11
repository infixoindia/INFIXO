'use client';

import { useState, useEffect } from "react";
import WorkPhotos from "../components/WorkPhotos/WorkPhotos";
import dummyWorker from "../data/dummyWorker";
import { supabase } from "@/lib/supabaseClient";
import { mapDatabaseToWorker } from "@/lib/workerService";

export default function WorkPhotosPage() {
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

  return <WorkPhotos worker={workerData} backHref="/" />;
}
