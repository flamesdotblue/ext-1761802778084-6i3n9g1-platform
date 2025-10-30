import React, { useMemo, useState } from 'react';
import { Filter, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Listings({ title, listings, onBook, onView, districts, language, t }) {
  const [filter, setFilter] = useState({ district: '', active: true, sort: 'newest' });

  const filtered = useMemo(() => {
    let arr = [...listings];
    if (filter.district) arr = arr.filter(l => l.district === filter.district);
    if (filter.active) arr = arr.filter(l => !l.expired);
    if (filter.sort === 'newest') arr.sort((a,b)=>b.createdAt - a.createdAt);
    return arr;
  }, [listings, filter]);

  return (
    <section className="mt-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl md:text-2xl font-semibold text-emerald-800">{title}</h2>
        <div className="flex items-center gap-2 text-sm">
          <Filter className="w-4 h-4 text-emerald-700" />
          <select value={filter.district} onChange={e=>setFilter(f=>({...f, district:e.target.value}))} className="px-3 py-2 rounded-lg border border-emerald-200 bg-white">
            <option value="">{t.district}</option>
            {districts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <button className={`px-3 py-2 rounded-lg border ${filter.active?'bg-emerald-600 text-white border-emerald-600':'bg-white text-gray-800 border-emerald-200'}`} onClick={()=>setFilter(f=>({...f, active:!f.active}))}>{t.active}</button>
          <button className={`px-3 py-2 rounded-lg border ${filter.sort==='newest'?'bg-emerald-600 text-white border-emerald-600':'bg-white text-gray-800 border-emerald-200'}`} onClick={()=>setFilter(f=>({...f, sort:'newest'}))}>{t.newest}</button>
          <button className="px-3 py-2 rounded-lg border bg-white text-gray-800 border-emerald-200" onClick={()=>setFilter({ district:'', active:true, sort:'newest' })}>{t.clearFilters}</button>
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="bg-white/80 backdrop-blur rounded-2xl shadow p-8 text-center text-gray-700">{t.noListings}</div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map(cow => (
          <Card key={cow.id} cow={cow} onBook={() => onBook(cow)} onView={() => onView(cow)} language={language} />
        ))}
      </div>
    </section>
  );
}

function Card({ cow, onBook, onView, language }) {
  const [idx, setIdx] = useState(0);
  const images = cow.images && cow.images.length > 0 ? cow.images : [
    'https://images.unsplash.com/photo-1526266061230-4dd5d4c3b8c7?q=80&w=800&auto=format&fit=crop'
  ];

  return (
    <div className="bg-white/80 backdrop-blur rounded-2xl shadow overflow-hidden">
      <div className="relative aspect-video bg-black/5">
        <img src={images[idx]} alt={cow.breed} className="w-full h-full object-cover" />
        {images.length > 1 && (
          <div className="absolute inset-0 flex items-center justify-between px-2">
            <button aria-label="Prev" className="p-2 rounded-full bg-white/80 hover:bg-white shadow" onClick={() => setIdx((idx - 1 + images.length) % images.length)}>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button aria-label="Next" className="p-2 rounded-full bg-white/80 hover:bg-white shadow" onClick={() => setIdx((idx + 1) % images.length)}>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
        {cow.expired && (
          <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded">Expired</div>
        )}
        {cow.booked && (
          <div className="absolute top-2 right-2 bg-emerald-600 text-white text-xs px-2 py-1 rounded">Booked</div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{cow.breed} • ₹{cow.price}</h3>
          <span className="text-xs text-gray-600">{cow.district}</span>
        </div>
        <div className="text-sm text-gray-700 mt-1">
          <span>{language==='ta'? 'வயது':'Age'}: {cow.age} • </span>
          <span>{language==='ta'? 'பால்':'Milk'}: {cow.milkYield}L/day</span>
        </div>
        {cow.features && <p className="text-sm text-gray-700 mt-2 line-clamp-2">{cow.features}</p>}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button onClick={onView} className="w-full bg-white border border-emerald-300 text-emerald-700 hover:bg-emerald-50 px-4 py-2 rounded-lg">
            {language==='ta'?'மாட்டை பார்க்க':'View Cow'}
          </button>
          <button onClick={onBook} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg">
            {language==='ta'?'இந்த மாட்டை புக் செய்ய':'Book this Cow'}
          </button>
        </div>
        <div className="text-[11px] text-gray-500 mt-3">Listing expires on {new Date(cow.expiresAt).toLocaleDateString()}</div>
      </div>
    </div>
  );
}
