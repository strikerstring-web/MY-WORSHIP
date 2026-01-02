
import React, { useState, useMemo } from 'react';
import { UserData, FastingLog, PrayerTimings, HealthPeriod } from '../types';

interface FastingTrackerProps {
  state: UserData & { todayTimings: PrayerTimings | null };
  updateFasting: (date: string, log: FastingLog) => void;
  setCurrentView: (view: any) => void;
  t: (key: string) => string;
}

const FastingTracker: React.FC<FastingTrackerProps> = ({ state, updateFasting, setCurrentView, t }) => {
  const [activeTab, setActiveTab] = useState<'ramadan' | 'daily'>('ramadan');
  const [selectedYear] = useState('1446H'); // Mock current Hijri year for exhibition

  const ramadanDays = Array.from({ length: 30 }, (_, i) => i + 1);

  const isDayInHayd = (day: number): boolean => {
    // Note: This is a simulation since Ramadan days aren't absolute dates without a start date.
    // For exhibition, we'll assume Ramadan 1446H starts on 2025-03-01
    const ramadanStartDate = new Date("2025-03-01");
    const targetDate = new Date(ramadanStartDate);
    targetDate.setDate(targetDate.getDate() + (day - 1));
    const dateStr = targetDate.toISOString().split('T')[0];

    return state.healthPeriods.some(p => {
      const start = new Date(p.start).getTime();
      const end = p.end ? new Date(p.end).getTime() : new Date().getTime() + (100 * 365 * 24 * 60 * 60 * 1000);
      return targetDate.getTime() >= start && targetDate.getTime() <= end;
    });
  };

  const getRamadanLog = (day: number) => {
    const key = `ramadan-${selectedYear}-${day}`;
    if (isDayInHayd(day)) return { status: 'excused', type: 'ramadan' } as FastingLog;
    return state.fastingLogs[key] || { status: 'none', type: 'ramadan' };
  };

  const toggleRamadanStatus = (day: number) => {
    if (isDayInHayd(day)) return; // Status is fixed as excused
    
    const key = `ramadan-${selectedYear}-${day}`;
    const current = getRamadanLog(day);
    let nextStatus: FastingLog['status'] = 'none';
    
    if (current.status === 'none') nextStatus = 'completed';
    else if (current.status === 'completed') nextStatus = 'missed';
    else nextStatus = 'none';

    updateFasting(key, { status: nextStatus, type: 'ramadan' });
    if (nextStatus === 'completed' && 'vibrate' in navigator) navigator.vibrate(50);
  };

  const stats = useMemo(() => {
    let completed = 0;
    let missed = 0;
    let excused = 0;
    ramadanDays.forEach(day => {
      const log = getRamadanLog(day);
      if (log.status === 'completed') completed++;
      if (log.status === 'missed') missed++;
      if (log.status === 'excused') excused++;
    });
    // Missed and Excused both require Qada according to rulings.
    return { completed, missed, excused, pendingQada: missed + excused };
  }, [state.fastingLogs, state.healthPeriods, ramadanDays]);

  return (
    <div className="flex flex-col h-full bg-[#fdfbf7] view-transition">
      <div className="p-4 pt-10 pb-6 bg-emerald-900 text-white flex flex-col gap-4 shadow-xl rounded-b-[40px] z-20 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => setCurrentView('dashboard')} className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-xl hover:bg-white/20 transition-all active-scale border border-white/10 rtl:rotate-180">
            <i className="fas fa-chevron-left text-xs"></i>
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight">{t('fasting')}</h1>
            <p className="text-[9px] text-emerald-300/80 font-bold uppercase tracking-[0.2em] mt-0.5">Spiritual Discipline</p>
          </div>
        </div>

        <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 backdrop-blur-md">
          <button onClick={() => setActiveTab('ramadan')} className={`flex-1 py-2.5 px-3 rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all ${activeTab === 'ramadan' ? 'bg-white text-emerald-900 shadow-lg' : 'text-white/60'}`}>Ramadan</button>
          <button onClick={() => setActiveTab('daily')} className={`flex-1 py-2.5 px-3 rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all ${activeTab === 'daily' ? 'bg-white text-emerald-900 shadow-lg' : 'text-white/60'}`}>Sunnah</button>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-hidden flex flex-col justify-around"> {/* No scroll here */}
        {activeTab === 'ramadan' ? (
          <div className="space-y-4 flex-1 flex flex-col justify-around animate-fade-up">
            <div className="grid grid-cols-2 gap-3 shrink-0">
              <div className="bg-white p-3 rounded-[28px] border border-emerald-50 shadow-sm flex flex-col items-center text-center">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{t('completed')}</span>
                <span className="text-2xl font-black text-emerald-600">{stats.completed}</span>
              </div>
              <div className="bg-white p-3 rounded-[28px] border border-rose-50 shadow-sm flex flex-col items-center text-center">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Pending Qadāʾ</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-rose-600">{stats.pendingQada}</span>
                  {stats.excused > 0 && <span className="text-[9px] text-pink-500 font-bold">(+{stats.excused} {t('excused')})</span>}
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-[32px] shadow-sm border border-emerald-50/50 relative overflow-hidden flex-1 flex flex-col justify-between">
               <div className="absolute top-0 right-0 p-2 opacity-[0.02] rotate-12"><i className="fas fa-moon text-7xl"></i></div>
               <div className="flex justify-between items-center mb-4 relative z-10 shrink-0">
                 <div>
                    <h3 className="text-base font-black text-emerald-900">Ramadan {selectedYear}</h3>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Exemption Logic Enabled</p>
                 </div>
               </div>

               <div className="grid grid-cols-5 gap-1.5 overflow-hidden flex-1">
                 {ramadanDays.map(day => {
                   const log = getRamadanLog(day);
                   return (
                     <button
                       key={day}
                       onClick={() => toggleRamadanStatus(day)}
                       className={`h-10 rounded-lg flex flex-col items-center justify-center transition-all active-scale relative border-2 ${
                         log.status === 'completed' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
                         log.status === 'missed' ? 'bg-rose-50 border-rose-100 text-rose-700' :
                         log.status === 'excused' ? 'bg-pink-50 border-pink-100 text-pink-700 bg-[radial-gradient(#fbcfe8_1px,transparent_1px)] [background-size:3px_3px]' :
                         'bg-slate-50 border-transparent text-slate-400'
                       }`}
                     >
                       <span className="text-[10px] font-black">{day}</span>
                       <div className="mt-0.5">
                         {log.status === 'completed' && <i className="fas fa-check text-[9px]"></i>}
                         {log.status === 'missed' && <i className="fas fa-xmark text-[9px]"></i>}
                         {log.status === 'excused' && <i className="fas fa-droplet text-[7px]"></i>}
                       </div>
                     </button>
                   );
                 })}
               </div>
            </div>
            
            <div className="bg-amber-50 p-3 rounded-[28px] border border-amber-100 shrink-0">
               <h4 className="text-amber-900 font-bold text-[9px] mb-1.5 uppercase tracking-widest">Women's Fasting Note</h4>
               <p className="text-amber-800/70 text-[8px] leading-relaxed font-semibold">
                 Days highlighted in pink are exempted from fasting due to Hayd or Nifās. <b>Important:</b> Islamic law requires these fasts to be made up later, which is why they are included in your total Qadāʾ count.
               </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6 flex-1 flex flex-col justify-center animate-fade-up">
            <div className="bg-white p-4 rounded-[32px] shadow-sm border border-emerald-50/50 text-center py-16">
               <i className="fas fa-sun text-3xl text-emerald-100 mb-3"></i>
               <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Sunnah Tracking Coming Soon</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FastingTracker;
