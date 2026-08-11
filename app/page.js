'use client';

import { useState, useEffect } from "react";
import Header from "./components/Header/Header";
import WorkerIdentityCard from "./components/WorkerIdentityCard/WorkerIdentityCard";
import NavigationTabs from "./components/NavigationTabs/NavigationTabs";
import Footer from "./components/Footer/Footer";
import dummyWorker from "./data/dummyWorker";
import { supabase } from "@/lib/supabaseClient";
import { mapDatabaseToWorker } from "@/lib/workerService";

// The homepage always shows the default/demo worker (slug: rahul-sharma)
// so old bookmarks to "/" keep working. Every other worker created in the
// admin panel gets its own URL at /w/[slug].
const DEFAULT_SLUG = "rahul-sharma";

export default function HomePage() {
  const [workerData, setWorkerData] = useState(dummyWorker);

  useEffect(() => {
    let channel = null;

    async function loadDataAndSubscribe() {
      try {
        const { data } = await supabase
          .from("workers")
          .select("*")
          .eq("slug", DEFAULT_SLUG)
          .maybeSingle();

        if (data) {
          setWorkerData(mapDatabaseToWorker(data));
        }

        channel = supabase
          .channel("realtime_worker_changes")
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "workers", filter: `slug=eq.${DEFAULT_SLUG}` },
            (payload) => {
              if (payload.new) {
                setWorkerData(mapDatabaseToWorker(payload.new));
              }
            }
          )
          .subscribe();
      } catch (err) {
        console.error("Error loading worker data:", err);
      }
    }

    loadDataAndSubscribe();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  return (
    <main>
      <Header />

      <div style={{ padding: "2rem 1rem 0 1rem" }}>
        <WorkerIdentityCard worker={workerData} />
        <NavigationTabs worker={workerData} basePath="" />
      </div>

      <Footer />
    </main>
  );
}
