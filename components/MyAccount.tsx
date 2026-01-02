
import React, { useMemo } from 'react';
import { UserData, PrayerStatus } from '../types';

interface MyAccountProps {
  state: UserData;
  setCurrentView: (view: any) => void;
  t: (key: string) => string;
  onLogout: () => void;
}

const MyAccount: React.FC<MyAccountProps> = ({ state, setCurrentView, t, onLogout }) => {
  const stats = useMemo(() => {
    let totalFard = 0, completedFard = 0, missedFard = 0;
    Object.values(state.prayerLogs).forEach(log => {
      Object.values(log).forEach(status => {
        totalFard++;
        if (status === PrayerStatus.COMPLETED) completedFard++;
        if (status === PrayerStatus.MISSED) missedFard++;
      });
    });
    const ratio = totalFard > 0 ? (completedFard / totalFard) : 1;
    let levelKey = 'levelBeginner', colorClass = 'text-slate-500', icon = 'fa-seedling';
    if (ratio >= 0.9 && totalFard > 30) { levelKey = 'levelElite'; colorClass = 'text-[#c5a059]'; icon = 'fa-crown'; }
    else if (ratio >= 0.7) { levelKey = 'levelAdvanced'; colorClass = 'text-emerald-600'; icon = 'fa-shield-heart'; }
    else if (ratio >= 0.4) { levelKey = 'levelConsistent'; colorClass = 'text-teal-600'; icon = 'fa-leaf'; }
    return { completedFard, missedFard, levelKey, colorClass, ratio, icon };
  }, [state]);

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-hidden">
      <header className="bg-white p-6 pt-12 pb-6 flex items-center gap-4 z-10 shrink-0">
        <div className="w-16 h-16 bg-emerald-900 rounded-3xl flex items-center justify-center text-white shadow-xl">
           <i className="fas fa-user-circle text-3xl"></i>
        </div>
        <div>
          <h1 className="text-2xl font-black text-emerald-900 leading-none mb-1">{state.profile.name}</h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">@{state.profile.username}</p>
        </div>
      </header>

      <div className="scroll-container px-6 pt-2 space-y-6">
        {/* Achievement Card */}
        <div className="bg-white p-8 rounded-[32px] shadow-premium flex flex-col items-center text-center border border-slate-50 relative overflow-hidden">
           <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl mb-3 bg-emerald-50 ${stats.colorClass} shadow-inner`}>
             <i className={`fas ${stats.icon}`}></i>
           </div>
           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('consistency')}</span>
           <h3 className={`text-3xl font-black ${stats.colorClass} tracking-tighter mb-4`}>{t(stats.levelKey)}</h3>
           <div className="w-full bg-slate-50 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-600 h-full rounded-full transition-all" style={{ width: `${stats.ratio * 100}%` }}></div>
           </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
           <div className="card-premium">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-2">PRAYERS DONE</span>
              <p className="text-2xl font-black text-emerald-900">{stats.completedFard}</p>
           </div>
           <div className="card-premium">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-2">DHIKR TOTAL</span>
              <p className="text-2xl font-black text-emerald-900">{state.dhikrCount.toLocaleString()}</p>
           </div>
        </div>

        {/* Settings/Account Actions */}
        <div className="space-y-3">
          <button className="card-premium w-full flex items-center justify-between btn-ripple">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center"><i className="fas fa-id-card"></i></div>
              <span className="font-black text-emerald-900 text-sm">Profile Details</span>
            </div>
            <i className="fas fa-chevron-right text-slate-300 text-xs"></i>
          </button>
          <button onClick={() => setCurrentView('about')} className="card-premium w-full flex items-center justify-between btn-ripple">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center"><i className="fas fa-circle-info"></i></div>
              <span className="font-black text-emerald-900 text-sm">Help & About</span>
            </div>
            <i className="fas fa-chevron-right text-slate-300 text-xs"></i>
          </button>
          <button onClick={onLogout} className="card-premium w-full flex items-center justify-between bg-rose-50 border-rose-100 btn-ripple">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center"><i className="fas fa-power-off"></i></div>
              <span className="font-black text-rose-900 text-sm">{t('logout')}</span>
            </div>
          </button>
        </div>

        <div className="pt-8 text-center text-slate-300 text-[10px] font-black uppercase tracking-widest pb-10">
           Ibadathi v5.5 • 1446 AH
        </div>
      </div>
    </div>
  );
};

export default MyAccount;
