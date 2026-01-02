
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
    if ('vibrate' in navigator) navigator.vibrate(40);
    setTapAnimation(true); setTimeout(() => setTapAnimation(false), 100);
    updateProgress(state.activeDhikrId, 1);
  };

  const handleIncrementPersonal = () => {
    if (!activePersonalId || !activePersonal) return;
    if ('vibrate' in navigator) navigator.vibrate(50);
    setTapAnimation(true); setTimeout(() => setTapAnimation(false), 100);
    updatePersonalProgress(activePersonalId, 1);
  };

  if (activeChallenge || activePersonal) {
    const title = activeChallenge ? t(activeChallenge.title) : activePersonal?.name;
    const current = activeChallenge ? activeChallenge.current : activePersonal?.sessionCount;
    const arabic = activeChallenge ? activeChallenge.arabic : '';
    const increment = activeChallenge ? handleIncrementChallenge : handleIncrementPersonal;

    return (
      <div className="h-full flex flex-col bg-emerald-900 text-white animate-fade-in">
        <header className="p-6 pt-12 pb-4 flex items-center gap-4">
          <button onClick={() => { setActiveDhikr(null); setActivePersonalId(null); }} className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 active:scale-90"><i className="fas fa-chevron-left"></i></button>
          <h1 className="text-xl font-black truncate">{title}</h1>
        </header>
        
        <div className="flex-1 flex flex-col items-center justify-around py-12">
          <div className="text-center px-6">
            <p className="arabic-font text-5xl font-bold mb-4 opacity-90" dir="rtl">{arabic}</p>
            <p className="text-emerald-300 text-[10px] font-black uppercase tracking-widest">{title}</p>
          </div>

          <button onClick={increment} className={`w-64 h-64 rounded-full bg-white text-emerald-900 flex flex-col items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.2)] transition-all duration-100 ${tapAnimation ? 'scale-90' : 'active:scale-95'}`}>
             <span className="text-8xl font-black tabular-nums tracking-tighter">{current}</span>
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-[-5px]">RECITATIONS</span>
          </button>

          <div className="w-full px-8 text-center space-y-4">
             {activeChallenge && activeChallenge.current >= activeChallenge.target && (
               <button onClick={() => archiveChallenge(activeChallenge.id)} className="w-full py-5 bg-emerald-600 rounded-[28px] font-black text-sm uppercase tracking-widest shadow-xl animate-bounce">Complete & Archive</button>
             )}
             <p className="text-emerald-300/40 text-[9px] font-black uppercase tracking-widest">Tap the circle to recite</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-hidden">
      <header className="bg-white p-6 pt-12 pb-4 flex justify-between items-center z-10 shrink-0">
        <div>
          <h1 className="text-2xl font-black text-emerald-900 mb-1">{t('dhikr')}</h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Spiritual Energy</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button onClick={() => setActiveTab('challenges')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${activeTab === 'challenges' ? 'bg-white text-emerald-900 shadow-sm' : 'text-slate-400'}`}>Tasks</button>
          <button onClick={() => setActiveTab('personal')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${activeTab === 'personal' ? 'bg-white text-emerald-900 shadow-sm' : 'text-slate-400'}`}>Personal</button>
        </div>
      </header>

      <div className="scroll-container px-6 pt-4 space-y-4">
        {activeTab === 'challenges' ? (
          state.activeChallenges.map(c => {
            const perc = Math.min(100, (c.current / c.target) * 100);
            return (
              <div key={c.id} onClick={() => setActiveDhikr(c.id)} className="card-premium btn-ripple cursor-pointer group">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 overflow-hidden">
                    <h3 className="font-black text-emerald-900 uppercase text-sm mb-1">{t(c.title)}</h3>
                    <p className="arabic-font text-lg text-emerald-800/40 truncate" dir="rtl">{c.arabic}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-inner ${perc === 100 ? 'bg-emerald-600 text-white' : 'bg-slate-50 text-slate-300'}`}>
                    <i className={`fas ${perc === 100 ? 'fa-check' : 'fa-play'} text-xs`}></i>
                  </div>
                </div>
                <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                   <div className="bg-emerald-600 h-full rounded-full transition-all" style={{ width: `${perc}%` }}></div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="space-y-4">
            <button onClick={() => setIsAddingDhikr(true)} className="w-full p-8 rounded-[32px] border-4 border-dashed border-emerald-100 text-emerald-700 flex flex-col items-center gap-2 btn-ripple">
              <i className="fas fa-plus-circle text-2xl"></i>
              <span className="font-black text-[10px] uppercase tracking-widest">Add New Task</span>
            </button>
            {state.personalDhikrs.map(d => (
              <div key={d.id} onClick={() => setActivePersonalId(d.id)} className="card-premium flex items-center justify-between btn-ripple cursor-pointer">
                <div>
                  <h3 className="font-black text-emerald-900 text-sm uppercase">{d.name}</h3>
                  <p className="text-[9px] font-black text-slate-400 mt-1 uppercase">Daily: {d.dailyCount}</p>
                </div>
                <div className="w-10 h-10 bg-emerald-50 text-emerald-700 rounded-xl flex items-center justify-center"><i className="fas fa-fingerprint"></i></div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isAddingDhikr && (
        <div className="absolute inset-0 z-[100] bg-emerald-900/80 backdrop-blur-md flex items-center justify-center p-6">
          <div className="w-full max-w-sm bg-white rounded-[40px] p-8 shadow-2xl space-y-6">
            <h2 className="text-2xl font-black text-emerald-900 text-center">New Remembrance</h2>
            <input type="text" placeholder="e.g. Istighfar" value={newDhikrName} onChange={e => setNewDhikrName(e.target.value)} className="w-full p-5 bg-slate-50 border border-slate-100 rounded-3xl outline-none font-bold text-emerald-900" />
            <div className="flex gap-4">
               <button onClick={() => setIsAddingDhikr(false)} className="flex-1 py-4 text-slate-400 font-black uppercase text-[10px]">Cancel</button>
               <button onClick={() => { addPersonalDhikr(newDhikrName); setIsAddingDhikr(false); setNewDhikrName(''); }} className="flex-1 py-4 bg-emerald-900 text-white rounded-2xl font-black uppercase text-[10px] shadow-lg">Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DhikrCounter;
