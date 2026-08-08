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

  // Database se live profile fetch karne ka function
  async function fetchWorkerProfile() {
    try {
      const { data, error } = await supabase
        .from('worker_profile')
        .select('*')
        .limit(1);

      if (data && data.length > 0) {
        const dbData = data[0];
        setWorkerData((prev) => ({
          ...prev,
          name: dbData.name || prev.name,
          profession: dbData.profession || prev.profession,
          experience: dbData.experience || prev.experience,
          serviceArea: dbData.service_area || prev.serviceArea,
          gender: dbData.gender || prev.gender,
          age: dbData.age || prev.age,
          languages: dbData.languages || prev.languages,
          primarySkill: dbData.primary_skill || prev.primarySkill,
          workingHours: dbData.working_hours || prev.workingHours,
          workingShift: dbData.working_shift || prev.workingShift,
          aboutMe: dbData.about_me || prev.aboutMe,
          profilePic: dbData.profile_pic || prev.profilePic
        }));
      }
    } catch (err) {
      console.error("Error fetching worker profile:", err);
    }
  }

  useEffect(() => {
    // 1. Initial Data Fetch
    fetchWorkerProfile();

    // 2. Realtime Listener: Database mein change aate hi UI update kar dega
    const channel = supabase
      .channel('realtime_worker_profile')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'worker_profile' },
        () => {
          fetchWorkerProfile();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <main>
      <Header />

      <div style={{ padding: "2rem 1rem 0 1rem" }}>
        <WorkerIdentityCard worker={workerData} />
        <NavigationTabs worker={workerData} />
      </div>

      <Footer />
    </main>
  );
}
