
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
    <div className="flex flex-col items-center justify-between h-full w-full p-6 text-center bg-[#fdfbf7] relative overflow-hidden">
      {/* Visual Background Elements */}
      <div className="absolute top-0 left-0 w-full h-[60vh] bg-gradient-to-b from-[#ecfdf5] to-transparent pointer-events-none"></div>
      <div className="absolute top-[-10%] right-[-20%] w-[300px] h-[300px] bg-[#c5a059] opacity-[0.05] rounded-full blur-[80px]"></div>
      <div className="absolute bottom-[-10%] left-[-20%] w-[300px] h-[300px] bg-[#064e3b] opacity-[0.05] rounded-full blur-[80px]"></div>

      <div className="flex-1 flex flex-col items-center justify-center space-y-8 z-10 w-full">
        {/* Logo Section */}
        <div className="relative animate-fade-up">
          <div className="w-36 h-36 bg-[#064e3b] rounded-[42px] flex items-center justify-center shadow-[0_25px_50px_-12px_rgba(6,78,59,0.4)] border-[6px] border-white transform transition-transform hover:rotate-2">
            <i className="fas fa-kaaba text-6xl text-[#ecfdf5] drop-shadow-2xl"></i>
          </div>
          <div className="absolute -bottom-3 -right-3 w-14 h-14 bg-white rounded-2xl shadow-xl flex items-center justify-center border border-emerald-50">
             <i className="fas fa-star-and-crescent text-2xl text-[#c5a059]"></i>
          </div>
        </div>

        <div className="space-y-4 w-full max-w-xs animate-fade-up" style={{ animationDelay: '100ms' }}>
          <h1 className="text-5xl font-extrabold text-[#064e3b] tracking-tight">Ibadathi</h1>
          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-8 bg-[#c5a059]/30"></div>
            <span className="text-3xl arabic-font text-[#c5a059] font-bold" dir="rtl">عبادتي</span>
            <div className="h-px w-8 bg-[#c5a059]/30"></div>
          </div>
          <p className="text-slate-500 text-xs font-medium leading-relaxed px-2">
            {t('welcomeSub')}
          </p>
        </div>

        {/* Language Selection Grid */}
        <div className="w-full max-w-[320px] space-y-4 animate-fade-up" style={{ animationDelay: '200ms' }}>
          <p className="text-[10px] font-black text-[#064e3b]/40 uppercase tracking-[0.2em]">{t('selectLanguage')}</p>
          
          <div className="grid grid-cols-2 gap-3">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`flex flex-col items-center justify-center p-4 rounded-[28px] border-2 transition-all duration-300 active:scale-95 ${
                  language === lang.code
                    ? 'bg-white border-[#064e3b] shadow-xl shadow-emerald-900/5'
                    : 'bg-white/40 border-slate-100 hover:border-emerald-100 shadow-sm'
                }`}
              >
                <span className={`text-[8px] uppercase font-black tracking-widest mb-1 ${
                  language === lang.code ? 'text-[#064e3b]' : 'text-slate-400'
                }`}>{lang.label}</span>
                <span className={`text-base font-bold ${
                  language === lang.code ? 'text-[#064e3b]' : 'text-slate-700'
                } ${lang.code === 'ar' ? 'arabic-ui' : ''}`}>
                  {lang.native}
                </span>
                {language === lang.code && (
                  <div className="mt-1.5 w-1 h-1 bg-[#c5a059] rounded-full"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Primary Action */}
      <div className="w-full max-w-xs pb-10 z-10 animate-fade-up" style={{ animationDelay: '300ms' }}>
        <button 
          onClick={onEnter}
          className="w-full bg-[#064e3b] hover:bg-[#053d2e] text-white font-black py-4.5 rounded-[32px] shadow-[0_20px_40px_-10px_rgba(6,78,59,0.3)] flex items-center justify-center gap-4 group transition-all active:scale-[0.98]"
        >
          <span className="tracking-widest uppercase text-sm font-bold">{t('getStarted')}</span>
          <i className="fas fa-arrow-right text-xs opacity-60 group-hover:translate-x-1 transition-transform rtl:rotate-180"></i>
        </button>
      </div>
    </div>
  );
};

export default Welcome;
