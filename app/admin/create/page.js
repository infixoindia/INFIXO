'use client';

import WorkerMasterProfile from '../../components/WorkerMasterProfile/WorkerMasterProfile';
import { supabase } from '../../lib/supabase';

import { useRouter } from 'next/navigation';

export default function CreateWorkerPage() {
  const router = useRouter();

  const emptyWorker = {
    full_name: '',
    profession: '',
    experience: '',
    service_area: [],
    working_shift: ['Day', 'Night'],
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
