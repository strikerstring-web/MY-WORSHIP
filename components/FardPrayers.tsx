
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
    <div className="h-full flex flex-col bg-slate-50 overflow-hidden">
      <header className="bg-white p-6 pt-12 pb-4 flex justify-between items-center z-10 shrink-0">
        <div>
          <h1 className="text-2xl font-black text-emerald-900 mb-1">{t('prayer')}</h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Daily Fulfillment</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button onClick={() => setActiveTab('fard')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${activeTab === 'fard' ? 'bg-white text-emerald-900 shadow-sm' : 'text-slate-400'}`}>{t('fard')}</button>
          <button onClick={() => setActiveTab('sunnah')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${activeTab === 'sunnah' ? 'bg-white text-emerald-900 shadow-sm' : 'text-slate-400'}`}>{t('sunnah')}</button>
        </div>
      </header>

      <div className="scroll-container px-6 pt-4 space-y-4">
        {isExcused && (
          <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100 flex items-center gap-3">
            <i className="fas fa-droplet text-rose-500"></i>
            <p className="text-rose-900 text-[10px] font-black uppercase tracking-widest">{t('excused')} - Rest well</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3">
          {(activeTab === 'fard' ? PRAYERS : SUNNAH_PRAYERS).map((p) => {
            const isDone = activeTab === 'fard' ? fardLogs[p as any] === PrayerStatus.COMPLETED : sunnahLogs.includes(p);
            const time = activeTab === 'fard' ? state.todayTimings?.[p.charAt(0).toUpperCase() + p.slice(1) as keyof PrayerTimings] : null;

            return (
              <div 
                key={p} 
                onClick={() => !isExcused && handleToggle(p, activeTab)} 
                className={`card-premium flex items-center justify-between py-5 btn-ripple cursor-pointer border-2 ${isDone ? 'border-emerald-600' : 'border-transparent'} ${isExcused ? 'opacity-40 grayscale' : ''}`}
              >
                <div className="flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl transition-all ${isDone ? 'bg-emerald-600 text-white shadow-xl' : 'bg-slate-100 text-slate-300'}`}>
                    <i className={`fas ${isDone ? 'fa-check' : 'fa-kaaba'}`}></i>
                  </div>
                  <div>
                    <h3 className="font-black text-emerald-900 capitalize">{t(p)}</h3>
                    {time && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{time}</p>}
                  </div>
                </div>
                {isDone && (
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase">Mabrook</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="bg-emerald-50 p-6 rounded-[32px] text-center border border-emerald-100/50 mt-8">
           <p className="arabic-font text-emerald-900 text-2xl font-bold mb-2">الصلاة خير من النوم</p>
           <p className="text-emerald-700/60 text-[9px] font-black uppercase tracking-widest">Prayer is better than sleep</p>
        </div>
      </div>
    </div>
  );
};

export default FardPrayers;
