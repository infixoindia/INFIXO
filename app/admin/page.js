'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const [profile, setProfile] = useState({
    name: '',
    profession: '',
    experience: '',
    service_area: '',
    gender: '',
    age: '',
    languages: '',
    primary_skill: '',
    working_hours: '',
    working_shift: '',
    about_me: ''
  });

  const [photos, setPhotos] = useState([]);
  const [videos, setVideos] = useState([]);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const ADMIN_PIN = '1234';

  useEffect(() => {
    const auth = localStorage.getItem('infixo_admin_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
      fetchData();
    }
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: profData } = await supabase.from('worker_profile').select('*').single();
    if (profData) setProfile(profData);

    const { data: pData } = await supabase.from('work_photos').select('*').order('id', { ascending: false });
    const { data: vData } = await supabase.from('work_videos').select('*').order('id', { ascending: false });
    
    if (pData) setPhotos(pData);
    if (vData) setVideos(vData);
    setLoading(false);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (pin === ADMIN_PIN) {
      setIsAuthenticated(true);
      localStorage.setItem('infixo_admin_auth', 'true');
      fetchData();
    } else {
      alert('Incorrect Secret PIN!');
    }
  };

  const handleProfileSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('worker_profile')
      .update(profile)
      .eq('id', profile.id || 1);

    if (error) {
      alert('Error saving profile: ' + error.message);
    } else {
      alert('Profile details updated successfully! 🎉');
    }
    setSaving(false);
  };

  const handleMediaUpload = async (type) => {
    if (!file) return alert('Select a file first!');
    setUploading(true);

    try {
      const ext = file.name.split('.').pop();
      const path = `${type}s/${Date.now()}.${ext}`;

      const { error: uploadErr } = await supabase.storage.from('media').upload(path, file);
      if (uploadErr) throw uploadErr;

      const { data: urlData } = supabase.storage.from('media').getPublicUrl(path);
      const url = urlData.publicUrl;

      const table = type === 'photo' ? 'work_photos' : 'work_videos';
      const payload = type === 'photo' ? { image_url: url } : { video_url: url };

      await supabase.from(table).insert([payload]);
      alert('Uploaded successfully!');
      setFile(null);
      fetchData();
    } catch (err) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMedia = async (id, table) => {
    if (confirm('Delete this item?')) {
      await supabase.from(table).delete().eq('id', id);
      fetchData();
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={styles.authContainer}>
        <div style={styles.authCard}>
          <h2 style={{ marginBottom: '8px' }}>🔒 Infixo Admin</h2>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>Enter secret PIN to edit worker profile</p>
          <form onSubmit={handleLogin}>
            <input 
              type="password" 
              placeholder="••••" 
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              style={styles.pinInput}
            />
            <button type="submit" style={styles.primaryBtn}>Unlock Editor</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>Edit Worker Profile</h2>
        <button onClick={() => { localStorage.removeItem('infixo_admin_auth'); setIsAuthenticated(false); }} style={styles.logoutBtn}>Logout</button>
      </div>

      <div style={styles.tabs}>
        <button style={activeTab === 'profile' ? styles.activeTabBtn : styles.tabBtn} onClick={() => setActiveTab('profile')}>Info & Details</button>
        <button style={activeTab === 'photos' ? styles.activeTabBtn : styles.tabBtn} onClick={() => setActiveTab('photos')}>Photos ({photos.length})</button>
        <button style={activeTab === 'videos' ? styles.activeTabBtn : styles.tabBtn} onClick={() => setActiveTab('videos')}>Videos ({videos.length})</button>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', margin: '40px 0', color: '#666' }}>Loading details...</p>
      ) : (
        <>
          {activeTab === 'profile' && (
            <div style={styles.card}>
              <div style={styles.sectionHeader}>Personal & Professional Details</div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Full Name</label>
                <input 
                  type="text" 
                  value={profile.name || ''} 
                  onChange={(e) => setProfile({...profile, name: e.target.value})} 
                  style={styles.fieldInput} 
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Profession</label>
                <input 
                  type="text" 
                  value={profile.profession || ''} 
                  onChange={(e) => setProfile({...profile, profession: e.target.value})} 
                  style={styles.fieldInput} 
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Experience</label>
                <input 
                  type="text" 
                  value={profile.experience || ''} 
                  onChange={(e) => setProfile({...profile, experience: e.target.value})} 
                  style={styles.fieldInput} 
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Service Area</label>
                <input 
                  type="text" 
                  value={profile.service_area || ''} 
                  onChange={(e) => setProfile({...profile, service_area: e.target.value})} 
                  style={styles.fieldInput} 
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Gender</label>
                <input 
                  type="text" 
                  value={profile.gender || ''} 
                  onChange={(e) => setProfile({...profile, gender: e.target.value})} 
                  style={styles.fieldInput} 
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Age</label>
                <input 
                  type="text" 
                  value={profile.age || ''} 
                  onChange={(e) => setProfile({...profile, age: e.target.value})} 
                  style={styles.fieldInput} 
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Languages</label>
                <input 
                  type="text" 
                  value={profile.languages || ''} 
                  onChange={(e) => setProfile({...profile, languages: e.target.value})} 
                  style={styles.fieldInput} 
                />
              </div>

              <div style={styles.sectionHeader}>Work Details & Timings</div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Primary Skill</label>
                <input 
                  type="text" 
                  value={profile.primary_skill || ''} 
                  onChange={(e) => setProfile({...profile, primary_skill: e.target.value})} 
                  style={styles.fieldInput} 
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Working Hours</label>
                <input 
                  type="text" 
                  value={profile.working_hours || ''} 
                  onChange={(e) => setProfile({...profile, working_hours: e.target.value})} 
                  style={styles.fieldInput} 
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>About Me Paragraph</label>
                <textarea 
                  rows={3} 
                  value={profile.about_me || ''} 
                  onChange={(e) => setProfile({...profile, about_me: e.target.value})} 
                  style={{ ...styles.fieldInput, height: 'auto', padding: '10px' }} 
                />
              </div>

              <button onClick={handleProfileSave} disabled={saving} style={styles.saveBtn}>
                {saving ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          )}

          {activeTab === 'photos' && (
            <div style={styles.card}>
              <div style={styles.uploadBox}>
                <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
                <button onClick={() => handleMediaUpload('photo')} disabled={uploading} style={styles.uploadBtn}>
                  {uploading ? 'Uploading...' : 'Upload New Photo'}
                </button>
              </div>

              <div style={styles.grid}>
                {photos.map((item) => (
                  <div key={item.id} style={styles.mediaCard}>
                    <img src={item.image_url} alt="work" style={styles.mediaImg} />
                    <button onClick={() => handleDeleteMedia(item.id, 'work_photos')} style={styles.deleteBtn}>❌ Delete</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'videos' && (
            <div style={styles.card}>
              <div style={styles.uploadBox}>
                <input type="file" accept="video/*" onChange={(e) => setFile(e.target.files[0])} />
                <button onClick={() => handleMediaUpload('video')} disabled={uploading} style={styles.uploadBtn}>
                  {uploading ? 'Uploading...' : 'Upload New Video'}
                </button>
              </div>

              <div style={styles.grid}>
                {videos.map((item) => (
                  <div key={item.id} style={styles.mediaCard}>
                    <video src={item.video_url} style={styles.mediaImg} />
                    <button onClick={() => handleDeleteMedia(item.id, 'work_videos')} style={styles.deleteBtn}>❌ Delete</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: '480px', margin: '0 auto', padding: '16px', fontFamily: 'system-ui, sans-serif', backgroundColor: '#f8f9fa', minHeight: '100vh' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  logoutBtn: { padding: '6px 12px', background: '#ffebee', color: '#c62828', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
  authContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f0f2f5' },
  authCard: { background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', width: '320px', textAlign: 'center' },
  pinInput: { width: '100%', padding: '12px', fontSize: '20px', textAlign: 'center', letterSpacing: '6px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '12px', boxSizing: 'border-box' },
  primaryBtn: { width: '100%', padding: '12px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer' },
  tabs: { display: 'flex', gap: '8px', marginBottom: '16px', background: '#e5e7eb', padding: '4px', borderRadius: '10px' },
  tabBtn: { flex: 1, padding: '10px 0', border: 'none', background: 'transparent', borderRadius: '8px', fontSize: '13px', color: '#4b5563', cursor: 'pointer' },
  activeTabBtn: { flex: 1, padding: '10px 0', border: 'none', background: 'white', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', color: '#111827', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  card: { background: 'white', padding: '16px', borderRadius: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' },
  sectionHeader: { fontSize: '12px', fontWeight: 'bold', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '12px', marginBottom: '12px' },
  inputGroup: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f3f4f6' },
  label: { fontSize: '14px', color: '#374151', fontWeight: '500', width: '35%' },
  fieldInput: { width: '60%', padding: '8px 10px', fontSize: '14px', border: '1px solid #e5e7eb', borderRadius: '6px', outline: 'none', textAlign: 'right', color: '#111827' },
  saveBtn: { width: '100%', padding: '14px', marginTop: '20px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' },
  uploadBox: { display: 'flex', flexDirection: 'column', gap: '10px', padding: '16px', background: '#f9fafb', borderRadius: '12px', border: '1px dashed #d1d5db', marginBottom: '16px' },
  uploadBtn: { padding: '10px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  mediaCard: { position: 'relative', borderRadius: '10px', overflow: 'hidden', background: '#000' },
  mediaImg: { width: '100%', height: '140px', objectFit: 'cover' },
  deleteBtn: { position: 'absolute', bottom: '6px', left: '50%', transform: 'translateX(-50%)', padding: '4px 8px', background: 'rgba(239, 68, 68, 0.9)', color: 'white', border: 'none', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', whiteSpace: 'nowrap' }
};
