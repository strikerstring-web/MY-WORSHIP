
import React, { useMemo } from 'react';
import { UserData, PrayerStatus } from '../types';

interface MyAccountProps {
  state: UserData;
  setCurrentView: (view: any) => void;
  t: (key: string) => string;
  onLogout: () => void;
  toggleTheme: () => void;
  toggleNotifications: () => void;
}

const MyAccount: React.FC<MyAccountProps> = ({ state, setCurrentView, t, onLogout, toggleTheme, toggleNotifications }) => {
  const stats = useMemo(() => {
    let totalFard = 0, completedFard = 0;
    Object.values(state.prayerLogs).forEach(log => {
      Object.values(log).forEach(status => {
        totalFard++;
        if (status === PrayerStatus.COMPLETED) completedFard++;
      });
    });
    const ratio = totalFard > 0 ? (completedFard / totalFard) : 1;
    let levelKey = 'levelBeginner', colorClass = 'text-slate-500', bgClass = 'from-slate-400 to-slate-500', icon = 'fa-seedling';
    if (ratio >= 0.9) { levelKey = 'levelElite'; colorClass = 'text-amber-500'; bgClass = 'from-amber-400 to-amber-600'; icon = 'fa-crown'; }
    else if (ratio >= 0.7) { levelKey = 'levelAdvanced'; colorClass = 'text-emerald-600'; bgClass = 'from-emerald-500 to-emerald-700'; icon = 'fa-shield-heart'; }
    else if (ratio >= 0.4) { levelKey = 'levelConsistent'; colorClass = 'text-teal-600'; bgClass = 'from-teal-500 to-teal-700'; icon = 'fa-leaf'; }
    return { completedFard, levelKey, colorClass, bgClass, ratio, icon };
  }, [state]);

  const isDark = state.settings.theme === 'dark';
  const notificationsEnabled = state.settings.notificationsEnabled;

  return (
    <div className="h-full flex flex-col bg-[#fdfbf7] dark:bg-slate-900 overflow-hidden">
      <header className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl px-6 py-6 flex items-center gap-4 shrink-0 border-b border-slate-100/50 dark:border-slate-800/50">
        <div className="w-14 h-14 bg-gradient-to-br from-emerald-800 to-teal-950 rounded-2xl flex items-center justify-center text-white shadow-lg">
           <i className="fas fa-user-circle text-2xl"></i>
        </div>
        <div>
          <h1 className="text-xl font-black text-emerald-950 dark:text-emerald-50 tracking-tighter">{state.profile.name}</h1>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">@{state.profile.username}</p>
        </div>
      </header>

      <div className="scroll-container px-4 pt-4 space-y-6 w-full flex flex-col items-center">
        <div className="w-full content-limit space-y-6">
          {/* Rank Card */}
          <div className="card-premium p-6 flex flex-col items-center text-center">
             <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-3 bg-gradient-to-br ${stats.bgClass} text-white shadow-lg`}>
               <i className={`fas ${stats.icon}`}></i>
             </div>
             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('consistency')}</span>
             <h3 className={`text-2xl font-black ${stats.colorClass} tracking-tighter mb-4`}>{t(stats.levelKey)}</h3>
             <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full transition-all duration-1000" style={{ width: `${stats.ratio * 100}%` }}></div>
             </div>
          </div>

          {/* Preferences */}
          <div className="space-y-2">
            <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">PREFERENCES</h3>
            
            <button onClick={toggleTheme} className="card-premium w-full flex items-center justify-between p-4 bg-white dark:bg-slate-800 border">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-slate-700 text-amber-400' : 'bg-amber-50 text-amber-600'}`}>
                  <i className={`fas ${isDark ? 'fa-moon' : 'fa-sun'}`}></i>
                </div>
                <span className="font-black text-emerald-950 dark:text-emerald-50 text-sm tracking-tight">{isDark ? 'Dark Mode' : 'Light Mode'}</span>
              </div>
              <div className={`w-10 h-5 rounded-full p-1 transition-colors ${isDark ? 'bg-emerald-600' : 'bg-slate-200'}`}>
                <div className={`w-3 h-3 bg-white rounded-full transition-transform ${isDark ? 'translate-x-5' : 'translate-x-0'}`}></div>
              </div>
            </button>

            <button onClick={toggleNotifications} className="card-premium w-full flex items-center justify-between p-4 bg-white dark:bg-slate-800 border">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${notificationsEnabled ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'}`}>
                  <i className={`fas ${notificationsEnabled ? 'fa-bell' : 'fa-bell-slash'}`}></i>
                </div>
                <span className="font-black text-emerald-950 dark:text-emerald-50 text-sm tracking-tight">{notificationsEnabled ? t('notificationOn') : t('notificationOff')}</span>
              </div>
              <div className={`w-10 h-5 rounded-full p-1 transition-colors ${notificationsEnabled ? 'bg-emerald-600' : 'bg-slate-200'}`}>
                <div className={`w-3 h-3 bg-white rounded-full transition-transform ${notificationsEnabled ? 'translate-x-5' : 'translate-x-0'}`}></div>
              </div>
            </button>

            <button onClick={onLogout} className="card-premium w-full flex items-center gap-3 p-4 bg-rose-50 border-rose-100 dark:bg-rose-900/10 dark:border-rose-900/20">
              <div className="w-10 h-10 bg-rose-100 dark:bg-rose-900/30 text-rose-600 rounded-xl flex items-center justify-center">
                <i className="fas fa-power-off text-sm"></i>
              </div>
              <span className="font-black text-rose-900 dark:text-rose-100 text-sm tracking-tight">{t('logout')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAccount;
