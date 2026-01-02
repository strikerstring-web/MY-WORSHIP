
import React, { useState } from 'react';

interface AboutHelpProps {
  setCurrentView: (view: any) => void;
  t: (key: string) => string;
}

const GUIDE_ITEMS_PER_PAGE = 4;

const AboutHelp: React.FC<AboutHelpProps> = ({ setCurrentView, t }) => {
  const [activeTab, setActiveTab] = useState<'about' | 'guide'>('about');
  const [guidePage, setGuidePage] = useState(0);

  const guideItems = [
    { icon: 'fa-kaaba', title: 'fard', desc: 'fardGuide' },
    { icon: 'fa-sun', title: 'sunnah', desc: 'sunnahGuide' },
    { icon: 'fa-calendar-check', title: 'qadah', desc: 'qadahGuide' },
    { icon: 'fa-moon', title: 'fasting', desc: 'fastingGuide' },
    { icon: 'fa-book-quran', title: 'quran', desc: 'quranGuide' },
    { icon: 'fa-venus', title: 'womensSpace', desc: 'womensGuide' },
    { icon: 'fa-shield-halved', title: 'persistence', desc: 'persistenceGuide' }
  ];

  const totalGuidePages = Math.ceil(guideItems.length / GUIDE_ITEMS_PER_PAGE);
  const visibleGuide = guideItems.slice(guidePage * GUIDE_ITEMS_PER_PAGE, (guidePage + 1) * GUIDE_ITEMS_PER_PAGE);

  return (
    <div className="h-full w-full flex flex-col bg-[#fdfbf7] overflow-hidden view-transition">
      <div className="p-4 pt-10 pb-4 bg-[#064e3b] text-white shrink-0 shadow-lg rounded-b-[32px]">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => setCurrentView('dashboard')} className="w-8 h-8 flex items-center justify-center bg-white/10 rounded-lg"><i className="fas fa-chevron-left text-xs"></i></button>
          <h1 className="text-lg font-bold tracking-tight">{t('about')}</h1>
        </div>
        <div className="flex bg-white/5 p-1 rounded-xl">
          <button onClick={() => setActiveTab('about')} className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${activeTab === 'about' ? 'bg-white text-emerald-900 shadow' : 'text-white/60'}`}>{t('about')}</button>
          <button onClick={() => setActiveTab('guide')} className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${activeTab === 'guide' ? 'bg-white text-emerald-900 shadow' : 'text-white/60'}`}>{t('guideTitle')}</button>
        </div>
      </div>

      <div className="flex-1 p-4 flex flex-col justify-around overflow-hidden">
        {activeTab === 'about' ? (
          <div className="space-y-4 animate-fade-up flex-1 flex flex-col items-center text-center justify-around">
            <div className="shrink-0">
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-3 border-2 border-white shadow-md rotate-3">
                <i className="fas fa-kaaba text-2xl text-emerald-800"></i>
              </div>
              <h2 className="text-xl font-black text-emerald-900 mb-1 tracking-tighter">Ibadathi</h2>
              <p className="text-slate-500 text-[10px] leading-tight px-6 font-medium italic">"{t('appPurpose')}"</p>
            </div>
            <div className="grid grid-cols-1 gap-2 w-full max-w-xs shrink-0">
              <div className="bg-white p-3 rounded-2xl shadow-sm border border-emerald-50">
                <h3 className="text-emerald-900 font-bold mb-1 flex items-center justify-center gap-1.5 text-[9px] uppercase"><i className="fas fa-heart text-gold-classic text-[10px]"></i> Goal</h3>
                <p className="text-slate-500 text-[8px] leading-tight px-4">Modern tools for consistency in daily worship.</p>
              </div>
              <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-100">
                <h3 className="text-emerald-900 font-bold mb-1 flex items-center justify-center gap-1.5 text-[9px] uppercase"><i className="fas fa-globe text-emerald-600 text-[10px]"></i> Access</h3>
                <p className="text-emerald-800/70 text-[8px] leading-tight px-4">Multi-language support for spiritual growth.</p>
              </div>
            </div>
            <div className="text-slate-300 font-black uppercase text-[7px] tracking-widest">Exhibition v5.5 • 1446 AH</div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-between overflow-hidden animate-fade-up">
            <div className="space-y-1.5 flex-1">
              {visibleGuide.map((item, idx) => (
                <div key={idx} className="bg-white p-2.5 rounded-xl border border-emerald-50 shadow-sm flex gap-2 items-center">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0"><i className={`fas ${item.icon} text-[10px]`}></i></div>
                  <div className="overflow-hidden">
                    <h3 className="text-[8px] font-black text-emerald-900 uppercase truncate">{t(item.title)}</h3>
                    <p className="text-slate-500 text-[8px] leading-none truncate">{t(item.desc)}</p>
                  </div>
                </div>
              ))}
            </div>
            {totalGuidePages > 1 && (
              <div className="flex justify-between items-center bg-white p-2 rounded-xl border border-emerald-50 shadow-sm mt-3">
                 <button disabled={guidePage === 0} onClick={() => setGuidePage(p => p - 1)} className="w-8 h-8 flex items-center justify-center bg-emerald-50 rounded-lg disabled:opacity-30"><i className="fas fa-chevron-left text-[8px]"></i></button>
                 <span className="text-[8px] font-black uppercase text-slate-400">Page {guidePage + 1} of {totalGuidePages}</span>
                 <button disabled={guidePage === totalGuidePages - 1} onClick={() => setGuidePage(p => p + 1)} className="w-8 h-8 flex items-center justify-center bg-emerald-50 rounded-lg disabled:opacity-30"><i className="fas fa-chevron-right text-[8px]"></i></button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AboutHelp;
