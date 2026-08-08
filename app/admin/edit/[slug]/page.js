'use client';

import { use, useEffect, useState } from 'react';
import WorkerMasterProfile from '../../../components/WorkerMasterProfile/WorkerMasterProfile';
import { supabase } from '../../../lib/supabase';


export default function EditWorkerPage({ params }) {
  const { slug } = use(params);
  const [workerData, setWorkerData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWorker() {
      const { data, error } = await supabase
        .from('workers')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) {
        console.error('Error fetching worker:', error.message);
      } else {
        setWorkerData(data);
      }
      setLoading(false);
    }

    fetchWorker();
  }, [slug]);

  const handleSave = async (updatedData) => {
    const { error } = await supabase
      .from('workers')
      .update(updatedData)
      .eq('slug', slug);

    if (error) {
      alert('Error updating worker: ' + error.message);
    } else {
      alert('Worker profile updated successfully!');
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading worker data...</div>;
  }

  if (!workerData) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Worker not found!</div>;
  }

  return (
    <WorkerMasterProfile
      initialWorkerData={workerData}
      mode="edit"
      onSave={handleSave}
    />
  );
}
