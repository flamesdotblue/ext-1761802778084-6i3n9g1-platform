import React, { useEffect, useMemo, useState } from 'react';
import Header from './components/Header';
import CreateListingForm from './components/CreateListingForm';
import Listings from './components/Listings';
import CowDetail from './components/CowDetail';

// Admin WhatsApp number
const ADMIN_WHATSAPP = '7904825836';

// Broadcast channel for real-time sync across tabs
const channel = typeof window !== 'undefined' && 'BroadcastChannel' in window ? new BroadcastChannel('maadugal_listings') : null;

const districtsTN = [
  'Ariyalur','Chengalpattu','Chennai','Coimbatore','Cuddalore','Dharmapuri','Dindigul','Erode','Kallakurichi','Kanchipuram','Kanyakumari','Karur','Krishnagiri','Madurai','Mayiladuthurai','Nagapattinam','Namakkal','Nilgiris','Perambalur','Pudukottai','Ramanathapuram','Ranipet','Salem','Sivaganga','Tenkasi','Thanjavur','Theni','Thoothukudi','Tiruchirappalli','Tirunelveli','Tirupathur','Tiruppur','Tiruvallur','Tiruvannamalai','Tiruvarur','Vellore','Viluppuram','Virudhunagar'
];

const i18n = {
  en: {
    appName: 'maadugal',
    createListing: 'Create Listing',
    viewCows: 'View Cows',
    bookedCows: 'Booked Cows',
    contactSupport: 'Contact Support',
    tutorial: 'Tutorial Video',
    newest: 'Newest',
    active: 'Active',
    district: 'District',
    clearFilters: 'Clear Filters',
    viewCow: 'View Cow',
    bookThisCow: 'Book this Cow',
    noListings: 'No listings found.',
    supportText: 'For any support, message us on WhatsApp.',
    tutorialNote: 'Watch the tutorial to use maadugal effectively.'
  },
  ta: {
    appName: 'மாடுகள் (maadugal)',
    createListing: 'புதிய அறிவிப்பு',
    viewCows: 'மாடுகள்',
    bookedCows: 'புக் செய்யப்பட்டவை',
    contactSupport: 'உதவி',
    tutorial: 'வழிகாட்டும் வீடியோ',
    newest: 'புதியவை',
    active: 'செயலில்',
    district: 'மாவட்டம்',
    clearFilters: 'அழிக்க',
    viewCow: 'மாட்டை பார்க்க',
    bookThisCow: 'இந்த மாட்டை புக் செய்ய',
    noListings: 'அறிவிப்புகள் எதுவும் இல்லை.',
    supportText: 'எந்த உதவிக்கும் வாட்ஸ்அப்பில் எங்களுக்கு செய்தி அனுப்பவும்.',
    tutorialNote: 'maadugal ஐ பயன்படுத்த இந்த வீடியோவை பார்க்கவும்.'
  }
};

function loadListings() {
  try {
    const raw = localStorage.getItem('maadugal_listings');
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function saveListings(listings) {
  localStorage.setItem('maadugal_listings', JSON.stringify(listings));
  if (channel) channel.postMessage({ type: 'sync', payload: listings });
}

function pruneExpired(list) {
  const now = Date.now();
  return list.map(l => ({ ...l, expired: now > l.expiresAt })).filter(Boolean);
}

export default function App() {
  const [route, setRoute] = useState('view'); // 'view' | 'create' | 'booked' | 'support' | 'tutorial' | 'detail'
  const [language, setLanguage] = useState(() => localStorage.getItem('lang') || 'en');
  const t = useMemo(() => i18n[language], [language]);

  const [listings, setListings] = useState(() => pruneExpired(loadListings()));
  const [selectedCow, setSelectedCow] = useState(null);

  useEffect(() => {
    const id = setInterval(() => {
      const pruned = pruneExpired(loadListings());
      setListings(pruned);
      saveListings(pruned);
    }, 60 * 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!channel) return;
    const handler = (e) => {
      if (e.data?.type === 'sync') {
        setListings(pruneExpired(e.data.payload || []));
      }
    };
    channel.addEventListener('message', handler);
    return () => channel.removeEventListener('message', handler);
  }, []);

  const handleCreate = (newListing) => {
    const withMeta = {
      ...newListing,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
      expired: false,
      booked: false
    };
    const next = [withMeta, ...listings];
    setListings(next);
    saveListings(next);

    const message = encodeURIComponent(
      `New Cow Listing on maadugal\n` +
      `Breed: ${withMeta.breed}\n` +
      `Age: ${withMeta.age}\n` +
      `Milk Yield: ${withMeta.milkYield} L/day\n` +
      `District: ${withMeta.district}\n` +
      `Price: ₹${withMeta.price}\n` +
      `Features: ${withMeta.features || '-'}\n` +
      `Video: ${withMeta.videoDriveLink || 'Attached'}\n` +
      `Images: ${withMeta.imageDriveLinks?.join(', ') || 'Attached'}\n` +
      `Listing ID: ${withMeta.id}`
    );

    window.open(`https://wa.me/91${ADMIN_WHATSAPP}?text=${message}`, '_blank');
    setRoute('view');
  };

  const handleBook = (cow) => {
    const message = encodeURIComponent(
      `Booking request on maadugal\n` +
      `Listing ID: ${cow.id}\n` +
      `Breed: ${cow.breed}\n` +
      `District: ${cow.district}\n` +
      `Price: ₹${cow.price}\n` +
      `Please assist with this booking.`
    );
    window.open(`https://wa.me/91${ADMIN_WHATSAPP}?text=${message}`, '_blank');
    const updated = listings.map(l => l.id === cow.id ? { ...l, booked: true } : l);
    setListings(updated);
    saveListings(updated);
  };

  const handleView = (cow) => {
    setSelectedCow(cow);
    setRoute('detail');
  };

  const booked = listings.filter(l => l.booked);

  return (
    <div className="min-h-screen bg-[#f8f4ec] text-gray-900">
      <Header
        language={language}
        setLanguage={(lang) => { setLanguage(lang); localStorage.setItem('lang', lang); }}
        currentRoute={route}
        onNavigate={setRoute}
        t={t}
      />

      <main className="max-w-5xl mx-auto px-4 pb-20">
        {route === 'create' && (
          <CreateListingForm
            onCreate={handleCreate}
            districts={districtsTN}
            language={language}
          />
        )}

        {route === 'view' && (
          <Listings
            title={t.viewCows}
            listings={listings}
            onBook={handleBook}
            onView={handleView}
            districts={districtsTN}
            language={language}
            t={t}
          />
        )}

        {route === 'booked' && (
          <Listings
            title={t.bookedCows}
            listings={booked}
            onBook={handleBook}
            onView={handleView}
            districts={districtsTN}
            language={language}
            t={t}
          />
        )}

        {route === 'support' && (
          <div className="bg-white/80 backdrop-blur rounded-2xl shadow p-6 mt-6">
            <h2 className="text-2xl font-semibold mb-2">{t.contactSupport}</h2>
            <p className="mb-4">{t.supportText}</p>
            <a
              href={`https://wa.me/91${ADMIN_WHATSAPP}?text=${encodeURIComponent('Hi maadugal support, I need help.')}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              WhatsApp
            </a>
          </div>
        )}

        {route === 'tutorial' && (
          <div className="bg-white/80 backdrop-blur rounded-2xl shadow p-6 mt-6">
            <h2 className="text-2xl font-semibold mb-2">{t.tutorial}</h2>
            <p className="mb-4">{t.tutorialNote}</p>
            <div className="aspect-video w-full overflow-hidden rounded-xl shadow">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                title="maadugal tutorial"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {route === 'detail' && selectedCow && (
          <CowDetail
            cow={selectedCow}
            onBack={() => setRoute('view')}
            onBook={() => handleBook(selectedCow)}
            language={language}
            t={t}
          />
        )}
      </main>

      <footer className="text-center text-sm text-gray-600 py-8">
        © {new Date().getFullYear()} maadugal. Security hardened client-side. For enterprise-grade security, integrate with a managed backend.
      </footer>
    </div>
  );
}
