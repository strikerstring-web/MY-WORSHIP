
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { UserData, QuranProgress, PrayerTimings } from '../types';
import { SURAHS } from '../constants';

interface QuranTrackerProps {
  state: UserData & { todayTimings: PrayerTimings | null };
  onUpdate: (progress: QuranProgress) => void;
  setCurrentView: (view: any) => void;
  t: (key: string) => string;
}

const QuranTracker: React.FC<QuranTrackerProps> = ({ state, onUpdate, setCurrentView, t }) => {
  const [surahInput, setSurahInput] = useState(state.quranProgress.surah || '');
  const [ayahInput, setAyahInput] = useState(state.quranProgress.ayah || '');
  const [juzInput, setJuzInput] = useState(state.quranProgress.juz || '');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredSurahs = useMemo(() => {
    if (!surahInput) return SURAHS.slice(0, 5);
    return SURAHS.filter(s => s.toLowerCase().includes(surahInput.toLowerCase())).slice(0, 5);
  }, [surahInput]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSave = () => {
    onUpdate({
      surah: surahInput,
      ayah: ayahInput,
      juz: juzInput,
      lastUpdated: new Date().toISOString()
    });
    if ('vibrate' in navigator) navigator.vibrate(40);
  };

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] animate-fade-up">
      <div className="p-6 pt-12 pb-10 bg-gradient-to-br from-amber-600 to-amber-800 text-white shadow-xl rounded-b-[48px] z-20 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => setCurrentView('dashboard')} className="w-12 h-12 flex items-center justify-center bg-white/10 rounded-2xl border border-white/20 active:scale-90">
            <i className="fas fa-chevron-left"></i>
          </button>
          <div>
            <h1 className="text-2xl font-black tracking-tight">{t('quran')}</h1>
            <p className="text-[10px] text-amber-200 font-black uppercase tracking-[0.2em]">Divine Guidance</p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto">
        <div className="bg-white p-6 rounded-[36px] shadow-premium border border-amber-50 relative overflow-hidden text-center">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full -mr-16 -mt-16 blur-3xl opacity-50"></div>
          <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-amber-200 rounded-3xl flex items-center justify-center mx-auto mb-4 text-amber-600 text-2xl animate-float shadow-lg">
            <i className="fas fa-book-open"></i>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('lastRead')}</p>
          <h2 className="text-xl font-black text-emerald-900 leading-tight">
            {state.quranProgress.surah ? `${state.quranProgress.surah}, ${t('ayah')} ${state.quranProgress.ayah}` : '---'}
          </h2>
          {state.quranProgress.juz && <p className="text-[10px] font-bold text-amber-600 mt-1 uppercase tracking-widest">{t('juz')} {state.quranProgress.juz}</p>}
        </div>

        <div className="space-y-6">
          <div className="space-y-2 relative" ref={dropdownRef}>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{t('surah')}</label>
            <input 
              type="text" 
              placeholder="e.g. Al-Baqarah"
              className="w-full p-4.5 bg-white border border-slate-100 rounded-[24px] focus:ring-4 focus:ring-amber-500/10 outline-none shadow-sm font-bold text-emerald-900"
              value={surahInput}
              onFocus={() => setShowDropdown(true)}
              onChange={(e) => {
                setSurahInput(e.target.value);
                setShowDropdown(true);
              }}
            />
            {showDropdown && filteredSurahs.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-[24px] shadow-2xl border border-slate-50 p-2 z-50 animate-fade-in">
                {filteredSurahs.map(s => (
                  <button 
                    key={s}
                    onClick={() => {
                      setSurahInput(s);
                      setShowDropdown(false);
                    }}
                    className="w-full text-left px-5 py-3 hover:bg-amber-50 rounded-xl text-sm font-bold text-emerald-900 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{t('juz')}</label>
              <input 
                type="number" 
                placeholder="1-30"
                className="w-full p-4.5 bg-white border border-slate-100 rounded-[24px] focus:ring-4 focus:ring-amber-500/10 outline-none shadow-sm font-bold text-emerald-900"
                value={juzInput}
                onChange={(e) => setJuzInput(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{t('ayah')}</label>
              <input 
                type="number" 
                placeholder="Verse #"
                className="w-full p-4.5 bg-white border border-slate-100 rounded-[24px] focus:ring-4 focus:ring-amber-500/10 outline-none shadow-sm font-bold text-emerald-900"
                value={ayahInput}
                onChange={(e) => setAyahInput(e.target.value)}
              />
            </div>
          </div>

          <button 
            onClick={handleSave}
            className="w-full py-5 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-[28px] font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-amber-900/20 active:scale-95 transition-all"
          >
            {t('save')}
          </button>
        </div>

        <div className="mt-4 glass-card p-6 rounded-[36px] border border-amber-100 shadow-sm relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 p-4 opacity-[0.05] pointer-events-none rotate-12"><i className="fas fa-moon text-6xl"></i></div>
          <h3 className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-3 flex items-center gap-2">
            <i className="fas fa-sparkles text-[10px]"></i>
            {t('quranVirtue')}
          </h3>
          <div className="space-y-4">
            <p className="text-emerald-900 arabic-font text-xl leading-relaxed text-right font-bold" dir="rtl">
              مَنْ قَرَأَ حَرْفًا مِنْ كِتَابِ اللَّهِ فَلَهُ بِهِ حَسَنَةٌ
            </p>
            <p className="text-slate-500 text-[11px] leading-relaxed italic border-l-2 border-amber-200 pl-4 font-medium">
              "Whoever reads a letter from the Book of Allah, he will have a reward. And that reward will be multiplied by ten..."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuranTracker;
