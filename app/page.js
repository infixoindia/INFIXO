'use client';

import { useState, useEffect } from "react";
import Header from "./components/Header/Header";
import WorkerIdentityCard from "./components/WorkerIdentityCard/WorkerIdentityCard";
import NavigationTabs from "./components/NavigationTabs/NavigationTabs";
import Footer from "./components/Footer/Footer";
import dummyWorker from "./data/dummyWorker";
import { createClient } from "@supabase/supabase-js";

// Safe Inline Supabase Client Init (Taaki import path fail hone se page na phate)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY) 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) 
  : null;

export default function HomePage() {
  const [workerData, setWorkerData] = useState(dummyWorker);

  useEffect(() => {
    let channel = null;

    async function loadAndSubscribe() {
      if (!supabase) return;

      try {
        // 1. Initial Fetch
        const { data } = await supabase
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

        // 2. Realtime Listener
        channel = supabase
          .channel('realtime_profile')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'worker_profile' },
            (payload) => {
              if (payload.new) {
                const dbData = payload.new;
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
            }
          )
          .subscribe();
      } catch (err) {
        console.error("Supabase load error:", err);
      }
    }

    loadAndSubscribe();

    return () => {
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
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
