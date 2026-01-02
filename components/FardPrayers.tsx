
import React, { useState } from 'react';
import { UserData, PrayerStatus, PrayerTimings } from '../types';
import { PRAYERS } from '../constants';

interface FardPrayersProps {
  state: UserData & { todayTimings: PrayerTimings | null };
  updatePrayerStatus: (date: string, prayer: any, status: PrayerStatus) => void;
  toggleSunnahStatus: (date: string, sunnahName: string) => void;
  setCurrentView: (view: any) => void;
  t: (key: string) => string;
}

const SUNNAH_PRAYERS = [
  'Fajr Sunnah (2)',
  'Dhuhr Before (4)',
  'Dhuhr After (2)',
  'Maghrib Sunnah (2)',
  'Isha Sunnah (2)',
  'Witr (1/3)'
];

const FardPrayers: React.FC<FardPrayersProps> = ({ state, updatePrayerStatus, toggleSunnahStatus, setCurrentView, t }) => {
  const [activeTab, setActiveTab] = useState<'fard' | 'sunnah'>('fard');
  const [animatingPrayer, setAnimatingPrayer] = useState<string | null>(null);
  
  const today = new Date().toISOString().split('T')[0];
  
  const fardLogs = state.prayerLogs[today] || {
    fajr: PrayerStatus.PENDING,
    dhuhr: PrayerStatus.PENDING,
    asr: PrayerStatus.PENDING,
    maghrib: PrayerStatus.PENDING,
    isha: PrayerStatus.PENDING
  };

  const sunnahLogs = state.sunnahLogs[today] || [];
  const isExcused = state.isHaydNifas;

  const handleFardStatusChange = (prayer: typeof PRAYERS[number], status: PrayerStatus) => {
    const currentStatus = fardLogs[prayer];
    const newStatus = currentStatus === status ? PrayerStatus.PENDING : status;
    
    if (newStatus === PrayerStatus.COMPLETED) {
      setAnimatingPrayer(prayer);
      setTimeout(() => setAnimatingPrayer(null), 800);
      if ('vibrate' in navigator) {
        navigator.vibrate([20, 40]);
      }
    }
    
    updatePrayerStatus(today, prayer, newStatus);
  };

  const handleSunnahToggle = (sunnah: string) => {
    const isCompleted = sunnahLogs.includes(sunnah);
    if (!isCompleted) {
      setAnimatingPrayer(sunnah);
      setTimeout(() => setAnimatingPrayer(null), 800);
      if ('vibrate' in navigator) {
        navigator.vibrate([15, 30]);
      }
    }
    toggleSunnahStatus(today, sunnah);
  };

  return (
    <div className="flex flex-col h-full bg-[#fdfbf7] overflow-hidden view-transition">
      {/* Fixed Navigation Header */}
      <div className="p-4 pt-10 pb-6 bg-emerald-900 text-white flex flex-col gap-4 shadow-xl rounded-b-[40px] z-20 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => setCurrentView('dashboard')} className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-xl hover:bg-white/20 transition-all active-scale border border-white/10 rtl:rotate-180">
            <i className="fas fa-chevron-left text-xs"></i>
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight">{t('fard')} & {t('sunnah')}</h1>
            <p className="text-[9px] text-emerald-300/80 font-bold uppercase tracking-[0.2em] mt-0.5">Daily Tracker</p>
          </div>
        </div>

        <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 backdrop-blur-md">
          <button 
            onClick={() => setActiveTab('fard')}
            className={`flex-1 py-2.5 px-3 rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all ${activeTab === 'fard' ? 'bg-white text-emerald-900 shadow-lg' : 'text-white/60 hover:text-white'}`}
          >
            {t('fard')}
          </button>
          <button 
            onClick={() => setActiveTab('sunnah')}
            className={`flex-1 py-2.5 px-3 rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all ${activeTab === 'sunnah' ? 'bg-white text-emerald-900 shadow-lg' : 'text-white/60 hover:text-white'}`}
          >
            {t('sunnah')}
          </button>
        </div>
      </div>

      {/* Internal Content Area - No Scroll */}
      <div className="flex flex-col flex-1 p-4 overflow-hidden">
        <div className="text-center pb-3 border-b border-emerald-50 mb-4 shrink-0">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {new Date().toLocaleDateString(state.profile?.preferredLanguage || 'en', { weekday: 'long', month: 'long', day: 'numeric' })}
          </span>
        </div>

        {activeTab === 'fard' ? (
          <div className="flex-1 space-y-2 overflow-hidden flex flex-col"> {/* Use flex column to manage vertical space */}
            {PRAYERS.map((prayer) => {
              const status = fardLogs[prayer];
              const isAnimating = animatingPrayer === prayer;
              return (
                <div 
                  key={prayer} 
                  className={`transition-all border p-3 rounded-[24px] flex items-center justify-between group ${
                    status === PrayerStatus.COMPLETED ? 'bg-emerald-50 border-emerald-100' : 
                    status === PrayerStatus.MISSED ? 'bg-rose-50 border-rose-100' : 'bg-white border-emerald-50 shadow-sm'
                  } ${isAnimating ? 'animate-ripple-glow animate-success-pop' : ''} rtl:flex-row-reverse`}
                >
                  <div className="flex flex-col ltr:items-start rtl:items-end">
                    <span className={`capitalize font-bold text-sm tracking-tight ${
                      status === PrayerStatus.COMPLETED ? 'text-emerald-900' : 
                      status === PrayerStatus.MISSED ? 'text-rose-900' : 'text-slate-800'
                    }`}>{t(prayer)}</span>
                    <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Obligatory</span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleFardStatusChange(prayer, PrayerStatus.COMPLETED)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all active-scale ${
                        status === PrayerStatus.COMPLETED 
                        ? 'bg-emerald-600 text-white shadow-md' 
                        : 'bg-white text-slate-300 border border-slate-100 hover:border-emerald-200 hover:text-emerald-600'
                      }`}
                    >
                      <i className={`fas ${status === PrayerStatus.COMPLETED ? 'fa-check-circle' : 'fa-check'} text-base`}></i>
                    </button>
                    <button 
                      disabled={isExcused}
                      onClick={() => handleFardStatusChange(prayer, PrayerStatus.MISSED)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all active-scale ${
                        status === PrayerStatus.MISSED 
                        ? 'bg-rose-500 text-white shadow-md' 
                        : isExcused 
                          ? 'bg-slate-50 text-slate-200 opacity-40 cursor-not-allowed border border-slate-100' 
                          : 'bg-white text-slate-300 border border-slate-100 hover:border-rose-200 hover:text-rose-500'
                      }`}
                    >
                      <i className={`fas ${status === PrayerStatus.MISSED ? 'fa-times-circle' : 'fa-times'} text-base`}></i>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex-1 space-y-2 overflow-hidden flex flex-col"> {/* Use flex column to manage vertical space */}
            {SUNNAH_PRAYERS.map((sunnah) => {
              const isCompleted = sunnahLogs.includes(sunnah);
              const isAnimating = animatingPrayer === sunnah;
              return (
                <div 
                  key={sunnah} 
                  className={`transition-all p-3 rounded-[24px] flex items-center justify-between border ${
                    isCompleted ? 'bg-emerald-50 border-emerald-100' : 'bg-white border-emerald-50 shadow-sm'
                  } ${isAnimating ? 'animate-ripple-glow animate-success-pop' : ''} rtl:flex-row-reverse`}
                >
                  <div className="flex flex-col ltr:items-start rtl:items-end">
                    <span className={`font-bold text-sm ${isCompleted ? 'text-emerald-900' : 'text-slate-800'}`}>{sunnah}</span>
                    <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Recommended</span>
                  </div>
                  <button 
                    disabled={isExcused}
                    onClick={() => handleSunnahToggle(sunnah)}
                    className={`px-4 py-2 rounded-xl font-bold text-[9px] uppercase tracking-widest transition-all active-scale shadow-md ${
                      isCompleted 
                      ? 'bg-emerald-600 text-white' 
                      : isExcused 
                        ? 'bg-slate-50 text-slate-200 cursor-not-allowed border border-slate-100' 
                        : 'bg-white text-slate-400 border border-slate-100 hover:border-emerald-200 hover:text-emerald-600'
                    }`}
                  >
                    {isCompleted ? <i className="fas fa-check-circle mr-1"></i> : null}
                    {isCompleted ? t('completed') : t('pending')}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Static Footer (part of content area, shrunk) */}
        <div className="py-4 text-center shrink-0">
          <p className="arabic-font text-emerald-800 text-sm leading-relaxed" dir="rtl">
            أَقِمِ الصَّلَاةَ لِدُلُوكِ الشَّمْسِ إِلَىٰ غَسَقِ اللَّيْلِ
          </p>
          <p className="text-slate-500 text-[8px] font-medium leading-relaxed italic opacity-80 mt-1">
            {state.profile?.preferredLanguage === 'ar' 
              ? "«أول ما يحاسب عليه العبد يوم القيامة من عمله صلاته»"
              : "\"Establish prayer at the decline of the sun...\" (Qur'an 17:78)"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FardPrayers;
