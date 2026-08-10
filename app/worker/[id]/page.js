'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function WorkerProfilePage() {
  const params = useParams();
  const workerId = params?.id;

  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (workerId) {
      fetchWorkerData();
    }
  }, [workerId]);

  const fetchWorkerData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('workers')
      .select('*')
      .eq('id', workerId)
      .single();

    if (!error && data) {
      setWorker(data);
    }
    setLoading(false);
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Loading Profile...</div>;
  if (!worker) return <div style={{ textAlign: 'center', padding: '50px' }}>Worker Not Found</div>;

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', fontFamily: 'sans-serif', background: '#fff', minHeight: '100vh', paddingBottom: '30px' }}>
      
      {/* 1. Hero / Image Slider */}
      <div style={{ position: 'relative', width: '100%', height: '260px', overflowX: 'auto', display: 'flex', gap: '10px', background: '#222' }}>
        {worker.hero_images && worker.hero_images.length > 0 ? (
          worker.hero_images.map((imgObj, idx) => (
            <img key={idx} src={imgObj.image} alt="Hero" style={{ minWidth: '100%', height: '100%', objectFit: 'cover' }} />
          ))
        ) : (
          <div style={{ color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>No Slider Images</div>
        )}
      </div>

      {/* Identity Banner */}
      <div style={{ padding: '15px' }}>
        <h2 style={{ margin: '0 0 5px 0' }}>{worker.name} {worker.is_verified && '✔️'}</h2>
        <p style={{ color: '#666', margin: '0 0 8px 0' }}>{worker.profession} • {worker.experience}</p>
        <p style={{ color: '#888', margin: 0, fontSize: '14px' }}>📍 {worker.service_area}</p>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid #eee' }} />

      {/* 2. Work Details */}
      <div style={{ padding: '15px' }}>
        <h3>Work Details</h3>
        <p><b>Primary Skill:</b> {worker.primary_skill}</p>

        {/* Services Chips */}
        <p style={{ marginBottom: '6px', fontWeight: 'bold' }}>Services Provided:</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '15px' }}>
          {worker.services?.map((chip, idx) => (
            <span key={idx} style={chipStyle}>{chip}</span>
          ))}
        </div>

        <p><b>Experience:</b> {worker.work_experience}</p>
        <p><b>Working Hours:</b> {worker.working_hours}</p>
        <p><b>Shifts:</b> {worker.working_shift?.join(', ')}</p>

        {/* Why Choose Me */}
        {worker.why_choose_me && worker.why_choose_me.length > 0 && (
          <div>
            <p style={{ fontWeight: 'bold' }}>Why Choose Me:</p>
            <ul>
              {worker.why_choose_me.map((reason, idx) => (
                <li key={idx}>{reason}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid #eee' }} />

      {/* 3. Worker Details & Verification Badges */}
      <div style={{ padding: '15px' }}>
        <h3>Worker Details</h3>
        <p><b>Full Name:</b> {worker.full_name}</p>
        <p><b>Gender:</b> {worker.gender} | <b>Age:</b> {worker.age}</p>
        <p><b>Address:</b> {worker.address}</p>
        <p><b>Languages:</b> {worker.languages}</p>

        {/* Dynamic Verification Badges */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '15px' }}>
          {worker.is_worker_verified && <span style={badgeStyle}>✅ Worker Verified</span>}
          {worker.is_work_verified && <span style={badgeStyle}>✅ Work Verified</span>}
          {worker.is_address_verified && <span style={badgeStyle}>✅ Address Verified</span>}
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid #eee' }} />

      {/* 4. Photos Gallery */}
      {worker.work_photos && worker.work_photos.length > 0 && (
        <div style={{ padding: '15px' }}>
          <h3>Work Photos</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {worker.work_photos.map((photoUrl, idx) => (
              <img key={idx} src={photoUrl} alt="Work Photo" style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '8px' }} />
            ))}
          </div>
        </div>
      )}

      {/* 5. Videos Gallery */}
      {worker.work_videos && worker.work_videos.length > 0 && (
        <div style={{ padding: '15px' }}>
          <h3>Work Videos</h3>
          <div style={{ display: 'flex', gap: '10px', overflowX: 'auto' }}>
            {worker.work_videos.map((v, idx) => (
              <div key={idx} style={{ minWidth: '140px', background: '#000', color: '#fff', borderRadius: '8px', padding: '20px 10px', textAlign: 'center' }}>
                <p style={{ margin: 0 }}>▶ Play Video</p>
                <small>{v.duration}</small>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

const chipStyle = { background: '#f0f0f0', padding: '6px 12px', borderRadius: '16px', fontSize: '13px' };
const badgeStyle = { background: '#e6f4ea', color: '#137333', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' };
