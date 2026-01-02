
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
    <div className="flex flex-col h-full bg-[#fdfbf7] overflow-hidden view-transition">
      <div className="p-4 pt-10 pb-4 bg-emerald-900 text-white shrink-0 shadow-lg rounded-b-[32px]">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => setCurrentView('dashboard')} className="w-8 h-8 flex items-center justify-center bg-white/10 rounded-lg"><i className="fas fa-chevron-left text-xs"></i></button>
          <h1 className="text-lg font-bold tracking-tight">{t('fard')}</h1>
        </div>
        <div className="flex bg-white/5 p-1 rounded-xl">
          <button onClick={() => setActiveTab('fard')} className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${activeTab === 'fard' ? 'bg-white text-emerald-900 shadow' : 'text-white/60'}`}>{t('fard')}</button>
          <button onClick={() => setActiveTab('sunnah')} className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${activeTab === 'sunnah' ? 'bg-white text-emerald-900 shadow' : 'text-white/60'}`}>{t('sunnah')}</button>
        </div>
      </div>

      <div className="flex-1 p-3 flex flex-col justify-between overflow-hidden">
        <div className="text-center mb-3 shrink-0">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-emerald-50 pb-1">
            {new Date().toLocaleDateString(state.profile?.preferredLanguage || 'en', { weekday: 'long', day: 'numeric', month: 'short' })}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 flex-1">
          {(activeTab === 'fard' ? PRAYERS : SUNNAH_PRAYERS).map((p) => {
            const isDone = activeTab === 'fard' ? fardLogs[p as any] === PrayerStatus.COMPLETED : sunnahLogs.includes(p);
            const isMissed = activeTab === 'fard' && fardLogs[p as any] === PrayerStatus.MISSED;
            
            return (
              <button
                key={p}
                onClick={() => handleToggle(p, activeTab)}
                disabled={isExcused}
                className={`relative flex flex-col items-center justify-center p-3 rounded-2xl border transition-all h-24 ${
                  isDone ? 'bg-emerald-50 border-emerald-200' : isMissed ? 'bg-rose-50 border-rose-200' : 'bg-white border-emerald-50 shadow-sm'
                } ${isExcused ? 'opacity-40 grayscale' : 'active-scale'}`}
              >
                <span className={`text-[10px] font-black uppercase tracking-widest mb-2 ${isDone ? 'text-emerald-800' : 'text-slate-800'}`}>
                  {t(p).split(' ')[0]}
                </span>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDone ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-100 text-slate-300'}`}>
                  <i className={`fas ${isDone ? 'fa-check' : 'fa-hand-pointer'} text-[10px]`}></i>
                </div>
                {activeTab === 'fard' && !isDone && !isExcused && (
                   <div onClick={(e) => { e.stopPropagation(); updatePrayerStatus(today, p as any, PrayerStatus.MISSED); }} className="absolute top-1 right-1 w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center text-white text-[8px] shadow-sm"><i className="fas fa-times"></i></div>
                )}
              </button>
            );
          })}
        </div>

        <div className="py-4 text-center border-t border-emerald-50 shrink-0">
          <p className="arabic-font text-emerald-800 text-[11px]" dir="rtl">أَقِمِ الصَّلَاةَ لِدُلُوكِ الشَّمْسِ</p>
          <p className="text-slate-400 text-[7px] font-medium italic mt-1 leading-none italic opacity-70 px-4">"Establish prayer at the decline of the sun..." (17:78)</p>
        </div>
      </div>
    </div>
  );
};

export default FardPrayers;
