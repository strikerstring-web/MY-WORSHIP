
import React, { useState } from 'react';

interface AboutHelpProps {
  setCurrentView: (view: any) => void;
  t: (key: string) => string;
}

const AboutHelp: React.FC<AboutHelpProps> = ({ setCurrentView, t }) => {
  const [activeTab, setActiveTab] = useState<'about' | 'guide'>('about');

  const guideItems = [
    { icon: 'fa-kaaba', title: 'fard', desc: 'fardGuide' },
    { icon: 'fa-sun', title: 'sunnah', desc: 'sunnahGuide' },
    { icon: 'fa-calendar-check', title: 'qadah', desc: 'qadahGuide' },
    { icon: 'fa-moon', title: 'fasting', desc: 'fastingGuide' },
    { icon: 'fa-book-quran', title: 'quran', desc: 'quranGuide' },
    { icon: 'fa-venus', title: 'womensSpace', desc: 'womensGuide' },
    { icon: 'fa-shield-halved', title: 'persistence', desc: 'persistenceGuide' }
  ];

  return (
    <div className="h-full w-full flex flex-col bg-[#fdfbf7] overflow-hidden view-transition">
      <div className="p-4 pt-10 pb-6 bg-[#064e3b] text-white flex flex-col gap-4 shadow-xl rounded-b-[40px] z-20 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => setCurrentView('dashboard')} className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-xl hover:bg-white/20 transition-all active-scale border border-white/10 rtl:rotate-180">
            <i className="fas fa-chevron-left text-xs"></i>
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight">{t('about')}</h1>
            <p className="text-[9px] text-emerald-300/80 font-bold uppercase tracking-[0.2em] mt-0.5">{t('howItWorks')}</p>
          </div>
        </div>

        <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 backdrop-blur-md">
          <button onClick={() => setActiveTab('about')} className={`flex-1 py-2.5 px-3 rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all ${activeTab === 'about' ? 'bg-white text-emerald-900 shadow-lg' : 'text-white/60'}`}>{t('about')}</button>
          <button onClick={() => setActiveTab('guide')} className={`flex-1 py-2.5 px-3 rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all ${activeTab === 'guide' ? 'bg-white text-emerald-900 shadow-lg' : 'text-white/60'}`}>{t('guideTitle')}</button>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-hidden flex flex-col"> {/* No scroll here */}
        {activeTab === 'about' ? (
          <div className="space-y-4 animate-fade-up flex-1 flex flex-col items-center text-center justify-between">
            <div className="shrink-0">
              <div className="w-16 h-16 bg-emerald-50 rounded-[28px] flex items-center justify-center mx-auto mb-4 border-2 border-white shadow-lg rotate-3">
                <i className="fas fa-kaaba text-2xl text-emerald-800"></i>
              </div>
              <h2 className="text-2xl font-black text-emerald-900 mb-2 tracking-tighter">Ibadathi</h2>
              <p className="text-slate-600 text-xs leading-relaxed px-4 font-medium italic">"{t('appPurpose')}"</p>
            </div>

            <div className="grid grid-cols-1 gap-3 w-full max-w-xs flex-1 justify-center flex flex-col">
              <div className="bg-white p-4 rounded-[28px] shadow-sm border border-emerald-50">
                <h3 className="text-emerald-900 font-bold mb-1.5 flex items-center gap-1.5 text-xs uppercase tracking-widest"><i className="fas fa-heart text-gold-classic text-sm"></i> Goal</h3>
                <p className="text-slate-500 text-[9px] leading-relaxed">To empower Muslims with modern tools to measure and improve their daily worship consistency.</p>
              </div>
              <div className="bg-emerald-50 p-4 rounded-[28px] border border-emerald-100">
                <h3 className="text-emerald-900 font-bold mb-1.5 flex items-center gap-1.5 text-xs uppercase tracking-widest"><i className="fas fa-globe text-emerald-600 text-sm"></i> Access</h3>
                <p className="text-emerald-800/70 text-[9px] leading-relaxed">Multi-language support for diverse backgrounds in spiritual growth.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2 animate-fade-up flex-1 flex flex-col overflow-hidden">
            {guideItems.map((item, idx) => (
              <div key={idx} className="bg-white p-3 rounded-[24px] border border-emerald-50 shadow-sm flex gap-3 items-start shrink-0">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0"><i className={`fas ${item.icon} text-xs`}></i></div>
                <div>
                  <h3 className="text-[9px] font-black text-emerald-900 uppercase tracking-widest mb-0.5">{t(item.title)}</h3>
                  <p className="text-slate-500 text-[8px] leading-relaxed font-medium">{t(item.desc)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="py-4 text-center text-slate-300 font-bold uppercase tracking-widest text-[7px] shrink-0">Ibadathi Exhibition v5.2 • 1446 AH</div>
      </div>
    </div>
  );
};

export default AboutHelp;
