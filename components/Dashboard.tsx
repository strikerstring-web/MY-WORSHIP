
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
    { id: 'fard', label: t('fard'), icon: 'fa-kaaba', color: 'bg-white text-emerald-800', iconBg: 'bg-emerald-50' },
    { id: 'qibla', label: t('qibla'), icon: 'fa-compass', color: 'bg-white text-teal-800', iconBg: 'bg-teal-50' },
    { id: 'qadah', label: t('qadah'), icon: 'fa-calendar-day', color: 'bg-white text-amber-900', iconBg: 'bg-amber-50' },
    { id: 'quran', label: t('quran'), icon: 'fa-book-open', color: 'bg-white text-blue-900', iconBg: 'bg-blue-50' },
    { id: 'fasting', label: t('fasting'), icon: 'fa-moon', color: 'bg-white text-indigo-900', iconBg: 'bg-indigo-50' },
    { id: 'dhikr', label: t('dhikr'), icon: 'fa-seedling', color: 'bg-white text-green-900', iconBg: 'bg-green-50' },
    { id: 'account', label: t('myAccount'), icon: 'fa-user-circle', color: 'bg-white text-gold-900', iconBg: 'bg-[#f3e9d2]' },
    ...(state.profile?.sex === 'female' ? [{ id: 'women', label: t('womensSpace'), icon: 'fa-leaf', color: 'bg-white text-rose-900', iconBg: 'bg-rose-50' }] : [])
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
    <div className="h-full w-full flex flex-col bg-[#f8fafc] overflow-hidden view-transition pt-10 sm:pt-14 lg:pt-16">
      {/* Header Profile Section */}
      <header className="relative w-full bg-[#064e3b] text-white pt-6 pb-10 px-6 sm:px-8 rounded-b-[42px] sm:rounded-b-[54px] shadow-emerald-premium shrink-0">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#c5a059] opacity-[0.07] rounded-full blur-[60px] -mr-20 -mt-20"></div>
        <div className="relative z-10 w-full flex flex-col gap-4">
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-3">
              <div 
                onClick={() => setCurrentView('account')}
                className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-xl sm:rounded-2xl flex items-center justify-center border border-white/20 backdrop-blur-md cursor-pointer active:scale-90 transition-all"
              >
                <i className="fas fa-user text-emerald-200 text-sm sm:text-base"></i>
              </div>
              <div>
                <span className="text-[9px] sm:text-[10px] font-black text-emerald-300 uppercase tracking-widest block opacity-70">Marhaban</span>
                <h1 className="text-base sm:text-lg font-bold truncate max-w-[140px] sm:max-w-[200px] tracking-tight">{state.profile?.name}</h1>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setCurrentView('about')} className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center bg-white/10 border border-white/10 hover:bg-white/20 transition-all active:scale-95"><i className="fas fa-info text-[10px] sm:text-xs"></i></button>
              <button onClick={toggleNotifications} className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center border transition-all active:scale-95 ${state.settings.notificationsEnabled ? 'bg-[#c5a059] border-[#c5a059] shadow-lg' : 'bg-white/10 border-white/10'}`}><i className={`fas ${state.settings.notificationsEnabled ? 'fa-bell' : 'fa-bell-slash'} text-[10px] sm:text-xs`}></i></button>
            </div>
          </div>
          
          <div className="flex gap-3">
            <div className="flex-1 bg-white/5 backdrop-blur-sm p-3 rounded-2xl sm:rounded-3xl border border-white/10">
              <span className="text-[7px] sm:text-[9px] text-emerald-300/80 uppercase font-black tracking-widest block mb-0.5">{t('dhikr')}</span>
              <span className="text-base sm:text-xl font-black tabular-nums tracking-tighter">{state.dhikrCount.toLocaleString()}</span>
            </div>
            <div className="flex-1 bg-white/5 backdrop-blur-sm p-3 rounded-2xl sm:rounded-3xl border border-white/10">
              <span className="text-[7px] sm:text-[9px] text-emerald-300/80 uppercase font-black tracking-widest block mb-0.5">{t('lastRead')}</span>
              <span className="text-[11px] sm:text-[13px] font-bold truncate block tracking-tight">{state.quranProgress.surah || '---'}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 px-5 sm:px-8 flex flex-col justify-around py-5 overflow-hidden">
        
        {/* Next Prayer Card */}
        <div className="bg-white p-5 rounded-3xl sm:rounded-[40px] shadow-premium border border-slate-50 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full blur-[30px] -mr-12 -mt-12 transition-all"></div>
          <div className="flex items-center justify-between gap-2 relative z-10">
            <div className="ltr:text-left">
              <span className="text-[9px] sm:text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-1">{t('nextPrayer')}</span>
              <div className="flex items-center gap-3">
                <h2 className="text-xl sm:text-2xl font-black text-emerald-900 capitalize tracking-tight">{prayerTimingData ? t(prayerTimingData.next.name) : '--'}</h2>
                <span className="text-[10px] sm:text-[12px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">{prayerTimingData?.next.time}</span>
              </div>
            </div>
            <div className="ltr:text-right">
              <span className="text-2xl sm:text-3xl font-black text-[#c5a059] tabular-nums tracking-tighter">{prayerTimingData?.timeLeft || '--:--'}</span>
              <span className="text-[8px] sm:text-[10px] font-black text-slate-400 block uppercase tracking-tighter">Remaining</span>
            </div>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-4 p-0.5">
            <div className="bg-emerald-600 h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(16,185,129,0.3)]" style={{ width: `${prayerTimingData?.progress || 0}%` }}></div>
          </div>
        </div>

        {/* Hadith Section */}
        <div className="bg-white p-5 rounded-3xl sm:rounded-[40px] border border-slate-50 shadow-premium overflow-hidden relative">
          <span className="bg-[#c5a059]/10 text-[#c5a059] text-[8px] sm:text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest mb-3 inline-block">Daily Guidance</span>
          <p className="text-[#064e3b] arabic-font text-base sm:text-lg leading-tight text-right mb-3 font-bold" dir="rtl">{dailyHadith.arabic}</p>
          <p className="text-slate-500 italic text-[10px] sm:text-[12px] leading-relaxed line-clamp-2 border-l-2 border-emerald-50 pl-3">"{dailyHadith[userLang]}"</p>
        </div>

        {/* Today's Prayers Summary */}
        <div className="bg-white p-5 rounded-3xl sm:rounded-[40px] shadow-premium border border-slate-50">
          <div className="flex justify-between items-center mb-3">
             <h3 className="text-[10px] sm:text-[12px] font-black text-emerald-900 uppercase tracking-widest">{t('todayPrayers')}</h3>
             {state.isHaydNifas && <span className="text-[8px] font-bold px-2 py-0.5 bg-rose-50 text-rose-600 rounded-full border border-rose-100">{t('excused')}</span>}
          </div>
          <div className="grid grid-cols-5 gap-3">
            {PRAYERS.map((p) => {
              const status = todayLogs[p];
              return (
                <button 
                  key={p} 
                  disabled={state.isHaydNifas} 
                  onClick={() => handlePrayerToggle(p)} 
                  className={`flex flex-col items-center p-2.5 rounded-2xl sm:rounded-3xl border-2 transition-all active:scale-95 ${status === PrayerStatus.COMPLETED ? 'bg-emerald-50 border-emerald-100 text-emerald-800 shadow-sm' : 'bg-slate-50 border-transparent text-slate-300'} ${state.isHaydNifas ? 'opacity-30' : ''}`}
                >
                  <span className="text-[8px] sm:text-[10px] font-black uppercase mb-2 tracking-tighter">{t(p).substring(0,3)}</span>
                  <div className={`w-7 h-7 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-sm transition-all ${status === PrayerStatus.COMPLETED ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-100'}`}>
                    <i className={`fas ${status === PrayerStatus.COMPLETED ? 'fa-check' : 'fa-circle'} text-[10px] sm:text-xs`}></i>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation Grid - Adaptive Column Count */}
        <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-4 gap-3">
          {menuItems.map((item) => (
            <button 
              key={item.id} 
              onClick={() => setCurrentView(item.id)} 
              className={`flex flex-col items-center justify-center p-3 rounded-3xl sm:rounded-[36px] transition-all active:scale-90 border border-slate-50 shadow-premium hover:shadow-lg group bg-white`}
            >
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl sm:rounded-[20px] ${item.iconBg} flex items-center justify-center mb-2 transition-all group-hover:rotate-6`}>
                <i className={`fas ${item.icon} text-lg sm:text-xl`}></i>
              </div>
              <span className="text-[9px] sm:text-[11px] font-bold text-center uppercase tracking-tighter text-slate-600 truncate w-full group-hover:text-emerald-900">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
