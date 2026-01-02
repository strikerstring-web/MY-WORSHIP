import React, { useMemo, useState, useEffect } from 'react';
import { UserData, PrayerTimings, PrayerStatus } from '../types';
import { PRAYERS, HADITHS } from '../constants';

interface DashboardProps {
  state: UserData & { todayTimings: PrayerTimings | null };
  setCurrentView: (view: any) => void;
  t: (key: string) => string;
  updatePrayerStatus: (date: string, prayer: any, status: PrayerStatus) => void;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ state, setCurrentView, t, updatePrayerStatus, onLogout }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const todayStr = currentTime.toISOString().split('T')[0];
  const logs = state.prayerLogs[todayStr] || { fajr: 'pending', dhuhr: 'pending', asr: 'pending', maghrib: 'pending', isha: 'pending' };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const dailyHadith = useMemo(() => {
    const start = new Date(currentTime.getFullYear(), 0, 0);
    const diff = currentTime.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const day = Math.floor(diff / oneDay);
    return HADITHS[day % HADITHS.length];
  }, [currentTime.getFullYear()]);

  const nextPrayer = useMemo(() => {
    if (!state.todayTimings) return null;
    const nowMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    const timings = PRAYERS.map(p => {
      const timingKey = p.charAt(0).toUpperCase() + p.slice(1) as keyof PrayerTimings;
      const [h, m] = state.todayTimings![timingKey].split(':').map(Number);
      return { name: p, minutes: h * 60 + m, time: state.todayTimings![timingKey] };
    });
    let next = timings.find(t => t.minutes > nowMinutes);
    if (!next) next = { ...timings[0], minutes: timings[0].minutes + 1440 };
    const diff = next.minutes - nowMinutes;
    return { ...next, diffH: Math.floor(diff / 60), diffM: diff % 60 };
  }, [state.todayTimings, currentTime]);

  return (
    <div className="scroll-container px-6 pt-12 content-limit w-full">
      {/* Header Profile */}
      <div className="flex justify-between items-center mb-10 animate-fade-up">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 text-emerald-600">
            <i className="fas fa-mosque text-xl"></i>
          </div>
          <div>
            <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">Salam Alaikum</h2>
            <h1 className="text-2xl font-black text-white tracking-tighter leading-none">{state.profile.name}</h1>
          </div>
        </div>
        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
           <i className="fas fa-fire text-gold-500 text-sm"></i>
        </div>
      </div>

      {/* 1. Daily Hadith - Large Elegant Banner */}
      <div className="mb-10 animate-fade-up stagger-1">
        <div className="card-premium relative bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 !p-8 overflow-hidden">
          <div className="absolute top-[-20%] right-[-10%] w-[200px] h-[200px] bg-emerald-500/5 rounded-full blur-[80px]"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <span className="h-px w-6 bg-emerald-500/30"></span>
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{t('hadithTitle')}</span>
            </div>
            <p className="arabic-font text-2xl font-bold text-emerald-100 text-right leading-relaxed mb-6" dir="rtl">
              {dailyHadith.arabic}
            </p>
            <div className="pl-4 border-l-2 border-emerald-500/20">
              <p className="text-sm font-medium text-slate-300 italic leading-relaxed">
                "{dailyHadith[state.profile.preferredLanguage as keyof typeof dailyHadith] || dailyHadith.en}"
              </p>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-4 text-right">— {dailyHadith.reference}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Next Prayer Card */}
      <div className="mb-10 animate-fade-up stagger-2">
        <div className="card-premium relative bg-gradient-to-br from-emerald-600 to-teal-800 border-none !p-8 flex items-center justify-between text-white shadow-2xl shadow-emerald-950/40">
          <i className="fas fa-mosque absolute -right-4 -bottom-4 text-9xl opacity-10 rotate-12"></i>
          <div className="relative z-10">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-200 mb-2">{t('nextPrayer')}</h3>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-black tracking-tighter capitalize">{nextPrayer ? t(nextPrayer.name) : '---'}</span>
              <span className="text-lg font-bold opacity-60 tabular-nums">@ {nextPrayer?.time}</span>
            </div>
          </div>
          <div className="relative z-10 bg-white/10 backdrop-blur-md rounded-2xl p-3 px-5 border border-white/20 text-center">
             <p className="text-[8px] font-black uppercase tracking-widest text-emerald-200 mb-1">{t('time')}</p>
             <p className="text-xl font-black tabular-nums leading-none">-{nextPrayer?.diffH}h {nextPrayer?.diffM}m</p>
          </div>
        </div>
      </div>

      {/* 3. Horizontal Prayer Tracker */}
      <div className="mb-12 animate-fade-up stagger-3">
        <div className="flex justify-between items-center mb-6 px-1">
          <h3 className="text-xs font-black text-white uppercase tracking-widest">Worship Tracker</h3>
          <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20">
            {PRAYERS.filter(p => logs[p as keyof typeof logs] === 'completed').length}/5 Done
          </span>
        </div>
        
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-2 px-2">
          {PRAYERS.map(p => {
            const status = logs[p as keyof typeof logs];
            const isDone = status === PrayerStatus.COMPLETED;
            const isMissed = status === PrayerStatus.MISSED;
            const time = state.todayTimings?.[p.charAt(0).toUpperCase() + p.slice(1) as keyof PrayerTimings];
            
            return (
              <button 
                key={p} 
                onClick={() => updatePrayerStatus(todayStr, p, isDone ? PrayerStatus.PENDING : PrayerStatus.COMPLETED)}
                className={`flex-none w-32 aspect-[3/4.2] rounded-[2.5rem] border transition-all duration-500 flex flex-col items-center justify-between py-8 px-4 relative ${
                  isDone 
                    ? 'bg-gradient-to-br from-emerald-500 to-teal-600 border-emerald-400 text-white shadow-xl shadow-emerald-500/20 scale-105 z-10' 
                    : isMissed
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-500'
                    : 'bg-white/5 border-white/10 text-slate-500'
                }`}
              >
                <div className="flex flex-col items-center">
                  <span className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isDone ? 'text-emerald-100' : 'text-slate-500'}`}>{time}</span>
                  <span className={`text-sm font-black uppercase tracking-tight capitalize ${isDone ? 'text-white' : 'text-slate-200'}`}>{t(p)}</span>
                </div>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-all duration-500 ${
                  isDone ? 'bg-white text-emerald-600 shadow-lg' : isMissed ? 'bg-rose-500 text-white' : 'bg-white/5 text-slate-600'
                }`}>
                   <i className={`fas ${isDone ? 'fa-check' : isMissed ? 'fa-xmark' : 'fa-clock'}`}></i>
                </div>
                <span className={`text-[8px] font-black uppercase tracking-widest ${isDone ? 'text-emerald-100' : isMissed ? 'text-rose-400' : 'text-slate-500'}`}>
                  {isDone ? 'Mabrook' : isMissed ? 'Qada' : 'Upcoming'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Tools Grid */}
      <div className="grid grid-cols-1 gap-4 animate-fade-up stagger-4 mb-20">
        <button onClick={() => setCurrentView('quran')} className="card-premium h-28 flex items-center justify-between bg-gradient-to-br from-amber-600/10 to-transparent border-amber-600/20">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-amber-600/10 text-amber-500 rounded-2xl flex items-center justify-center text-3xl"><i className="fas fa-book-quran"></i></div>
            <div className="text-left">
              <h4 className="font-black text-lg text-white tracking-tight">{t('quran')}</h4>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Surah {state.quranProgress.surah || '---'}</p>
            </div>
          </div>
          <i className="fas fa-chevron-right text-slate-700"></i>
        </button>

        <button onClick={() => setCurrentView('qibla')} className="card-premium h-28 flex items-center justify-between bg-gradient-to-br from-blue-600/10 to-transparent border-blue-600/20">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-blue-600/10 text-blue-500 rounded-2xl flex items-center justify-center text-3xl"><i className="fas fa-compass"></i></div>
            <div className="text-left">
              <h4 className="font-black text-lg text-white tracking-tight">{t('qibla')}</h4>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Direction Finder</p>
            </div>
          </div>
          <i className="fas fa-chevron-right text-slate-700"></i>
        </button>
      </div>
    </div>
  );
};

export default Dashboard;