import React, { useMemo } from 'react';
import { UserData, PrayerStatus, PrayerReminder } from '../types';
import { PRAYERS } from '../constants';

interface MyAccountProps {
  state: UserData;
  setCurrentView: (view: any) => void;
  t: (key: string) => string;
  onLogout: () => void;
  toggleTheme: () => void;
  toggleEcoMode: () => void;
  updatePrayerReminder: (prayer: string, time: string, enabled: boolean) => void;
}

const MyAccount: React.FC<MyAccountProps> = ({ state, setCurrentView, t, onLogout, toggleTheme, toggleEcoMode, updatePrayerReminder }) => {
  const stats = useMemo(() => {
    let totalFard = 0, completedFard = 0, missedFard = 0;
    Object.values(state.prayerLogs).forEach(log => {
      Object.values(log).forEach(status => {
        totalFard++;
        if (status === PrayerStatus.COMPLETED) completedFard++;
        if (status === PrayerStatus.MISSED) missedFard++;
      });
    });
    const ratio = totalFard > 0 ? (completedFard / totalFard) : 0;
    
    let level = 'levelBeginner', color = 'text-slate-400', icon = 'fa-seedling';
    if (ratio >= 0.9) { level = 'levelElite'; color = 'text-amber-500'; icon = 'fa-crown'; }
    else if (ratio >= 0.7) { level = 'levelAdvanced'; color = 'text-emerald-500'; icon = 'fa-shield-heart'; }
    else if (ratio >= 0.4) { level = 'levelConsistent'; color = 'text-teal-500'; icon = 'fa-leaf'; }

    return { totalFard, completedFard, missedFard, ratio, level, color, icon };
  }, [state]);

  const prayerReminders = state.settings.prayerReminders || [];
  const isDark = state.settings.theme === 'dark';

  return (
    <div className="scroll-container px-6 pt-12 content-limit w-full">
      {/* Profile Header */}
      <div className="flex items-center justify-between mb-10 animate-fade-up">
         <div>
            <h1 className="text-3xl font-black text-emerald-950 dark:text-white tracking-tighter">{state.profile.name}</h1>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">@{state.profile.username}</p>
         </div>
         <button onClick={onLogout} className="w-12 h-12 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center border border-rose-500/20 active:scale-90 transition-transform">
           <i className="fas fa-power-off"></i>
         </button>
      </div>

      {/* Commitment Card */}
      <div className={`card-premium mb-10 flex items-center gap-6 !p-8 animate-fade-up stagger-1`}>
         <div className={`w-20 h-20 rounded-[2.5rem] flex items-center justify-center text-4xl shadow-2xl bg-white/5 border border-white/10 ${stats.color}`}>
           <i className={`fas ${stats.icon}`}></i>
         </div>
         <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{t('consistency')}</p>
            <h3 className={`text-2xl font-black tracking-tight ${stats.color}`}>{t(stats.level)}</h3>
            <p className="text-xs font-medium text-slate-500 mt-1">{(stats.ratio * 100).toFixed(0)}% Commitment</p>
         </div>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-2 gap-4 mb-12 animate-fade-up stagger-2">
         <div className="card-premium flex flex-col items-center !p-6">
            <div className="w-10 h-10 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center mb-4"><i className="fas fa-check-double text-xs"></i></div>
            <p className="text-2xl font-black text-emerald-950 dark:text-white">{stats.completedFard}</p>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">{t('completed')}</p>
         </div>
         <div className="card-premium flex flex-col items-center !p-6">
            <div className="w-10 h-10 bg-rose-500/10 text-rose-500 rounded-xl flex items-center justify-center mb-4"><i className="fas fa-history text-xs"></i></div>
            <p className="text-2xl font-black text-emerald-950 dark:text-white">{stats.missedFard}</p>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">{t('missed')}</p>
         </div>
      </div>

      {/* Reminders Section */}
      <div className="space-y-6 mb-12 animate-fade-up stagger-3">
         <div className="flex items-center gap-4 px-1">
            <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Prayer Alerts</h4>
            <span className="h-px flex-1 bg-black/5 dark:bg-white/5"></span>
         </div>
         <div className="space-y-3">
           {PRAYERS.map(p => {
             const reminder = prayerReminders.find(r => r.prayer === p) || { prayer: p, time: '12:00', enabled: false };
             return (
               <div key={p} className="card-premium flex items-center justify-between !p-5 group">
                 <div className="flex items-center gap-5">
                   <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg ${reminder.enabled ? 'bg-emerald-600 text-white' : 'bg-slate-50 dark:bg-white/5 text-slate-400 dark:text-slate-600'}`}>
                     <i className="fas fa-bell"></i>
                   </div>
                   <div>
                     <span className="font-black text-sm text-emerald-950 dark:text-white capitalize">{t(p)}</span>
                     <p className="text-[9px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest mt-0.5">Custom Reminder</p>
                   </div>
                 </div>
                 <div className="flex items-center gap-4">
                   <input 
                     type="time" 
                     className="bg-transparent border-none text-xs font-black text-emerald-600 focus:ring-0 cursor-pointer" 
                     value={reminder.time} 
                     onChange={(e) => updatePrayerReminder(p, e.target.value, reminder.enabled)}
                   />
                   <button 
                     onClick={() => updatePrayerReminder(p, reminder.time, !reminder.enabled)}
                     className={`w-12 h-6 rounded-full p-1 transition-all ${reminder.enabled ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-white/10'}`}
                   >
                     <div className={`w-4 h-4 bg-white rounded-full transition-transform ${reminder.enabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                   </button>
                 </div>
               </div>
             );
           })}
         </div>
      </div>

      {/* System Settings */}
      <div className="space-y-6 animate-fade-up stagger-4 pb-20">
         <div className="flex items-center gap-4 px-1">
            <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Preferences</h4>
            <span className="h-px flex-1 bg-black/5 dark:bg-white/5"></span>
         </div>
         
         <button onClick={toggleTheme} className="card-premium w-full flex items-center justify-between !p-6 mb-3">
            <div className="flex items-center gap-5">
               <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-all ${isDark ? 'bg-indigo-500/10 text-indigo-400' : 'bg-amber-500/10 text-amber-500'}`}>
                 <i className={`fas ${isDark ? 'fa-moon' : 'fa-sun'}`}></i>
               </div>
               <div className="text-left">
                 <span className="font-black text-sm text-emerald-950 dark:text-white">{isDark ? 'Dark Theme' : 'Light Theme'}</span>
                 <p className="text-[9px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest mt-0.5">Visual Appearance</p>
               </div>
            </div>
            <div className={`w-12 h-6 rounded-full p-1 transition-colors ${isDark ? 'bg-indigo-600' : 'bg-amber-500'}`}>
               <div className={`w-4 h-4 bg-white rounded-full transition-transform ${isDark ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </div>
         </button>

         <button onClick={toggleEcoMode} className="card-premium w-full flex items-center justify-between !p-6">
            <div className="flex items-center gap-5">
               <div className="w-12 h-12 bg-teal-500/10 text-teal-500 rounded-2xl flex items-center justify-center text-xl"><i className="fas fa-bolt-lightning"></i></div>
               <div className="text-left">
                 <span className="font-black text-sm text-emerald-950 dark:text-white">Eco Mode</span>
                 <p className="text-[9px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest mt-0.5">Performance Optimizer</p>
               </div>
            </div>
            <div className={`w-12 h-6 rounded-full p-1 transition-colors ${state.settings.ecoMode ? 'bg-teal-600' : 'bg-slate-200 dark:bg-white/10'}`}>
               <div className={`w-4 h-4 bg-white rounded-full transition-transform ${state.settings.ecoMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </div>
         </button>
      </div>
    </div>
  );
};

export default MyAccount;