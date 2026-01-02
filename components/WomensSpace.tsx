
import React, { useState } from 'react';
import { UserData, PrayerTimings, HealthPeriod } from '../types';

interface WomensSpaceProps {
  state: UserData & { todayTimings: PrayerTimings | null };
  toggleHayd: (active: boolean) => void;
  addHealthPeriod: (start: string, end: string | null) => void;
  removeHealthPeriod: (id: string) => void;
  setCurrentView: (view: any) => void;
  t: (key: string) => string;
}

const WomensSpace: React.FC<WomensSpaceProps> = ({ state, toggleHayd, addHealthPeriod, removeHealthPeriod, setCurrentView, t }) => {
  const [newStart, setNewStart] = useState(new Date().toISOString().split('T')[0]);
  const [newEnd, setNewEnd] = useState<string>('');
  const [showAdd, setShowAdd] = useState(false);

  const handleAdd = () => {
    if (!newStart) return;
    addHealthPeriod(newStart, newEnd || null);
    setShowAdd(false);
    setNewEnd('');
  };

  const recentPeriods = state.healthPeriods.slice(-2).reverse();

  return (
    <div className="flex flex-col h-full bg-[#fdfbf7] view-transition overflow-hidden">
      <div className="p-4 pt-10 pb-4 bg-emerald-900 text-white shrink-0 shadow-lg rounded-b-[32px]">
        <div className="flex items-center gap-3">
          <button onClick={() => setCurrentView('dashboard')} className="w-8 h-8 flex items-center justify-center bg-white/10 rounded-lg"><i className="fas fa-chevron-left text-xs"></i></button>
          <h1 className="text-lg font-bold tracking-tight">{t('womensSpace')}</h1>
        </div>
      </div>

      <div className="flex-1 p-4 flex flex-col justify-around overflow-hidden">
        <div className={`p-4 rounded-2xl text-center border-2 transition-all ${state.isHaydNifas ? 'border-rose-100 bg-rose-50/30' : 'border-emerald-50 bg-white shadow-sm'} shrink-0`}>
          <div className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-2 text-xl ${state.isHaydNifas ? 'bg-rose-500 text-white shadow-lg rotate-12' : 'bg-emerald-50 text-emerald-700'}`}><i className="fas fa-droplet"></i></div>
          <h2 className="text-xs font-black text-emerald-900 mb-1">{t('haydMode')}</h2>
          <button onClick={() => toggleHayd(!state.isHaydNifas)} className={`w-full py-2 rounded-xl font-black text-[8px] uppercase tracking-widest transition-all shadow-sm ${state.isHaydNifas ? 'bg-rose-500 text-white' : 'bg-[#064e3b] text-white'}`}>{state.isHaydNifas ? t('inactive') : t('active')}</button>
        </div>

        <div className="flex-1 flex flex-col justify-around overflow-hidden mt-2">
          <div className="flex items-center justify-between mb-1 shrink-0 px-1">
            <h3 className="text-[9px] font-black text-emerald-900 uppercase tracking-widest flex items-center gap-1"><i className="fas fa-history text-[10px] text-gold-classic"></i> Recent</h3>
            <button onClick={() => setShowAdd(!showAdd)} className="w-6 h-6 bg-emerald-50 text-emerald-700 rounded-full flex items-center justify-center border border-emerald-100 transition-all"><i className={`fas ${showAdd ? 'fa-times' : 'fa-plus'} text-[8px]`}></i></button>
          </div>

          <div className="flex-1 flex flex-col gap-1.5 overflow-hidden">
            {showAdd ? (
              <div className="bg-white p-3 rounded-2xl border border-emerald-50 shadow-lg animate-fade-up space-y-2 shrink-0">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-0.5"><label className="text-[6px] font-black text-slate-400 uppercase tracking-widest ml-1">Start</label><input type="date" value={newStart} onChange={e => setNewStart(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-100 rounded-lg text-[9px] outline-none" /></div>
                  <div className="space-y-0.5"><label className="text-[6px] font-black text-slate-400 uppercase tracking-widest ml-1">End</label><input type="date" value={newEnd} onChange={e => setNewEnd(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-100 rounded-lg text-[9px] outline-none" /></div>
                </div>
                <button onClick={handleAdd} className="w-full py-2 bg-[#064e3b] text-white rounded-lg font-black text-[8px] uppercase tracking-widest shadow-md">Save</button>
              </div>
            ) : (
              recentPeriods.map(p => (
                <div key={p.id} className="bg-white p-2.5 rounded-xl border border-emerald-50 shadow-sm flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2"><div className="w-7 h-7 bg-rose-50 text-rose-500 rounded-lg flex items-center justify-center text-[9px]"><i className="fas fa-tint"></i></div><div><p className="text-[9px] font-black text-emerald-900 leading-none mb-0.5">{p.start.split('T')[0]}</p><p className="text-[7px] text-slate-400 uppercase font-bold">Excused</p></div></div>
                  <button onClick={() => removeHealthPeriod(p.id)} className="w-6 h-6 text-rose-200"><i className="fas fa-trash text-[8px]"></i></button>
                </div>
              ))
            )}
            {!showAdd && recentPeriods.length === 0 && <div className="flex-1 border-2 border-dashed border-emerald-50 rounded-2xl flex items-center justify-center text-[8px] text-slate-300 font-bold uppercase">No records</div>}
          </div>
        </div>

        <div className="bg-amber-50 p-3 rounded-2xl border border-amber-100 shrink-0 mt-2">
          <h3 className="font-black text-amber-800 text-[8px] mb-1 flex items-center gap-1"><i className="fas fa-circle-info text-[9px]"></i> Rules</h3>
          <ul className="space-y-1 text-[7px] text-amber-900/80 font-medium">
            <li className="flex gap-1"><i className="fas fa-check-circle text-amber-500 mt-0.5"></i> <span>Prayer during periods are <b>exempted</b> and not made up.</span></li>
            <li className="flex gap-1"><i className="fas fa-exclamation-circle text-amber-500 mt-0.5"></i> <span>Ramadan fasts <b>must</b> be made up later (Qada).</span></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default WomensSpace;
