import React from 'react';

export default function CowDetail({ cow, onBack, onBook, language, t }) {
  return (
    <section className="mt-6">
      <button onClick={onBack} className="mb-3 inline-flex items-center gap-2 text-emerald-700 hover:underline">
        ← {language==='ta'?'மீண்டும்':'Back'}
      </button>
      <div className="bg-white/80 backdrop-blur rounded-2xl shadow overflow-hidden">
        <div className="grid md:grid-cols-2">
          <div className="bg-black/5">
            {cow.video ? (
              <video controls className="w-full h-full max-h-[70vh] object-contain bg-black">
                <source src={cow.video} />
              </video>
            ) : cow.videoDriveLink ? (
              <a href={cow.videoDriveLink} target="_blank" rel="noreferrer" className="flex items-center justify-center h-full p-8 text-emerald-700 underline">
                {language==='ta'?'வீடியோவை பார்க்க (டிரைவ்)':'View Video (Drive)'}
              </a>
            ) : (
              <div className="h-full min-h-[320px] flex items-center justify-center text-gray-500">{language==='ta'?'வீடியோ இல்லை':'No video'}</div>
            )}
          </div>
          <div className="p-6">
            <h2 className="text-2xl font-semibold text-emerald-800">{cow.breed} • ₹{cow.price}</h2>
            <div className="text-sm text-gray-700 mt-2">
              <div>{language==='ta'?'மாவட்டம்':'District'}: {cow.district}</div>
              <div>{language==='ta'?'வயது':'Age'}: {cow.age}</div>
              <div>{language==='ta'?'பால் அளவு':'Milk Yield'}: {cow.milkYield} L/day</div>
              <div className="mt-2 whitespace-pre-wrap">{cow.features}</div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button onClick={onBook} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg">
                {t.bookThisCow}
              </button>
              <button onClick={onBack} className="w-full bg-white border border-emerald-300 text-emerald-700 hover:bg-emerald-50 px-4 py-2 rounded-lg">
                {language==='ta'?'பட்டியலுக்கு திரும்ப':'Back to list'}
              </button>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-2">
              {(cow.images && cow.images.length>0 ? cow.images : []).map((src, i) => (
                <img key={i} src={src} alt={`cow-${i}`} className="w-full h-28 object-cover rounded-lg border border-emerald-100" />
              ))}
            </div>

            {cow.imageDriveLinks && cow.imageDriveLinks.length>0 && (
              <div className="mt-4">
                <div className="text-sm font-medium mb-1">Drive Images</div>
                <div className="flex flex-wrap gap-2">
                  {cow.imageDriveLinks.map((link, idx) => (
                    <a key={idx} className="text-emerald-700 underline text-sm" href={link} target="_blank" rel="noreferrer">Image {idx+1}</a>
                  ))}
                </div>
              </div>
            )}

            <div className="text-[11px] text-gray-500 mt-4">Listing ID: {cow.id} • Expires: {new Date(cow.expiresAt).toLocaleDateString()}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
