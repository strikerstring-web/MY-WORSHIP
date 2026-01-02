
import React, { useState, useMemo } from 'react';
import { UserData, DhikrChallenge, PersonalDhikr, PrayerTimings } from '../types';

interface DhikrCounterProps {
  state: UserData & { todayTimings: PrayerTimings | null };
  updateProgress: (id: string, delta: number) => void;
  updatePersonalProgress: (id: string, delta: number) => void;
  addPersonalDhikr: (name: string) => void;
  resetPersonalSession: (id: string) => void;
  deletePersonalDhikr: (id: string) => void;
  archiveChallenge: (id: string) => void;
  setActiveDhikr: (id: string | null) => void;
  setCurrentView: (view: any) => void;
  t: (key: string) => string;
}

const DhikrCounter: React.FC<DhikrCounterProps> = ({ 
  state, updateProgress, updatePersonalProgress, addPersonalDhikr, resetPersonalSession, deletePersonalDhikr, archiveChallenge, setActiveDhikr, setCurrentView, t 
}) => {
  const [activeTab, setActiveTab] = useState<'challenges' | 'personal'>('challenges');
  const [tapAnimation, setTapAnimation] = useState(false);
  const [isAddingDhikr, setIsAddingDhikr] = useState(false);
  const [newDhikrName, setNewDhikrName] = useState('');
  const [activePersonalId, setActivePersonalId] = useState<string | null>(null);

  const activeChallenge = useMemo(() => state.activeChallenges.find(c => c.id === state.activeDhikrId), [state.activeChallenges, state.activeDhikrId]);
  const activePersonal = useMemo(() => state.personalDhikrs.find(d => d.id === activePersonalId), [state.personalDhikrs, activePersonalId]);

  const handleIncrementChallenge = () => {
    if (!state.activeDhikrId || !activeChallenge) return;
    if ('vibrate' in navigator) navigator.vibrate(50);
    setTapAnimation(true); setTimeout(() => setTapAnimation(false), 150);
    updateProgress(state.activeDhikrId, 1);
  };

  const handleIncrementPersonal = () => {
    if (!activePersonalId || !activePersonal) return;
    if ('vibrate' in navigator) navigator.vibrate(60);
    setTapAnimation(true); setTimeout(() => setTapAnimation(false), 150);
    updatePersonalProgress(activePersonalId, 1);
  };

  // Modern Counter View
  if (activeChallenge || activePersonal) {
    const title = activeChallenge ? t(activeChallenge.title) : activePersonal?.name;
    const current = activeChallenge ? activeChallenge.current : activePersonal?.sessionCount;
    const target = activeChallenge ? activeChallenge.target : 0;
    const arabic = activeChallenge ? activeChallenge.arabic : '';
    const increment = activeChallenge ? handleIncrementChallenge : handleIncrementPersonal;
    
    // Choose a color theme based on the dhikr
    const themeClass = activeChallenge?.id === 'salawat' ? 'from-emerald-700 to-emerald-950' : 
                      activeChallenge?.id === 'astaghfirullah' ? 'from-slate-700 to-slate-900' :
                      activeChallenge?.id === 'allahuakbar' ? 'from-amber-600 to-amber-900' :
                      'from-emerald-800 to-teal-950';

    return (
      <div className={`h-full flex flex-col bg-gradient-to-b ${themeClass} text-white animate-fade-in`}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
           <div className="absolute top-1/4 -left-20 w-80 h-80 bg-white/20 rounded-full blur-3xl"></div>
           <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        <header className="p-6 pt-12 pb-4 flex items-center justify-between relative z-10">
          <button onClick={() => { setActiveDhikr(null); setActivePersonalId(null); }} className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20 active:scale-90 transition-all"><i className="fas fa-arrow-left"></i></button>
          <div className="flex flex-col items-end">
             <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Current Session</span>
             <p className="text-xl font-black tabular-nums">{current}</p>
          </div>
        </header>
        
        <div className="flex-1 flex flex-col items-center justify-around py-12 relative z-10">
          <div className="text-center px-8 space-y-6">
            <h1 className="text-2xl font-black tracking-tight mb-2 opacity-60 uppercase tracking-[0.3em] text-sm">{title}</h1>
            <p className="arabic-font text-6xl font-black mb-6 drop-shadow-2xl leading-relaxed" dir="rtl">{arabic}</p>
          </div>

          <button 
            onClick={increment} 
            className={`w-72 h-72 rounded-[64px] bg-white text-emerald-950 flex flex-col items-center justify-center shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] transition-all duration-200 ${tapAnimation ? 'scale-[0.88] bg-emerald-50' : 'active:scale-95'}`}
          >
             <span className="text-9xl font-black tabular-nums tracking-tighter transition-all">{current}</span>
             <div className="h-1 w-20 bg-emerald-100 rounded-full mt-2"></div>
          </button>

          <div className="w-full px-10 text-center space-y-8">
             {activeChallenge && activeChallenge.current >= activeChallenge.target && (
               <button 
                 onClick={() => archiveChallenge(activeChallenge.id)} 
                 className="w-full py-6 bg-gradient-to-r from-emerald-400 to-teal-500 text-white rounded-[32px] font-black text-sm uppercase tracking-[0.3em] shadow-2xl animate-bounce border-b-4 border-emerald-600"
               >
                 Mabrook! Archive Task
               </button>
             )}
             <div className="space-y-2">
               <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-2">
                 <i className="fas fa-fingerprint text-xs"></i>
                 TAP TO RECITE
               </p>
               {activeChallenge && (
                 <p className="text-white/20 text-[9px] font-bold uppercase">Target: {activeChallenge.target}</p>
               )}
             </div>
          </div>
        </div>
      </div>
    );
  }

  // Selection View
  return (
    <div className="h-full flex flex-col bg-[#fdfbf7] dark:bg-slate-900 overflow-hidden">
      <header className="bg-white dark:bg-slate-900 p-6 pt-12 pb-6 flex justify-between items-center z-10 shadow-sm border-b dark:border-slate-800">
        <div>
          <h1 className="text-3xl font-black text-emerald-950 dark:text-emerald-100 mb-1 tracking-tighter">Tasks</h1>
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Spiritual Momentum</p>
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
          <button onClick={() => setActiveTab('challenges')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'challenges' ? 'bg-white dark:bg-slate-700 text-emerald-900 dark:text-emerald-50 shadow-md' : 'text-slate-400'}`}>DAILY</button>
          <button onClick={() => setActiveTab('personal')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'personal' ? 'bg-white dark:bg-slate-700 text-emerald-900 dark:text-emerald-50 shadow-md' : 'text-slate-400'}`}>MY OWN</button>
        </div>
      </header>

      <div className="scroll-container px-6 pt-8 space-y-6">
        {activeTab === 'challenges' ? (
          state.activeChallenges.map((c, idx) => {
            const perc = Math.min(100, (c.current / c.target) * 100);
            const isDone = perc === 100;
            // Diverse colorful accents
            const accentColors = ['emerald', 'amber', 'sky', 'violet', 'rose', 'teal'];
            const accent = accentColors[idx % accentColors.length];
            
            return (
              <div 
                key={c.id} 
                onClick={() => setActiveDhikr(c.id)} 
                className={`card-premium dark:bg-slate-800 group cursor-pointer relative overflow-hidden transition-all hover:translate-y-[-4px] active:scale-[0.98] border-2 ${isDone ? `border-${accent}-500 bg-${accent}-50/10` : 'border-transparent'}`}
              >
                <div className="flex justify-between items-start relative z-10">
                  <div className="flex-1 overflow-hidden space-y-2">
                    <h3 className="font-black text-emerald-950 dark:text-emerald-50 uppercase text-base tracking-tight">{t(c.title)}</h3>
                    <p className="arabic-font text-2xl text-emerald-800/60 dark:text-emerald-400/60 truncate" dir="rtl">{c.arabic}</p>
                  </div>
                  <div className={`w-14 h-14 rounded-[22px] flex items-center justify-center shadow-lg transition-all ${isDone ? `bg-gradient-to-br from-${accent}-500 to-${accent}-700 text-white` : 'bg-slate-50 dark:bg-slate-700 text-slate-300'}`}>
                    <i className={`fas ${isDone ? 'fa-check-double' : 'fa-play'} text-lg`}></i>
                  </div>
                </div>
                <div className="mt-6 space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{c.current} / {c.target}</span>
                    <span className={`text-[10px] font-black text-${accent}-600 dark:text-${accent}-400 uppercase tracking-widest`}>{Math.round(perc)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                     <div className={`bg-${accent}-500 h-full rounded-full transition-all duration-700 shadow-[0_0_10px_rgba(0,0,0,0.1)]`} style={{ width: `${perc}%` }}></div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="space-y-6">
            <button onClick={() => setIsAddingDhikr(true)} className="w-full p-10 rounded-[48px] border-4 border-dashed border-emerald-100 dark:border-slate-800 text-emerald-700 dark:text-emerald-500 flex flex-col items-center gap-3 transition-all hover:bg-emerald-50 dark:hover:bg-slate-800/50 active:scale-95 group">
              <div className="w-16 h-16 bg-emerald-50 dark:bg-slate-700 rounded-3xl flex items-center justify-center transition-transform group-hover:scale-110">
                <i className="fas fa-plus text-2xl"></i>
              </div>
              <span className="font-black text-[12px] uppercase tracking-[0.3em]">Start New Remembrance</span>
            </button>
            {state.personalDhikrs.map(d => (
              <div key={d.id} onClick={() => setActivePersonalId(d.id)} className="card-premium dark:bg-slate-800 flex items-center justify-between group cursor-pointer hover:shadow-2xl transition-all active:scale-[0.98]">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-gradient-to-br from-sky-400 to-sky-600 text-white rounded-[22px] flex items-center justify-center text-xl shadow-lg shadow-sky-400/20 group-hover:rotate-6 transition-transform">
                    <i className="fas fa-moon"></i>
                  </div>
                  <div>
                    <h3 className="font-black text-emerald-950 dark:text-emerald-50 text-lg tracking-tight uppercase">{d.name}</h3>
                    <p className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-widest">Lifetime: {d.totalCount}</p>
                  </div>
                </div>
                <div className="w-10 h-10 bg-slate-50 dark:bg-slate-700 text-slate-300 dark:text-slate-500 rounded-xl flex items-center justify-center group-hover:text-emerald-600 transition-colors"><i className="fas fa-chevron-right text-xs"></i></div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isAddingDhikr && (
        <div className="absolute inset-0 z-[100] bg-emerald-950/80 backdrop-blur-xl flex items-center justify-center p-8 animate-fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-[56px] p-10 shadow-2xl space-y-8 animate-fade-up">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-black text-emerald-950 dark:text-emerald-50 tracking-tighter">Custom Task</h2>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">What would you like to recite?</p>
            </div>
            <input 
              type="text" 
              placeholder="e.g. Istighfar" 
              value={newDhikrName} 
              onChange={e => setNewDhikrName(e.target.value)} 
              className="w-full p-6 bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600 rounded-[32px] outline-none font-black text-xl text-emerald-900 dark:text-emerald-50 placeholder:text-slate-300 focus:ring-4 focus:ring-emerald-500/10 transition-all" 
            />
            <div className="flex gap-4">
               <button onClick={() => setIsAddingDhikr(false)} className="flex-1 py-5 text-slate-400 dark:text-slate-500 font-black uppercase text-[11px] tracking-widest">Cancel</button>
               <button onClick={() => { addPersonalDhikr(newDhikrName); setIsAddingDhikr(false); setNewDhikrName(''); }} className="flex-1 py-5 bg-gradient-to-r from-emerald-600 to-emerald-800 text-white rounded-[28px] font-black uppercase text-[11px] tracking-widest shadow-xl shadow-emerald-900/20 active:scale-95 transition-all">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DhikrCounter;
