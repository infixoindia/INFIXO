'use client';
import { useState, useEffect } from 'react';
import Header from "./components/Header/Header";
import WorkerIdentityCard from "./components/WorkerIdentityCard/WorkerIdentityCard";
import NavigationTabs from "./components/NavigationTabs/NavigationTabs";
import Footer from "./components/Footer/Footer";
import dummyWorker from "./data/dummyWorker";
import { supabase } from "../lib/supabaseClient";

export default function HomePage() {
  const [worker, setWorker] = useState(dummyWorker);

  useEffect(() => {
    async function loadWorkerData() {
      const { data, error } = await supabase
        .from('worker_profile')
        .select('*')
        .limit(1);

      if (data && data.length > 0) {
        const dbWorker = data[0];
        
        // Purani UI components ka exact prop structure maintain kar rahe hain
        setWorker({
          ...dummyWorker,
          name: dbWorker.name || dummyWorker.name,
          profession: dbWorker.profession || dummyWorker.profession,
          experience: dbWorker.experience || dummyWorker.experience,
          serviceArea: dbWorker.service_area || dummyWorker.serviceArea,
          gender: dbWorker.gender || dummyWorker.gender,
          age: dbWorker.age || dummyWorker.age,
          languages: dbWorker.languages || dummyWorker.languages,
          primarySkill: dbWorker.primary_skill || dummyWorker.primarySkill,
          workingHours: dbWorker.working_hours || dummyWorker.workingHours,
          workingShift: dbWorker.working_shift || dummyWorker.workingShift,
          aboutMe: dbWorker.about_me || dummyWorker.aboutMe,
          profilePic: dbWorker.profile_pic || dummyWorker.profilePic,
        });
      }
    }

    loadWorkerData();
  }, []);

  return (
    <main>
      <Header />

      <div style={{ padding: "2rem 1rem 0 1rem" }}>
        <WorkerIdentityCard worker={worker} />
        <NavigationTabs worker={worker} />
      </div>

      <Footer />
    </main>
  );
}
