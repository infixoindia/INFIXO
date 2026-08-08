'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function WorkerProfile() {
  const [activeTab, setActiveTab] = useState('work'); // 'work', 'worker', 'photos', 'videos'
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState({
    name: 'Krish Yadav',
    profession: 'Electrician',
    experience: '8+ Years',
    service_area: 'Indore, MP',
    gender: 'Male',
    age: '28 Years',
    languages: 'Hindi, English',
    primary_skill: 'Electrician',
    working_hours: '9:00 AM – 7:00 PM',
    working_shift: 'Day',
    about_me: 'Dedicated and reliable professional known for delivering high-quality work.'
  });

  const [photos, setPhotos] = useState([]);
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    fetchWorkerData();
  }, []);

  const fetchWorkerData = async () => {
    setLoading(true);
    // Fetch Profile Data from Supabase
    const { data: profData } = await supabase.from('worker_profile').select('*').limit(1);
    if (profData && profData.length > 0) {
      setProfile(profData[0]);
    }

    // Fetch Work Photos & Videos
    const { data: pData } = await supabase.from('work_photos').select('*').order('id', { ascending: false });
    const { data: vData } = await supabase.from('work_videos').select('*').order('id', { ascending: false });

    if (pData) setPhotos(pData);
    if (vData) setVideos(vData);

    setLoading(false);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
        <p style={{ color: '#6b7280', fontSize: '16px' }}>Loading Profile...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Top Banner Card */}
      <div style={styles.profileHeaderCard}>
        <div style={styles.bannerImgBox}>
          <img 
            src={profile.profile_pic || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=600&auto=format&fit=crop'} 
            alt={profile.name} 
            style={styles.profileImg} 
          />
        </div>
        
        <div style={styles.headerInfo}>
          <h1 style={styles.workerName}>{profile.name}</h1>
          <div style={styles.badgeRow}>
            <span style={styles.professionBadge}>{profile.profession}</span>
            <span style={styles.expBadge}>{profile.experience} Exp</span>
          </div>

          <div style={styles.metaRow}>
            <span>📍 {profile.service_area}</span>
          </div>

          <div style={styles.verifiedTag}>
            <span style={{ color: '#10b981', marginRight: '4px' }}>✓</span> VERIFIED BY INFIXO
          </div>
        </div>
      </div>

      {/* 4 Main Action Buttons */}
      <div style={styles.navGrid}>
        <button 
          style={activeTab === 'work' ? styles.activeNavBtn : styles.navBtn} 
          onClick={() => setActiveTab('work')}
        >
          📋 Work Details
        </button>
        <button 
          style={activeTab === 'worker' ? styles.activeNavBtn : styles.navBtn} 
          onClick={() => setActiveTab('worker')}
        >
          👤 Worker Details
        </button>
        <button 
          style={activeTab === 'photos' ? styles.activeNavBtn : styles.navBtn} 
          onClick={() => setActiveTab('photos')}
        >
          🖼️ Work Photos ({photos.length})
        </button>
        <button 
          style={activeTab === 'videos' ? styles.activeNavBtn : styles.navBtn} 
          onClick={() => setActiveTab('videos')}
        >
          🎥 Work Videos ({videos.length})
        </button>
      </div>

      {/* TAB CONTENT SECTIONS */}
      <div style={styles.contentSection}>

        {/* TAB 1: WORK DETAILS */}
        {activeTab === 'work' && (
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Work & Service Details</h3>

            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Primary Skill</span>
              <span style={styles.infoValue}>{profile.primary_skill || profile.profession}</span>
            </div>

            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Working Hours</span>
              <span style={styles.infoValue}>{profile.working_hours}</span>
            </div>

            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Shift</span>
              <span style={styles.infoValue}>{profile.working_shift || 'Day'}</span>
            </div>

            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Service Area</span>
              <span style={styles.infoValue}>{profile.service_area}</span>
            </div>

            <h4 style={{ ...styles.cardTitle, marginTop: '20px', fontSize: '14px' }}>Why Choose Me</h4>
            <div style={styles.badgesWrap}>
              <span style={styles.featurePill}>👍 Clean & Professional Work</span>
              <span style={styles.featurePill}>⏰ On Time Work</span>
              <span style={styles.featurePill}>💰 Reasonable Pricing</span>
              <span style={styles.featurePill}>⭐ Customer Satisfaction</span>
            </div>
          </div>
        )}

        {/* TAB 2: WORKER DETAILS */}
        {activeTab === 'worker' && (
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Professional Details</h3>

            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Full Name</span>
              <span style={styles.infoValue}>{profile.name}</span>
            </div>

            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Gender</span>
              <span style={styles.infoValue}>{profile.gender}</span>
            </div>

            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Age</span>
              <span style={styles.infoValue}>{profile.age}</span>
            </div>

            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Languages</span>
              <span style={styles.infoValue}>{profile.languages}</span>
            </div>

            <h4 style={{ ...styles.cardTitle, marginTop: '20px', fontSize: '14px' }}>About Me</h4>
            <p style={styles.aboutText}>{profile.about_me}</p>
          </div>
        )}

        {/* TAB 3: WORK PHOTOS */}
        {activeTab === 'photos' && (
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Work Gallery ({photos.length})</h3>
            {photos.length === 0 ? (
              <p style={{ color: '#9ca3af', textAlign: 'center', padding: '20px 0' }}>No photos uploaded yet.</p>
            ) : (
              <div style={styles.mediaGrid}>
                {photos.map((item) => (
                  <div key={item.id} style={styles.mediaCard}>
                    <img src={item.image_url} alt="Work Photo" style={styles.mediaImg} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: WORK VIDEOS */}
        {activeTab === 'videos' && (
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Work Videos ({videos.length})</h3>
            {videos.length === 0 ? (
              <p style={{ color: '#9ca3af', textAlign: 'center', padding: '20px 0' }}>No videos uploaded yet.</p>
            ) : (
              <div style={styles.mediaGrid}>
                {videos.map((item) => (
                  <div key={item.id} style={styles.mediaCard}>
                    <video src={item.video_url} controls style={styles.mediaImg} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: '480px', margin: '0 auto', padding: '16px', fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#f8f9fa', minHeight: '100vh' },
  profileHeaderCard: { background: 'white', borderRadius: '16px', padding: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: '16px', textAlign: 'center' },
  bannerImgBox: { width: '100px', height: '100px', margin: '0 auto 12px', borderRadius: '50%', overflow: 'hidden', border: '3px solid #2563eb' },
  profileImg: { width: '100%', height: '100%', objectFit: 'cover' },
  workerName: { fontSize: '22px', fontWeight: '700', color: '#111827', margin: '0 0 6px 0' },
  badgeRow: { display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '8px' },
  professionBadge: { background: '#dbeafe', color: '#1e40af', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  expBadge: { background: '#f3f4f6', color: '#374151', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' },
  metaRow: { fontSize: '13px', color: '#6b7280', marginBottom: '10px' },
  verifiedTag: { display: 'inline-flex', alignItems: 'center', background: '#ecfdf5', color: '#065f46', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', letterSpacing: '0.5px' },
  navGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' },
  navBtn: { padding: '12px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', fontSize: '13px', fontWeight: '600', color: '#374151', cursor: 'pointer', textAlign: 'center' },
  activeNavBtn: { padding: '12px', background: '#2563eb', border: '1px solid #2563eb', borderRadius: '12px', fontSize: '13px', fontWeight: '600', color: 'white', cursor: 'pointer', textAlign: 'center', boxShadow: '0 4px 10px rgba(37, 99, 235, 0.2)' },
  contentSection: { marginBottom: '20px' },
  card: { background: 'white', padding: '16px', borderRadius: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' },
  cardTitle: { fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '16px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' },
  infoRow: { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f9fafb', fontSize: '14px' },
  infoLabel: { color: '#6b7280', fontWeight: '500' },
  infoValue: { color: '#111827', fontWeight: '600' },
  badgesWrap: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' },
  featurePill: { background: '#f3f4f6', color: '#374151', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '500' },
  aboutText: { fontSize: '14px', color: '#4b5563', lineHeight: '1.6', marginTop: '6px' },
  mediaGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
  mediaCard: { borderRadius: '10px', overflow: 'hidden', background: '#000', height: '140px' },
  mediaImg: { width: '100%', height: '100%', objectFit: 'cover' }
};
