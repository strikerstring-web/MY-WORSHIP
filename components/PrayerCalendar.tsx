import React, { useState, useMemo } from 'react';
import { UserData, PrayerStatus, PrayerTimings, FastingLog } from '../types';
import { PRAYERS } from '../constants';

interface PrayerCalendarProps {
  state: UserData & { todayTimings: PrayerTimings | null };
  updatePrayerStatus: (date: string, prayer: any, status: PrayerStatus) => void;
  setCurrentView: (view: any) => void;
  t: (key: string) => string;
}

const PrayerCalendar: React.FC<PrayerCalendarProps> = ({ state, updatePrayerStatus, setCurrentView, t }) => {
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(new Date().toISOString().split('T')[0]);

  const month = viewDate.getMonth();
  const year = viewDate.getFullYear();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const d = i + 1;
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  });

  const isExcused = (date: string) => state.healthPeriods.some(p => {
    const d = new Date(date).setHours(0, 0, 0, 0);
    const start = new Date(p.start).setHours(0, 0, 0, 0);
    const end = p.end ? new Date(p.end).setHours(23, 59, 59, 999) : new Date().setHours(23, 59, 59, 999);
    return d >= start && d <= end;
  });

  const getHijriDay = (date: string) => {
    try {
      const d = new Date(date);
      const parts = new Intl.DateTimeFormat('en-u-ca-islamic-uma-nu-latn', { day: 'numeric' }).formatToParts(d);
      return parts.find(p => p.type === 'day')?.value || '';
    } catch (e) { return ''; }
  };

  const getDayWorshipData = (date: string) => {
    const log = state.prayerLogs[date] || {};
    const sunnah = state.sunnahLogs[date] || [];
    const fasting = Object.entries(state.fastingLogs).find(([k, v]) => k.includes(date) || (k.startsWith('ramadan') && date === k.split('-').slice(2).join('-')))?.[1] as FastingLog | undefined;
    
    // Check if dhikr was done on this date
    const dhikrDone = state.dhikrHistory.some(h => h.date.startsWith(date));
    
    // Check if quran was updated on this date
    const quranDone = state.quranProgress.lastUpdated.startsWith(date);

    return {
      fardCount: PRAYERS.filter(p => log[p] === PrayerStatus.COMPLETED).length,
      missedCount: PRAYERS.filter(p => log[p] === PrayerStatus.MISSED).length,
      sunnahCount: sunnah.length,
      isFasting: fasting?.status === 'completed',
      dhikrDone,
      quranDone,
      excused: isExcused(date)
    };
  };

  const selectedData = useMemo(() => getDayWorshipData(selectedDateStr), [selectedDateStr, state]);

  return (
    <div className="flex flex-col h-full bg-ivory dark:bg-slate-950 overflow-hidden view-transition">
      {/* Premium Header */}
      <header className="p-6 pt-12 bg-gradient-to-br from-emerald-800 via-teal-900 to-emerald-950 text-white shrink-0 shadow-2xl rounded-b-[48px] relative z-20">
        <div className="flex justify-between items-center mb-8">
          <div className="flex flex-col">
            <h1 className="text-2xl font-black tracking-tight leading-none">
              {viewDate.toLocaleString('default', { month: 'long' })}
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] font-black text-emerald-300 uppercase tracking-widest">{year}</span>
              <span className="w-1 h-1 rounded-full bg-emerald-500/40"></span>
              <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Hijri {new Intl.DateTimeFormat('en-u-ca-islamic-uma-nu-latn', { year: 'numeric' }).format(viewDate)}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setViewDate(new Date(year, month - 1, 1))} className="w-11 h-11 bg-white/10 rounded-2xl flex items-center justify-center hover:bg-white/20 transition-all active:scale-90 border border-white/10">
              <i className="fas fa-chevron-left text-sm"></i>
            </button>
            <button onClick={() => setViewDate(new Date(year, month + 1, 1))} className="w-11 h-11 bg-white/10 rounded-2xl flex items-center justify-center hover:bg-white/20 transition-all active:scale-90 border border-white/10">
              <i className="fas fa-chevron-right text-sm"></i>
            </button>
          </div>
        </div>

        {/* Calendar Grid Header */}
        <div className="grid grid-cols-7 gap-1 px-1">
          {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((d, i) => (
            <div key={i} className="text-center text-[8px] font-black text-emerald-300 uppercase tracking-[0.2em] opacity-40">{d}</div>
          ))}
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-4 pt-6 pb-32 no-scrollbar">
        <div className="content-limit w-full">
          
          {/* Monthly Grid */}
          <div className="grid grid-cols-7 gap-3 mb-8 animate-fade-up">
            {Array(firstDay).fill(null).map((_, i) => <div key={`empty-${i}`} className="aspect-square" />)}
            {days.map(d => {
              const { fardCount, missedCount, isFasting, dhikrDone, quranDone, excused } = getDayWorshipData(d);
              const isSelected = selectedDateStr === d;
              const isToday = d === new Date().toISOString().split('T')[0];
              const dayNum = d.split('-')[2];
              const hijriDay = getHijriDay(d);

              return (
                <button 
                  key={d} 
                  onClick={() => setSelectedDateStr(d)}
                  className={`
                    relative aspect-square rounded-[1.25rem] border-2 flex flex-col items-center justify-center gap-1 transition-all duration-300
                    ${isSelected ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 shadow-xl shadow-emerald-500/10 scale-110 z-10' : 
                      excused ? 'bg-rose-50/10 border-rose-100/50 dark:bg-rose-900/10 dark:border-rose-900/30' : 
                      isToday ? 'border-teal-500/30 bg-white dark:bg-slate-900 shadow-sm' :
                      'bg-white dark:bg-slate-900 border-slate-50 dark:border-slate-800 shadow-sm'}
                  `}
                >
                  <div className="flex flex-col items-center">
                    <span className={`text-[11px] font-black leading-none ${isSelected ? 'text-emerald-600 dark:text-emerald-400' : excused ? 'text-rose-400' : 'text-slate-900 dark:text-emerald-100'}`}>
                      {parseInt(dayNum)}
                    </span>
                    <span className="text-[6px] font-bold text-slate-400 mt-0.5 opacity-60">{hijriDay}</span>
                  </div>
                  
                  <div className="flex flex-wrap justify-center gap-[2px] px-1">
                    {excused ? (
                      <i className="fas fa-leaf text-[7px] text-rose-300/60"></i>
                    ) : (
                      <>
                        {fardCount > 0 && <div className="w-1 h-1 rounded-full bg-emerald-500"></div>}
                        {missedCount > 0 && <div className="w-1 h-1 rounded-full bg-rose-500"></div>}
                        {dhikrDone && <div className="w-1 h-1 rounded-full bg-blue-500"></div>}
                        {quranDone && <div className="w-1 h-1 rounded-full bg-purple-500"></div>}
                        {isFasting && <div className="w-1 h-1 rounded-full bg-amber-500"></div>}
                      </>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Day Details Card */}
          <div className="animate-fade-up stagger-1">
            <div className="card-premium !p-6 bg-white dark:bg-slate-900/50 border-emerald-50 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('summary')}</h3>
                  <h2 className="text-xl font-black text-emerald-950 dark:text-white tracking-tight">
                    {new Date(selectedDateStr).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' })}
                  </h2>
                </div>
                {selectedData.excused && (
                  <span className="px-3 py-1 bg-rose-50 dark:bg-rose-900/20 text-rose-500 text-[8px] font-black uppercase tracking-widest rounded-full border border-rose-100 dark:border-rose-800/30">
                    <i className="fas fa-leaf mr-1"></i> {t('excused')}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100/50 dark:border-emerald-900/20">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${selectedData.fardCount === 5 ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-white dark:bg-slate-800 text-emerald-600'}`}>
                    <i className="fas fa-kaaba"></i>
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{t('fard')}</p>
                    <p className="text-sm font-black text-emerald-950 dark:text-white">{selectedData.fardCount}/5</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100/50 dark:border-blue-900/20">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${selectedData.dhikrDone ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-white dark:bg-slate-800 text-blue-600'}`}>
                    <i className="fas fa-fingerprint"></i>
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{t('dhikr')}</p>
                    <p className="text-sm font-black text-emerald-950 dark:text-white">{selectedData.dhikrDone ? 'Active' : 'Pending'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-900/10 border border-purple-100/50 dark:border-purple-900/20">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${selectedData.quranDone ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20' : 'bg-white dark:bg-slate-800 text-purple-600'}`}>
                    <i className="fas fa-book-quran"></i>
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{t('quran')}</p>
                    <p className="text-sm font-black text-emerald-950 dark:text-white">{selectedData.quranDone ? 'Read' : 'Pending'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100/50 dark:border-amber-900/20">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${selectedData.isFasting ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-white dark:bg-slate-800 text-amber-600'}`}>
                    <i className="fas fa-moon"></i>
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{t('fasting')}</p>
                    <p className="text-sm font-black text-emerald-950 dark:text-white">{selectedData.isFasting ? 'Fasting' : 'None'}</p>
                  </div>
                </div>
              </div>

              {/* Legend Summary */}
              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap justify-center gap-4">
                 <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Prayers</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                    <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Dhikr</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                    <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Quran</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                    <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Fast</span>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrayerCalendar;