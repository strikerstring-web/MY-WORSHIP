
import React, { useState, useEffect, useMemo } from 'react';
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

const ITEMS_PER_PAGE = 4;

const DhikrCounter: React.FC<DhikrCounterProps> = ({ 
  state, 
  updateProgress, 
  updatePersonalProgress,
  addPersonalDhikr,
  resetPersonalSession,
  deletePersonalDhikr,
  archiveChallenge, 
  setActiveDhikr, 
  setCurrentView, 
  t 
}) => {
  const [activeTab, setActiveTab] = useState<'challenges' | 'personal'>('challenges');
  const [showHistory, setShowHistory] = useState(false);
  const [historyPage, setHistoryPage] = useState(0);
  const [tapAnimation, setTapAnimation] = useState(false);
  const [isAddingDhikr, setIsAddingDhikr] = useState(false);
  const [newDhikrName, setNewDhikrName] = useState('');
  const [activePersonalId, setActivePersonalId] = useState<string | null>(null);

  // Derived state from global user data
  const activeChallenge = useMemo(() => {
    return state.activeChallenges.find(c => c.id === state.activeDhikrId);
  }, [state.activeChallenges, state.activeDhikrId]);

  const activePersonal = useMemo(() => {
    return state.personalDhikrs.find(d => d.id === activePersonalId);
  }, [state.personalDhikrs, activePersonalId]);

  const handleIncrementChallenge = () => {
    if (!state.activeDhikrId || !activeChallenge) return;
    if ('vibrate' in navigator) navigator.vibrate(40);
    setTapAnimation(true);
    setTimeout(() => setTapAnimation(false), 100);
    updateProgress(state.activeDhikrId, 1);
    if (activeChallenge.current + 1 === activeChallenge.target) {
      if ('vibrate' in navigator) navigator.vibrate([100, 50, 100]);
    }
  };

  const handleIncrementPersonal = () => {
    if (!activePersonalId || !activePersonal) return;
    if ('vibrate' in navigator) navigator.vibrate(40);
    setTapAnimation(true);
    setTimeout(() => setTapAnimation(false), 100);
    updatePersonalProgress(activePersonalId, 1);
  };

  const handleAddDhikr = () => {
    if (newDhikrName.trim()) {
      addPersonalDhikr(newDhikrName.trim());
      setNewDhikrName('');
      setIsAddingDhikr(false);
    }
  };

  const handleBack = () => {
    if (state.activeDhikrId) {
      setActiveDhikr(null);
    } else if (activePersonalId) {
      setActivePersonalId(null);
    } else {
      setCurrentView('dashboard');
    }
  };

  const isChallengeCompleted = activeChallenge && activeChallenge.current >= activeChallenge.target;

  // History View
  if (showHistory) {
    const totalPages = Math.ceil(state.dhikrHistory.length / ITEMS_PER_PAGE);
    const visibleHistory = state.dhikrHistory.slice(historyPage * ITEMS_PER_PAGE, (historyPage + 1) * ITEMS_PER_PAGE);

    return (
      <div className="flex flex-col h-full bg-[#f8fafc] view-transition">
        <div className="p-5 pt-12 pb-6 bg-[#064e3b] text-white shrink-0 shadow-emerald-premium rounded-b-[42px]">
          <div className="flex items-center gap-4">
            <button onClick={() => setShowHistory(false)} className="w-10 h-10 flex items-center justify-center bg-white/10 border border-white/10 rounded-xl active:scale-90 transition-all"><i className="fas fa-chevron-left text-xs"></i></button>
            <h1 className="text-xl font-bold tracking-tight">{t('history')}</h1>
          </div>
        </div>
        <div className="flex-1 p-5 flex flex-col justify-between overflow-hidden">
          <div className="space-y-3 flex-1 overflow-y-auto">
            {state.dhikrHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full opacity-10 grayscale"><i className="fas fa-box-open text-6xl mb-4"></i><p className="text-xs uppercase font-black tracking-widest">{t('noHistory')}</p></div>
            ) : (
              visibleHistory.map((entry) => {
                const perc = Math.round((entry.current / entry.target) * 100);
                return (
                  <div key={entry.id} className="bg-white p-4 rounded-3xl border border-slate-50 shadow-premium group">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-[11px] font-black text-[#064e3b] uppercase tracking-wide truncate w-48">{t(entry.title)}</h3>
                        <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-1">{new Date(entry.date).toLocaleDateString()}</p>
                      </div>
                      <span className="text-[10px] font-black text-[#c5a059] bg-[#c5a059]/10 px-2 py-1 rounded-lg">{perc}%</span>
                    </div>
                    <div className="w-full bg-slate-50 h-1.5 rounded-full overflow-hidden p-0.5"><div className="bg-[#c5a059] h-full rounded-full transition-all" style={{ width: `${Math.min(100, perc)}%` }}></div></div>
                  </div>
                );
              })
            )}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-between items-center bg-white p-2.5 rounded-2xl border border-slate-100 shadow-premium shrink-0 mt-4">
               <button disabled={historyPage === 0} onClick={() => setHistoryPage(p => p - 1)} className="w-10 h-10 flex items-center justify-center bg-slate-50 rounded-xl disabled:opacity-20 active:scale-90 transition-all"><i className="fas fa-chevron-left text-xs"></i></button>
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Page {historyPage + 1} of {totalPages}</span>
               <button disabled={historyPage === totalPages - 1} onClick={() => setHistoryPage(p => p + 1)} className="w-10 h-10 flex items-center justify-center bg-slate-50 rounded-xl disabled:opacity-20 active:scale-90 transition-all"><i className="fas fa-chevron-right text-xs"></i></button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Active Challenge Counter View
  if (activeChallenge) {
    return (
      <div className="flex flex-col h-full bg-[#f8fafc] view-transition">
        <div className="p-5 pt-12 pb-6 bg-[#064e3b] text-white shrink-0 shadow-emerald-premium rounded-b-[42px]">
          <div className="flex items-center gap-4">
            <button onClick={handleBack} className="w-10 h-10 flex items-center justify-center bg-white/10 border border-white/10 rounded-xl active:scale-90 transition-all"><i className="fas fa-chevron-left text-xs"></i></button>
            <h1 className="text-lg font-bold tracking-tight truncate w-2/3">{t(activeChallenge.title)}</h1>
          </div>
        </div>

        <div className="flex-1 p-6 flex flex-col items-center justify-around overflow-hidden">
          <div className="text-center w-full">
            <p className="arabic-font text-5xl text-[#064e3b] font-bold mb-3 drop-shadow-sm min-h-[60px] flex items-center justify-center" dir="rtl">{activeChallenge.arabic}</p>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">{t(activeChallenge.title)}</p>
          </div>

          <button 
            onClick={handleIncrementChallenge} 
            className={`relative w-56 h-56 group flex items-center justify-center transition-all duration-75 ${tapAnimation ? 'scale-90' : 'active:scale-95'}`}
          >
             <div className={`absolute inset-0 bg-gradient-to-br from-[#10b981] to-[#064e3b] rounded-full shadow-[0_25px_50px_-12px_rgba(6,78,59,0.4)] border-8 border-white flex items-center justify-center overflow-hidden transition-all ${isChallengeCompleted ? 'shadow-[0_0_30px_#10b981]' : ''}`}>
                <div className="absolute inset-0 bg-white opacity-0 group-active:opacity-10 transition-opacity"></div>
                <div className="flex flex-col items-center">
                   <span className="text-white text-7xl font-black drop-shadow-lg tracking-tighter tabular-nums">{activeChallenge.current}</span>
                   <span className="text-emerald-100/50 text-[10px] font-black uppercase tracking-widest mt-[-5px]">Target: {activeChallenge.target}</span>
                </div>
             </div>
             <svg className="absolute inset-[-15px] w-[calc(100%+30px)] h-[calc(100%+30px)] rotate-[-90deg]">
               <circle cx="50%" cy="50%" r="48%" className="stroke-slate-100 fill-none stroke-[6]" />
               <circle cx="50%" cy="50%" r="48%" className={`stroke-[#c5a059] fill-none stroke-[6] transition-all duration-300`} strokeDasharray="1000" strokeDashoffset={1000 - (Math.min(100, (activeChallenge.current/activeChallenge.target)*100) * 10)} strokeLinecap="round" />
             </svg>
          </button>

          <div className="w-full max-w-xs space-y-4">
            <div className="bg-white p-6 rounded-[42px] shadow-premium border border-slate-50 text-center relative overflow-hidden h-40 flex flex-col justify-center">
               {isChallengeCompleted ? (
                 <div className="animate-fade-up flex flex-col items-center">
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-3 animate-bounce">
                      <i className="fas fa-check text-emerald-600 text-xl"></i>
                    </div>
                    <h3 className="text-emerald-900 font-black uppercase text-xs tracking-widest mb-4">Target Achieved</h3>
                    <div className="flex gap-2">
                      <button onClick={handleIncrementChallenge} className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-2xl font-black text-[9px] uppercase tracking-widest active:scale-95">Continue</button>
                      <button onClick={() => archiveChallenge(state.activeDhikrId!)} className="bg-[#c5a059] text-white px-6 py-2 rounded-2xl font-black text-[9px] uppercase tracking-widest shadow-xl active:scale-95">Archive</button>
                    </div>
                 </div>
               ) : (
                 <>
                   <div className="flex justify-between items-end mb-3 px-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                     <span>Progress</span>
                     <span className="text-emerald-900 font-bold">{Math.round((activeChallenge.current/activeChallenge.target)*100)}%</span>
                   </div>
                   <div className="w-full bg-slate-50 h-3 rounded-full overflow-hidden p-1 shadow-inner mb-4">
                     <div className="bg-[#064e3b] h-full rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(6,78,59,0.3)]" style={{ width: `${Math.min(100, (activeChallenge.current/activeChallenge.target)*100)}%` }}></div>
                   </div>
                   <p className="text-[9px] text-slate-300 font-black uppercase tracking-[0.2em] animate-pulse">{t('tapToCount')}</p>
                 </>
               )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Active Personal Dhikr Counter View
  if (activePersonal) {
    return (
      <div className="flex flex-col h-full bg-[#f8fafc] view-transition">
        <div className="p-5 pt-12 pb-6 bg-[#064e3b] text-white shrink-0 shadow-emerald-premium rounded-b-[42px]">
          <div className="flex items-center gap-4">
            <button onClick={handleBack} className="w-10 h-10 flex items-center justify-center bg-white/10 border border-white/10 rounded-xl active:scale-90 transition-all"><i className="fas fa-chevron-left text-xs"></i></button>
            <h1 className="text-lg font-bold tracking-tight truncate w-2/3">{activePersonal.name}</h1>
          </div>
        </div>

        <div className="flex-1 p-6 flex flex-col items-center justify-around overflow-hidden">
          <div className="text-center w-full">
            <h2 className="text-4xl font-black text-emerald-900 mb-2 tracking-tight">{activePersonal.name}</h2>
            <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest">{t('personal')}</p>
          </div>

          <button 
            onClick={handleIncrementPersonal} 
            className={`relative w-64 h-64 group flex items-center justify-center transition-all duration-75 ${tapAnimation ? 'scale-90' : 'active:scale-95'}`}
          >
             <div className="absolute inset-0 bg-gradient-to-br from-[#c5a059] to-[#8d6e35] rounded-full shadow-2xl border-8 border-white flex flex-col items-center justify-center overflow-hidden">
                <span className="text-white text-8xl font-black drop-shadow-lg tracking-tighter tabular-nums">{activePersonal.sessionCount}</span>
                <span className="text-amber-100/50 text-[10px] font-black uppercase tracking-widest mt-[-5px]">{t('session')}</span>
             </div>
             <div className="absolute -inset-2 border-2 border-dashed border-amber-200/40 rounded-full animate-spin-slow pointer-events-none"></div>
          </button>

          <div className="w-full max-w-sm grid grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-[32px] shadow-premium border border-slate-50 text-center">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">{t('daily')}</span>
              <p className="text-2xl font-black text-emerald-900 tabular-nums">{activePersonal.dailyCount}</p>
            </div>
            <div className="bg-white p-5 rounded-[32px] shadow-premium border border-slate-50 text-center">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">{t('total')}</span>
              <p className="text-2xl font-black text-emerald-900 tabular-nums">{activePersonal.totalCount}</p>
            </div>
            <button 
              onClick={() => resetPersonalSession(activePersonalId!)} 
              className="col-span-2 py-4 bg-emerald-50 text-emerald-700 rounded-3xl font-black text-[10px] uppercase tracking-[0.2em] active:scale-95 transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <i className="fas fa-undo text-[8px]"></i> {t('resetSession')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main Lists View
  return (
    <div className="flex flex-col h-full bg-[#f8fafc] view-transition">
      <div className="p-5 pt-12 pb-6 bg-[#064e3b] text-white shrink-0 shadow-emerald-premium rounded-b-[42px]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button onClick={() => setCurrentView('dashboard')} className="w-10 h-10 flex items-center justify-center bg-white/10 border border-white/10 rounded-xl active:scale-90 transition-all"><i className="fas fa-chevron-left text-xs"></i></button>
            <h1 className="text-xl font-bold tracking-tight">{t('dhikr')}</h1>
          </div>
          <button onClick={() => setShowHistory(true)} className="w-10 h-10 flex items-center justify-center bg-white/10 border border-white/10 rounded-xl active:scale-90 transition-all"><i className="fas fa-history text-xs"></i></button>
        </div>

        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 backdrop-blur-sm">
          <button 
            onClick={() => setActiveTab('challenges')} 
            className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'challenges' ? 'bg-white text-emerald-900 shadow-xl' : 'text-white/40'}`}
          >
            {t('challenge')}
          </button>
          <button 
            onClick={() => setActiveTab('personal')} 
            className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'personal' ? 'bg-white text-emerald-900 shadow-xl' : 'text-white/40'}`}
          >
            {t('personal')}
          </button>
        </div>
      </div>

      <div className="flex-1 p-4 flex flex-col gap-3 overflow-y-auto pb-10">
        {activeTab === 'challenges' ? (
          <div className="grid grid-cols-1 gap-3 mt-2">
            {state.activeChallenges.map((challenge) => {
              const perc = Math.min(100, (challenge.current / challenge.target) * 100);
              return (
                <button 
                  key={challenge.id} 
                  onClick={() => setActiveDhikr(challenge.id)} 
                  className="flex flex-col p-5 rounded-[32px] bg-white border border-slate-50 shadow-premium active:scale-[0.98] transition-all text-left group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 opacity-0 group-hover:opacity-100 rounded-full blur-2xl -mr-12 -mt-12 transition-all"></div>
                  <div className="flex justify-between items-start mb-3 relative z-10">
                    <div className="flex-1">
                      <h3 className="text-[12px] font-black text-[#064e3b] uppercase tracking-wide truncate pr-4 group-hover:text-emerald-700">{t(challenge.title)}</h3>
                      <p className="arabic-font text-xl text-emerald-800/40 mt-1 line-clamp-1" dir="rtl">{challenge.arabic}</p>
                    </div>
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${perc === 100 ? 'bg-emerald-500 text-white shadow-lg' : 'bg-slate-50 text-slate-300 group-hover:bg-emerald-50 group-hover:text-emerald-600'}`}>
                      <i className={`fas ${perc === 100 ? 'fa-check' : 'fa-play'} text-sm`}></i>
                    </div>
                  </div>
                  <div className="relative z-10">
                    <div className="flex justify-between text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                      <span>{challenge.current} / {challenge.target}</span>
                      <span>{Math.round(perc)}%</span>
                    </div>
                    <div className="w-full bg-slate-50 h-2 rounded-full overflow-hidden p-0.5">
                      <div className="bg-[#064e3b] h-full rounded-full transition-all" style={{ width: `${perc}%` }}></div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="space-y-3 mt-2">
            <button 
              onClick={() => setIsAddingDhikr(true)} 
              className="w-full p-6 rounded-[32px] bg-white border-2 border-dashed border-emerald-100 text-emerald-700 flex flex-col items-center justify-center gap-3 active:scale-95 transition-all group"
            >
              <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"><i className="fas fa-plus"></i></div>
              <span className="text-[10px] font-black uppercase tracking-widest">{t('addDhikr')}</span>
            </button>

            {state.personalDhikrs.map((d) => (
              <div key={d.id} className="relative group">
                <button 
                  onClick={() => setActivePersonalId(d.id)}
                  className="w-full flex items-center justify-between p-5 rounded-[32px] bg-white border border-slate-50 shadow-premium active:scale-[0.98] transition-all text-left"
                >
                  <div className="flex-1">
                    <h3 className="text-[13px] font-black text-emerald-900 uppercase tracking-tight">{d.name}</h3>
                    <div className="flex gap-3 mt-1 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                      <span>{t('total')}: {d.totalCount}</span>
                      <span className="text-emerald-600">{t('daily')}: {d.dailyCount}</span>
                    </div>
                  </div>
                  <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                    <i className="fas fa-hand-pointer"></i>
                  </div>
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); deletePersonalDhikr(d.id); }}
                  className="absolute -top-1 -right-1 w-7 h-7 bg-rose-50 text-rose-300 rounded-full flex items-center justify-center text-[8px] border border-rose-100 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="bg-emerald-50/50 p-6 rounded-[36px] border border-emerald-100 text-center relative overflow-hidden mt-4 shrink-0">
           <div className="absolute top-0 right-0 p-4 opacity-[0.05] pointer-events-none"><i className="fas fa-leaf text-5xl"></i></div>
           <p className="text-[#064e3b]/80 text-[11px] italic leading-relaxed font-medium px-4">"{t('remembranceVerse')}"</p>
        </div>
      </div>

      {/* Add Dhikr Modal Overlay */}
      {isAddingDhikr && (
        <div className="absolute inset-0 z-[100] bg-[#064e3b]/80 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in">
          <div className="w-full max-w-sm bg-white rounded-[40px] p-8 shadow-2xl animate-fade-up">
            <h3 className="text-2xl font-black text-emerald-900 mb-6 tracking-tight text-center">{t('addDhikr')}</h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('dhikrName')}</label>
                <input 
                  type="text" 
                  autoFocus
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-[20px] focus:ring-2 focus:ring-emerald-500/10 outline-none text-emerald-900 font-bold"
                  placeholder="e.g. Subhanallah"
                  value={newDhikrName}
                  onChange={e => setNewDhikrName(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleAddDhikr()}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setIsAddingDhikr(false)} className="flex-1 py-4 text-slate-400 font-black text-[10px] uppercase tracking-widest">{t('back')}</button>
                <button onClick={handleAddDhikr} className="flex-1 py-4 bg-[#064e3b] text-white rounded-[20px] font-black text-[10px] uppercase tracking-widest shadow-xl">{t('save')}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DhikrCounter;
