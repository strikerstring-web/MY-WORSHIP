
import React, { useState, useMemo } from 'react';
import { UserData, FastingLog, PrayerTimings, HealthPeriod } from '../types';

interface FastingTrackerProps {
  state: UserData & { todayTimings: PrayerTimings | null };
  updateFasting: (date: string, log: FastingLog) => void;
  setCurrentView: (view: any) => void;
  t: (key: string) => string;
}

const FastingTracker: React.FC<FastingTrackerProps> = ({ state, updateFasting, setCurrentView, t }) => {
  const [subView, setSubView] = useState<'stats' | 'ramadan' | 'sunnah'>('stats');
  const selectedYear = '1446H';
  const ramadanDays = Array.from({ length: 30 }, (_, i) => i + 1);

  const getRamadanLog = (day: number) => {
    const ramadanStartDate = new Date("2025-03-01");
    const targetDate = new Date(ramadanStartDate);
    targetDate.setDate(targetDate.getDate() + (day - 1));
    const h = state.healthPeriods.some(p => {
      const start = new Date(p.start).getTime(), end = p.end ? new Date(p.end).getTime() : new Date().getTime() + 8640000000;
      return targetDate.getTime() >= start && targetDate.getTime() <= end;
    });
    if (h) return { status: 'excused', type: 'ramadan' } as FastingLog;
    return state.fastingLogs[`ramadan-${selectedYear}-${day}`] || { status: 'none', type: 'ramadan' };
  };

  const toggle = (day: number) => {
    const log = getRamadanLog(day);
    if (log.status === 'excused') return;
    const next: FastingLog['status'] = log.status === 'none' ? 'completed' : log.status === 'completed' ? 'missed' : 'none';
    updateFasting(`ramadan-${selectedYear}-${day}`, { status: next, type: 'ramadan' });
  };

  const stats = useMemo(() => {
    let c = 0, m = 0, e = 0;
    ramadanDays.forEach(d => {
      const l = getRamadanLog(d);
      if (l.status === 'completed') c++; else if (l.status === 'missed') m++; else if (l.status === 'excused') e++;
    });
    return { completed: c, pendingQada: m + e };
  }, [state.fastingLogs, state.healthPeriods]);

  return (
    <div className="flex flex-col h-full bg-[#fdfbf7] overflow-hidden view-transition">
      <div className="p-4 pt-10 pb-4 bg-emerald-900 text-white shrink-0 shadow-lg rounded-b-[32px]">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => setCurrentView('dashboard')} className="w-8 h-8 flex items-center justify-center bg-white/10 rounded-lg"><i className="fas fa-chevron-left text-xs"></i></button>
          <h1 className="text-lg font-bold tracking-tight">{t('fasting')}</h1>
        </div>
        <div className="flex bg-white/5 p-1 rounded-xl">
          <button onClick={() => setSubView('stats')} className={`flex-1 py-1.5 rounded-lg text-[8px] font-black uppercase ${subView === 'stats' ? 'bg-white text-emerald-900' : 'text-white/60'}`}>Stats</button>
          <button onClick={() => setSubView('ramadan')} className={`flex-1 py-1.5 rounded-lg text-[8px] font-black uppercase ${subView === 'ramadan' ? 'bg-white text-emerald-900' : 'text-white/60'}`}>Ramadan</button>
          <button onClick={() => setSubView('sunnah')} className={`flex-1 py-1.5 rounded-lg text-[8px] font-black uppercase ${subView === 'sunnah' ? 'bg-white text-emerald-900' : 'text-white/60'}`}>Sunnah</button>
        </div>
      </div>

      <div className="flex-1 p-3 flex flex-col justify-around overflow-hidden">
        {subView === 'stats' && (
          <div className="space-y-4 animate-fade-up">
            <div className="bg-white p-5 rounded-2xl border border-emerald-50 text-center shadow-sm">
               <span className="text-[9px] font-black text-slate-400 uppercase">Fasting Progress</span>
               <div className="flex justify-around items-center mt-3">
                 <div><p className="text-2xl font-black text-emerald-600">{stats.completed}</p><p className="text-[7px] uppercase">Done</p></div>
                 <div className="h-8 w-px bg-slate-100"></div>
                 <div><p className="text-2xl font-black text-rose-600">{stats.pendingQada}</p><p className="text-[7px] uppercase">Qada Due</p></div>
               </div>
            </div>
            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
               <h4 className="text-amber-900 font-bold text-[8px] uppercase mb-1">Rulings</h4>
               <p className="text-amber-800/70 text-[9px] leading-tight font-semibold italic">Ramadan fasts missed due to illness or health periods must be recorded and made up (Qada) before the next Ramadan.</p>
            </div>
          </div>
        )}

        {subView === 'ramadan' && (
          <div className="flex-1 flex flex-col justify-between overflow-hidden animate-fade-up">
            <div className="flex-1 grid grid-cols-5 gap-1.5">
              {ramadanDays.map(day => {
                const log = getRamadanLog(day);
                return (
                  <button key={day} onClick={() => toggle(day)} className={`h-11 rounded-lg flex flex-col items-center justify-center border-2 ${log.status === 'completed' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : log.status === 'missed' ? 'bg-rose-50 border-rose-200 text-rose-700' : log.status === 'excused' ? 'bg-pink-50 border-pink-200 text-pink-700' : 'bg-slate-50 border-transparent text-slate-400'}`}>
                    <span className="text-[8px] font-black">{day}</span>
                    <i className={`fas ${log.status === 'completed' ? 'fa-check' : log.status === 'missed' ? 'fa-times' : log.status === 'excused' ? 'fa-droplet' : ''} text-[6px] mt-0.5`}></i>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {subView === 'sunnah' && (
          <div className="h-full flex items-center justify-center animate-fade-up text-center px-6">
            <div>
              <i className="fas fa-sun text-4xl text-amber-100 mb-3"></i>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Sunnah Tracking Coming Soon</p>
              <p className="text-slate-300 text-[8px] mt-1">Mondays, Thursdays, and Ayyam al-Bidh</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FastingTracker;
