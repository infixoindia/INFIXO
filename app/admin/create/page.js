'use client';

import WorkerMasterProfile from '@/app/components/WorkerMasterProfile/WorkerMasterProfile';
import { supabase } from '@/lib/supabaseClient'; // Sahi file name
import { useRouter } from 'next/navigation';

export default function CreateWorkerPage() {
  const router = useRouter();

  // Sabhi required initial properties baseline setup karo
  const emptyWorker = {
    full_name: '',
    profession: '',
    experience: '',
    service_area: [],
    working_shift: ['Day', 'Night'],
    image: '', // Undefined image error fix karne ke liye
    images: [],
    skills: [],
    portfolio: [],
  };

  const handleSave = async (newData) => {
    const generatedSlug = newData.full_name
      ? newData.full_name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')
      : `worker-${Date.now()}`;

    const payload = {
      ...newData,
      slug: generatedSlug,
    };

    const { error } = await supabase.from('workers').insert([payload]);

    if (error) {
      alert('Error creating worker: ' + error.message);
    } else {
      alert(`New Worker Created! URL: /w/${generatedSlug}`);
      router.push('/admin');
    }
  };

  return (
    <WorkerMasterProfile
      initialWorkerData={emptyWorker}
      mode="create"
      onSave={handleSave}
    />
  );
}
