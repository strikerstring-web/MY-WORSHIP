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

const SUNNAH_PRAYERS = ['Fajr Sunnah', 'Dhuhr Before', 'Dhuhr After', 'Maghrib Sunnah', 'Isha Sunnah', 'Witr'];

const FardPrayers: React.FC<FardPrayersProps> = ({ state, updatePrayerStatus, toggleSunnahStatus, setCurrentView, t }) => {
  const [activeTab, setActiveTab] = useState<'fard' | 'sunnah'>('fard');
  const today = new Date().toISOString().split('T')[0];
  const fardLogs = state.prayerLogs[today] || { fajr: PrayerStatus.PENDING, dhuhr: PrayerStatus.PENDING, asr: PrayerStatus.PENDING, maghrib: PrayerStatus.PENDING, isha: PrayerStatus.PENDING };
  const sunnahLogs = state.sunnahLogs[today] || [];
  const isExcused = state.isHaydNifas;

  const handleToggle = (prayer: any, type: 'fard' | 'sunnah') => {
    if (type === 'fard') {
      const status = fardLogs[prayer] === PrayerStatus.COMPLETED ? PrayerStatus.PENDING : PrayerStatus.COMPLETED;
      updatePrayerStatus(today, prayer, status);
    } else {
      toggleSunnahStatus(today, prayer);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#fdfbf7] dark:bg-slate-900 overflow-hidden">
      <header className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl px-6 py-4 flex flex-col gap-4 z-10 shrink-0 border-b border-slate-100/50 dark:border-slate-800/50">
        <div className="flex justify-between items-center w-full content-limit">
          <div>
            <h1 className="text-2xl font-black text-emerald-950 dark:text-emerald-50 tracking-tighter">{t('fard')}</h1>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Spiritual Momentum</p>
          </div>
          <div className="flex bg-slate-100/50 dark:bg-slate-800 p-1 rounded-xl">
            <button onClick={() => setActiveTab('fard')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'fard' ? 'bg-white dark:bg-slate-700 text-emerald-900 dark:text-emerald-50 shadow-sm' : 'text-slate-400'}`}>{t('fard')}</button>
            <button onClick={() => setActiveTab('sunnah')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'sunnah' ? 'bg-white dark:bg-slate-700 text-emerald-900 dark:text-emerald-50 shadow-sm' : 'text-slate-400'}`}>{t('sunnah')}</button>
          </div>
        </div>
      </header>

      <div className="scroll-container px-4 pt-4 space-y-3 w-full flex flex-col items-center">
        <div className="w-full content-limit space-y-3">
          {(activeTab === 'fard' ? PRAYERS : SUNNAH_PRAYERS).map((p, idx) => {
            const isDone = activeTab === 'fard' ? fardLogs[p as any] === PrayerStatus.COMPLETED : sunnahLogs.includes(p);
            const time = activeTab === 'fard' ? state.todayTimings?.[p.charAt(0).toUpperCase() + p.slice(1) as keyof PrayerTimings] : null;
            const themes = ['emerald', 'teal', 'sky', 'blue', 'indigo', 'violet'];
            const theme = themes[idx % themes.length];

            return (
              <div 
                key={p} 
                onClick={() => !isExcused && handleToggle(p, activeTab)} 
                className={`card-premium !p-4 flex items-center justify-between btn-ripple border ${isDone ? `border-${theme}-200 bg-${theme}-50/5` : 'border-transparent dark:bg-slate-800'} ${isExcused ? 'opacity-30 grayscale' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl ${isDone ? `bg-gradient-to-br from-${theme}-500 to-${theme}-700 text-white shadow-lg` : 'bg-slate-100 dark:bg-slate-700 text-slate-300'}`}>
                    <i className={`fas ${isDone ? 'fa-check-circle' : 'fa-kaaba'}`}></i>
                  </div>
                  <div>
                    <h3 className="font-black text-emerald-950 dark:text-emerald-50 text-base tracking-tight">{t(p)}</h3>
                    {time && <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{time}</p>}
                  </div>
                </div>
                {isDone && <span className={`text-[8px] font-black text-${theme}-600 bg-${theme}-50 px-3 py-1 rounded-full uppercase tracking-widest`}>Done</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FardPrayers;