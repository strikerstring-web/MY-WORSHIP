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
  const [copied, setCopied] = useState(false);
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

  const handleCopyHadith = () => {
    const text = `${dailyHadith.arabic}\n\n"${dailyHadith[state.profile.preferredLanguage as keyof typeof dailyHadith] || dailyHadith.en}"\n— ${dailyHadith.reference}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="scroll-container px-5 pt-8 content-limit w-full">
      {/* 1. Header - Compact Profile */}
      <div className="flex justify-between items-center mb-6 animate-fade-up">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20 text-emerald-500">
            <i className="fas fa-mosque text-sm"></i>
          </div>
          <div>
            <h2 className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Assalamu Alaikum</h2>
            <h1 className="text-lg font-black text-white tracking-tight leading-none">{state.profile.name}</h1>
          </div>
        </div>
        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
           <i className="fas fa-fire text-gold-500 text-xs"></i>
        </div>
      </div>

      {/* 2. Daily Hadith - Minimalist Card */}
      <div className="mb-6 animate-fade-up stagger-1">
        <div className="card-premium relative bg-white/[0.03] border-white/10 !p-5 overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[8px] font-black text-emerald-500 uppercase tracking-[0.2em]">{t('hadithTitle')}</span>
            <button onClick={handleCopyHadith} className="text-slate-500 hover:text-white transition-colors">
              <i className={`fas ${copied ? 'fa-check text-emerald-500' : 'fa-copy'} text-[10px]`}></i>
            </button>
          </div>
          <p className="arabic-font text-xl font-bold text-white text-center leading-relaxed mb-4" dir="rtl">
            {dailyHadith.arabic}
          </p>
          <p className="text-xs font-medium text-slate-400 italic leading-snug text-center px-2">
            "{dailyHadith[state.profile.preferredLanguage as keyof typeof dailyHadith] || dailyHadith.en}"
          </p>
          <div className="mt-4 pt-3 border-t border-white/5 text-center">
            <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{dailyHadith.reference}</span>
          </div>
        </div>
      </div>

      {/* 3. Next Prayer - Condensed Card */}
      <div className="mb-6 animate-fade-up stagger-2">
        <div className="card-premium bg-gradient-to-r from-emerald-600 to-emerald-700 border-none !p-5 flex items-center justify-between shadow-lg">
          <div>
            <h3 className="text-[8px] font-black uppercase tracking-widest text-emerald-200 mb-1">{t('nextPrayer')}</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white tracking-tight capitalize">{nextPrayer ? t(nextPrayer.name) : '---'}</span>
              <span className="text-xs font-bold text-emerald-100/60 tabular-nums">@ {nextPrayer?.time}</span>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl py-2 px-4 border border-white/20 text-center">
             <p className="text-[10px] font-black text-white tabular-nums leading-none">-{nextPrayer?.diffH}h {nextPrayer?.diffM}m</p>
          </div>
        </div>
      </div>

      {/* 4. Prayer Tracker - Smaller & Tighter */}
      <div className="mb-8 animate-fade-up stagger-3">
        <div className="flex justify-between items-center mb-4 px-1">
          <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Today's Worship</h3>
          <span className="text-[8px] font-black text-emerald-500">{PRAYERS.filter(p => logs[p as keyof typeof logs] === 'completed').length}/5 Complete</span>
        </div>
        
        <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-1 px-1">
          {PRAYERS.map(p => {
            const status = logs[p as keyof typeof logs];
            const isDone = status === PrayerStatus.COMPLETED;
            const isMissed = status === PrayerStatus.MISSED;
            const time = state.todayTimings?.[p.charAt(0).toUpperCase() + p.slice(1) as keyof PrayerTimings];
            
            return (
              <button 
                key={p} 
                onClick={() => updatePrayerStatus(todayStr, p, isDone ? PrayerStatus.PENDING : PrayerStatus.COMPLETED)}
                className={`flex-none w-24 aspect-[4/5] rounded-[1.5rem] border transition-all duration-300 flex flex-col items-center justify-center gap-3 ${
                  isDone 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' 
                    : isMissed
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-500'
                    : 'bg-white/5 border-white/10 text-slate-600'
                }`}
              >
                <div className="text-center">
                  <p className={`text-[7px] font-black uppercase tracking-widest mb-0.5 ${isDone ? 'text-emerald-500' : 'text-slate-600'}`}>{time}</p>
                  <p className={`text-[11px] font-black capitalize ${isDone ? 'text-emerald-400' : 'text-slate-300'}`}>{t(p)}</p>
                </div>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs ${
                  isDone ? 'bg-emerald-500 text-white' : isMissed ? 'bg-rose-500 text-white' : 'bg-white/5'
                }`}>
                   <i className={`fas ${isDone ? 'fa-check' : isMissed ? 'fa-xmark' : 'fa-clock'}`}></i>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Tools Grid - Smaller Heights */}
      <div className="grid grid-cols-2 gap-3 animate-fade-up stagger-4 mb-16">
        <button onClick={() => setCurrentView('quran')} className="card-premium h-20 flex items-center gap-3 bg-white/5 border-white/5 !p-3">
          <div className="w-10 h-10 bg-amber-600/10 text-amber-500 rounded-xl flex items-center justify-center text-lg"><i className="fas fa-book-quran"></i></div>
          <div className="text-left overflow-hidden">
            <h4 className="font-black text-xs text-white truncate">{t('quran')}</h4>
            <p className="text-[7px] font-bold text-slate-600 uppercase tracking-widest truncate">{state.quranProgress.surah || 'Track'}</p>
          </div>
        </button>

        <button onClick={() => setCurrentView('qibla')} className="card-premium h-20 flex items-center gap-3 bg-white/5 border-white/5 !p-3">
          <div className="w-10 h-10 bg-blue-600/10 text-blue-500 rounded-xl flex items-center justify-center text-lg"><i className="fas fa-compass"></i></div>
          <div className="text-left overflow-hidden">
            <h4 className="font-black text-xs text-white truncate">{t('qibla')}</h4>
            <p className="text-[7px] font-bold text-slate-600 uppercase tracking-widest truncate">Finder</p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default Dashboard;