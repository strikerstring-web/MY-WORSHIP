
import React, { useState } from 'react';
import { UserData, QuranProgress, PrayerTimings } from '../types';

interface QuranTrackerProps {
  // Corrected state type from AppState to UserData with todayTimings
  state: UserData & { todayTimings: PrayerTimings | null };
  onUpdate: (progress: QuranProgress) => void;
  setCurrentView: (view: any) => void;
  t: (key: string) => string;
}

const QuranTracker: React.FC<QuranTrackerProps> = ({ state, onUpdate, setCurrentView, t }) => {
  const [localProgress, setLocalProgress] = useState<QuranProgress>(state.quranProgress);

  const handleSave = () => {
    onUpdate({
      ...localProgress,
      lastUpdated: new Date().toISOString()
    });
    alert(t('save') + "!");
  };

  return (
    <div className="flex flex-col h-full bg-[#fdfbf7] animate-fade-up">
      <div className="p-4 pt-10 pb-6 flex items-center gap-3 bg-amber-600 text-white shadow-xl rounded-b-[40px] z-20 shrink-0">
        <button onClick={() => setCurrentView('dashboard')} className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-xl hover:bg-white/20 transition-all border border-white/10 active:scale-90 rtl:rotate-180">
          <i className="fas fa-chevron-left text-xs"></i>
        </button>
        <div>
          <h1 className="text-xl font-bold tracking-tight">{t('quran')}</h1>
          <p className="text-[9px] text-amber-200/80 font-bold uppercase tracking-[0.2em] mt-0.5">Divine Guidance</p>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-hidden flex flex-col justify-around"> {/* No scroll here */}
        <div className="bg-amber-50 p-4 rounded-[32px] mb-4 flex flex-col items-center text-center border border-amber-100 shadow-xl shadow-amber-900/5 shrink-0">
          <div className="w-16 h-16 bg-amber-600 rounded-[24px] flex items-center justify-center text-white text-2xl mb-3 shadow-lg shadow-amber-200">
            <i className="fas fa-book-open"></i>
          </div>
          <h2 className="text-[9px] font-black text-amber-800/40 uppercase tracking-[0.2em] mb-1">{t('lastRead')}</h2>
          <p className="text-amber-700 text-lg font-black mt-1">
            {state.quranProgress.surah ? `${t('surah')} ${state.quranProgress.surah}, ${t('ayah')} ${state.quranProgress.ayah}` : '---'}
          </p>
          {state.quranProgress.lastUpdated && (
            <p className="text-[8px] text-amber-500 mt-2 font-bold uppercase tracking-widest">
              Updated: {new Date(state.quranProgress.lastUpdated).toLocaleDateString()}
            </p>
          )}
        </div>

        <div className="space-y-4 flex-1 flex flex-col justify-center shrink-0">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('surah')}</label>
              <input 
                type="text" 
                placeholder="Al-Baqarah"
                className="w-full p-3 bg-white border border-emerald-50 rounded-[20px] focus:ring-2 focus:ring-emerald-500/10 outline-none shadow-sm font-bold text-[#064e3b] text-sm"
                value={localProgress.surah}
                onChange={(e) => setLocalProgress({...localProgress, surah: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('ayah')}</label>
              <input 
                type="text" 
                placeholder="255"
                className="w-full p-3 bg-white border border-emerald-50 rounded-[20px] focus:ring-2 focus:ring-emerald-500/10 outline-none shadow-sm font-bold text-[#064e3b] text-sm"
                value={localProgress.ayah}
                onChange={(e) => setLocalProgress({...localProgress, ayah: e.target.value})}
              />
            </div>
          </div>

          <button 
            onClick={handleSave}
            className="w-full py-4 bg-amber-600 text-white rounded-[20px] font-black text-sm uppercase tracking-widest shadow-xl shadow-amber-900/20 active:scale-95 transition-all"
          >
            {t('save')}
          </button>
        </div>

        {/* Virtue Section with Arabic + Translation */}
        <div className="mt-4 bg-white p-4 rounded-[28px] border border-amber-50 shadow-sm relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 p-2 opacity-[0.03]">
             <i className="fas fa-star-and-crescent text-5xl"></i>
          </div>
          <h3 className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <i className="fas fa-sparkles text-[7px]"></i>
            {t('quranVirtue')}
          </h3>
          <div className="space-y-3">
            <p className="text-[#064e3b] arabic-font text-sm leading-relaxed text-right font-bold" dir="rtl">
              مَنْ قَرَأَ حَرْفًا مِنْ كِتَابِ اللَّهِ فَلَهُ بِهِ حَسَنَةٌ، وَالْحَسَنَةُ بِعَشْرِ أَمْثَالِهَا
            </p>
            <p className="text-slate-600 text-[9px] leading-relaxed italic border-l border-amber-100 pl-2">
              "Whoever reads a letter from the Book of Allah, he will have a reward. And that reward will be multiplied by ten..."
            </p>
          </div>
          <p className="text-[8px] font-bold text-amber-700/40 uppercase tracking-widest mt-3 text-right">
             Source: Sunan al-Tirmidhi
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuranTracker;
