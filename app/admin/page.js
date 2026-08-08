'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('work');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

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
    about_me: 'Dedicated and reliable professional known for delivering high-quality work.',
    profile_pic: ''
  });

  const [photos, setPhotos] = useState([]);
  const [videos, setVideos] = useState([]);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');

  // Safe Supabase Initializer
  const getSupabase = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key || !url.startsWith('http')) return null;
    return createClient(url, key);
  };

  // Fetch Initial Data
  useEffect(() => {
    async function loadData() {
      const supabase = getSupabase();
      if (!supabase) {
        setLoading(false);
        return;
      }

      try {
        // Fetch Profile
        const { data: profData } = await supabase.from('worker_profile').select('*').limit(1);
        if (profData && profData.length > 0) {
          setProfile(profData[0]);
        }

        // Fetch Photos & Videos
        const { data: pData } = await supabase.from('work_photos').select('*').order('id', { ascending: false });
        const { data: vData } = await supabase.from('work_videos').select('*').order('id', { ascending: false });

        if (pData) setPhotos(pData);
        if (vData) setVideos(vData);
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  // Save Profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const supabase = getSupabase();
    if (!supabase) {
      alert("Supabase keys missing!");
      return;
    }

    setSaving(true);
    setMessage('');

    try {
      const { error } = await supabase
        .from('worker_profile')
        .update(profile)
        .eq('id', profile.id || 1);

      if (error) {
        setMessage('❌ Save Failed: ' + error.message);
      } else {
        setMessage('✅ Profile Saved Successfully! Check main site.');
      }
    } catch (err) {
      setMessage('❌ Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Add Photo
  const handleAddPhoto = async (e) => {
    e.preventDefault();
    if (!newPhotoUrl) return;
    const supabase = getSupabase();
    if (!supabase) return;

    const { data, error } = await supabase.from('work_photos').insert([{ image_url: newPhotoUrl }]).select();
    if (!error && data) {
      setPhotos([data[0], ...photos]);
      setNewPhotoUrl('');
    }
  };

  // Add Video
  const handleAddVideo = async (e) => {
    e.preventDefault();
    if (!newVideoUrl) return;
    const supabase = getSupabase();
    if (!supabase) return;

    const { data, error } = await supabase.from('work_videos').insert([{ video_url: newVideoUrl }]).select();
    if (!error && data) {
      setVideos([data[0], ...videos]);
      setNewVideoUrl('');
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>Loading Admin Panel...</div>;
  }

  return (
    <div style={{ maxWidth: '600px', margin: '20px auto', padding: '16px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <h1 style={{ fontSize: '22px', fontWeight: 'bold', textAlign: 'center', marginBottom: '16px' }}>⚙️ Admin Panel</h1>

      {message && (
        <div style={{ padding: '10px', marginBottom: '16px', borderRadius: '8px', background: message.includes('✅') ? '#dcfce7' : '#fee2e2', color: message.includes('✅') ? '#166534' : '#991b1b', fontSize: '14px', fontWeight: 'bold' }}>
          {message}
        </div>
      )}

      {/* 4 Tabs Navigation */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
        <button onClick={() => setActiveTab('work')} style={activeTab === 'work' ? activeTabBtn : tabBtn}>📋 Work Details</button>
        <button onClick={() => setActiveTab('worker')} style={activeTab === 'worker' ? activeTabBtn : tabBtn}>👤 Worker Details</button>
        <button onClick={() => setActiveTab('photos')} style={activeTab === 'photos' ? activeTabBtn : tabBtn}>🖼️ Photos ({photos.length})</button>
        <button onClick={() => setActiveTab('videos')} style={activeTab === 'videos' ? activeTabBtn : tabBtn}>🎥 Videos ({videos.length})</button>
      </div>

      {/* TAB 1: WORK DETAILS */}
      {activeTab === 'work' && (
        <form onSubmit={handleSaveProfile} style={cardStyle}>
          <h3 style={titleStyle}>Edit Work Details</h3>
          <div style={fieldStyle}>
            <label style={labelStyle}>Primary Skill</label>
            <input type="text" name="primary_skill" value={profile.primary_skill || ''} onChange={handleProfileChange} style={inputStyle} />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Working Hours</label>
            <input type="text" name="working_hours" value={profile.working_hours || ''} onChange={handleProfileChange} style={inputStyle} />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Shift</label>
            <input type="text" name="working_shift" value={profile.working_shift || ''} onChange={handleProfileChange} style={inputStyle} />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Service Area</label>
            <input type="text" name="service_area" value={profile.service_area || ''} onChange={handleProfileChange} style={inputStyle} />
          </div>
          <button type="submit" disabled={saving} style={saveBtn}>{saving ? 'Saving...' : '💾 Save Work Details'}</button>
        </form>
      )}

      {/* TAB 2: WORKER DETAILS */}
      {activeTab === 'worker' && (
        <form onSubmit={handleSaveProfile} style={cardStyle}>
          <h3 style={titleStyle}>Edit Worker Details</h3>
          <div style={fieldStyle}>
            <label style={labelStyle}>Worker Name</label>
            <input type="text" name="name" value={profile.name || ''} onChange={handleProfileChange} style={inputStyle} required />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Profession</label>
            <input type="text" name="profession" value={profile.profession || ''} onChange={handleProfileChange} style={inputStyle} />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Experience</label>
            <input type="text" name="experience" value={profile.experience || ''} onChange={handleProfileChange} style={inputStyle} />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Gender</label>
            <input type="text" name="gender" value={profile.gender || ''} onChange={handleProfileChange} style={inputStyle} />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Age</label>
            <input type="text" name="age" value={profile.age || ''} onChange={handleProfileChange} style={inputStyle} />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Languages</label>
            <input type="text" name="languages" value={profile.languages || ''} onChange={handleProfileChange} style={inputStyle} />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>About Me</label>
            <textarea name="about_me" rows="3" value={profile.about_me || ''} onChange={handleProfileChange} style={inputStyle} />
          </div>
          <button type="submit" disabled={saving} style={saveBtn}>{saving ? 'Saving...' : '💾 Save Worker Details'}</button>
        </form>
      )}

      {/* TAB 3: WORK PHOTOS */}
      {activeTab === 'photos' && (
        <div style={cardStyle}>
          <h3 style={titleStyle}>Manage Work Photos</h3>
          <form onSubmit={handleAddPhoto} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <input type="url" placeholder="Paste Image URL" value={newPhotoUrl} onChange={(e) => setNewPhotoUrl(e.target.value)} style={inputStyle} required />
            <button type="submit" style={addBtn}>Add</button>
          </form>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {photos.map((p) => (
              <img key={p.id} src={p.image_url} alt="Work" style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '8px' }} />
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: WORK VIDEOS */}
      {activeTab === 'videos' && (
        <div style={cardStyle}>
          <h3 style={titleStyle}>Manage Work Videos</h3>
          <form onSubmit={handleAddVideo} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <input type="url" placeholder="Paste Video URL" value={newVideoUrl} onChange={(e) => setNewVideoUrl(e.target.value)} style={inputStyle} required />
            <button type="submit" style={addBtn}>Add</button>
          </form>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {videos.map((v) => (
              <video key={v.id} src={v.video_url} controls style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '8px' }} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const tabBtn = { padding: '10px', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' };
const activeTabBtn = { padding: '10px', background: '#2563eb', color: 'white', border: '1px solid #2563eb', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' };
const cardStyle = { background: '#ffffff', padding: '16px', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' };
const titleStyle = { fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' };
const fieldStyle = { marginBottom: '12px' };
const labelStyle = { display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '4px' };
const inputStyle = { width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box' };
const saveBtn = { width: '100%', padding: '10px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '8px' };
const addBtn = { padding: '8px 16px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' };
