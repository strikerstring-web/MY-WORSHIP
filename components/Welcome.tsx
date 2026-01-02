
import React from 'react';
import { Language } from '../types';
import Logo from './Logo';

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
    <div className="flex flex-col items-center justify-between h-full w-full p-6 text-center relative overflow-hidden bg-[#000d1a]">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-emerald-600/5 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-sky-600/5 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center space-y-8 z-10 w-full animate-fade-up">
        <div className="relative group">
          <div className="absolute -inset-6 bg-[#e9c46a]/10 rounded-full blur-3xl group-hover:bg-[#e9c46a]/20 transition-all opacity-0 group-hover:opacity-100"></div>
          <Logo size="xl" withText className="transition-transform group-hover:scale-105 duration-500" />
        </div>

        <div className="space-y-1 w-full max-w-xs">
          <h1 className="text-4xl font-black text-white tracking-tighter">Ibadathi</h1>
          <p className="text-slate-400 text-[10px] font-black leading-tight px-6 opacity-60 uppercase tracking-widest">
            {t('welcomeSub')}
          </p>
        </div>

        <div className="w-full max-w-[280px] space-y-4">
          <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.3em]">{t('selectLanguage')}</p>
          <div className="grid grid-cols-2 gap-3">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-300 active:scale-95 ${
                  language === lang.code ? 'bg-white border-white shadow-xl' : 'bg-white/5 border-white/5 hover:border-white/10'
                }`}
              >
                <span className={`text-[7px] uppercase font-black tracking-widest mb-1 ${language === lang.code ? 'text-emerald-900' : 'text-slate-500'}`}>{lang.label}</span>
                <span className={`text-xs font-black ${language === lang.code ? 'text-emerald-900' : 'text-slate-200'} ${lang.code === 'ar' ? 'arabic-font text-lg' : ''}`}>
                  {lang.native}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full max-w-[280px] pb-10 z-10 space-y-4 animate-fade-up">
        <button onClick={onEnter} className="w-full bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-black py-4 rounded-2xl shadow-2xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all border border-white/10">
          <span className="tracking-widest uppercase text-[11px] font-black">{t('getStarted')}</span>
          <i className="fas fa-arrow-right text-[8px] opacity-40"></i>
        </button>
        <p className="text-slate-600 text-[7px] font-black uppercase tracking-[0.4em] opacity-40">DIGITAL WORSHIP • 1446 AH</p>
      </div>
    </div>
  );
};

export default Welcome;
