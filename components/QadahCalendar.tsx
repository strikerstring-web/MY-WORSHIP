import React, { useState, useMemo } from 'react';
import { UserData, PrayerStatus, QadaReminder, PrayerTimings, HealthPeriod, FastingLog } from '../types';
import { PRAYERS } from '../constants';

interface QadahCalendarProps {
  state: UserData & { todayTimings: PrayerTimings | null };
  updatePrayerStatus: (date: string, prayer: any, status: PrayerStatus) => void;
  updateReminders: (reminders: QadaReminder[]) => void;
  setCurrentView: (view: any) => void;
  t: (key: string) => string;
}

const QadahCalendar: React.FC<QadahCalendarProps> = ({ state, updatePrayerStatus, updateReminders, setCurrentView, t }) => {
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(new Date().toISOString().split('T')[0]);
  const [filter, setFilter] = useState<'all' | 'qadah' | 'fasting'>('all');

  const month = viewDate.getMonth(), year = viewDate.getFullYear();
  const todayStr = new Date().toISOString().split('T')[0];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const isDateInHayd = (dateStr: string): boolean => {
    const targetDate = new Date(dateStr).getTime();
    return state.healthPeriods.some(p => {
      const start = new Date(p.start).getTime();
      const end = p.end ? new Date(p.end).getTime() : new Date().getTime() + (100 * 365 * 24 * 60 * 60 * 1000);
      return targetDate >= start && targetDate <= end;
    });
  };

  const days = useMemo(() => {
    const arr = [];
    for (let i = 0; i < firstDayOfMonth; i++) arr.push(null);
    for (let i = 1; i <= daysInMonth; i++) {
      arr.push(`${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`);
    }
    return arr;
  }, [month, year]);

  // Statistics for the current month view
  const monthlyStats = useMemo(() => {
    let completed = 0;
    let missed = 0;
    let qadahPending = 0;
    let fastingCount = 0;

    days.forEach(dateStr => {
      if (!dateStr) return;
      const logs = state.prayerLogs[dateStr];
      const fastingLog = (state.fastingLogs[`ramadan-1446H-${dateStr.split('-')[2]}`] || // Simplified mapping for example
                        Object.entries(state.fastingLogs).find(([k]) => k.includes(dateStr))?.[1]) as FastingLog | undefined;

      if (fastingLog?.status === 'completed') fastingCount++;

      if (logs) {
        PRAYERS.forEach(p => {
          if (logs[p] === PrayerStatus.COMPLETED) completed++;
          if (logs[p] === PrayerStatus.MISSED) {
            missed++;
            qadahPending++;
          }
        });
      }
    });
    return { completed, missed, qadahPending, fastingCount };
  }, [days, state.prayerLogs, state.fastingLogs]);

  const handleStatus = (prayer: string, status: PrayerStatus) => {
    if (selectedDate) updatePrayerStatus(selectedDate, prayer as any, status);
  };

  const monthName = viewDate.toLocaleString('default', { month: 'long' });

  return (
    <div className="flex flex-col h-full bg-[#fdfbf7] dark:bg-slate-900 overflow-hidden animate-fade-in">
      {/* Sticky Header */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 pt-12 pb-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setCurrentView('dashboard')} 
              className="w-11 h-11 flex items-center justify-center bg-emerald-50 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 rounded-2xl border border-emerald-100 dark:border-slate-700 active:scale-95 transition-transform"
            >
              <i className="fas fa-arrow-left"></i>
            </button>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{monthName}</h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{year}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setViewDate(new Date(year, month - 1, 1))} 
              className="w-10 h-10 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400 hover:text-emerald-600 transition-colors"
            >
              <i className="fas fa-chevron-left"></i>
            </button>
            <button 
              onClick={() => setViewDate(new Date(year, month + 1, 1))} 
              className="w-10 h-10 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400 hover:text-emerald-600 transition-colors"
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>

        {/* Summary Strip */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 text-center">
            <p className="text-[8px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">Done</p>
            <p className="text-lg font-black text-emerald-900 dark:text-emerald-50">{monthlyStats.completed}</p>
          </div>
          <div className="bg-rose-50 dark:bg-rose-900/20 p-3 rounded-2xl border border-rose-100 dark:border-rose-900/30 text-center">
            <p className="text-[8px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest mb-1">Missed</p>
            <p className="text-lg font-black text-rose-900 dark:text-rose-50">{monthlyStats.missed}</p>
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-2xl border border-amber-100 dark:border-amber-900/30 text-center">
            <p className="text-[8px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-1">Fasts</p>
            <p className="text-lg font-black text-amber-900 dark:text-amber-50">{monthlyStats.fastingCount}</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-6 pb-32">
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-3 mb-8">
          {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => (
            <div key={d} className="text-center text-[9px] font-black text-slate-300 dark:text-slate-600 py-2 uppercase tracking-widest">{d}</div>
          ))}
          
          {days.map((dateStr, idx) => {
            if (!dateStr) return <div key={`empty-${idx}`} className="h-16" />;
            
            const isSelected = selectedDate === dateStr;
            const isToday = dateStr === todayStr;
            const isHayd = isDateInHayd(dateStr);
            const dayNum = dateStr.split('-')[2];
            const logs = state.prayerLogs[dateStr];
            
            // Check for fasting log (simplified search)
            // Fix: Cast to FastingLog | undefined to resolve 'unknown' type error
            const fastingLog = Object.entries(state.fastingLogs).find(([k]) => k.includes(dateStr))?.[1] as FastingLog | undefined;

            return (
              <button 
                key={dateStr} 
                onClick={() => setSelectedDate(dateStr)} 
                className={`
                  relative h-20 rounded-2xl border-2 flex flex-col items-center justify-between p-2 transition-all active:scale-90
                  ${isSelected ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 shadow-lg shadow-emerald-500/10 z-10 scale-105' : 
                    isHayd ? 'border-pink-100 dark:border-pink-900/30 bg-pink-50/50 dark:bg-pink-900/10' : 
                    isToday ? 'border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-800' :
                    'border-slate-50 dark:border-slate-800 bg-white dark:bg-slate-800'}
                `}
              >
                <div className="flex justify-between w-full">
                  <span className={`text-xs font-black ${isSelected ? 'text-emerald-700 dark:text-emerald-400' : isHayd ? 'text-pink-600' : isToday ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {parseInt(dayNum)}
                  </span>
                  {fastingLog?.status === 'completed' && (
                    <i className="fas fa-moon text-[8px] text-amber-500"></i>
                  )}
                </div>

                {!isHayd && logs ? (
                  <div className="flex flex-wrap gap-0.5 justify-center w-full">
                    {PRAYERS.map(p => {
                      const s = logs[p];
                      return (
                        <div 
                          key={p} 
                          className={`w-1.5 h-1.5 rounded-full ${
                            s === PrayerStatus.COMPLETED ? 'bg-emerald-500' : 
                            s === PrayerStatus.MISSED ? 'bg-rose-500' : 
                            'bg-slate-100 dark:bg-slate-700'
                          }`}
                        ></div>
                      );
                    })}
                  </div>
                ) : isHayd ? (
                  <i className="fas fa-leaf text-[10px] text-pink-300"></i>
                ) : (
                  <div className="h-2"></div>
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Day View - Spacious Detail Card */}
        {selectedDate && (
          <div className="animate-fade-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <i className="fas fa-calendar-day text-emerald-600"></i>
                {new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' })}
              </h2>
              {isDateInHayd(selectedDate) && (
                <span className="px-3 py-1 bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-pink-100 dark:border-pink-900/30">
                  Excused Period
                </span>
              )}
            </div>

            <div className="space-y-3">
              {PRAYERS.map((prayer, idx) => {
                const logs = state.prayerLogs[selectedDate] || { fajr: 'pending', dhuhr: 'pending', asr: 'pending', maghrib: 'pending', isha: 'pending' };
                const s = isDateInHayd(selectedDate) ? PrayerStatus.EXCUSED : (logs[prayer as keyof typeof logs] || PrayerStatus.PENDING);
                
                return (
                  <div 
                    key={prayer} 
                    className={`
                      card-premium !p-5 flex items-center justify-between transition-all border
                      ${s === PrayerStatus.COMPLETED ? 'border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/30 dark:bg-emerald-900/5' : 
                        s === PrayerStatus.MISSED ? 'border-rose-100 dark:border-rose-900/30 bg-rose-50/30 dark:bg-rose-900/5' : 
                        'border-slate-100 dark:border-slate-800'}
                      ${isDateInHayd(selectedDate) ? 'opacity-60 grayscale' : ''}
                    `}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${
                        s === PrayerStatus.COMPLETED ? 'bg-emerald-500 text-white' : 
                        s === PrayerStatus.MISSED ? 'bg-rose-500 text-white' : 
                        'bg-slate-100 dark:bg-slate-700 text-slate-400'
                      }`}>
                        <i className={`fas ${s === PrayerStatus.COMPLETED ? 'fa-check' : s === PrayerStatus.MISSED ? 'fa-xmark' : 'fa-kaaba'}`}></i>
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900 dark:text-white capitalize">{t(prayer)}</h4>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          {s === PrayerStatus.COMPLETED ? 'Alhamdulillah' : s === PrayerStatus.MISSED ? 'Qadah Required' : 'Log your prayer'}
                        </p>
                      </div>
                    </div>

                    {!isDateInHayd(selectedDate) && (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleStatus(prayer, s === PrayerStatus.COMPLETED ? PrayerStatus.PENDING : PrayerStatus.COMPLETED)}
                          className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-all active:scale-95 ${
                            s === PrayerStatus.COMPLETED ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-300'
                          }`}
                        >
                          <i className="fas fa-check"></i>
                        </button>
                        <button 
                          onClick={() => handleStatus(prayer, s === PrayerStatus.MISSED ? PrayerStatus.PENDING : PrayerStatus.MISSED)}
                          className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-all active:scale-95 ${
                            s === PrayerStatus.MISSED ? 'bg-rose-600 border-rose-500 text-white' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-300'
                          }`}
                        >
                          <i className="fas fa-xmark"></i>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QadahCalendar;