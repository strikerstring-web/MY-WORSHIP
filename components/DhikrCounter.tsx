
import React, { useState, useEffect } from 'react';
import { UserData, DhikrChallenge, PrayerTimings } from '../types';

interface DhikrCounterProps {
  state: UserData & { todayTimings: PrayerTimings | null };
  updateProgress: (id: string, delta: number) => void;
  archiveChallenge: (id: string) => void;
  setCurrentView: (view: any) => void;
  t: (key: string) => string;
}

const ITEMS_PER_PAGE = 4;

const DhikrCounter: React.FC<DhikrCounterProps> = ({ state, updateProgress, archiveChallenge, setCurrentView, t }) => {
  const [activeChallengeId, setActiveChallengeId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [historyPage, setHistoryPage] = useState(0);
  const [justCompleted, setJustCompleted] = useState(false);

  const activeChallenge = state.activeChallenges.find(c => c.id === activeChallengeId);

  const handleIncrement = () => {
    if (!activeChallengeId || !activeChallenge) return;
    if ('vibrate' in navigator) navigator.vibrate(40);
    if (activeChallenge.current < activeChallenge.target) {
      updateProgress(activeChallengeId, 1);
      if (activeChallenge.current + 1 === activeChallenge.target) {
        setJustCompleted(true);
        if ('vibrate' in navigator) navigator.vibrate([100, 50, 100]);
      }
    }
  };

  if (showHistory) {
    const totalPages = Math.ceil(state.dhikrHistory.length / ITEMS_PER_PAGE);
    const visibleHistory = state.dhikrHistory.slice(historyPage * ITEMS_PER_PAGE, (historyPage + 1) * ITEMS_PER_PAGE);

    return (
      <div className="flex flex-col h-full bg-[#fdfbf7] animate-fade-up">
        <div className="p-4 pt-10 pb-6 bg-[#064e3b] text-white shrink-0 shadow-lg rounded-b-[32px]">
          <div className="flex items-center gap-3">
            <button onClick={() => setShowHistory(false)} className="w-8 h-8 flex items-center justify-center bg-white/10 rounded-lg"><i className="fas fa-chevron-left text-xs"></i></button>
            <h1 className="text-lg font-bold tracking-tight">{t('history')}</h1>
          </div>
        </div>
        <div className="flex-1 p-4 flex flex-col justify-between overflow-hidden">
          <div className="space-y-2 flex-1">
            {state.dhikrHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full opacity-20"><i className="fas fa-box-open text-3xl mb-2"></i><p className="text-[10px] uppercase font-black">{t('noHistory')}</p></div>
            ) : (
              visibleHistory.map((entry) => {
                const perc = Math.round((entry.current / entry.target) * 100);
                return (
                  <div key={entry.id} className="bg-white p-3 rounded-2xl border border-emerald-50 shadow-sm">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-[10px] font-black text-[#064e3b] uppercase truncate w-2/3">{t(entry.title)}</h3>
                      <span className="text-[8px] font-black text-emerald-700 bg-emerald-50 px-1.5 rounded">{perc}%</span>
                    </div>
                    <p className="text-[7px] text-slate-400 font-bold uppercase mb-2">{new Date(entry.date).toLocaleDateString()}</p>
                    <div className="w-full bg-slate-50 h-1 rounded-full overflow-hidden"><div className="bg-emerald-500 h-full" style={{ width: `${Math.min(100, perc)}%` }}></div></div>
                  </div>
                );
              })
            )}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-between items-center bg-white p-2 rounded-xl border border-emerald-50 shadow-sm shrink-0">
               <button disabled={historyPage === 0} onClick={() => setHistoryPage(p => p - 1)} className="w-8 h-8 flex items-center justify-center bg-emerald-50 rounded-lg disabled:opacity-30"><i className="fas fa-chevron-left text-[8px]"></i></button>
               <span className="text-[8px] font-black uppercase text-slate-400">Page {historyPage + 1} of {totalPages}</span>
               <button disabled={historyPage === totalPages - 1} onClick={() => setHistoryPage(p => p + 1)} className="w-8 h-8 flex items-center justify-center bg-emerald-50 rounded-lg disabled:opacity-30"><i className="fas fa-chevron-right text-[8px]"></i></button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (activeChallengeId && activeChallenge) {
    return (
      <div className="flex flex-col h-full bg-[#fdfbf7] animate-fade-up">
        <div className="p-4 pt-10 pb-6 bg-[#064e3b] text-white shrink-0 shadow-lg rounded-b-[32px]">
          <div className="flex items-center gap-3">
            <button onClick={() => { setActiveChallengeId(null); setJustCompleted(false); }} className="w-8 h-8 flex items-center justify-center bg-white/10 rounded-lg"><i className="fas fa-chevron-left text-xs"></i></button>
            <h1 className="text-lg font-bold tracking-tight truncate w-2/3">{t(activeChallenge.title)}</h1>
          </div>
        </div>

        <div className="flex-1 p-4 flex flex-col items-center justify-around overflow-hidden">
          <div className="text-center">
            <p className="arabic-font text-3xl text-[#064e3b] font-bold mb-1" dir="rtl">{activeChallenge.arabic}</p>
            <p className="text-slate-400 text-[8px] font-bold uppercase tracking-widest">{t(activeChallenge.title)}</p>
          </div>

          <button onClick={handleIncrement} disabled={activeChallenge.current >= activeChallenge.target} className="relative w-40 h-40 group flex items-center justify-center active-scale">
             <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-[#064e3b] rounded-full shadow-xl border-4 border-white/30 flex items-center justify-center overflow-hidden">
                <span className="text-white text-5xl font-black">{activeChallenge.current}</span>
             </div>
          </button>

          <div className="w-full max-w-xs space-y-4">
            <div className="bg-white p-4 rounded-2xl shadow-md border border-emerald-50 text-center relative overflow-hidden h-32 flex flex-col justify-center">
               {justCompleted ? (
                 <div className="animate-fade-up">
                    <i className="fas fa-check-circle text-emerald-600 text-2xl mb-1"></i>
                    <h3 className="text-emerald-900 font-black uppercase text-[10px] mb-2">COMPLETE</h3>
                    <button onClick={() => { archiveChallenge(activeChallengeId); setActiveChallengeId(null); setJustCompleted(false); }} className="bg-emerald-600 text-white px-4 py-1.5 rounded-full font-black text-[8px] uppercase">Archive</button>
                 </div>
               ) : (
                 <>
                   <div className="flex justify-between items-end mb-2 px-1 text-[8px] font-black uppercase text-slate-400"><span>Progress</span><span>{activeChallenge.current} / {activeChallenge.target}</span></div>
                   <div className="w-full bg-emerald-50 h-1.5 rounded-full overflow-hidden mb-3"><div className="bg-[#064e3b] h-full transition-all duration-300" style={{ width: `${Math.min(100, (activeChallenge.current/activeChallenge.target)*100)}%` }}></div></div>
                   <p className="text-[7px] text-slate-300 font-bold uppercase">{t('tapToCount')}</p>
                 </>
               )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#fdfbf7] animate-fade-up">
      <div className="p-4 pt-10 pb-6 bg-[#064e3b] text-white flex items-center justify-between shrink-0 shadow-lg rounded-b-[32px]">
        <div className="flex items-center gap-3">
          <button onClick={() => setCurrentView('dashboard')} className="w-8 h-8 flex items-center justify-center bg-white/10 rounded-lg"><i className="fas fa-chevron-left text-xs"></i></button>
          <h1 className="text-lg font-bold tracking-tight">{t('dhikrList')}</h1>
        </div>
        <button onClick={() => setShowHistory(true)} className="w-8 h-8 flex items-center justify-center bg-white/10 rounded-lg"><i className="fas fa-history text-xs"></i></button>
      </div>

      <div className="flex-1 p-3 flex flex-col gap-2 overflow-hidden justify-around">
        <div className="grid grid-cols-1 gap-1.5">
          {state.activeChallenges.slice(0, 4).map((challenge) => {
            const perc = Math.min(100, (challenge.current / challenge.target) * 100);
            return (
              <button key={challenge.id} onClick={() => setActiveChallengeId(challenge.id)} className="flex flex-col p-3 rounded-2xl bg-white border border-emerald-50 shadow-sm active-scale text-left">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-[10px] font-black text-[#064e3b] uppercase truncate w-2/3">{t(challenge.title)}</h3>
                  <i className={`fas ${perc === 100 ? 'fa-check-circle text-emerald-500' : 'fa-play text-slate-200'} text-[9px]`}></i>
                </div>
                <div className="w-full bg-slate-50 h-1 rounded-full overflow-hidden"><div className="bg-emerald-600 h-full" style={{ width: `${perc}%` }}></div></div>
              </button>
            );
          })}
        </div>
        <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-100 text-center">
           <p className="text-[#064e3b]/60 text-[8px] italic leading-tight px-4">"Verily, in the remembrance of Allah do hearts find rest." (13:28)</p>
        </div>
      </div>
    </div>
  );
};

export default DhikrCounter;
