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

  // Update body class for eco mode based on user setting
  useEffect(() => {
    if (state.settings.ecoMode) {
      document.body.classList.add('eco-mode');
    } else {
      const isLowEnd = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);
      if (!isLowEnd) document.body.classList.remove('eco-mode');
    }
  }, [state.settings.ecoMode]);

  const hijriDateFull = useMemo(() => {
    try {
      return new Intl.DateTimeFormat('en-u-ca-islamic-uma-nu-latn', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        weekday: 'long'
      }).format(currentTime);
    } catch (e) {
      return '';
    }
  }, [currentTime]);

  const hijriDayMonth = useMemo(() => {
    try {
      return new Intl.DateTimeFormat('en-u-ca-islamic-uma-nu-latn', {
        day: 'numeric',
        month: 'long'
      }).format(currentTime);
    } catch (e) {
      return '';
    }
  }, [currentTime]);

  const hijriYear = useMemo(() => {
    try {
      return new Intl.DateTimeFormat('en-u-ca-islamic-uma-nu-latn', {
        year: 'numeric'
      }).format(currentTime);
    } catch (e) {
      return '';
    }
  }, [currentTime]);

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
      {/* 1. Enhanced Header - Profile + Prominent Hijri Date */}
      <div className="flex flex-col gap-6 mb-8 animate-fade-up">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 text-emerald-500 shadow-sm shadow-emerald-500/5">
              <i className="fas fa-mosque text-lg"></i>
            </div>
            <div>
              <h2 className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none mb-1.5">Assalamu Alaikum</h2>
              <h1 className="text-xl font-black text-emerald-950 dark:text-white tracking-tight leading-none">{state.profile.name}</h1>
            </div>
          </div>
          <button onClick={onLogout} className="w-10 h-10 flex items-center justify-center bg-black/5 dark:bg-white/5 rounded-xl text-slate-400 hover:text-rose-500 transition-colors">
            <i className="fas fa-power-off text-sm"></i>
          </button>
        </div>

        {/* Dedicated Prominent Hijri Date Banner */}
        <div className="card-premium !p-5 bg-gradient-to-br from-white to-emerald-50/30 dark:from-slate-900 dark:to-emerald-950/10 border-emerald-100/50 dark:border-emerald-900/20 flex items-center justify-between shadow-xl shadow-slate-200/50 dark:shadow-none">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-emerald-600 text-white rounded-2xl flex flex-col items-center justify-center shadow-lg shadow-emerald-600/20">
              <span className="text-xs font-black leading-none mb-0.5">{currentTime.getDate()}</span>
              <span className="text-[7px] font-black uppercase tracking-widest leading-none">{currentTime.toLocaleString('default', { month: 'short' })}</span>
            </div>
            <div>
              <h3 className="text-sm font-black text-emerald-900 dark:text-emerald-400 tracking-tight">{hijriDayMonth}</h3>
              <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">{hijriYear} AH • {currentTime.toLocaleDateString(undefined, { weekday: 'long' })}</p>
            </div>
          </div>
          <div className="text-right">
             <i className="fas fa-moon text-emerald-200 dark:text-emerald-800 text-3xl opacity-50"></i>
          </div>
        </div>
      </div>

      {/* 2. Daily Hadith - Minimalist Card */}
      <div className="mb-8 animate-fade-up stagger-1">
        <div className="card-premium relative overflow-hidden group">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[8px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-[0.2em]">{t('hadithTitle')}</span>
            <button onClick={handleCopyHadith} className="text-slate-400 hover:text-emerald-600 dark:text-slate-500 dark:hover:text-white transition-colors">
              <i className={`fas ${copied ? 'fa-check text-emerald-500' : 'fa-copy'} text-[10px]`}></i>
            </button>
          </div>
          <p className="arabic-font text-2xl font-bold text-emerald-950 dark:text-white text-center leading-relaxed mb-6 px-4" dir="rtl">
            {dailyHadith.arabic}
          </p>
          <div className="relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-1 bg-emerald-500/10 rounded-full"></div>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 italic leading-relaxed text-center px-4">
              "{dailyHadith[state.profile.preferredLanguage as keyof typeof dailyHadith] || dailyHadith.en}"
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-black/5 dark:border-white/5 text-center">
            <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">{dailyHadith.reference}</span>
          </div>
        </div>
      </div>

      {/* 3. Next Prayer - Condensed Card */}
      <div className="mb-8 animate-fade-up stagger-2">
        <div className="card-premium bg-gradient-to-r from-emerald-600 to-emerald-700 border-none !p-6 flex items-center justify-between shadow-2xl shadow-emerald-600/20">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white backdrop-blur-md border border-white/20">
               <i className="fas fa-clock"></i>
            </div>
            <div>
              <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-100/70 mb-1">{t('nextPrayer')}</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-white tracking-tight capitalize">{nextPrayer ? t(nextPrayer.name) : '---'}</span>
                <span className="text-xs font-bold text-emerald-100/60 tabular-nums">@ {nextPrayer?.time}</span>
              </div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl py-2 px-4 border border-white/20 text-center">
             <p className="text-[11px] font-black text-white tabular-nums leading-none">-{nextPrayer?.diffH}h {nextPrayer?.diffM}m</p>
          </div>
        </div>
      </div>

      {/* 4. Prayer Tracker - Smaller & Tighter */}
      <div className="mb-8 animate-fade-up stagger-3">
        <div className="flex justify-between items-center mb-5 px-1">
          <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Worship Tracker</h3>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-24 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 transition-all duration-700" 
                style={{ width: `${(PRAYERS.filter(p => logs[p as keyof typeof logs] === 'completed').length / 5) * 100}%` }}
              ></div>
            </div>
            <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-500">{PRAYERS.filter(p => logs[p as keyof typeof logs] === 'completed').length}/5</span>
          </div>
        </div>
        
        <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-1 px-1 py-1">
          {PRAYERS.map(p => {
            const status = logs[p as keyof typeof logs];
            const isDone = status === PrayerStatus.COMPLETED;
            const isMissed = status === PrayerStatus.MISSED;
            const time = state.todayTimings?.[p.charAt(0).toUpperCase() + p.slice(1) as keyof PrayerTimings];
            
            return (
              <button 
                key={p} 
                onClick={() => updatePrayerStatus(todayStr, p, isDone ? PrayerStatus.PENDING : PrayerStatus.COMPLETED)}
                className={`flex-none w-28 aspect-[5/6] rounded-[2rem] border-2 transition-all duration-300 flex flex-col items-center justify-center gap-3 ${
                  isDone 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-500 shadow-lg shadow-emerald-500/5' 
                    : isMissed
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-500'
                    : 'bg-white dark:bg-slate-900/50 border-black/5 dark:border-white/10 text-slate-500 dark:text-slate-600'
                }`}
              >
                <div className="text-center">
                  <p className={`text-[8px] font-black uppercase tracking-widest mb-1 ${isDone ? 'text-emerald-600 dark:text-emerald-500' : 'text-slate-400 dark:text-slate-500'}`}>{time}</p>
                  <p className={`text-xs font-black capitalize ${isDone ? 'text-emerald-900 dark:text-emerald-100' : 'text-slate-700 dark:text-slate-300'}`}>{t(p)}</p>
                </div>
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm transition-all duration-300 ${
                  isDone ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : isMissed ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-300'
                }`}>
                   <i className={`fas ${isDone ? 'fa-check' : isMissed ? 'fa-xmark' : 'fa-clock'}`}></i>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Tools Grid */}
      <div className="grid grid-cols-2 gap-4 animate-fade-up stagger-4 mb-20">
        <button onClick={() => setCurrentView('quran')} className="card-premium h-24 flex items-center gap-4 !p-4 hover:border-amber-200 transition-colors">
          <div className="w-12 h-12 bg-amber-500/10 text-amber-600 rounded-2xl flex items-center justify-center text-2xl shadow-sm"><i className="fas fa-book-quran"></i></div>
          <div className="text-left overflow-hidden">
            <h4 className="font-black text-sm text-emerald-950 dark:text-white truncate">{t('quran')}</h4>
            <p className="text-[8px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest truncate">{state.quranProgress.surah || 'Track Path'}</p>
          </div>
        </button>

        <button onClick={() => setCurrentView('qibla')} className="card-premium h-24 flex items-center gap-4 !p-4 hover:border-blue-200 transition-colors">
          <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center text-2xl shadow-sm"><i className="fas fa-compass"></i></div>
          <div className="text-left overflow-hidden">
            <h4 className="font-black text-sm text-emerald-950 dark:text-white truncate">{t('qibla')}</h4>
            <p className="text-[8px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest truncate">Direction</p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default Dashboard;