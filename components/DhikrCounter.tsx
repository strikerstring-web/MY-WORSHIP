
import React, { useState, useEffect } from 'react';
import { UserData, DhikrChallenge, PrayerTimings } from '../types';

interface DhikrCounterProps {
  // Corrected state type from AppState to UserData with todayTimings
  state: UserData & { todayTimings: PrayerTimings | null };
  updateProgress: (id: string, delta: number) => void;
  archiveChallenge: (id: string) => void;
  setCurrentView: (view: any) => void;
  t: (key: string) => string;
}

const DhikrCounter: React.FC<DhikrCounterProps> = ({ state, updateProgress, archiveChallenge, setCurrentView, t }) => {
  const [activeChallengeId, setActiveChallengeId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);

  const activeChallenge = state.activeChallenges.find(c => c.id === activeChallengeId);

  const handleIncrement = () => {
    if (!activeChallengeId || !activeChallenge) return;
    
    // Haptic Feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(40);
    }

    if (activeChallenge.current < activeChallenge.target) {
      updateProgress(activeChallengeId, 1);
      
      // Check for completion
      if (activeChallenge.current + 1 === activeChallenge.target) {
        setJustCompleted(true);
        if ('vibrate' in navigator) {
          navigator.vibrate([100, 50, 100]);
        }
      }
    }
  };

  const handleArchive = () => {
    if (activeChallengeId) {
      archiveChallenge(activeChallengeId);
      setActiveChallengeId(null);
      setJustCompleted(false);
    }
  };

  if (showHistory) {
    return (
      <div className="flex flex-col h-full bg-[#fdfbf7] animate-fade-up">
        <div className="p-4 pt-10 pb-6 flex items-center bg-[#064e3b] text-white shadow-xl rounded-b-[40px] z-20 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setShowHistory(false)} className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-xl hover:bg-white/20 transition-all border border-white/10 active:scale-90">
              <i className="fas fa-chevron-left text-xs"></i>
            </button>
            <h1 className="text-xl font-bold tracking-tight">{t('history')}</h1>
          </div>
        </div>
        <div className="p-4 flex-1 overflow-hidden space-y-2"> {/* No scroll here, limited entries */}
          {state.dhikrHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-300">
               <i className="fas fa-box-open text-4xl mb-3 opacity-20"></i>
               <p className="text-sm font-black uppercase tracking-widest">{t('noHistory')}</p>
            </div>
          ) : (
            // Only display a limited number of recent entries to avoid scrolling
            state.dhikrHistory.slice(0, 5).map((entry) => { 
              const percentage = Math.round((entry.current / entry.target) * 100);
              return (
                <div key={entry.id} className="bg-white p-3 rounded-[24px] border border-emerald-50 shadow-sm shadow-emerald-900/5 shrink-0">
                  <div className="flex justify-between items-start mb-1.5">
                    <div>
                      <h3 className="text-sm font-black text-[#064e3b]">{t(entry.title)}</h3>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                        {new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">{percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-50 h-1 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full transition-all" style={{ width: `${Math.min(100, percentage)}%` }}></div>
                  </div>
                </div>
              );
            })
          )}
          {state.dhikrHistory.length > 5 && (
            <div className="text-center text-slate-400 text-[9px] uppercase font-bold tracking-widest mt-3">
              ... Only showing recent entries
            </div>
          )}
        </div>
      </div>
    );
  }

  // Active Counting View
  if (activeChallengeId && activeChallenge) {
    const progress = Math.min(100, (activeChallenge.current / activeChallenge.target) * 100);
    const isCompleted = activeChallenge.current >= activeChallenge.target;

    return (
      <div className="flex flex-col h-full bg-[#fdfbf7] animate-fade-up">
        <div className="p-4 pt-10 pb-6 flex items-center bg-[#064e3b] text-white shadow-xl rounded-b-[40px] z-20 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => { setActiveChallengeId(null); setJustCompleted(false); }} className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-xl hover:bg-white/20 transition-all border border-white/10 active:scale-90">
              <i className="fas fa-chevron-left text-xs"></i>
            </button>
            <h1 className="text-xl font-bold tracking-tight">{t(activeChallenge.title)}</h1>
          </div>
        </div>

        <div className="p-4 flex flex-col items-center flex-1 justify-around gap-4 py-8 overflow-hidden"> {/* No scroll here */}
          <div className="text-center shrink-0">
            <h2 className="text-emerald-800/40 text-[9px] uppercase font-black tracking-[0.3em] mb-2">Challenge Active</h2>
            <p className="arabic-font text-4xl text-[#064e3b] font-bold mb-1" dir="rtl">{activeChallenge.arabic}</p>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{t(activeChallenge.title)}</p>
          </div>

          <div className="relative flex items-center justify-center w-full max-w-[200px] aspect-square mx-auto">
             <div className="text-7xl font-black text-[#064e3b] tracking-tighter tabular-nums drop-shadow-sm opacity-10 absolute pointer-events-none select-none">
               {activeChallenge.current}
             </div>
             
             {/* Main Counter Button */}
             <button 
                onClick={handleIncrement}
                disabled={isCompleted}
                className={`relative w-full h-full group flex items-center justify-center rounded-full transition-all duration-150 transform ${isCompleted ? 'scale-90 grayscale opacity-50' : 'active:scale-90'}`}
             >
                <div className={`absolute inset-0 rounded-full blur-[30px] opacity-10 transition-opacity ${isCompleted ? 'bg-emerald-200' : 'bg-[#064e3b] group-active:opacity-30'}`}></div>
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-[#064e3b] rounded-full shadow-xl border-4 border-white/30 flex items-center justify-center overflow-hidden">
                   <div className="text-white text-5xl font-black drop-shadow-lg">
                      {activeChallenge.current}
                   </div>
                   {/* Visual Pulse for Click */}
                   {!isCompleted && <div className="absolute inset-0 bg-white/5 opacity-0 group-active:opacity-100 transition-opacity"></div>}
                </div>
             </button>
          </div>

          <div className="w-full max-w-xs space-y-4 shrink-0">
            <div className="bg-white p-4 rounded-[28px] shadow-xl shadow-emerald-900/5 border border-emerald-50 text-center relative overflow-hidden">
               {justCompleted && (
                 <div className="absolute inset-0 bg-emerald-600 flex flex-col items-center justify-center z-10 animate-fade-up">
                    <i className="fas fa-check-circle text-white text-3xl mb-2 animate-check-draw"></i>
                    <h3 className="text-white font-black uppercase text-xs tracking-widest">{t('challengeComplete')}</h3>
                    <button 
                      onClick={handleArchive}
                      className="mt-4 bg-white text-emerald-700 px-6 py-2.5 rounded-full font-black text-[9px] uppercase tracking-widest shadow-lg active:scale-95"
                    >
                      {t('completeAndArchive')}
                    </button>
                 </div>
               )}

               <div className="flex justify-between items-end mb-2 px-1">
                  <span className="text-[9px] text-emerald-800/40 font-black uppercase tracking-widest">Progress</span>
                  <span className="text-xs font-black text-[#064e3b]">{activeChallenge.current} / {activeChallenge.target}</span>
               </div>
               
               <div className="w-full bg-emerald-50 h-2 rounded-full overflow-hidden border border-emerald-100 mb-3">
                  <div 
                    className="bg-[#064e3b] h-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
               </div>

               <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                 {isCompleted ? t('challengeComplete') : t('tapToCount')}
               </p>
            </div>

            <button 
              onClick={() => { setActiveChallengeId(null); setJustCompleted(false); }}
              className="w-full py-3 bg-slate-50 text-slate-400 rounded-xl font-black text-[9px] uppercase tracking-widest border border-slate-100 hover:bg-slate-100 transition-all active:scale-95"
            >
              {t('back')} to Challenges
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Grid List View
  return (
    <div className="flex flex-col h-full bg-[#fdfbf7] animate-fade-up">
      <div className="p-4 pt-10 pb-6 flex items-center justify-between bg-[#064e3b] text-white shadow-xl rounded-b-[40px] z-20 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => setCurrentView('dashboard')} className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-xl hover:bg-white/20 transition-all border border-white/10 active:scale-90">
            <i className="fas fa-chevron-left text-xs"></i>
          </button>
          <h1 className="text-xl font-bold tracking-tight">{t('dhikrList')}</h1>
        </div>
        <button 
          onClick={() => setShowHistory(true)} 
          className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-xl hover:bg-white/20 transition-all border border-white/10 active:scale-90"
        >
          <i className="fas fa-history text-xs"></i>
        </button>
      </div>

      <div className="p-4 flex-1 overflow-hidden"> {/* No scroll here */}
        <div className="grid grid-cols-1 gap-2 pb-4 max-w-sm mx-auto">
          {state.activeChallenges.map((challenge) => {
            const progress = Math.min(100, (challenge.current / challenge.target) * 100);
            const isCompleted = challenge.current >= challenge.target;

            return (
              <button 
                key={challenge.id}
                onClick={() => setActiveChallengeId(challenge.id)}
                className={`flex flex-col p-4 rounded-[28px] border transition-all text-left group relative overflow-hidden ${
                  isCompleted 
                    ? 'bg-emerald-50 border-emerald-100 opacity-80' 
                    : 'bg-white border-emerald-50 shadow-sm hover:shadow-xl hover:scale-[1.02] active:scale-95'
                }`}
              >
                {isCompleted && (
                  <div className="absolute top-3 right-3 text-emerald-600">
                    <i className="fas fa-check-circle text-base"></i>
                  </div>
                )}
                
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-sm font-black text-[#064e3b] uppercase tracking-wider mb-0.5">
                      {t(challenge.title)}
                    </h3>
                    <p className="arabic-font text-base text-emerald-800 font-bold" dir="rtl">{challenge.arabic}</p>
                  </div>
                </div>

                <div className="mt-auto space-y-2">
                  <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest">
                    <span className={isCompleted ? 'text-emerald-600' : 'text-slate-400'}>
                      {isCompleted ? t('completed') : t('progress')}
                    </span>
                    <span className="text-emerald-800">{challenge.current} / {challenge.target}</span>
                  </div>
                  <div className="w-full bg-slate-50 h-1.5 rounded-full overflow-hidden border border-slate-100">
                    <div 
                      className={`h-full transition-all duration-1000 ${isCompleted ? 'bg-emerald-500' : 'bg-emerald-600'}`} 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="bg-[#064e3b]/5 p-4 rounded-[28px] text-center border border-emerald-50/50 max-w-sm mx-auto">
           <i className="fas fa-hand-holding-heart text-emerald-700/20 text-3xl mb-3"></i>
           <p className="text-[#064e3b]/60 text-[9px] italic leading-relaxed">
             "For without doubt in the remembrance of Allah do hearts find rest." (13:28)
           </p>
        </div>
      </div>
    </div>
  );
};

export default DhikrCounter;
