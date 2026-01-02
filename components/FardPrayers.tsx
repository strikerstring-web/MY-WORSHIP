
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
    <div className="flex flex-col h-full bg-[#f8fafc] overflow-hidden view-transition">
      <div className="p-6 pt-12 pb-8 bg-[#064e3b] text-white shrink-0 shadow-emerald-premium rounded-b-[42px] sm:rounded-b-[54px]">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => setCurrentView('dashboard')} className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-white/10 rounded-xl sm:rounded-2xl border border-white/10 active:scale-90 transition-all"><i className="fas fa-chevron-left text-xs sm:text-sm"></i></button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{t('fard')}</h1>
            <p className="text-[10px] sm:text-[12px] font-black text-emerald-300 uppercase tracking-widest opacity-60">Daily Tracker</p>
          </div>
        </div>
        <div className="flex bg-white/5 p-2 rounded-2xl border border-white/5 backdrop-blur-sm max-w-sm mx-auto">
          <button onClick={() => setActiveTab('fard')} className={`flex-1 py-3 rounded-xl text-[11px] sm:text-[13px] font-black uppercase tracking-[0.15em] transition-all ${activeTab === 'fard' ? 'bg-white text-emerald-900 shadow-xl' : 'text-white/50'}`}>{t('fard')}</button>
          <button onClick={() => setActiveTab('sunnah')} className={`flex-1 py-3 rounded-xl text-[11px] sm:text-[13px] font-black uppercase tracking-[0.15em] transition-all ${activeTab === 'sunnah' ? 'bg-white text-emerald-900 shadow-xl' : 'text-white/50'}`}>{t('sunnah')}</button>
        </div>
      </div>

      <div className="flex-1 p-5 sm:p-8 flex flex-col justify-between overflow-hidden">
        <div className="text-center mb-6 shrink-0">
          <span className="text-[12px] sm:text-[14px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-emerald-50 pb-2 px-6">
            {new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 flex-1 overflow-hidden">
          {(activeTab === 'fard' ? PRAYERS : SUNNAH_PRAYERS).map((p) => {
            const isDone = activeTab === 'fard' ? fardLogs[p as any] === PrayerStatus.COMPLETED : sunnahLogs.includes(p);
            const isMissed = activeTab === 'fard' && fardLogs[p as any] === PrayerStatus.MISSED;
            
            return (
              <button
                key={p}
                onClick={() => handleToggle(p, activeTab)}
                disabled={isExcused}
                className={`relative flex flex-col items-center justify-center p-5 rounded-[36px] border-2 transition-all h-full max-h-36 ${
                  isDone ? 'bg-white border-[#064e3b] shadow-xl shadow-emerald-900/5' : isMissed ? 'bg-rose-50 border-rose-200' : 'bg-white border-slate-50 shadow-premium'
                } ${isExcused ? 'opacity-30 grayscale' : 'active:scale-95'}`}
              >
                <div className={`absolute top-3 right-4 w-2.5 h-2.5 rounded-full transition-all ${isDone ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : isMissed ? 'bg-rose-500' : 'bg-slate-100'}`}></div>
                <span className={`text-[11px] sm:text-[13px] font-black uppercase tracking-[0.15em] mb-4 ${isDone ? 'text-emerald-900' : 'text-slate-600'}`}>
                  {t(p).split(' ')[0]}
                </span>
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl sm:rounded-3xl flex items-center justify-center transition-all ${isDone ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-50 text-slate-300 border border-slate-100'}`}>
                  <i className={`fas ${isDone ? 'fa-check' : 'fa-hand-pointer'} text-base sm:text-lg`}></i>
                </div>
                {activeTab === 'fard' && !isDone && !isExcused && (
                   <div onClick={(e) => { e.stopPropagation(); updatePrayerStatus(today, p as any, PrayerStatus.MISSED); }} className="absolute -top-1 -left-1 w-7 h-7 bg-rose-500 rounded-full flex items-center justify-center text-white text-[11px] shadow-lg active:scale-90"><i className="fas fa-times"></i></div>
                )}
              </button>
            );
          })}
        </div>

        <div className="pt-8 pb-4 text-center border-t border-slate-100 shrink-0 mt-4">
          <p className="arabic-font text-emerald-800 text-lg sm:text-xl font-bold" dir="rtl">أَقِمِ الصَّلَاةَ لِدُلُوكِ الشَّمْسِ</p>
          <p className="text-slate-400 text-[10px] sm:text-[12px] font-bold uppercase tracking-widest mt-2 opacity-60">Qur'an 17:78</p>
        </div>
      </div>
    </div>
  );
};

export default FardPrayers;
