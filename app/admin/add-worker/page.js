'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function AddWorkerAdminPage() {
  // 1. Identity State
  const [identity, setIdentity] = useState({
    name: '',
    profession: '',
    experience: '',
    serviceArea: '',
    isVerified: false,
  });
  const [heroImages, setHeroImages] = useState([]);

  // 2. Work Details State
  const [workDetails, setWorkDetails] = useState({
    primarySkill: '',
    workExperience: '',
    workingHours: '',
    workServiceArea: '',
  });
  const [services, setServices] = useState([]);
  const [serviceInput, setServiceInput] = useState('');
  const [workingShift, setWorkingShift] = useState({ day: true, night: true });
  const [whyChooseMe, setWhyChooseMe] = useState([]);
  const [whyChooseInput, setWhyChooseInput] = useState('');

  // 3. Worker Details State
  const [workerDetails, setWorkerDetails] = useState({
    fullName: '',
    gender: 'Male',
    age: '',
    address: '',
    languages: 'Hindi, English',
  });
  const [aboutMeBullets, setAboutMeBullets] = useState(['']);
  const [verifications, setVerifications] = useState({
    workerVerified: true,
    workVerified: true,
    addressVerified: true,
  });

  // 4. Photos & Videos State
  const [workPhotos, setWorkPhotos] = useState([]);
  const [workVideos, setWorkVideos] = useState([]);
  const [videoInput, setVideoInput] = useState({ url: '', duration: '00:10' });
  const [loading, setLoading] = useState(false);

  // --- Chips Handlers ---
  const addService = () => {
    if (serviceInput.trim()) {
      setServices([...services, serviceInput.trim()]);
      setServiceInput('');
    }
  };

  const removeService = (index) => setServices(services.filter((_, i) => i !== index));

  const addWhyChoose = () => {
    if (whyChooseInput.trim()) {
      setWhyChooseMe([...whyChooseMe, whyChooseInput.trim()]);
      setWhyChooseInput('');
    }
  };

  const removeWhyChoose = (index) => setWhyChooseMe(whyChooseMe.filter((_, i) => i !== index));

  // --- Hero Images Upload ---
  const handleHeroImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    for (let file of files) {
      const fileName = `hero-${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
      const { data, error } = await supabase.storage.from('worker-photos').upload(fileName, file);
      if (!error) {
        const { data: publicUrlData } = supabase.storage.from('worker-photos').getPublicUrl(fileName);
        setHeroImages((prev) => [...prev, { image: publicUrlData.publicUrl }]);
      }
    }
  };

  const removeHeroImage = (index) => setHeroImages(heroImages.filter((_, i) => i !== index));

  // --- Work Photos Upload ---
  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    for (let file of files) {
      const fileName = `work-${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
      const { data, error } = await supabase.storage.from('worker-photos').upload(fileName, file);
      if (!error) {
        const { data: publicUrlData } = supabase.storage.from('worker-photos').getPublicUrl(fileName);
        setWorkPhotos((prev) => [...prev, publicUrlData.publicUrl]);
      }
    }
  };

  const removePhoto = (index) => setWorkPhotos(workPhotos.filter((_, i) => i !== index));

  // --- Work Videos Handling ---
  const addVideoItem = () => {
    if (videoInput.url.trim()) {
      setWorkVideos([...workVideos, { ...videoInput, id: Date.now().toString() }]);
      setVideoInput({ url: '', duration: '00:10' });
    }
  };

  const removeVideo = (index) => setWorkVideos(workVideos.filter((_, i) => i !== index));

  // --- Submit Logic ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const shifts = [];
    if (workingShift.day) shifts.push('Day');
    if (workingShift.night) shifts.push('Night');

    const workerPayload = {
      hero_images: heroImages,
      name: identity.name,
      profession: identity.profession,
      experience: identity.experience,
      service_area: identity.serviceArea,
      is_verified: identity.isVerified,

      primary_skill: workDetails.primarySkill,
      services: services,
      work_experience: workDetails.workExperience,
      working_hours: workDetails.workingHours,
      working_shift: shifts,
      work_service_area: workDetails.workServiceArea,
      why_choose_me: whyChooseMe,

      full_name: workerDetails.fullName,
      gender: workerDetails.gender,
      age: workerDetails.age,
      address: workerDetails.address,
      languages: workerDetails.languages,
      about_me: aboutMeBullets.filter((b) => b.trim() !== ''),
      is_worker_verified: verifications.workerVerified,
      is_work_verified: verifications.workVerified,
      is_address_verified: verifications.addressVerified,

      work_photos: workPhotos,
      work_videos: workVideos,
    };

    const { data, error } = await supabase.from('workers').insert([workerPayload]);

    setLoading(false);

    if (error) {
      alert('Error saving worker: ' + error.message);
    } else {
      alert('Worker Saved Successfully in Supabase!');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '20px auto', padding: '20px', fontFamily: 'sans-serif', background: '#f8f9fa', borderRadius: '12px' }}>
      <h2 style={{ textAlign: 'center', color: '#111' }}>Infixo Admin — Add Worker</h2>

      <form onSubmit={handleSubmit}>
        {/* 1. Worker Identity Card */}
        <fieldset style={cardStyle}>
          <legend><b>1. Worker Identity Card</b></legend>
          <label>Name:</label>
          <input type="text" value={identity.name} onChange={(e) => setIdentity({...identity, name: e.target.value})} style={inputStyle} required />

          <label>Profession:</label>
          <input type="text" value={identity.profession} onChange={(e) => setIdentity({...identity, profession: e.target.value})} style={inputStyle} />

          <label>Experience:</label>
          <input type="text" value={identity.experience} onChange={(e) => setIdentity({...identity, experience: e.target.value})} style={inputStyle} placeholder="8+ Years" />

          <label>Service Area:</label>
          <input type="text" value={identity.serviceArea} onChange={(e) => setIdentity({...identity, serviceArea: e.target.value})} style={inputStyle} placeholder="Indore, M.P." />

          <label style={{ cursor: 'pointer' }}>
            <input type="checkbox" checked={identity.isVerified} onChange={(e) => setIdentity({...identity, isVerified: e.target.checked})} />
            <b> VERIFIED BY INFIXO</b>
          </label>

          <br /><br />
          <label>Slider Images (Multiple):</label>
          <input type="file" multiple accept="image/*" onChange={handleHeroImageUpload} style={{ display: 'block', margin: '5px 0' }} />
          
          <div style={thumbGridStyle}>
            {heroImages.map((img, idx) => (
              <div key={idx} style={thumbBoxStyle}>
                <img src={img.image} alt="hero" style={imgStyle} />
                <button type="button" onClick={() => removeHeroImage(idx)} style={crossBtnStyle}>❌</button>
              </div>
            ))}
          </div>
        </fieldset>

        {/* 2. Work Details */}
        <fieldset style={cardStyle}>
          <legend><b>2. Work Details</b></legend>
          <label>Primary Skill:</label>
          <input type="text" value={workDetails.primarySkill} onChange={(e) => setWorkDetails({...workDetails, primarySkill: e.target.value})} style={inputStyle} placeholder="Painter" />

          <label>Services Chips:</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input type="text" value={serviceInput} onChange={(e) => setServiceInput(e.target.value)} style={inputStyle} placeholder="Add service chip" />
            <button type="button" onClick={addService} style={addBtnStyle}>+ Add</button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', margin: '8px 0' }}>
            {services.map((s, idx) => (
              <span key={idx} style={chipStyle}>
                {s} <b onClick={() => removeService(idx)} style={{ cursor: 'pointer', marginLeft: '6px' }}>×</b>
              </span>
            ))}
          </div>

          <label>Experience Text:</label>
          <input type="text" value={workDetails.workExperience} onChange={(e) => setWorkDetails({...workDetails, workExperience: e.target.value})} style={inputStyle} placeholder="8+ Years of experience in painting work" />

          <label>Working Hours:</label>
          <input type="text" value={workDetails.workingHours} onChange={(e) => setWorkDetails({...workDetails, workingHours: e.target.value})} style={inputStyle} placeholder="9:00 AM – 7:00 PM" />

          <label>Working Shift:</label>
          <div style={{ margin: '5px 0 12px 0' }}>
            <label><input type="checkbox" checked={workingShift.day} onChange={(e) => setWorkingShift({...workingShift, day: e.target.checked})} /> Day</label>
            <label style={{ marginLeft: '15px' }}><input type="checkbox" checked={workingShift.night} onChange={(e) => setWorkingShift({...workingShift, night: e.target.checked})} /> Night</label>
          </div>

          <label>Why Choose Me (Dynamic List):</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input type="text" value={whyChooseInput} onChange={(e) => setWhyChooseInput(e.target.value)} style={inputStyle} placeholder="Add reason" />
            <button type="button" onClick={addWhyChoose} style={addBtnStyle}>+ Add</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', margin: '8px 0' }}>
            {whyChooseMe.map((r, idx) => (
              <div key={idx} style={chipStyle}>
                {r} <b onClick={() => removeWhyChoose(idx)} style={{ cursor: 'pointer', float: 'right' }}>×</b>
              </div>
            ))}
          </div>
        </fieldset>

        {/* 3. Worker Details */}
        <fieldset style={cardStyle}>
          <legend><b>3. Worker Details</b></legend>
          <label>Full Name:</label>
          <input type="text" value={workerDetails.fullName} onChange={(e) => setWorkerDetails({...workerDetails, fullName: e.target.value})} style={inputStyle} />

          <label>Gender:</label>
          <select value={workerDetails.gender} onChange={(e) => setWorkerDetails({...workerDetails, gender: e.target.value})} style={inputStyle}>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>

          <label>Age:</label>
          <input type="text" value={workerDetails.age} onChange={(e) => setWorkerDetails({...workerDetails, age: e.target.value})} style={inputStyle} placeholder="28 Years" />

          <label>Address:</label>
          <input type="text" value={workerDetails.address} onChange={(e) => setWorkerDetails({...workerDetails, address: e.target.value})} style={inputStyle} />

          <label>Languages:</label>
          <input type="text" value={workerDetails.languages} onChange={(e) => setWorkerDetails({...workerDetails, languages: e.target.value})} style={inputStyle} />

          <br /><br />
          <b>Infixo Verification Badges:</b>
          <div style={{ margin: '8px 0' }}>
            <label><input type="checkbox" checked={verifications.workerVerified} onChange={(e) => setVerifications({...verifications, workerVerified: e.target.checked})} /> Worker Verified [ ]</label><br />
            <label><input type="checkbox" checked={verifications.workVerified} onChange={(e) => setVerifications({...verifications, workVerified: e.target.checked})} /> Work Verified [ ]</label><br />
            <label><input type="checkbox" checked={verifications.addressVerified} onChange={(e) => setVerifications({...verifications, addressVerified: e.target.checked})} /> Address Verified [ ]</label>
          </div>
        </fieldset>

        {/* 4. Work Photos Gallery */}
        <fieldset style={cardStyle}>
          <legend><b>4. Work Photos Gallery</b></legend>
          <input type="file" multiple accept="image/*" onChange={handlePhotoUpload} />

          <div style={thumbGridStyle}>
            {workPhotos.map((url, idx) => (
              <div key={idx} style={thumbBoxStyle}>
                <img src={url} alt="work" style={imgStyle} />
                <button type="button" onClick={() => removePhoto(idx)} style={crossBtnStyle}>❌</button>
              </div>
            ))}
          </div>
        </fieldset>

        {/* 5. Work Videos */}
        <fieldset style={cardStyle}>
          <legend><b>5. Work Videos</b></legend>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input type="text" placeholder="Video / Thumbnail URL" value={videoInput.url} onChange={(e) => setVideoInput({...videoInput, url: e.target.value})} style={inputStyle} />
            <input type="text" placeholder="00:10" value={videoInput.duration} onChange={(e) => setVideoInput({...videoInput, duration: e.target.value})} style={{ width: '80px', padding: '8px' }} />
            <button type="button" onClick={addVideoItem} style={addBtnStyle}>+ Add</button>
          </div>

          <div style={thumbGridStyle}>
            {workVideos.map((v, idx) => (
              <div key={idx} style={{ ...thumbBoxStyle, width: '120px', padding: '5px', background: '#fff', textAlign: 'center' }}>
                <small>Duration: {v.duration}</small>
                <button type="button" onClick={() => removeVideo(idx)} style={crossBtnStyle}>❌</button>
              </div>
            ))}
          </div>
        </fieldset>

        <button type="submit" disabled={loading} style={{ width: '100%', padding: '16px', background: loading ? '#888' : '#0070f3', color: '#fff', fontSize: '18px', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer', marginTop: '15px' }}>
          {loading ? 'SAVING DATA...' : 'SAVE WORKER PROFILE'}
        </button>
      </form>
    </div>
  );
}

const cardStyle = { marginBottom: '20px', padding: '15px', borderRadius: '10px', border: '1px solid #ddd', background: '#fff' };
const inputStyle = { width: '100%', padding: '10px', margin: '4px 0 12px 0', boxSizing: 'border-box', borderRadius: '6px', border: '1px solid #ccc' };
const addBtnStyle = { padding: '10px 15px', height: '40px', background: '#111', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' };
const chipStyle = { background: '#e2e8f0', padding: '6px 12px', borderRadius: '20px', fontSize: '14px', display: 'inline-block' };
const thumbGridStyle = { display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' };
const thumbBoxStyle = { position: 'relative', width: '85px', height: '85px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #ddd' };
const imgStyle = { width: '100%', height: '100%', objectFit: 'cover' };
const crossBtnStyle = { position: 'absolute', top: '2px', right: '2px', background: 'rgba(0,0,0,0.7)', border: 'none', color: '#fff', cursor: 'pointer', borderRadius: '50%', padding: '2px 6px', fontSize: '10px' };
