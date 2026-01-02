
import React, { useMemo, useState, useEffect } from 'react';
import { Language, PrayerTimings, PrayerStatus, UserData } from '../types';
import { HADITHS, PRAYERS } from '../constants';

interface DashboardProps {
  state: UserData & { todayTimings: PrayerTimings | null };
  setCurrentView: (view: any) => void;
  t: (key: string) => string;
  onLogout: () => void;
  toggleNotifications: () => void;
  updatePrayerStatus: (date: string, prayer: typeof PRAYERS[number], status: PrayerStatus) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ state, setCurrentView, t, onLogout, toggleNotifications, updatePrayerStatus }) => {
  const userLang = (state.profile?.preferredLanguage || 'en') as Language;
  const [currentTimeMinutes, setCurrentTimeMinutes] = useState<number>(() => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTimeMinutes(now.getHours() * 60 + now.getMinutes());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const todayLogs = state.prayerLogs[today] || {
    fajr: PrayerStatus.PENDING, dhuhr: PrayerStatus.PENDING, asr: PrayerStatus.PENDING, maghrib: PrayerStatus.PENDING, isha: PrayerStatus.PENDING
  };

  const dailyHadith = useMemo(() => {
    const now = new Date();
    const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    return HADITHS[dayOfYear % HADITHS.length];
  }, []);

  const prayerTimingData = useMemo(() => {
    if (!state.todayTimings) return null;
    const timingsMinutes = PRAYERS.map(p => {
      const pKey = p.charAt(0).toUpperCase() + p.slice(1) as keyof PrayerTimings;
      const [h, m] = state.todayTimings![pKey].split(':').map(Number);
      return { name: p, total: h * 60 + m, time: state.todayTimings![pKey] };
    });
    let nextIndex = timingsMinutes.findIndex(p => p.total > currentTimeMinutes);
    let prevIndex, isTomorrow = false;
    if (nextIndex === -1) { nextIndex = 0; prevIndex = timingsMinutes.length - 1; isTomorrow = true; }
    else { prevIndex = nextIndex === 0 ? timingsMinutes.length - 1 : nextIndex - 1; }
    const next = timingsMinutes[nextIndex], prev = timingsMinutes[prevIndex];
    const nextTotal = isTomorrow ? next.total + 1440 : next.total;
    const prevTotal = (nextIndex === 0 && !isTomorrow) ? prev.total - 1440 : prev.total;
    const diff = nextTotal - currentTimeMinutes;
    const progress = Math.max(0, Math.min(100, ((currentTimeMinutes - prevTotal) / (nextTotal - prevTotal)) * 100));
    return { next, timeLeft: `${Math.floor(diff / 60)}h ${diff % 60}m`, progress, activeName: prev.name };
  }, [state.todayTimings, currentTimeMinutes]);

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-hidden w-full">
      {/* Fluid Fixed Header */}
      <header className="bg-white p-6 pt-12 pb-4 shadow-sm z-10 w-full flex justify-center">
        <div className="w-full content-limit flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-emerald-900 rounded-2xl flex items-center justify-center text-white shadow-lg">
               <i className="fas fa-user text-2xl"></i>
            </div>
            <div>
              <h1 className="text-2xl font-black text-emerald-900 leading-none mb-1">Assalamu Alaikum</h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{state.profile.name}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setCurrentView('qibla')} className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-600 active:scale-90 transition-all shadow-sm"><i className="fas fa-compass text-lg"></i></button>
            <button onClick={() => setCurrentView('about')} className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-600 active:scale-90 transition-all shadow-sm"><i className="fas fa-circle-info text-lg"></i></button>
          </div>
        </div>
      </header>

      {/* Responsive Scrollable Content */}
      <div className="scroll-container px-6 pt-6 space-y-8 w-full flex flex-col items-center">
        <div className="w-full content-limit space-y-8">
          
          {/* Daily Hadith - Priority placement right under welcome */}
          <div className="card-premium border-l-8 border-emerald-600 relative group active:scale-[0.99] transition-all bg-white">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-xl uppercase tracking-widest">WISDOM FOR TODAY</span>
            </div>
            <p className="text-emerald-900 arabic-font text-3xl leading-relaxed text-right mb-6 font-bold" dir="rtl">{dailyHadith.arabic}</p>
            <p className="text-slate-500 italic text-sm leading-relaxed border-l-4 border-emerald-100 pl-6 font-medium">"{dailyHadith[userLang]}"</p>
          </div>

          {/* Next Prayer Hero - Uber Style Responsive */}
          <div className="bg-emerald-900 p-10 rounded-[40px] text-white relative overflow-hidden shadow-2xl shadow-emerald-900/30">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <span className="text-[11px] font-black text-emerald-300 uppercase tracking-widest block mb-2">UP NEXT</span>
                <h2 className="text-5xl font-black capitalize tracking-tighter">{prayerTimingData ? t(prayerTimingData.next.name) : '---'}</h2>
                <p className="text-emerald-100/70 text-lg mt-2 font-medium">{prayerTimingData?.next.time}</p>
              </div>
              <div className="text-left md:text-right">
                <p className="text-4xl font-black tabular-nums tracking-tight">{prayerTimingData?.timeLeft}</p>
                <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mt-1">REMAINING</p>
              </div>
            </div>
            <div className="w-full bg-emerald-800/60 h-2.5 rounded-full mt-8 overflow-hidden p-1 shadow-inner">
               <div className="bg-emerald-400 h-full rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(52,211,153,0.4)]" style={{ width: `${prayerTimingData?.progress || 0}%` }}></div>
            </div>
          </div>

          {/* Feature Grid - Fluid Responsive columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card-premium flex items-center gap-5">
               <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl"><i className="fas fa-fire-flame-curved"></i></div>
               <div>
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">STREAK</span>
                 <p className="text-2xl font-black text-emerald-900">{state.dhikrCount.toLocaleString()}</p>
               </div>
            </div>
            <div className="card-premium flex items-center gap-5">
               <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center text-2xl"><i className="fas fa-book-quran"></i></div>
               <div className="overflow-hidden">
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">READING</span>
                 <p className="text-lg font-black text-emerald-900 truncate">{state.quranProgress.surah || '---'}</p>
               </div>
            </div>
          </div>

          {/* Today's Tasks - Adaptive columns */}
          <div>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-6">TODAY'S OBLIGATIONS</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
               {PRAYERS.map(p => {
                 const status = todayLogs[p];
                 const isDone = status === PrayerStatus.COMPLETED;
                 return (
                   <div 
                     key={p} 
                     onClick={() => updatePrayerStatus(today, p, isDone ? PrayerStatus.PENDING : PrayerStatus.COMPLETED)} 
                     className="card-premium flex items-center justify-between py-6 btn-ripple cursor-pointer bg-white"
                   >
                      <div className="flex items-center gap-5">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-md ${isDone ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-300'}`}>
                          <i className={`fas ${isDone ? 'fa-check' : 'fa-circle-notch'} text-lg`}></i>
                        </div>
                        <div>
                          <p className="font-black text-emerald-900 capitalize text-base">{t(p)}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            {state.todayTimings?.[p.charAt(0).toUpperCase() + p.slice(1) as keyof PrayerTimings]}
                          </p>
                        </div>
                      </div>
                      {isDone && <i className="fas fa-sparkles text-amber-400 text-sm animate-pulse"></i>}
                   </div>
                 );
               })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
