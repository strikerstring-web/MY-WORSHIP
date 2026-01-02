
import React from 'react';
import { Language } from '../types';

interface WelcomeProps {
  onEnter: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const Welcome: React.FC<WelcomeProps> = ({ onEnter, language, setLanguage, t }) => {
  const languages: { code: Language; label: string; native: string }[] = [
    { code: 'ar', label: 'Arabic', native: 'العربية' },
    { code: 'en', label: 'English', native: 'English' },
    { code: 'ml', label: 'Malayalam', native: 'മലയാളം' },
    { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  ];

  return (
    <div className="flex flex-col items-center justify-between h-full w-full p-4 text-center bg-[#fdfbf7] relative overflow-hidden">
      {/* Aesthetic Accents */}
      <div className="absolute top-0 left-0 w-full h-[40vh] bg-gradient-to-b from-emerald-50 to-transparent pointer-events-none opacity-40"></div>
      <div className="absolute bottom-[-15%] left-[-15%] w-[40vw] h-[40vw] max-w-[200px] bg-emerald-600/5 rounded-full blur-[80px]"></div>
      <div className="absolute top-[5%] right-[-15%] w-[30vw] h-[30vw] max-w-[150px] bg-[#d4af37]/10 rounded-full blur-[70px]"></div>

      <div className="flex-1 flex flex-col items-center justify-center space-y-6 z-10 w-full">
        {/* Logo Section */}
        <div className="relative group animate-fade-up">
          <div className="w-32 h-32 bg-[#064e3b] rounded-[48px] flex items-center justify-center shadow-[0_20px_40px_-10px_rgba(6,78,59,0.4)] border-4 border-white transform transition-all duration-700 hover:rotate-3">
            <i className="fas fa-kaaba text-5xl text-emerald-100/90 drop-shadow-lg"></i>
          </div>
          <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-white rounded-xl shadow-md flex items-center justify-center border border-emerald-50">
             <i className="fas fa-star-and-crescent text-xl text-emerald-600"></i>
          </div>
        </div>

        <div className="space-y-3 animate-fade-up w-full max-w-xs" style={{ animationDelay: '100ms' }}>
          <h1 className="text-5xl font-black text-[#064e3b] tracking-tighter">Ibadathi</h1>
          <div className="flex items-center justify-center gap-3">
            <div className="h-0.5 w-8 bg-gradient-to-r from-transparent to-emerald-200"></div>
            <span className="text-3xl arabic-font text-[#d4af37] font-bold" dir="rtl" style={{ lineHeight: '1' }}>
              عبادتي
            </span>
            <div className="h-0.5 w-8 bg-gradient-to-l from-transparent to-emerald-200"></div>
          </div>
          <p className="text-slate-500 text-xs font-semibold leading-relaxed px-4 transition-all duration-300">
            {t('welcomeSub')}
          </p>
        </div>

        {/* Language Selection Grid */}
        <div className="w-full max-w-sm space-y-4 animate-fade-up" style={{ animationDelay: '200ms' }}>
          <p className="text-[9px] font-black text-emerald-800/40 uppercase tracking-[0.3em]">
            {t('selectLanguage')}
          </p>
          
          <div className="grid grid-cols-2 gap-2 w-full">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`flex items-center justify-between px-4 py-3 rounded-[24px] border transition-all duration-500 group relative overflow-hidden ${
                  language === lang.code
                    ? 'bg-white border-[#064e3b] shadow-lg shadow-emerald-900/5'
                    : 'bg-white/50 border-slate-100 hover:border-emerald-200 shadow-sm'
                }`}
              >
                <div className="flex flex-col items-start rtl:items-end relative z-10">
                  <span className={`text-[9px] uppercase font-black tracking-widest mb-0.5 ${
                    language === lang.code ? 'text-[#064e3b]' : 'text-slate-400'
                  }`}>
                    {lang.label}
                  </span>
                  <span className={`text-sm font-bold ${
                    language === lang.code ? 'text-[#064e3b]' : 'text-slate-800'
                  }`}>
                    {lang.native}
                  </span>
                </div>
                <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all relative z-10 ${
                  language === lang.code 
                    ? 'bg-[#064e3b] border-[#064e3b] shadow-md shadow-emerald-900/20' 
                    : 'border-slate-200'
                }`}>
                  {language === lang.code && <i className="fas fa-check text-white text-xs"></i>}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Primary Action Button Area */}
      <div className="w-full max-w-xs pb-4 z-10 animate-fade-up" style={{ animationDelay: '300ms' }}>
        <button 
          onClick={onEnter}
          className="w-full bg-[#064e3b] hover:bg-[#053d2e] text-white font-black py-4 rounded-[28px] shadow-xl shadow-emerald-900/30 transform active:scale-95 transition-all flex items-center justify-center gap-4 group"
        >
          <span className="tracking-widest uppercase text-sm">{t('getStarted')}</span>
          <i className="fas fa-arrow-right text-sm opacity-60 group-hover:translate-x-2 transition-transform rtl:rotate-180"></i>
        </button>
      </div>
    </div>
  );
};

export default Welcome;
