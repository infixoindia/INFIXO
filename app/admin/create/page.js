'use client';

import WorkerMasterProfile from '@/app/components/WorkerMasterProfile/WorkerMasterProfile';

export default function CreateWorkerPage() {
  const emptyWorker = {
    full_name: '',
    profession: '',
    experience: '',
    service_area: [],
    working_shift: ['Day', 'Night'],
  };

  const handleSave = (newData) => {
    console.log('Creating new worker:', newData);
    const newSlug = newData.fullName ? newData.fullName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-') : 'new-worker';
    alert(`New Worker Created! Unique URL generated: /w/${newSlug}`);
  };

  return (
    <WorkerMasterProfile
      initialWorkerData={emptyWorker}
      mode="create"
      onSave={handleSave}
    />
  );
}
