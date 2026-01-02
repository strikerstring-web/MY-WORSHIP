
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
  ];

  if (state.profile?.sex === 'female') {
    menuItems.push({ id: 'women', label: t('womensSpace'), icon: 'fa-leaf', color: 'from-rose-50 to-rose-100 text-rose-900', iconColor: 'text-rose-600' });
  }

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

  const featuredChallenge = state.activeChallenges[0];

  return (
    <div className="h-full w-full flex flex-col bg-slate-50/30 overflow-hidden view-transition pt-8">
      
      {/* Fixed Sticky Header Section */}
      <header className="relative w-full bg-[#064e3b] text-white pt-8 pb-12 px-4 rounded-b-[40px] shadow-2xl overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[80px] -mr-32 -mt-32"></div>
        <div className="relative z-10 w-full flex flex-col items-center">
          <div className="flex justify-between items-center w-full mb-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20 backdrop-blur-lg">
                <i className="fas fa-user text-emerald-200 text-sm"></i>
              </div>
              <div className="ltr:text-left rtl:text-right">
                <h2 className="text-[8px] text-emerald-300 uppercase tracking-widest font-bold">{t('welcome')}</h2>
                <h1 className="text-base font-bold tracking-tight">{state.profile?.name}</h1>
              </div>
            </div>
            <div className="flex gap-1.5">
              <button onClick={() => setCurrentView('about')} className="w-8 h-8 rounded-full flex items-center justify-center transition-all border border-white/10 bg-white/10"><i className="fas fa-info text-[10px]"></i></button>
              <button onClick={toggleNotifications} className={`w-8 h-8 rounded-full flex items-center justify-center transition-all border border-white/10 ${state.settings.notificationsEnabled ? 'bg-gold-classic' : 'bg-white/10'}`}><i className={`fas ${state.settings.notificationsEnabled ? 'fa-bell' : 'fa-bell-slash'} text-[10px]`}></i></button>
              <button onClick={onLogout} className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center border border-white/10"><i className="fas fa-power-off text-[10px] text-rose-300"></i></button>
            </div>
          </div>
          
          <div className="flex gap-2 w-full">
            <div className="flex-1 glass-card bg-white/5 p-3 rounded-2xl ltr:text-left rtl:text-right border border-white/10">
              <span className="text-[8px] text-emerald-300/60 uppercase font-black tracking-widest block">{t('dhikr')}</span>
              <span className="text-lg font-black tabular-nums">{state.dhikrCount.toLocaleString()}</span>
            </div>
            <div className="flex-1 glass-card bg-white/5 p-3 rounded-2xl ltr:text-left rtl:text-right border border-white/10">
              <span className="text-[8px] text-emerald-300/60 uppercase font-black tracking-widest block">{t('lastRead')}</span>
              <span className="text-xs font-bold truncate block mt-0.5">{state.quranProgress.surah || '---'}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area - No Scroll here, designed to fit */}
      <div className="w-full flex flex-col items-center flex-1 px-4 py-2 overflow-hidden">
        
        {/* Daily Hadith Banner - AT THE TOP OF CONTENT */}
        <div className="w-full mb-3">
          <div className="bg-white p-4 rounded-[28px] border border-emerald-50 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-[0.03] rotate-12"><i className="fas fa-quote-right text-4xl"></i></div>
            <div className="relative z-10">
              <div className="flex items-center gap-1.5 mb-2">
                <span className="bg-emerald-600/10 text-emerald-800 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">
                  {t('hadithTitle')}
                </span>
              </div>
              <p className="text-emerald-900 arabic-font text-sm leading-relaxed text-right font-medium" dir="rtl">
                {dailyHadith.arabic}
              </p>
              {userLang !== 'ar' && (
                <p className="text-slate-600 font-medium leading-relaxed italic text-[9px] mt-2 border-l border-gold-classic/40 pl-2">
                  "{dailyHadith[userLang]}"
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Next Prayer Floating Card */}
        <div className="mb-3 w-full">
          <div className="bg-white p-4 rounded-[32px] shadow-xl shadow-emerald-900/5 border border-emerald-50 relative overflow-hidden">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="ltr:text-left">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">{t('nextPrayer')}</span>
                <div className="flex items-center gap-1.5">
                  <h2 className="text-xl font-black text-emerald-900 capitalize tracking-tight">{prayerTimingData ? t(prayerTimingData.next.name) : '--'}</h2>
                  <div className="px-1.5 py-0.5 bg-emerald-50 rounded-full border border-emerald-100">
                    <span className="text-[8px] font-bold text-emerald-700 tabular-nums">{prayerTimingData?.next.time}</span>
                  </div>
                </div>
              </div>
              <div className="ltr:text-right">
                <span className="text-xl font-black text-gold-classic tabular-nums">{prayerTimingData?.timeLeft || '--:--'}</span>
                <span className="text-[7px] font-bold text-slate-400 block uppercase tracking-tighter">Remaining</span>
              </div>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden p-0.5">
              <div className="bg-emerald-600 h-full rounded-full transition-all duration-1000" style={{ width: `${prayerTimingData?.progress || 0}%` }}></div>
            </div>
          </div>
        </div>

        {/* Today's Prayers Summary */}
        <div className="w-full mb-3">
          <div className="bg-white p-4 rounded-[30px] shadow-sm border border-emerald-50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[9px] font-black text-emerald-900 uppercase tracking-widest">{t('todayPrayers')}</h3>
              {state.isHaydNifas && <span className="text-[7px] font-black px-1.5 py-0.5 bg-rose-50 text-rose-600 rounded-full border border-rose-100 uppercase">{t('excused')}</span>}
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {PRAYERS.map((p) => {
                const status = todayLogs[p], isAnimating = animatingPrayer === p;
                let isMissed = false;
                if (status === PrayerStatus.PENDING && prayerTimingData?.timingsMinutes) {
                  const tmg = prayerTimingData.timingsMinutes.find(tm => tm.name === p);
                  if (tmg && tmg.total < currentTimeMinutes) isMissed = true;
                }
                return (
                  <button key={p} disabled={state.isHaydNifas} onClick={() => handlePrayerToggle(p)} className={`flex flex-col items-center p-2 rounded-2xl border active-scale ${status === PrayerStatus.COMPLETED ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : isMissed ? 'bg-rose-50 border-rose-100 text-rose-700' : 'bg-slate-50 border-transparent text-slate-400'} ${isAnimating ? 'animate-success-pop' : ''} ${state.isHaydNifas ? 'opacity-40 grayscale cursor-not-allowed' : ''}`}>
                    <span className="text-[7px] font-black uppercase tracking-widest mb-1.5">{t(p)}</span>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${status === PrayerStatus.COMPLETED ? 'bg-emerald-600 text-white' : isMissed ? 'bg-rose-500 text-white' : 'bg-white text-slate-200 border border-slate-100'}`}>
                      {status === PrayerStatus.COMPLETED ? <i className="fas fa-check text-[8px]"></i> : isMissed ? <i className="fas fa-times text-[8px]"></i> : <i className="fas fa-circle text-[3px]"></i>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Menu Navigation Grid */}
        <div className="grid grid-cols-2 gap-2 w-full mb-3">
          {menuItems.map((item) => (
            <button key={item.id} onClick={() => setCurrentView(item.id)} className={`flex flex-col items-center justify-center p-4 rounded-[28px] transition-all active-scale bg-gradient-to-br ${item.color} border border-white group relative overflow-hidden shadow-sm`}>
              <div className={`w-8 h-8 rounded-xl ${item.iconColor} bg-white shadow-sm flex items-center justify-center mb-2 transition-transform group-hover:rotate-6`}>
                <i className={`fas ${item.icon} text-base`}></i>
              </div>
              <span className="text-[8px] font-black text-center uppercase tracking-widest text-slate-800">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Featured Challenge Footer Section */}
        {featuredChallenge && (
          <div className="w-full pb-4">
            <div className="w-full bg-[#064e3b] p-4 rounded-[30px] text-white shadow-xl relative overflow-hidden">
              <div className="flex justify-between items-center mb-3">
                <div><h3 className="text-emerald-400 text-[7px] uppercase font-black tracking-widest mb-0.5">{t('challenge')}</h3><p className="text-sm font-bold tracking-tight">{t(featuredChallenge.title)}</p></div>
                <span className="text-xl font-black text-gold-classic tabular-nums">{Math.round((featuredChallenge.current / featuredChallenge.target) * 100)}%</span>
              </div>
              <div className="w-full bg-emerald-800/50 h-1.5 rounded-full overflow-hidden mb-2 p-0.5">
                <div className="bg-gold-classic h-full rounded-full transition-all" style={{ width: `${Math.min(100, (featuredChallenge.current / featuredChallenge.target) * 100)}%` }}></div>
              </div>
              <div className="flex justify-between items-center text-[7px] text-emerald-400 font-bold uppercase">
                 <span className="opacity-60">{t('progress')}</span>
                 <span className="text-white font-black tabular-nums">{featuredChallenge.current} / {featuredChallenge.target}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
