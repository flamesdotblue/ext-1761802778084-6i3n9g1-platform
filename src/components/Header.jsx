import React from 'react';
import { Shield, Video, PlusCircle, Eye, CheckCircle2, MessageCircle } from 'lucide-react';

export default function Header({ language, setLanguage, currentRoute, onNavigate, t }) {
  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-[#f8f4ec]/70 border-b border-emerald-100/40">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full overflow-hidden ring-2 ring-emerald-500 shadow">
            <img
              alt="cow logo"
              className="h-full w-full object-cover"
              src="https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?q=80&w=200&auto=format&fit=crop"
            />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-emerald-700">{t.appName}</div>
            <div className="text-xs text-gray-600 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              Secure, modern green UI
            </div>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-2">
          <NavBtn active={currentRoute==='view'} onClick={() => onNavigate('view')} icon={<Eye className="w-4 h-4" />}>{t.viewCows}</NavBtn>
          <NavBtn active={currentRoute==='create'} onClick={() => onNavigate('create')} icon={<PlusCircle className="w-4 h-4" />}>{t.createListing}</NavBtn>
          <NavBtn active={currentRoute==='booked'} onClick={() => onNavigate('booked')} icon={<CheckCircle2 className="w-4 h-4" />}>{t.bookedCows}</NavBtn>
          <NavBtn active={currentRoute==='support'} onClick={() => onNavigate('support')} icon={<MessageCircle className="w-4 h-4" />}>{t.contactSupport}</NavBtn>
          <NavBtn active={currentRoute==='tutorial'} onClick={() => onNavigate('tutorial')} icon={<Video className="w-4 h-4" />}>{t.tutorial}</NavBtn>
        </nav>

        <div className="flex items-center gap-2">
          <LangToggle language={language} setLanguage={setLanguage} />
          <button className="md:hidden inline-flex items-center gap-2 bg-emerald-600 text-white px-3 py-2 rounded-lg" onClick={() => onNavigate(currentRoute==='create'?'view':'create')}>
            {currentRoute==='create'? t.viewCows : t.createListing}
          </button>
        </div>
      </div>
    </header>
  );
}

function NavBtn({ active, onClick, children, icon }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-emerald-600 text-white' : 'text-gray-800 hover:bg-emerald-100'}`}
    >
      {icon}{children}
    </button>
  );
}

function LangToggle({ language, setLanguage }) {
  return (
    <div className="inline-flex rounded-lg overflow-hidden border border-emerald-300">
      <button onClick={() => setLanguage('en')} className={`px-3 py-1.5 text-sm ${language==='en'?'bg-emerald-600 text-white':'bg-white text-gray-800'}`}>EN</button>
      <button onClick={() => setLanguage('ta')} className={`px-3 py-1.5 text-sm ${language==='ta'?'bg-emerald-600 text-white':'bg-white text-gray-800'}`}>TA</button>
    </div>
  );
}
