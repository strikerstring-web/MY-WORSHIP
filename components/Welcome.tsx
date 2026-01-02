
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
    <div className="flex flex-col items-center justify-between h-full w-full p-6 text-center relative overflow-hidden bg-slate-900">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-emerald-600/10 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-sky-600/10 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center space-y-5 z-10 w-full animate-fade-up">
        <div className="relative group">
          <div className="absolute -inset-2 bg-gradient-to-tr from-emerald-500 to-sky-500 rounded-[32px] opacity-20 blur-xl group-hover:opacity-40 transition-opacity"></div>
          <Logo size="lg" className="rotate-3 transition-transform group-hover:rotate-0" />
        </div>

        <div className="space-y-1 w-full max-w-xs">
          <h1 className="text-4xl font-black text-white tracking-tighter">Ibadathi</h1>
          <div className="flex items-center justify-center gap-2">
            <div className="h-px w-6 bg-amber-400/30"></div>
            <span className="text-lg arabic-font text-amber-400 font-black" dir="rtl">عبادتي</span>
            <div className="h-px w-6 bg-amber-400/30"></div>
          </div>
          <p className="text-slate-400 text-[10px] font-black leading-tight px-6 opacity-70">
            {t('welcomeSub')}
          </p>
        </div>

        <div className="w-full max-w-[280px] space-y-3">
          <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">{t('selectLanguage')}</p>
          <div className="grid grid-cols-2 gap-2">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all duration-300 active:scale-95 ${
                  language === lang.code ? 'bg-white border-white' : 'bg-white/5 border-white/5 hover:border-white/10'
                }`}
              >
                <span className={`text-[7px] uppercase font-black tracking-widest mb-0.5 ${language === lang.code ? 'text-emerald-900' : 'text-slate-500'}`}>{lang.label}</span>
                <span className={`text-xs font-black ${language === lang.code ? 'text-emerald-900' : 'text-slate-200'} ${lang.code === 'ar' ? 'arabic-font text-base' : ''}`}>
                  {lang.native}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full max-w-[280px] pb-10 z-10 space-y-2 animate-fade-up">
        <button onClick={onEnter} className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black py-4 rounded-2xl shadow-lg flex items-center justify-center gap-3 active:scale-[0.98] transition-all">
          <span className="tracking-widest uppercase text-[11px] font-black">{t('getStarted')}</span>
          <i className="fas fa-arrow-right text-[8px] opacity-40"></i>
        </button>
        <p className="pt-4 text-slate-600 text-[7px] font-black uppercase tracking-[0.4em] opacity-40">DIGITAL WORSHIP • 1446 AH</p>
      </div>
    </div>
  );
};

export default Welcome;
