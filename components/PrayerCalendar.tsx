import React, { useState } from 'react';
import { UserData, PrayerStatus, PrayerTimings } from '../types';
import { PRAYERS } from '../constants';

interface PrayerCalendarProps {
  state: UserData & { todayTimings: PrayerTimings | null };
  updatePrayerStatus: (date: string, prayer: any, status: PrayerStatus) => void;
  setCurrentView: (view: any) => void;
  t: (key: string) => string;
}

const PrayerCalendar: React.FC<PrayerCalendarProps> = ({ state, updatePrayerStatus, setCurrentView, t }) => {
  const [viewDate, setViewDate] = useState(new Date());
  const month = viewDate.getMonth(), year = viewDate.getFullYear();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const d = i + 1;
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  });

  const isExcused = (date: string) => state.healthPeriods.some(p => {
    // Normalize date to start of day for accurate comparison
    const d = new Date(date).setHours(0, 0, 0, 0);
    const start = new Date(p.start).setHours(0, 0, 0, 0);
    const end = p.end ? new Date(p.end).setHours(23, 59, 59, 999) : new Date().setHours(23, 59, 59, 999);
    return d >= start && d <= end;
  });

  return (
    <div className="flex flex-col h-full bg-[#fdfbf7] dark:bg-slate-950 overflow-hidden">
      <header className="p-4 pt-10 bg-gradient-to-br from-emerald-900 via-teal-900 to-emerald-950 text-white shrink-0 shadow-lg rounded-b-[32px]">
        <div className="flex justify-between items-center mb-6">
          <div className="flex flex-col">
            <h1 className="text-xl font-black tracking-tighter leading-none">{viewDate.toLocaleString('default', { month: 'long' })}</h1>
            <span className="text-[10px] font-black text-emerald-300 uppercase tracking-widest mt-1">{year}</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setViewDate(new Date(year, month - 1, 1))} className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all active:scale-90"><i className="fas fa-chevron-left text-xs"></i></button>
            <button onClick={() => setViewDate(new Date(year, month + 1, 1))} className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all active:scale-90"><i className="fas fa-chevron-right text-xs"></i></button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 px-1">
          {['S','M','T','W','T','F','S'].map((d, i) => <div key={i} className="text-center text-[7px] font-black text-emerald-300 uppercase opacity-60">{d}</div>)}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 pb-32 no-scrollbar">
        <div className="content-limit w-full">
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2 mb-8">
            {Array(firstDay).fill(null).map((_, i) => <div key={`empty-${i}`} className="aspect-square" />)}
            {days.map(d => {
              const log = state.prayerLogs[d] || {};
              const excused = isExcused(d);
              const done = PRAYERS.filter(p => log[p] === PrayerStatus.COMPLETED).length;
              const missed = PRAYERS.filter(p => log[p] === PrayerStatus.MISSED).length;
              
              return (
                <div key={d} className={`aspect-square rounded-xl border flex flex-col items-center justify-center gap-0.5 transition-all ${excused ? 'bg-pink-50/20 border-pink-100/50 dark:bg-pink-900/10 dark:border-pink-900/30' : 'bg-white dark:bg-slate-900 border-slate-50 dark:border-slate-800 shadow-sm'}`}>
                  <span className={`text-[10px] font-black ${excused ? 'text-pink-400' : 'text-slate-900 dark:text-emerald-100'}`}>{d.split('-')[2]}</span>
                  <div className="flex gap-0.5">
                    {excused ? (
                      <i className="fas fa-leaf text-[6px] text-pink-300 animate-pulse"></i>
                    ) : (
                      <>
                        {done > 0 && <div className="w-1 h-1 rounded-full bg-emerald-500"></div>}
                        {missed > 0 && <div className="w-1 h-1 rounded-full bg-rose-500"></div>}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Qadah Tracker Table */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('qadah')} Table</h3>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div><span className="text-[7px] text-slate-400 font-bold">Done</span></div>
                <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div><span className="text-[7px] text-slate-400 font-bold">Missed</span></div>
                <div className="flex items-center gap-1"><i className="fas fa-leaf text-[7px] text-pink-400"></i><span className="text-[7px] text-slate-400 font-bold">Excused</span></div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden border border-slate-50 dark:border-slate-800 shadow-sm bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950">
               <div className="grid grid-cols-6 bg-emerald-50/50 dark:bg-emerald-950/10 p-4 border-b dark:border-slate-800">
                  <div className="text-[7px] font-black text-emerald-600 uppercase">Day</div>
                  {PRAYERS.map(p => (
                    <div key={p} className="text-[7px] font-black text-emerald-600 uppercase text-center truncate px-0.5">
                      {t(p).charAt(0)}
                    </div>
                  ))}
               </div>
               
               <div className="max-h-[350px] overflow-y-auto no-scrollbar">
                 {days.slice().reverse().map(d => {
                   const l = state.prayerLogs[d] || {};
                   const excused = isExcused(d);
                   return (
                     <div key={d} className={`grid grid-cols-6 p-4 border-b last:border-0 dark:border-slate-800/50 transition-colors ${excused ? 'bg-pink-50/5 dark:bg-pink-900/5 grayscale opacity-60' : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/50'}`}>
                        <div className={`text-[9px] font-black ${excused ? 'text-pink-300' : 'text-slate-400'}`}>{d.split('-')[2]}</div>
                        {PRAYERS.map(p => (
                          <button 
                            key={p} 
                            disabled={excused}
                            onClick={() => !excused && updatePrayerStatus(d, p, l[p] === PrayerStatus.COMPLETED ? PrayerStatus.PENDING : PrayerStatus.COMPLETED)}
                            className={`flex justify-center items-center h-4 w-full transition-all ${excused ? 'cursor-not-allowed' : 'active:scale-90'}`}
                          >
                             {excused ? (
                               <i className="fas fa-leaf text-[8px] text-pink-200 dark:text-pink-900/40"></i>
                             ) : (
                               <i className={`fas ${l[p] === PrayerStatus.COMPLETED ? 'fa-check-circle text-emerald-500' : l[p] === PrayerStatus.MISSED ? 'fa-times-circle text-rose-500' : 'fa-circle text-slate-100 dark:text-slate-800'} text-[10px]`}></i>
                             )}
                          </button>
                        ))}
                     </div>
                   );
                 })}
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrayerCalendar;