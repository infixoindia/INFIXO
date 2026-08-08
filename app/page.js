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

  useEffect(() => {
    async function getProfile() {
      try {
        const { data, error } = await supabase
          .from('worker_profile')
          .select('*')
          .limit(1);

        if (data && data.length > 0) {
          const dbData = data[0];
          setWorkerData({
            ...dummyWorker,
            name: dbData.name || dummyWorker.name,
            profession: dbData.profession || dummyWorker.profession,
            experience: dbData.experience || dummyWorker.experience,
            serviceArea: dbData.service_area || dummyWorker.serviceArea,
            gender: dbData.gender || dummyWorker.gender,
            age: dbData.age || dummyWorker.age,
            languages: dbData.languages || dummyWorker.languages,
            primarySkill: dbData.primary_skill || dummyWorker.primarySkill,
            workingHours: dbWorker.working_hours || dummyWorker.workingHours,
            workingShift: dbWorker.working_shift || dummyWorker.workingShift,
            aboutMe: dbData.about_me || dummyWorker.aboutMe,
          });
        }
      } catch (err) {
        console.log("Supabase Fetch Error:", err);
      }
    }

    getProfile();
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
