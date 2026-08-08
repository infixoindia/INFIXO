'use client';

import { use } from 'react';
import WorkerMasterProfile from '@/app/components/WorkerMasterProfile/WorkerMasterProfile';
import dummyWorker from '@/app/data/dummyWorker';

export default function EditWorkerPage({ params }) {
  const { slug } = use(params);

  const workerData = {
    ...dummyWorker,
    full_name: slug ? slug.replace(/-/g, ' ') : 'Worker',
    slug: slug,
  };

  const handleSave = (updatedData) => {
    console.log('Editing existing worker record:', updatedData);
    alert(`Worker ${updatedData.fullName} updated! URL remains: /w/${slug}`);
  };

  return (
    <WorkerMasterProfile
      initialWorkerData={workerData}
      mode="edit"
      onSave={handleSave}
    />
  );
}
