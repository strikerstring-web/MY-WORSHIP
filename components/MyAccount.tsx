
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
    let totalFard = 0;
    let completedFard = 0;
    let missedFard = 0;

    Object.values(state.prayerLogs).forEach(log => {
      Object.values(log).forEach(status => {
        totalFard++;
        if (status === PrayerStatus.COMPLETED) completedFard++;
        if (status === PrayerStatus.MISSED) missedFard++;
      });
    });

    const totalFasting = Object.keys(state.fastingLogs).length;
    const completedFasting = Object.values(state.fastingLogs).filter(l => l.status === 'completed').length;
    
    const challengesDone = state.dhikrHistory.length;

    // Consistency calculation (0.0 - 1.0)
    const ratio = totalFard > 0 ? (completedFard / totalFard) : 1;
    let levelKey = 'levelBeginner';
    let colorClass = 'text-slate-500';
    let strokeClass = 'stroke-slate-300';
    let icon = 'fa-seedling';

    if (ratio >= 0.9 && totalFard > 30) {
      levelKey = 'levelElite';
      colorClass = 'text-[#c5a059]';
      strokeClass = 'stroke-[#c5a059]';
      icon = 'fa-crown';
    } else if (ratio >= 0.7) {
      levelKey = 'levelAdvanced';
      colorClass = 'text-emerald-600';
      strokeClass = 'stroke-emerald-600';
      icon = 'fa-shield-heart';
    } else if (ratio >= 0.4) {
      levelKey = 'levelConsistent';
      colorClass = 'text-teal-600';
      strokeClass = 'stroke-teal-600';
      icon = 'fa-leaf';
    }

    return { completedFard, missedFard, completedFasting, challengesDone, levelKey, colorClass, strokeClass, ratio, icon };
  }, [state]);

  const percentage = Math.round(stats.ratio * 100);
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (stats.ratio * circumference);

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] overflow-hidden view-transition">
      <div className="p-6 pt-12 pb-10 bg-[#064e3b] text-white shrink-0 shadow-emerald-premium rounded-b-[42px] sm:rounded-b-[54px] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#c5a059] opacity-[0.05] rounded-full blur-[80px] -mr-32 -mt-32"></div>
        
        <div className="flex items-center gap-4 mb-8 relative z-10">
          <button onClick={() => setCurrentView('dashboard')} className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-white/10 rounded-xl sm:rounded-2xl border border-white/10 active:scale-90 transition-all">
            <i className="fas fa-chevron-left text-xs sm:text-sm"></i>
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{t('myAccount')}</h1>
            <p className="text-[10px] sm:text-[12px] font-black text-emerald-300 uppercase tracking-widest opacity-60">Spiritual Identity</p>
          </div>
        </div>
        
        <div className="bg-white/5 backdrop-blur-xl p-5 rounded-[32px] border border-white/10 flex items-center gap-5 relative z-10 shadow-2xl">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-[28px] flex items-center justify-center border-4 border-white/20 shadow-xl relative">
             <i className="fas fa-user-circle text-[#064e3b] text-4xl"></i>
             <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#c5a059] rounded-xl flex items-center justify-center border-2 border-white shadow-lg">
                <i className={`fas ${stats.icon} text-white text-[10px]`}></i>
             </div>
          </div>
          <div className="overflow-hidden flex-1">
             <h2 className="text-xl font-black truncate tracking-tight">{state.profile.name}</h2>
             <div className="flex items-center gap-2 mt-1">
               <span className="text-emerald-300 text-[10px] font-black uppercase tracking-widest">@{state.profile.username}</span>
               <div className="w-1 h-1 bg-white/20 rounded-full"></div>
               <span className="text-white/40 text-[9px] font-bold">{state.profile.place}</span>
             </div>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 sm:p-8 flex flex-col gap-6 overflow-hidden">
        <div className={`p-6 rounded-[40px] border border-slate-100 shadow-premium flex items-center gap-6 bg-white group transition-all`}>
           <div className="relative w-24 h-24 shrink-0">
             <svg className="w-full h-full -rotate-90">
               <circle cx="48" cy="48" r="45" className="stroke-slate-100 fill-none stroke-[8]" />
               <circle 
                 cx="48" cy="48" r="45" 
                 className={`${stats.strokeClass} fill-none stroke-[8] transition-all duration-1000 ease-out`}
                 strokeDasharray={circumference}
                 strokeDashoffset={offset}
                 strokeLinecap="round"
               />
             </svg>
             <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-black text-emerald-900 tracking-tighter leading-none">{percentage}%</span>
                <span className="text-[7px] font-black text-slate-400 uppercase tracking-tighter mt-1">Ratio</span>
             </div>
           </div>
           <div>
             <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-1">{t('consistency')}</span>
             <h3 className={`text-2xl font-black ${stats.colorClass} tracking-tight`}>{t(stats.levelKey)}</h3>
             <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-1 opacity-80">Based on your fard prayer completion rate over time.</p>
           </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
           <div className="bg-white p-5 rounded-[32px] shadow-premium border border-slate-50">
              <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-2"><i className="fas fa-check-circle text-lg"></i></div>
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">{t('completed')}</span>
              <p className="text-xl font-black text-emerald-900">{stats.completedFard}</p>
           </div>
           <div className="bg-white p-5 rounded-[32px] shadow-premium border border-slate-50">
              <div className="w-10 h-10 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 mb-2"><i className="fas fa-history text-lg"></i></div>
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">{t('missed')}</span>
              <p className="text-xl font-black text-rose-900">{stats.missedFard}</p>
           </div>
           <div className="bg-white p-5 rounded-[32px] shadow-premium border border-slate-50">
              <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-2"><i className="fas fa-moon text-lg"></i></div>
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">{t('fasting')}</span>
              <p className="text-xl font-black text-indigo-900">{stats.completedFasting}</p>
           </div>
           <div className="bg-white p-5 rounded-[32px] shadow-premium border border-slate-50">
              <div className="w-10 h-10 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mb-2"><i className="fas fa-award text-lg"></i></div>
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Dhikr Done</span>
              <p className="text-xl font-black text-amber-900">{stats.challengesDone}</p>
           </div>
        </div>

        <div className="bg-white rounded-[32px] border border-slate-50 shadow-premium overflow-hidden flex flex-col">
           <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('profileDetails')}</h4>
              <i className="fas fa-id-card text-slate-200"></i>
           </div>
           <div className="p-6 space-y-4">
              <div className="flex justify-between items-center text-sm font-black text-emerald-900">
                 <span className="text-[11px] font-bold text-slate-400">{t('age')}</span>
                 <span>{state.profile.age}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-black text-emerald-900">
                 <span className="text-[11px] font-bold text-slate-400">{t('sex')}</span>
                 <span className="capitalize">{t(state.profile.sex)}</span>
              </div>
           </div>
        </div>

        <div className="mt-auto pb-6">
           <button 
             onClick={onLogout}
             className="w-full py-5 bg-white border-2 border-rose-100/50 text-rose-600 rounded-[32px] font-black text-[11px] uppercase tracking-[0.25em] shadow-premium hover:bg-rose-50 transition-all active:scale-95 flex items-center justify-center gap-4 group"
           >
             <i className="fas fa-power-off text-rose-300 group-hover:text-rose-500 transition-colors"></i>
             {t('logout')}
           </button>
        </div>
      </div>
    </div>
  );
};

export default MyAccount;
