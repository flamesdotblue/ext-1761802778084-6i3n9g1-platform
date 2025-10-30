import React, { useMemo, useRef, useState } from 'react';

const MAX_IMG_MB = 5;
const MAX_VIDEO_MB = 100;

export default function CreateListingForm({ onCreate, districts, language }) {
  const [form, setForm] = useState({
    breed: '',
    age: '',
    milkYield: '',
    price: '',
    district: '',
    features: '',
    imageFiles: [],
    videoFile: null,
    imageDriveLinks: [],
    videoDriveLink: ''
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const imgRef = useRef(null);
  const vidRef = useRef(null);

  const labels = useMemo(() => ({
    breed: language==='ta'?'இன வகை':'Breed',
    age: language==='ta'?'வயது (ஆண்டு)':'Age (years)',
    milkYield: language==='ta'?'பால் அளவு (லிட்டர்/நாள்)':'Milk yield (L/day)',
    price: language==='ta'?'விலை (₹)':'Price (₹)',
    district: language==='ta'?'மாவட்டம்':'District',
    features: language==='ta'?'சிறப்பம்சங்கள்':'Features',
    images: language==='ta'?'படங்கள் (அதிகபட்சம் 5MB/படம்)':'Images (max 5MB each)',
    video: language==='ta'?'வீடியோ (அதிகபட்சம் 100MB)':'Video (max 100MB)',
    gdrive: language==='ta'?'கூகுள் டிரைவ் இணைப்புகள் (விருப்பம்)':'Google Drive links (optional)',
    submit: language==='ta'?'அறிவிப்பை உருவாக்கவும்':'Create Listing'
  }), [language]);

  const validate = async () => {
    const e = {};
    if (!form.breed.trim()) e.breed = 'Required';
    if (!form.age || Number(form.age) <= 0) e.age = 'Invalid';
    if (!form.milkYield || Number(form.milkYield) <= 0) e.milkYield = 'Invalid';
    if (!form.price || Number(form.price) <= 0) e.price = 'Invalid';
    if (!form.district) e.district = 'Required';

    // Files validation
    for (const f of form.imageFiles) {
      if (!f.type.startsWith('image/')) e.images = 'Images only';
      if (f.size > MAX_IMG_MB * 1024 * 1024) e.images = `Each image must be <= ${MAX_IMG_MB}MB`;
    }
    if (form.videoFile) {
      if (!form.videoFile.type.startsWith('video/')) e.video = 'Video only';
      if (form.videoFile.size > MAX_VIDEO_MB * 1024 * 1024) e.video = `Video must be <= ${MAX_VIDEO_MB}MB`;
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const toDataURL = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!(await validate())) return;
    setSubmitting(true);
    try {
      const imagesData = await Promise.all((form.imageFiles || []).map(toDataURL));
      const videoData = form.videoFile ? await toDataURL(form.videoFile) : '';
      const payload = {
        breed: form.breed.trim(),
        age: Number(form.age),
        milkYield: Number(form.milkYield),
        price: Number(form.price),
        district: form.district,
        features: form.features.trim(),
        images: imagesData,
        video: videoData,
        imageDriveLinks: form.imageDriveLinks.filter(Boolean),
        videoDriveLink: form.videoDriveLink || ''
      };
      onCreate(payload);
      setForm({ breed:'', age:'', milkYield:'', price:'', district:'', features:'', imageFiles:[], videoFile:null, imageDriveLinks:[], videoDriveLink:'' });
      if (imgRef.current) imgRef.current.value = '';
      if (vidRef.current) vidRef.current.value = '';
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur rounded-2xl shadow p-6 mt-6 space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <Field label={labels.breed} error={errors.breed}>
          <input className="input" value={form.breed} onChange={e=>setForm(f=>({...f, breed:e.target.value}))} required />
        </Field>
        <Field label={labels.age} error={errors.age}>
          <input type="number" min="0" step="0.1" className="input" value={form.age} onChange={e=>setForm(f=>({...f, age:e.target.value}))} required />
        </Field>
        <Field label={labels.milkYield} error={errors.milkYield}>
          <input type="number" min="0" step="0.1" className="input" value={form.milkYield} onChange={e=>setForm(f=>({...f, milkYield:e.target.value}))} required />
        </Field>
        <Field label={labels.price} error={errors.price}>
          <input type="number" min="0" step="0.1" className="input" value={form.price} onChange={e=>setForm(f=>({...f, price:e.target.value}))} required />
        </Field>
        <Field label={labels.district} error={errors.district}>
          <select className="input" value={form.district} onChange={e=>setForm(f=>({...f, district:e.target.value}))} required>
            <option value="">--</option>
            {districts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </Field>
        <Field label={labels.features}>
          <textarea className="input min-h-[90px]" value={form.features} onChange={e=>setForm(f=>({...f, features:e.target.value}))} placeholder={language==='ta'? 'எ.கா., நல்ல உடல் நிலை, அமைதியானது' : 'e.g., healthy, calm temperament'} />
        </Field>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Field label={labels.images} error={errors.images}>
          <input ref={imgRef} type="file" accept="image/*" multiple onChange={(e)=>setForm(f=>({...f, imageFiles:[...e.target.files]}))} className="block text-sm" />
        </Field>
        <Field label={labels.video} error={errors.video}>
          <input ref={vidRef} type="file" accept="video/*" onChange={(e)=>setForm(f=>({...f, videoFile:e.target.files?.[0]||null}))} className="block text-sm" />
        </Field>
      </div>

      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
        <div className="font-medium mb-2">{labels.gdrive}</div>
        <div className="grid md:grid-cols-2 gap-3">
          <input className="input" placeholder={language==='ta'?'வீடியோ டிரைவ் இணைப்பு':'Video Drive link'} value={form.videoDriveLink} onChange={e=>setForm(f=>({...f, videoDriveLink:e.target.value}))} />
          <input className="input" placeholder={language==='ta'?'படம் டிரைவ் இணைப்புகள் (கமா பிரித்து)':'Image Drive links (comma separated)'} value={form.imageDriveLinks.join(', ')} onChange={e=>setForm(f=>({...f, imageDriveLinks:e.target.value.split(',').map(s=>s.trim()).filter(Boolean)}))} />
        </div>
        <p className="text-xs text-gray-600 mt-2">
          Tip: If your video is large, upload to Google Drive and paste the share link above. Files are kept locally on your device for privacy.
        </p>
      </div>

      <div className="pt-2 flex items-center gap-3">
        <button disabled={submitting} className="inline-flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl disabled:opacity-50">
          {submitting ? (language==='ta'?'சமர்ப்பிக்கிறது...':'Submitting...') : labels.submit}
        </button>
        <p className="text-xs text-gray-600">We never ask seller details. Privacy-first.</p>
      </div>
    </form>
  );
}

function Field({ label, error, children }) {
  return (
    <label className="block">
      <div className="mb-1.5 text-sm font-medium text-gray-800">{label}</div>
      {children}
      {error && <div className="text-red-600 text-xs mt-1">{error}</div>}
      <style>{`.input{width:100%;background:white;border:1px solid rgb(209 250 229);outline:none;border-radius:0.75rem;padding:0.6rem 0.8rem;box-shadow:inset 0 0 0 1px rgb(16 185 129 / 0.05);} .input:focus{box-shadow:0 0 0 3px rgba(16,185,129,.25); border-color:rgb(16 185 129)}`}</style>
    </label>
  );
}
