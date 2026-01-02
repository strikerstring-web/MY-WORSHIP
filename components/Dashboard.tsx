
import React, { useMemo, useState, useEffect } from 'react';
import { AppState, Language, PrayerTimings, PrayerStatus, UserData } from '../types';
import { HADITHS, PRAYERS } from '../constants';

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
  const [animatingPrayer, setAnimatingPrayer] = useState<string | null>(null);
  const [currentTimeMinutes, setCurrentTimeMinutes] = useState<number>(() => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTimeMinutes(now.getHours() * 60 + now.getMinutes());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const todayLogs = state.prayerLogs[today] || {
    fajr: PrayerStatus.PENDING, dhuhr: PrayerStatus.PENDING, asr: PrayerStatus.PENDING, maghrib: PrayerStatus.PENDING, isha: PrayerStatus.PENDING
  };

  const handlePrayerToggle = (prayer: typeof PRAYERS[number]) => {
    if (state.isHaydNifas) return;
    const currentStatus = todayLogs[prayer];
    const newStatus = currentStatus === PrayerStatus.COMPLETED ? PrayerStatus.PENDING : PrayerStatus.COMPLETED;
    if (newStatus === PrayerStatus.COMPLETED) {
      setAnimatingPrayer(prayer);
      setTimeout(() => setAnimatingPrayer(null), 800);
      if ('vibrate' in navigator) navigator.vibrate([20, 40]);
    }
    updatePrayerStatus(today, prayer, newStatus);
  };

  const menuItems = [
    { id: 'fard', label: t('fard'), icon: 'fa-kaaba', color: 'from-emerald-50 to-emerald-100 text-emerald-800', iconColor: 'text-emerald-700' },
    { id: 'qibla', label: t('qibla'), icon: 'fa-compass', color: 'from-teal-50 to-teal-100 text-teal-800', iconColor: 'text-teal-700' },
    { id: 'qadah', label: t('qadah'), icon: 'fa-calendar-day', color: 'from-amber-50 to-emerald-50 text-emerald-900', iconColor: 'text-emerald-700' },
    { id: 'quran', label: t('quran'), icon: 'fa-book-open', color: 'from-blue-50 to-blue-100 text-blue-900', iconColor: 'text-blue-700' },
    { id: 'fasting', label: t('fasting'), icon: 'fa-moon', color: 'from-indigo-50 to-indigo-100 text-indigo-900', iconColor: 'text-indigo-700' },
    { id: 'dhikr', label: t('dhikr'), icon: 'fa-seedling', color: 'from-green-50 to-green-100 text-green-900', iconColor: 'text-green-700' },
    { id: 'zakat', label: t('zakat'), icon: 'fa-coins', color: 'from-rose-50 to-rose-100 text-rose-900', iconColor: 'text-rose-700' },
    ...(state.profile?.sex === 'female' ? [{ id: 'women', label: t('womensSpace'), icon: 'fa-leaf', color: 'from-rose-50 to-rose-100 text-rose-900', iconColor: 'text-rose-600' }] : [])
  ];

  const dailyHadith = useMemo(() => {
    const now = new Date();
    const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    return HADITHS[dayOfYear % HADITHS.length];
  }, []);

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
    return { next, timeLeft: `${Math.floor(diff / 60)}h ${diff % 60}m`, progress, activeName: prev.name, timingsMinutes };
  }, [state.todayTimings, currentTimeMinutes]);

  return (
    <div className="h-full w-full flex flex-col bg-slate-50/30 overflow-hidden view-transition pt-8">
      {/* Header Profile Section - Compact */}
      <header className="relative w-full bg-[#064e3b] text-white pt-6 pb-8 px-4 rounded-b-[32px] shadow-lg shrink-0">
        <div className="relative z-10 w-full flex flex-col gap-3">
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center border border-white/20">
                <i className="fas fa-user text-emerald-200 text-xs"></i>
              </div>
              <h1 className="text-sm font-bold truncate max-w-[120px]">{state.profile?.name}</h1>
            </div>
            <div className="flex gap-1">
              <button onClick={() => setCurrentView('about')} className="w-7 h-7 rounded-full flex items-center justify-center bg-white/10"><i className="fas fa-info text-[9px]"></i></button>
              <button onClick={toggleNotifications} className={`w-7 h-7 rounded-full flex items-center justify-center ${state.settings.notificationsEnabled ? 'bg-gold-classic' : 'bg-white/10'}`}><i className={`fas ${state.settings.notificationsEnabled ? 'fa-bell' : 'fa-bell-slash'} text-[9px]`}></i></button>
              <button onClick={onLogout} className="w-7 h-7 bg-white/10 rounded-full flex items-center justify-center"><i className="fas fa-power-off text-[9px] text-rose-300"></i></button>
            </div>
          </div>
          
          <div className="flex gap-1.5">
            <div className="flex-1 bg-white/5 p-2 rounded-xl border border-white/10">
              <span className="text-[7px] text-emerald-300/60 uppercase font-black block">{t('dhikr')}</span>
              <span className="text-sm font-black tabular-nums">{state.dhikrCount.toLocaleString()}</span>
            </div>
            <div className="flex-1 bg-white/5 p-2 rounded-xl border border-white/10">
              <span className="text-[7px] text-emerald-300/60 uppercase font-black block">{t('lastRead')}</span>
              <span className="text-[10px] font-bold truncate block">{state.quranProgress.surah || '---'}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Scroll-free content area */}
      <div className="flex-1 px-3 flex flex-col justify-around py-2 overflow-hidden">
        {/* Next Prayer - Tighter */}
        <div className="bg-white p-3 rounded-2xl shadow-sm border border-emerald-50 relative overflow-hidden">
          <div className="flex items-center justify-between gap-2">
            <div className="ltr:text-left">
              <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">{t('nextPrayer')}</span>
              <div className="flex items-center gap-1">
                <h2 className="text-lg font-black text-emerald-900 capitalize">{prayerTimingData ? t(prayerTimingData.next.name) : '--'}</h2>
                <span className="text-[7px] font-bold text-emerald-700 bg-emerald-50 px-1 rounded">{prayerTimingData?.next.time}</span>
              </div>
            </div>
            <div className="ltr:text-right">
              <span className="text-lg font-black text-gold-classic tabular-nums">{prayerTimingData?.timeLeft || '--:--'}</span>
              <span className="text-[7px] font-bold text-slate-400 block uppercase">Left</span>
            </div>
          </div>
          <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden mt-2">
            <div className="bg-emerald-600 h-full rounded-full transition-all duration-1000" style={{ width: `${prayerTimingData?.progress || 0}%` }}></div>
          </div>
        </div>

        {/* Hadith - Ultra compact */}
        <div className="bg-white p-3 rounded-2xl border border-emerald-50 shadow-sm overflow-hidden">
          <span className="bg-emerald-600/10 text-emerald-800 text-[6px] font-black px-1.5 py-0.5 rounded-full uppercase mb-1 inline-block">HADITH</span>
          <p className="text-emerald-900 arabic-font text-[11px] leading-tight text-right mb-1" dir="rtl">{dailyHadith.arabic}</p>
          <p className="text-slate-500 italic text-[8px] leading-tight line-clamp-2">"{dailyHadith[userLang]}"</p>
        </div>

        {/* Prayer Grid Summary - Tighter */}
        <div className="bg-white p-3 rounded-2xl shadow-sm border border-emerald-50">
          <div className="flex justify-between items-center mb-2">
             <h3 className="text-[8px] font-black text-emerald-900 uppercase">{t('todayPrayers')}</h3>
             {state.isHaydNifas && <span className="text-[6px] px-1 bg-rose-50 text-rose-600 rounded-full">{t('excused')}</span>}
          </div>
          <div className="grid grid-cols-5 gap-1">
            {PRAYERS.map((p) => {
              const status = todayLogs[p];
              return (
                <button key={p} disabled={state.isHaydNifas} onClick={() => handlePrayerToggle(p)} className={`flex flex-col items-center p-1.5 rounded-xl border ${status === PrayerStatus.COMPLETED ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-slate-50 border-transparent text-slate-400'} ${state.isHaydNifas ? 'opacity-40' : ''}`}>
                  <span className="text-[6px] font-black uppercase mb-1">{t(p).substring(0,3)}</span>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${status === PrayerStatus.COMPLETED ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-100'}`}>
                    <i className={`fas ${status === PrayerStatus.COMPLETED ? 'fa-check' : 'fa-circle'} text-[6px]`}></i>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation Grid - 2x4 for perfect fit */}
        <div className="grid grid-cols-4 gap-2">
          {menuItems.map((item) => (
            <button key={item.id} onClick={() => setCurrentView(item.id)} className={`flex flex-col items-center justify-center p-2 rounded-2xl bg-gradient-to-br ${item.color} border border-white shadow-sm active-scale`}>
              <i className={`fas ${item.icon} text-sm mb-1 ${item.iconColor}`}></i>
              <span className="text-[7px] font-black text-center uppercase tracking-tighter truncate w-full">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
