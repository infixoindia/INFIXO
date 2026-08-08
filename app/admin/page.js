'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = (url && key) ? createClient(url, key) : null;

export default function AdminPanel() {
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

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // 1. Existing Profile Fetch Karo
  useEffect(() => {
    async function loadProfile() {
      if (!supabase) return;
      const { data } = await supabase.from('worker_profile').select('*').limit(1);
      if (data && data.length > 0) {
        setProfile(data[0]);
      }
    }
    loadProfile();
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  // 2. Admin se Save Button Dabane par Update Hoga
  const handleSave = async (e) => {
    e.preventDefault();
    if (!supabase) {
      alert("Supabase keys missing!");
      return;
    }

    setSaving(true);
    setMessage('');

    const { error } = await supabase
      .from('worker_profile')
      .update(profile)
      .eq('id', profile.id || 1);

    setSaving(false);

    if (error) {
      setMessage('❌ Failed to save changes: ' + error.message);
    } else {
      setMessage('✅ Profile Updated Successfully! Live website instantly check karo.');
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '30px auto', padding: '20px', fontFamily: 'sans-serif', background: '#f9fafb', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
      <h1 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center' }}>⚙️ Admin Panel - Edit Profile</h1>

      {message && <div style={{ padding: '12px', marginBottom: '16px', borderRadius: '8px', background: message.includes('✅') ? '#dcfce7' : '#fee2e2', color: message.includes('✅') ? '#166534' : '#991b1b', fontSize: '14px' }}>{message}</div>}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151' }}>Worker Name</label>
          <input type="text" name="name" value={profile.name || ''} onChange={handleChange} style={inputStyle} required />
        </div>

        <div>
          <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151' }}>Profession</label>
          <input type="text" name="profession" value={profile.profession || ''} onChange={handleChange} style={inputStyle} />
        </div>

        <div>
          <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151' }}>Experience</label>
          <input type="text" name="experience" value={profile.experience || ''} onChange={handleChange} style={inputStyle} />
        </div>

        <div>
          <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151' }}>Service Area / Location</label>
          <input type="text" name="service_area" value={profile.service_area || ''} onChange={handleChange} style={inputStyle} />
        </div>

        <div>
          <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151' }}>Primary Skill</label>
          <input type="text" name="primary_skill" value={profile.primary_skill || ''} onChange={handleChange} style={inputStyle} />
        </div>

        <div>
          <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151' }}>Working Hours</label>
          <input type="text" name="working_hours" value={profile.working_hours || ''} onChange={handleChange} style={inputStyle} />
        </div>

        <div>
          <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151' }}>About Me / Description</label>
          <textarea name="about_me" rows="3" value={profile.about_me || ''} onChange={handleChange} style={{ ...inputStyle, resize: 'vertical' }} />
        </div>

        <button type="submit" disabled={saving} style={{ padding: '12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
          {saving ? 'Saving...' : '💾 Save Changes'}
        </button>
      </form>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '10px',
  marginTop: '4px',
  borderRadius: '6px',
  border: '1px solid #d1d5db',
  fontSize: '14px',
  boxSizing: 'border-box'
};
