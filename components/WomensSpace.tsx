
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

  const visibleHealthPeriods = state.healthPeriods.slice(-3).reverse(); // Show last 3 periods

  return (
    <div className="flex flex-col h-full bg-[#fdfbf7] view-transition">
      <div className="p-4 pt-10 pb-6 bg-emerald-900 text-white flex flex-col gap-4 shadow-xl rounded-b-[40px] z-20 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => setCurrentView('dashboard')} className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-xl hover:bg-white/20 transition-all active-scale border border-white/10 rtl:rotate-180">
            <i className="fas fa-chevron-left text-xs"></i>
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight">{t('womensSpace')}</h1>
            <p className="text-[9px] text-emerald-300/80 font-bold uppercase tracking-[0.2em] mt-0.5">Wellness & Rulings</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col flex-1 p-4 space-y-4 overflow-hidden"> {/* No scroll here */}
        {/* Quick Toggle Card */}
        <div className={`p-4 rounded-[32px] text-center border-2 transition-all duration-500 bg-white ${
          state.isHaydNifas ? 'border-rose-100 shadow-xl shadow-rose-900/5' : 'border-emerald-50 shadow-sm'
        } shrink-0`}>
          <div className={`w-16 h-16 mx-auto rounded-[24px] flex items-center justify-center mb-4 text-2xl transition-all duration-500 ${
            state.isHaydNifas ? 'bg-rose-500 text-white shadow-lg shadow-rose-200 rotate-12' : 'bg-emerald-50 text-emerald-700'
          }`}>
            <i className="fas fa-droplet"></i>
          </div>
          <h2 className="text-base font-black text-emerald-900 mb-1">{t('haydMode')}</h2>
          <p className="text-slate-400 text-[9px] font-semibold mb-4 px-2">
            {state.isHaydNifas 
              ? "Period mode is active. Prayers are automatically exempted." 
              : "Activate this mode manually when your period starts to automate tracking."}
          </p>
          
          <button 
            onClick={() => toggleHayd(!state.isHaydNifas)}
            className={`w-full py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active-scale shadow-md ${
              state.isHaydNifas ? 'bg-rose-500 text-white' : 'bg-[#064e3b] text-white'
            }`}
          >
            {state.isHaydNifas ? t('inactive') : t('active')}
          </button>
        </div>

        {/* History / Manual Range Entry */}
        <div className="space-y-3 flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-2 shrink-0">
            <h3 className="text-xs font-black text-emerald-900 uppercase tracking-widest flex items-center gap-1.5">
               <i className="fas fa-calendar-alt text-gold-classic text-sm"></i>
               Period History
            </h3>
            <button 
              onClick={() => setShowAdd(!showAdd)}
              className="w-9 h-9 bg-emerald-50 text-emerald-700 rounded-full flex items-center justify-center border border-emerald-100 transition-all hover:bg-emerald-100 active:scale-90"
            >
              <i className={`fas ${showAdd ? 'fa-times' : 'fa-plus'} text-xs`}></i>
            </button>
          </div>

          {showAdd && (
            <div className="bg-white p-4 rounded-[28px] border border-emerald-50 shadow-xl animate-fade-up space-y-3 shrink-0">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Start Date</label>
                  <input type="date" value={newStart} onChange={e => setNewStart(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-emerald-900 text-xs outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">End Date (Optional)</label>
                  <input type="date" value={newEnd} onChange={e => setNewEnd(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-emerald-900 text-xs outline-none" />
                </div>
              </div>
              <button onClick={handleAdd} className="w-full py-3 bg-[#064e3b] text-white rounded-xl font-black text-[9px] uppercase tracking-widest shadow-md">Save Period</button>
            </div>
          )}

          <div className="space-y-2 flex-1 overflow-hidden flex flex-col"> {/* No scroll here, limited display */}
            {visibleHealthPeriods.length === 0 ? (
              <div className="flex-1 flex items-center justify-center border-2 border-dashed border-emerald-50 rounded-[32px] text-center">
                <p className="text-[9px] text-slate-300 font-bold uppercase tracking-widest">No previous records</p>
              </div>
            ) : (
              visibleHealthPeriods.map(p => (
                <div key={p.id} className="bg-white p-3 rounded-[24px] border border-emerald-50 shadow-sm flex items-center justify-between group shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-rose-50 text-rose-500 rounded-lg flex items-center justify-center">
                       <i className="fas fa-tint text-xs"></i>
                    </div>
                    <div>
                      <p className="text-xs font-black text-emerald-900">{p.start} {p.end ? `— ${p.end}` : ' (Active)'}</p>
                      <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">Excused Period</p>
                    </div>
                  </div>
                  <button onClick={() => removeHealthPeriod(p.id)} className="w-7 h-7 text-rose-300 hover:text-rose-500 transition-colors">
                    <i className="fas fa-trash-can text-xs"></i>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Fiqh Reminder with Integrated Qada Logic */}
        <div className="bg-amber-50 p-4 rounded-[28px] border border-amber-100 relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 p-2 opacity-5 rotate-12">
             <i className="fas fa-scroll text-5xl text-amber-900"></i>
          </div>
          <h3 className="font-black text-amber-800 text-xs mb-2 flex items-center gap-1.5 relative z-10">
            <i className="fas fa-circle-info text-sm"></i> Integrated Rulings
          </h3>
          <ul className="space-y-2 text-[9px] text-amber-900/80 font-medium relative z-10">
            <li className="flex gap-2">
              <i className="fas fa-check-circle text-amber-500 mt-0.5 text-xs"></i>
              <span><b>Prayer:</b> Missed prayers during these periods are <b>exempted</b>. They do not need to be made up.</span>
            </li>
            <li className="flex gap-2">
              <i className="fas fa-exclamation-circle text-amber-500 mt-0.5 text-xs"></i>
              <span><b>Ramadan Fasts:</b> These <b>must</b> be made up later. They are added to your Qadāʾ Fasting count.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default WomensSpace;
