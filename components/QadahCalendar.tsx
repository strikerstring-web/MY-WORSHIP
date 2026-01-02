
import React, { useState, useMemo } from 'react';
import { UserData, PrayerStatus, QadaReminder, PrayerTimings, HealthPeriod } from '../types';
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
  const [animatingPrayer, setAnimatingPrayer] = useState<string | null>(null);
  const [showRemindersModal, setShowRemindersModal] = useState(false); // Modal for reminders

  const month = viewDate.getMonth();
  const year = viewDate.getFullYear();
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
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      arr.push(dateStr);
    }
    return arr;
  }, [month, year]);

  const getDaySummary = (dateStr: string) => {
    if (isDateInHayd(dateStr)) return 'excused';
    const logs = state.prayerLogs[dateStr];
    if (!logs) return 'none';
    const values = Object.values(logs);
    if (values.every(v => v === PrayerStatus.COMPLETED || v === PrayerStatus.EXCUSED)) return 'completed';
    if (values.some(v => v === PrayerStatus.MISSED)) return 'missed';
    return 'pending';
  };

  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));
  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const monthName = viewDate.toLocaleString(state.profile?.preferredLanguage || 'en', { month: 'long' });

  const stats = useMemo(() => {
    let missed = 0;
    let excused = 0;
    Object.keys(state.prayerLogs).forEach(date => {
      const day = state.prayerLogs[date];
      PRAYERS.forEach(p => {
        if (day[p] === PrayerStatus.MISSED) missed++;
        if (day[p] === PrayerStatus.EXCUSED) excused++;
      });
    });
    // For this summary, we only count what's explicitly logged or excused within logs.
    return { missed, excused };
  }, [state.prayerLogs]);

  const selectedDayLogs = selectedDate ? (state.prayerLogs[selectedDate] || {
    fajr: PrayerStatus.PENDING, dhuhr: PrayerStatus.PENDING, asr: PrayerStatus.PENDING, maghrib: PrayerStatus.PENDING, isha: PrayerStatus.PENDING
  }) : null;

  const handleStatusChange = (prayer: string, status: PrayerStatus) => {
    if (selectedDate) {
      if (status === PrayerStatus.COMPLETED) {
        setAnimatingPrayer(prayer);
        setTimeout(() => setAnimatingPrayer(null), 800);
      }
      updatePrayerStatus(selectedDate, prayer as any, status);
    }
  };

  // Reminder Logic (simplified for non-scrolling, would be in a modal)
  const [reminders, setLocalReminders] = useState<QadaReminder[]>(state.settings.qadaReminders);
  const addLocalReminder = () => {
    setLocalReminders([...reminders, { id: Date.now().toString(), time: '00:00', enabled: true }]);
  };
  const updateLocalReminder = (id: string, newTime: string, enabled: boolean) => {
    setLocalReminders(reminders.map(r => r.id === id ? { ...r, time: newTime, enabled: enabled } : r));
  };
  const removeLocalReminder = (id: string) => {
    setLocalReminders(reminders.filter(r => r.id !== id));
  };
  const saveReminders = () => {
    updateReminders(reminders);
    setShowRemindersModal(false);
  };

  return (
    <div className="flex flex-col h-full bg-[#fdfbf7] animate-fade-up relative">
      <div className="p-4 pt-10 pb-6 bg-[#064e3b] text-white flex items-center justify-between shadow-xl rounded-b-[40px] z-20 relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12">
           <i className="fas fa-kaaba text-7xl"></i>
        </div>
        <div className="flex items-center gap-3 relative z-10">
          <button onClick={() => setCurrentView('dashboard')} className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-xl hover:bg-white/20 border border-white/10 transition-all active:scale-90 rtl:rotate-180 shadow-md">
            <i className="fas fa-chevron-left text-xs"></i>
          </button>
          <div>
            <h1 className="text-xl font-black tracking-tight">{t('qadah')}</h1>
            <p className="text-[9px] text-emerald-300 font-black uppercase tracking-[0.2em]">{monthName} {year}</p>
          </div>
        </div>
        <div className="flex gap-1.5 relative z-10">
          <div className="bg-rose-500/20 px-2 py-1.5 rounded-lg border border-rose-500/30 flex items-center gap-1 backdrop-blur-sm">
             <span className="text-xs font-black text-rose-100">{stats.missed}</span>
             <span className="text-[7px] font-black uppercase text-rose-200/60">Qada</span>
          </div>
          <div className="bg-pink-500/20 px-2 py-1.5 rounded-lg border border-pink-500/30 flex items-center gap-1 backdrop-blur-sm">
             <span className="text-xs font-black text-pink-100">{stats.excused}</span>
             <span className="text-[7px] font-black uppercase text-pink-200/60">Excused</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col flex-1 overflow-hidden"> {/* No scroll here */}
        <div className="px-4 pt-4 flex items-center justify-between mb-3 shrink-0">
          <button onClick={prevMonth} className="w-10 h-10 flex items-center justify-center text-emerald-900 bg-white shadow-sm border border-emerald-50 rounded-xl transition-all hover:bg-emerald-50 active:scale-90 rtl:rotate-180">
            <i className="fas fa-chevron-left text-xs"></i>
          </button>
          <h2 className="text-base font-black text-[#064e3b] tracking-tight">{monthName} {year}</h2>
          <button onClick={nextMonth} className="w-10 h-10 flex items-center justify-center text-emerald-900 bg-white shadow-sm border border-emerald-50 rounded-xl transition-all hover:bg-emerald-50 active:scale-90 rtl:rotate-180">
            <i className="fas fa-chevron-right text-xs"></i>
          </button>
        </div>

        <div className="px-4 pb-3 shrink-0">
          <div className="grid grid-cols-7 text-center mb-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
              <span key={d} className="text-[8px] font-black text-slate-300 tracking-[0.2em]">{d}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((dateStr, idx) => {
              if (!dateStr) return <div key={`empty-${idx}`} className="h-8" />;
              const summary = getDaySummary(dateStr);
              const isSelected = selectedDate === dateStr;
              const isToday = dateStr === new Date().toISOString().split('T')[0];
              const dayNum = dateStr.split('-')[2];

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`h-8 rounded-lg flex flex-col items-center justify-center relative transition-all active:scale-90 border-2 ${
                    isSelected ? 'border-emerald-600 shadow-md' : 'border-transparent'
                  } ${
                    summary === 'completed' ? 'bg-emerald-50 text-emerald-800' :
                    summary === 'missed' ? 'bg-rose-50 text-rose-800' :
                    summary === 'excused' ? 'bg-pink-50 text-pink-700 bg-[radial-gradient(#fbcfe8_1px,transparent_1px)] [background-size:3px_3px]' : 'bg-white shadow-sm text-slate-400'
                  }`}
                >
                  <span className={`text-[10px] font-black ${isToday ? 'text-emerald-600 underline decoration-2' : ''}`}>{parseInt(dayNum)}</span>
                </button>
              );
            })}
          </div>
        </div>

        {selectedDate && (
          <div className="px-4 py-2 flex-1 overflow-hidden flex flex-col"> {/* No scroll here, inner content managed by flex */}
            <div className="bg-white rounded-[28px] p-4 shadow-xl shadow-emerald-900/5 border border-emerald-50/50 mb-3 animate-fade-up shrink-0">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-[8px] font-black text-emerald-800/40 uppercase tracking-[0.2em] mb-0.5">Journal Entry</p>
                  <h3 className="text-sm font-black text-[#064e3b]">
                    {new Date(selectedDate).toLocaleDateString(state.profile?.preferredLanguage || 'en', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </h3>
                </div>
                {isDateInHayd(selectedDate) && (
                  <div className="bg-pink-50 text-pink-600 px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border border-pink-100">
                    {t('excused')}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                {PRAYERS.map(prayer => {
                  const status = isDateInHayd(selectedDate) ? PrayerStatus.EXCUSED : (selectedDayLogs?.[prayer] || PrayerStatus.PENDING);
                  return (
                    <div key={prayer} className={`flex items-center justify-between p-3 rounded-[16px] border transition-all ${
                      status === PrayerStatus.EXCUSED ? 'bg-pink-50/30 border-pink-100' :
                      status === PrayerStatus.COMPLETED ? 'bg-emerald-50/50 border-emerald-100' : 
                      status === PrayerStatus.MISSED ? 'bg-rose-50/50 border-rose-100' : 'bg-slate-50/50 border-slate-100'
                    }`}>
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                          status === PrayerStatus.EXCUSED ? 'bg-pink-100 text-pink-500' :
                          status === PrayerStatus.COMPLETED ? 'bg-emerald-100 text-emerald-700' :
                          status === PrayerStatus.MISSED ? 'bg-rose-100 text-rose-700' : 'bg-white text-slate-300'
                        }`}>
                          <i className={`fas ${status === PrayerStatus.EXCUSED ? 'fa-leaf' : (status === PrayerStatus.COMPLETED ? 'fa-check' : 'fa-clock')} text-[9px]`}></i>
                        </div>
                        <span className="capitalize font-black text-xs text-[#064e3b] tracking-wide">{t(prayer)}</span>
                      </div>
                      
                      {!isDateInHayd(selectedDate) && (
                        <div className="flex gap-1.5">
                           <button onClick={() => handleStatusChange(prayer, status === PrayerStatus.COMPLETED ? PrayerStatus.PENDING : PrayerStatus.COMPLETED)} className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${status === PrayerStatus.COMPLETED ? 'bg-emerald-600 text-white' : 'bg-white text-slate-200 border border-slate-100'}`}>
                             <i className="fas fa-check text-[9px]"></i>
                           </button>
                           <button onClick={() => handleStatusChange(prayer, status === PrayerStatus.MISSED ? PrayerStatus.PENDING : PrayerStatus.MISSED)} className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${status === PrayerStatus.MISSED ? 'bg-rose-500 text-white' : 'bg-white text-slate-200 border border-slate-100'}`}>
                             <i className="fas fa-times text-[9px]"></i>
                           </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Reminders button */}
            <button onClick={() => setShowRemindersModal(true)} className="w-full py-2 bg-emerald-50 text-emerald-700 rounded-2xl font-black text-[9px] uppercase tracking-widest border border-emerald-100 shadow-sm active:scale-95 transition-all shrink-0">
              {t('qadaReminders')}
            </button>
          </div>
        )}
      </div>

      {/* Reminders Modal - this will take over the screen */}
      {showRemindersModal && (
        <div className="absolute inset-0 bg-[#fdfbf7] flex flex-col p-4 z-30 animate-fade-up">
          <div className="p-4 bg-[#064e3b] text-white flex items-center gap-3 shadow-xl rounded-[28px] z-20 shrink-0 mb-4">
            <button onClick={() => setShowRemindersModal(false)} className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-xl hover:bg-white/20 border border-white/10 transition-all active:scale-90 rtl:rotate-180">
              <i className="fas fa-chevron-left text-xs"></i>
            </button>
            <h1 className="text-lg font-black tracking-tight">{t('reminders')}</h1>
          </div>
          
          <div className="flex-1 overflow-hidden space-y-3 pb-4">
            {reminders.map((r, index) => (
              <div key={r.id} className="bg-white p-3 rounded-[24px] border border-emerald-50 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('time')}</span>
                  <input
                    type="time"
                    value={r.time}
                    onChange={(e) => updateLocalReminder(r.id, e.target.value, r.enabled)}
                    className="p-1 rounded-md bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-bold"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={r.enabled} onChange={(e) => updateLocalReminder(r.id, r.time, e.target.checked)} />
                    <div className="relative w-8 h-4 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                  <button onClick={() => removeLocalReminder(r.id)} className="w-8 h-8 rounded-lg text-rose-300 hover:text-rose-500 transition-colors"><i className="fas fa-trash text-xs"></i></button>
                </div>
              </div>
            ))}
            <button onClick={addLocalReminder} className="w-full py-2 bg-emerald-100 text-emerald-700 rounded-2xl font-black text-[9px] uppercase tracking-widest border border-emerald-200 shadow-sm active:scale-95 transition-all">
              {t('addReminder')}
            </button>
          </div>
          <button onClick={saveReminders} className="w-full py-3 bg-gold-classic text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all shrink-0">
            {t('save')} Reminders
          </button>
        </div>
      )}
    </div>
  );
};

export default QadahCalendar;
