import React, { useMemo, useState, useEffect } from 'react';
import { Language, PrayerTimings, PrayerStatus, UserData, FastingLog } from '../types';
import { HADITHS, PRAYERS } from '../constants';
import Logo from './Logo';

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

  const [calDate, setCalDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTimeMinutes(now.getHours() * 60 + now.getMinutes());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayLogs = state.prayerLogs[todayStr] || {
    fajr: PrayerStatus.PENDING, dhuhr: PrayerStatus.PENDING, asr: PrayerStatus.PENDING, maghrib: PrayerStatus.PENDING, isha: PrayerStatus.PENDING
  };

  const isDateInHayd = (dateStr: string): boolean => {
    const targetDate = new Date(dateStr).getTime();
    return state.healthPeriods.some(p => {
      const start = new Date(p.start).getTime();
      const end = p.end ? new Date(p.end).getTime() : new Date().getTime() + (100 * 365 * 24 * 60 * 60 * 1000);
      return targetDate >= start && targetDate <= end;
    });
  };

  const inHaydToday = isDateInHayd(todayStr);

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

  const calendarDays = useMemo(() => {
    const year = calDate.getFullYear();
    const month = calDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= lastDate; i++) days.push(`${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`);
    return days;
  }, [calDate]);

  const activeDhikr = state.activeChallenges[0] || null;
  const fastingToday: FastingLog = state.fastingLogs[`ramadan-1446H-${new Date().getDate()}`] || { status: 'none', type: 'ramadan' };

  const monthName = calDate.toLocaleString('default', { month: 'long' });

  return (
    <div className="h-full flex flex-col bg-[#fdfbf7] dark:bg-slate-900 overflow-hidden w-full">
      {/* Compact Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl px-4 py-3 z-20 w-full flex justify-center sticky top-0 border-b border-slate-100/50 dark:border-slate-800/50">
        <div className="w-full content-limit flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <div>
              <h1 className="text-lg font-black text-emerald-950 dark:text-emerald-50 leading-none">Salam,</h1>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{state.profile.name}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setCurrentView('qibla')} className="w-9 h-9 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-slate-100 dark:border-slate-700"><i className="fas fa-compass text-base"></i></button>
            <button onClick={() => setCurrentView('about')} className="w-9 h-9 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center text-amber-500 dark:text-amber-400 border border-slate-100 dark:border-slate-700"><i className="fas fa-sparkles text-base"></i></button>
          </div>
        </div>
      </header>

      <div className="scroll-container px-4 pt-4 space-y-5 w-full flex flex-col items-center">
        <div className="w-full content-limit space-y-6">
          
          {/* Compact Hero Banner */}
          <div className="bg-gradient-to-br from-emerald-800 to-teal-900 p-6 rounded-[28px] text-white relative overflow-hidden shadow-xl animate-fade-up">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/10 rounded-full -mr-32 -mt-32 blur-[80px]"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[9px] font-black text-emerald-300 uppercase tracking-[0.3em]">UP NEXT</span>
                <h2 className="text-4xl font-black capitalize tracking-tight">{prayerTimingData ? t(prayerTimingData.next.name) : '---'}</h2>
                <p className="text-emerald-100/70 text-sm font-bold">{prayerTimingData?.next.time}</p>
              </div>
              <div className="text-right bg-white/10 backdrop-blur-md p-4 rounded-[20px] border border-white/10">
                <p className="text-3xl font-black tabular-nums tracking-tighter text-emerald-300">{prayerTimingData?.timeLeft}</p>
                <p className="text-[8px] font-black text-emerald-400/60 uppercase tracking-widest">REMAINING</p>
              </div>
            </div>
            <div className="w-full bg-black/15 h-2 rounded-full mt-5 overflow-hidden p-0.5">
               <div className="bg-emerald-400 h-full rounded-full transition-all duration-1000" style={{ width: `${prayerTimingData?.progress || 0}%` }}></div>
            </div>
          </div>

          {/* Prominent Active Challenge Section */}
          {activeDhikr && (
            <div 
              onClick={() => setCurrentView('challenges')} 
              className={`card-premium dark:bg-slate-800 p-5 group cursor-pointer relative overflow-hidden transition-all hover:translate-y-[-4px] active:scale-[0.98] border-2 shadow-md animate-fade-up ${activeDhikr.current >= activeDhikr.target ? 'border-sky-500 bg-sky-50/10' : 'border-transparent'}`}
            >
              <div className="flex justify-between items-center relative z-10">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all ${activeDhikr.current >= activeDhikr.target ? 'bg-sky-500 text-white' : 'bg-emerald-50 dark:bg-slate-700 text-emerald-600 dark:text-emerald-400'}`}>
                    <i className={`fas ${activeDhikr.id === 'salawat' ? 'fa-heart' : 'fa-bolt'} text-lg`}></i>
                  </div>
                  <div>
                    <h3 className="font-black text-emerald-950 dark:text-emerald-50 uppercase text-xs tracking-widest">{t(activeDhikr.title)}</h3>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-0.5">Current Task</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-emerald-900 dark:text-emerald-100 tabular-nums leading-none">{activeDhikr.current}</p>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">/{activeDhikr.target}</p>
                </div>
              </div>
              <div className="mt-4 w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all duration-700 shadow-sm" 
                  style={{ width: `${Math.min(100, (activeDhikr.current / activeDhikr.target) * 100)}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Responsive Obligations Layout */}
          <div className="space-y-3">
            <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] px-1">DAILY PATH</h3>
            <div className="flex md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 overflow-x-auto md:overflow-visible gap-2.5 pb-2 px-1 -mx-1 md:mx-0 md:px-0 no-scrollbar snap-x md:snap-none">
              {!inHaydToday && PRAYERS.map((p, idx) => {
                const status = todayLogs[p];
                const isDone = status === PrayerStatus.COMPLETED;
                const isUpcoming = prayerTimingData?.next.name === p;
                const prayerThemes = ['emerald', 'teal', 'sky', 'blue', 'indigo'];
                const theme = prayerThemes[idx % prayerThemes.length];
                
                return (
                  <div 
                    key={p} 
                    onClick={() => updatePrayerStatus(todayStr, p, isDone ? PrayerStatus.PENDING : PrayerStatus.COMPLETED)} 
                    className={`min-w-[105px] md:min-w-0 snap-center p-3 rounded-[20px] border transition-all cursor-pointer flex flex-col gap-2 bg-white dark:bg-slate-800 shadow-sm ${isDone ? `border-${theme}-200 bg-${theme}-50/10` : isUpcoming ? 'border-amber-400 ring-2 ring-amber-500/5' : 'border-slate-100 dark:border-slate-700'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDone ? `bg-${theme}-500 text-white shadow-md` : 'bg-slate-100 dark:bg-slate-700 text-slate-300'}`}>
                        <i className={`fas ${isDone ? 'fa-check' : 'fa-moon'} text-[10px]`}></i>
                      </div>
                      {isUpcoming && <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>}
                    </div>
                    <div>
                      <p className="font-black text-emerald-950 dark:text-emerald-50 capitalize text-[11px] tracking-tight truncate">{t(p)}</p>
                      <p className="text-[7px] text-slate-400 font-black uppercase tracking-widest mt-0.5">{state.todayTimings?.[p.charAt(0).toUpperCase() + p.slice(1) as keyof PrayerTimings]}</p>
                    </div>
                  </div>
                );
              })}
              
              {/* Compact Fasting Card */}
              <div onClick={() => setCurrentView('fasting')} className={`min-w-[105px] md:min-w-0 snap-center p-3 rounded-[20px] border transition-all cursor-pointer flex flex-col gap-2 bg-white dark:bg-slate-800 shadow-sm ${fastingToday.status === 'completed' ? 'border-violet-200' : 'border-slate-100 dark:border-slate-700'}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${fastingToday.status === 'completed' ? 'bg-violet-500 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-700 text-slate-300'}`}>
                  <i className="fas fa-moon text-[10px]"></i>
                </div>
                <div>
                  <p className="font-black text-emerald-950 dark:text-emerald-50 text-[11px] tracking-tight">Fasting</p>
                  <p className="text-[7px] text-slate-400 font-black uppercase tracking-widest mt-0.5">{fastingToday.status === 'completed' ? 'DONE' : 'LOG IT'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Journey Map (Calendar) */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">JOURNEY MAP</h3>
                <h4 className="text-xl font-black text-emerald-950 dark:text-emerald-50 tracking-tight">{monthName}</h4>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setCalDate(new Date(calDate.getFullYear(), calDate.getMonth() - 1, 1))} 
                  className="w-10 h-10 bg-slate-50 dark:bg-slate-700/50 rounded-xl flex items-center justify-center text-slate-400 hover:text-emerald-600 active:scale-95 transition-all"
                >
                  <i className="fas fa-chevron-left text-[10px]"></i>
                </button>
                <button 
                  onClick={() => setCalDate(new Date(calDate.getFullYear(), calDate.getMonth() + 1, 1))} 
                  className="w-10 h-10 bg-slate-50 dark:bg-slate-700/50 rounded-xl flex items-center justify-center text-slate-400 hover:text-emerald-600 active:scale-95 transition-all"
                >
                  <i className="fas fa-chevron-right text-[10px]"></i>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2.5">
              {['S','M','T','W','T','F','S'].map(d => (
                <div key={d} className="text-center text-[8px] font-black text-slate-300 dark:text-slate-600 pb-2 uppercase tracking-widest">{d}</div>
              ))}
              
              {calendarDays.map((dateStr, idx) => {
                if (!dateStr) return <div key={`empty-${idx}`} className="h-12" />;
                
                const isToday = dateStr === todayStr;
                const inHayd = isDateInHayd(dateStr);
                const dayNum = dateStr.split('-')[2];
                const logs = state.prayerLogs[dateStr];
                // Fix: Cast to FastingLog | undefined to resolve 'unknown' type error
                const fastingLog = Object.entries(state.fastingLogs).find(([k]) => k.includes(dateStr))?.[1] as FastingLog | undefined;
                
                return (
                  <button 
                    key={dateStr}
                    onClick={() => setCurrentView('qadah')}
                    className={`
                      relative h-14 rounded-2xl border flex flex-col items-center justify-between p-1.5 transition-all active:scale-90
                      ${isToday ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-900/10' : 
                        inHayd ? 'border-pink-100 dark:border-pink-900/30 bg-pink-50/30 dark:bg-pink-900/5' : 
                        'border-slate-50 dark:border-slate-700/50 bg-white dark:bg-slate-700/30'}
                    `}
                  >
                    <div className="flex justify-between w-full px-0.5">
                      <span className={`text-[9px] font-black ${isToday ? 'text-emerald-700' : inHayd ? 'text-pink-600' : 'text-slate-400'}`}>
                        {parseInt(dayNum)}
                      </span>
                      {fastingLog?.status === 'completed' && (
                        <i className="fas fa-moon text-[7px] text-amber-500"></i>
                      )}
                    </div>
                    
                    {!inHayd && logs ? (
                      <div className="flex flex-wrap gap-0.5 justify-center w-full mb-1">
                        {PRAYERS.slice(0, 5).map(p => {
                          const status = logs[p as keyof typeof logs];
                          const color = status === 'completed' ? 'bg-emerald-500' : status === 'missed' ? 'bg-rose-500' : 'bg-slate-100 dark:bg-slate-600';
                          return <div key={p} className={`w-1 h-1 rounded-full ${color}`}></div>;
                        })}
                      </div>
                    ) : inHayd ? (
                      <i className="fas fa-leaf text-[8px] text-pink-300 mb-1"></i>
                    ) : (
                      <div className="h-1"></div>
                    )}
                  </button>
                );
              })}
            </div>

            <button 
              onClick={() => setCurrentView('qadah')}
              className="w-full mt-6 py-3.5 bg-slate-50 dark:bg-slate-700/40 text-slate-500 dark:text-slate-400 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-emerald-50 hover:text-emerald-600 transition-all"
            >
              Open Worship Calendar
              <i className="fas fa-arrow-right text-[8px] opacity-40"></i>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;