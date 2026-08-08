'use client';

import { useState } from 'react';
// Note: Apne existing components ka sahi path check kar lena
import Header from '../Header/Header';
import WorkerIdentityCard from '../WorkerIdentityCard/WorkerIdentityCard';
import HeroSlider from '../HeroSlider/HeroSlider';
import NavigationTabs from '../NavigationTabs/NavigationTabs';
import Footer from '../Footer/Footer';

export default function WorkerMasterProfile({
  initialWorkerData = {},
  mode = 'preview', // 'preview' | 'edit' | 'create'
  onSave,
}) {
  const [workerData, setWorkerData] = useState({
    fullName: initialWorkerData?.full_name || '',
    profession: initialWorkerData?.profession || '',
    experience: initialWorkerData?.experience || 0,
    serviceArea: Array.isArray(initialWorkerData?.service_area) ? initialWorkerData.service_area : [],
    isVerified: initialWorkerData?.is_verified ?? true,
    profilePic: initialWorkerData?.profile_pic || '/images/worker-placeholder-v3.png',
    aboutMe: initialWorkerData?.about_me || '',
    languages: Array.isArray(initialWorkerData?.languages) ? initialWorkerData.languages : [],
    workingHours: initialWorkerData?.working_hours || '',
    workingShift: Array.isArray(initialWorkerData?.working_shift) ? initialWorkerData.working_shift : ['Day', 'Night'],
    primarySkill: initialWorkerData?.primary_skill || '',
    gender: initialWorkerData?.gender || '',
    age: initialWorkerData?.age || '',
    heroSlides: Array.isArray(initialWorkerData?.hero_slides) ? initialWorkerData.hero_slides.filter(Boolean) : [],
    workPhotos: Array.isArray(initialWorkerData?.work_photos) ? initialWorkerData.work_photos.filter(Boolean) : [],
    workVideos: Array.isArray(initialWorkerData?.work_videos) ? initialWorkerData.work_videos.filter(Boolean) : [],
    slug: initialWorkerData?.slug || '',
    id: initialWorkerData?.id || null,
  });

  const isEditable = mode === 'edit' || mode === 'create';

  const handleFieldChange = (field, value) => {
    setWorkerData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleShift = (shiftName) => {
    const current = Array.isArray(workerData.workingShift) ? workerData.workingShift : [];
    if (current.includes(shiftName)) {
      handleFieldChange('workingShift', current.filter((s) => s !== shiftName));
    } else {
      handleFieldChange('workingShift', [...current, shiftName]);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* ADMIN FLOATING SAVE TOOLBAR (Only in Edit/Create Mode) */}
      {isEditable && (
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 10000,
            background: '#111827',
            color: '#fff',
            padding: '12px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          <div>
            <strong>MODE: {mode.toUpperCase()}</strong>
          </div>
          <button
            onClick={() => onSave && onSave(workerData)}
            style={{
              background: '#18A34A',
              color: '#fff',
              border: 'none',
              padding: '8px 20px',
              borderRadius: '6px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            Save Worker
          </button>
        </div>
      )}

      {/* LOCKED EXISTING HEADER */}
      <Header />

      <div style={{ padding: '2rem 1rem 0 1rem', position: 'relative' }}>
        {/* INLINE EDIT INPUTS (Only appears when editing or creating) */}
        {isEditable && (
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '12px',
              padding: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            <h4 style={{ margin: '0 0 12px 0' }}>✏️ Edit Worker Details</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <input
                type="text"
                placeholder="Full Name *"
                value={workerData.fullName}
                onChange={(e) => handleFieldChange('fullName', e.target.value)}
                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
              />
              <input
                type="text"
                placeholder="Profession *"
                value={workerData.profession}
                onChange={(e) => handleFieldChange('profession', e.target.value)}
                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
              />
              <input
                type="number"
                placeholder="Experience (Years)"
                value={workerData.experience}
                onChange={(e) => handleFieldChange('experience', e.target.value)}
                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
              />
              <input
                type="text"
                placeholder="Service Area (e.g. Indore, Dewas)"
                value={Array.isArray(workerData.serviceArea) ? workerData.serviceArea.join(', ') : workerData.serviceArea || ''}
                onChange={(e) => handleFieldChange('serviceArea', e.target.value.split(',').map(s => s.trim()))}
                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
              />
            </div>

            {/* DATA-DRIVEN SHIFT TOGGLE */}
            <div style={{ marginTop: '12px' }}>
              <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Working Shifts:</label>
              <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                {['Day', 'Night'].map((shift) => {
                  const shifts = Array.isArray(workerData.workingShift) ? workerData.workingShift : [];
                  const isSelected = shifts.includes(shift);
                  return (
                    <button
                      key={shift}
                      type="button"
                      onClick={() => toggleShift(shift)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '20px',
                        border: '1px solid #000',
                        background: isSelected ? '#18A34A' : '#e2e8f0',
                        color: isSelected ? '#fff' : '#000',
                        cursor: 'pointer',
                      }}
                    >
                      {shift} {isSelected ? '✓' : '✕'}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* LOCKED MASTER UI COMPONENTS */}
        <WorkerIdentityCard worker={workerData} />
        {Array.isArray(workerData.heroSlides) && workerData.heroSlides.length > 0 && (
          <HeroSlider slides={workerData.heroSlides} workerName={workerData.fullName} />
        )}
        <NavigationTabs worker={workerData} />
      </div>

      {/* LOCKED EXISTING FOOTER */}
      <Footer />
    </div>
  );
}
