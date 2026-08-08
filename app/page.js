'use client';
import { useState, useEffect } from "react";
import Header from "./components/Header/Header";
import WorkerIdentityCard from "./components/WorkerIdentityCard/WorkerIdentityCard";
import NavigationTabs from "./components/NavigationTabs/NavigationTabs";
import Footer from "./components/Footer/Footer";
import dummyWorker from "./data/dummyWorker";
import { supabase } from "../lib/supabaseClient";

export default function HomePage() {
  const [workerData, setWorkerData] = useState(dummyWorker);

  // 1. Data Fetch karne ka function
  async function getProfile() {
    const { data } = await supabase.from('worker_profile').select('*').limit(1);
    if (data && data.length > 0) {
      setWorkerData(prev => ({ ...prev, ...data[0] }));
    }
  }

  useEffect(() => {
    // Pehle baar data load karo
    getProfile();

    // 2. Realtime Listener: Jaise hi DB change hoga, ye trigger hoga
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'worker_profile' },
        (payload) => {
          console.log('Change detected!', payload);
          // New data update karo
          setWorkerData(prev => ({ ...prev, ...payload.new }));
        }
      )
      .subscribe();

    // Cleanup: Memory bachane ke liye
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <main>
      <Header />
      <div style={{ padding: "2rem 1rem 0 1rem" }}>
        <WorkerIdentityCard worker={workerData} />
        <NavigationTabs />
      </div>
      <Footer />
    </main>
  );
}
