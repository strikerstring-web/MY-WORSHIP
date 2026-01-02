import React, { useState, useEffect } from 'react';
import { AppState, UserProfile, UserData, Language, PrayerStatus, DhikrChallenge, PersonalDhikr, PrayerTimings, QadaReminder, DhikrHistoryEntry, HealthPeriod, FastingLog, QuranProgress } from './types';
import { TRANSLATIONS, PRAYERS } from './constants';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import FardPrayers from './components/FardPrayers';
import QadahCalendar from './components/QadahCalendar';
import WomensSpace from './components/WomensSpace';
import DhikrCounter from './components/DhikrCounter';
import QuranTracker from './components/QuranTracker';
import FastingTracker from './components/FastingTracker';
import Welcome from './components/Welcome';
import QiblaFinder from './components/QiblaFinder';
import AboutHelp from './components/AboutHelp';
import MyAccount from './components/MyAccount';

const USERS_DB_KEY = 'ibadathi_v1_users_database';
const SESSION_KEY = 'ibadathi_v1_active_session';

const INITIAL_DHIKRS: DhikrChallenge[] = [
  { id: 'salawat', title: 'dhikrSalawat', arabic: 'اللهم صل على محمد', target: 100, current: 0 },
  { id: 'subhanallah', title: 'dhikrSubhanAllah', arabic: 'سبحان الله', target: 33, current: 0 },
  { id: 'alhamdulillah', title: 'dhikrAlhamdulillah', arabic: 'الحمد لله', target: 33, current: 0 },
  { id: 'allahuakbar', title: 'dhikrAllahuAkbar', arabic: 'الله أكبر', target: 34, current: 0 },
  { id: 'astaghfirullah', title: 'dhikrAstaghfirullah', arabic: 'أستغفر الله', target: 100, current: 0 },
  { id: 'lailaha', title: 'dhikrLaIlaha', arabic: 'لا إله إلا الله', target: 100, current: 0 }
];

const DEFAULT_TIMINGS: PrayerTimings = {
  Fajr: "05:12", Sunrise: "06:34", Dhuhr: "12:28", Asr: "15:42", Maghrib: "18:22", Isha: "19:38"
};

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    const savedUsers = localStorage.getItem(USERS_DB_KEY);
    const activeSession = localStorage.getItem(SESSION_KEY);
    let parsedUsers: Record<string, UserData> = {};
    try { parsedUsers = savedUsers ? JSON.parse(savedUsers) : {}; } catch (e) {}
    const currentUser = (activeSession && parsedUsers[activeSession]) ? activeSession : null;
    return { currentUser, users: parsedUsers, todayTimings: DEFAULT_TIMINGS };
  });

  const currentUserData = state.currentUser ? state.users[state.currentUser] : null;
  const [currentLanguage, setCurrentLanguage] = useState<Language>(() => {
    return (state.currentUser && state.users[state.currentUser]) ? state.users[state.currentUser].profile.preferredLanguage : 'en';
  });

  const [activeTab, setActiveTab] = useState<'home' | 'prayer' | 'tracker' | 'challenges' | 'account'>('home');
  const [subView, setSubView] = useState<string | null>(null);
  const [isAuth, setIsAuth] = useState<boolean>(!!state.currentUser);

  useEffect(() => {
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(state.users));
    if (state.currentUser) {
      localStorage.setItem(SESSION_KEY, state.currentUser);
      setIsAuth(true);
    } else {
      localStorage.removeItem(SESSION_KEY);
      setIsAuth(false);
    }
  }, [state.users, state.currentUser]);

  const t = (key: string) => TRANSLATIONS[currentLanguage][key] || key;

  const handleLogin = (profile: UserProfile, isNew: boolean) => {
    const username = profile.username.toLowerCase();
    if (isNew) {
      const newUserData: UserData = {
        profile: { ...profile, username },
        prayerLogs: {}, sunnahLogs: {}, fastingLogs: {},
        quranProgress: { surah: '', ayah: '', juz: '', lastUpdated: '' },
        dhikrCount: 0, activeChallenges: INITIAL_DHIKRS, personalDhikrs: [],
        activeDhikrId: null, dhikrHistory: [], isHaydNifas: false, haydStartDate: null, healthPeriods: [],
        settings: { notificationsEnabled: false, locationEnabled: false, qadaReminders: [] }
      };
      setState(prev => ({ ...prev, currentUser: username, users: { ...prev.users, [username]: newUserData } }));
    } else {
      setState(prev => ({ ...prev, currentUser: username }));
    }
    setCurrentLanguage(profile.preferredLanguage);
    setActiveTab('home');
    setSubView(null);
  };

  const handleLogout = () => {
    setState(prev => ({ ...prev, currentUser: null }));
    setActiveTab('home');
    setSubView(null);
  };

  const updateActiveUser = (updater: (prev: UserData) => UserData) => {
    if (!state.currentUser) return;
    setState(prev => {
      const current = prev.currentUser!;
      if (!prev.users[current]) return prev;
      return { ...prev, users: { ...prev.users, [current]: updater(prev.users[current]) } };
    });
  };

  const updatePrayerStatus = (date: string, prayer: any, status: PrayerStatus) => {
    updateActiveUser(user => {
      const logs = user.prayerLogs[date] || { fajr: PrayerStatus.PENDING, dhuhr: PrayerStatus.PENDING, asr: PrayerStatus.PENDING, maghrib: PrayerStatus.PENDING, isha: PrayerStatus.PENDING };
      return { ...user, prayerLogs: { ...user.prayerLogs, [date]: { ...logs, [prayer]: status } } };
    });
  };

  const toggleSunnahStatus = (date: string, sunnah: string) => {
    updateActiveUser(user => {
      const cur = user.sunnahLogs[date] || [];
      const upd = cur.includes(sunnah) ? cur.filter(s => s !== sunnah) : [...cur, sunnah];
      return { ...user, sunnahLogs: { ...user.sunnahLogs, [date]: upd } };
    });
  };

  if (!isAuth) {
    return (
      <div className="app-viewport animate-fade-in">
        <main className="h-full flex flex-col w-full overflow-hidden">
          {subView === 'login' ? (
            <Login onLogin={handleLogin} t={t} initialLanguage={currentLanguage} users={state.users} />
          ) : (
            <Welcome onEnter={() => setSubView('login')} language={currentLanguage} setLanguage={setCurrentLanguage} t={t} />
          )}
        </main>
      </div>
    );
  }

  const compositeState = { ...currentUserData!, todayTimings: state.todayTimings };

  const renderContent = () => {
    if (subView === 'qibla') return <QiblaFinder setCurrentView={() => setSubView(null)} t={t} />;
    if (subView === 'about') return <AboutHelp setCurrentView={() => setSubView(null)} t={t} />;
    if (subView === 'quran') return <QuranTracker state={compositeState} onUpdate={(p) => updateActiveUser(u => ({ ...u, quranProgress: p }))} setCurrentView={() => setSubView(null)} t={t} />;
    if (subView === 'fasting') return <FastingTracker state={compositeState} updateFasting={(d, l) => updateActiveUser(u => ({ ...u, fastingLogs: { ...u.fastingLogs, [d]: l } }))} setCurrentView={() => setSubView(null)} t={t} />;
    if (subView === 'qadah') return <QadahCalendar state={compositeState} updatePrayerStatus={updatePrayerStatus} updateReminders={() => {}} setCurrentView={() => setSubView(null)} t={t} />;
    if (subView === 'women') return <WomensSpace state={compositeState} toggleHayd={(a) => updateActiveUser(u => ({ ...u, isHaydNifas: a }))} addHealthPeriod={(s, e) => updateActiveUser(u => ({ ...u, healthPeriods: [...u.healthPeriods, { id: Date.now().toString(), start: s, end: e }] }))} removeHealthPeriod={(id) => updateActiveUser(u => ({ ...u, healthPeriods: u.healthPeriods.filter(p => p.id !== id) }))} setCurrentView={() => setSubView(null)} t={t} />;

    switch (activeTab) {
      case 'home':
        return <Dashboard state={compositeState} setCurrentView={setSubView} t={t} onLogout={handleLogout} toggleNotifications={() => {}} updatePrayerStatus={updatePrayerStatus} />;
      case 'prayer':
        return <FardPrayers state={compositeState} updatePrayerStatus={updatePrayerStatus} toggleSunnahStatus={toggleSunnahStatus} setCurrentView={setSubView} t={t} />;
      case 'challenges':
        return (
          <DhikrCounter 
            state={compositeState} 
            updateProgress={(id, d) => updateActiveUser(u => ({ ...u, activeChallenges: u.activeChallenges.map(c => c.id === id ? { ...c, current: c.current + d } : c), dhikrCount: u.dhikrCount + d }))}
            updatePersonalProgress={(id, d) => updateActiveUser(u => {
              const today = new Date().toISOString().split('T')[0];
              const upd = u.personalDhikrs.map(pd => pd.id === id ? { ...pd, totalCount: pd.totalCount + d, dailyCount: (pd.lastUpdated.split('T')[0] !== today ? d : pd.dailyCount + d), sessionCount: pd.sessionCount + d, lastUpdated: new Date().toISOString() } : pd);
              return { ...u, personalDhikrs: upd, dhikrCount: u.dhikrCount + d };
            })}
            addPersonalDhikr={(n) => updateActiveUser(u => ({ ...u, personalDhikrs: [{ id: `p-${Date.now()}`, name: n, totalCount: 0, dailyCount: 0, sessionCount: 0, lastUpdated: new Date().toISOString() }, ...u.personalDhikrs] }))}
            resetPersonalSession={(id) => updateActiveUser(u => ({ ...u, personalDhikrs: u.personalDhikrs.map(d => d.id === id ? { ...d, sessionCount: 0 } : d) }))}
            deletePersonalDhikr={(id) => updateActiveUser(u => ({ ...u, personalDhikrs: u.personalDhikrs.filter(d => d.id !== id) }))}
            archiveChallenge={(id) => updateActiveUser(u => {
              const c = u.activeChallenges.find(x => x.id === id);
              if (!c) return u;
              const hist = { id: `${id}-${Date.now()}`, title: c.title, target: c.target, current: c.current, date: new Date().toISOString() };
              return { ...u, activeChallenges: u.activeChallenges.map(x => x.id === id ? { ...x, current: 0 } : x), dhikrHistory: [hist, ...u.dhikrHistory], activeDhikrId: null };
            })}
            setActiveDhikr={(id) => updateActiveUser(u => ({ ...u, activeDhikrId: id }))}
            setCurrentView={setSubView} t={t} 
          />
        );
      case 'tracker':
        return (
          <div className="scroll-container p-6 w-full content-limit">
            <h2 className="text-3xl font-black text-emerald-900 mb-6">My Progress</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div onClick={() => setSubView('quran')} className="card-premium flex items-center gap-4 btn-ripple cursor-pointer">
                <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center text-2xl"><i className="fas fa-book-open"></i></div>
                <div className="flex-1">
                  <h3 className="font-black text-emerald-900 text-lg">{t('quran')}</h3>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest">{compositeState.quranProgress.surah || 'Not started'}</p>
                </div>
                <i className="fas fa-chevron-right text-slate-300 text-xs"></i>
              </div>
              <div onClick={() => setSubView('fasting')} className="card-premium flex items-center gap-4 btn-ripple cursor-pointer">
                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl"><i className="fas fa-moon"></i></div>
                <div className="flex-1">
                  <h3 className="font-black text-emerald-900 text-lg">{t('fasting')}</h3>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest">Goal tracked</p>
                </div>
                <i className="fas fa-chevron-right text-slate-300 text-xs"></i>
              </div>
              <div onClick={() => setSubView('qadah')} className="card-premium flex items-center gap-4 btn-ripple cursor-pointer">
                <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center text-2xl"><i className="fas fa-calendar-check"></i></div>
                <div className="flex-1">
                  <h3 className="font-black text-emerald-900 text-lg">{t('qadah')}</h3>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest">Missed prayers log</p>
                </div>
                <i className="fas fa-chevron-right text-slate-300 text-xs"></i>
              </div>
              {compositeState.profile.sex === 'female' && (
                <div onClick={() => setSubView('women')} className="card-premium flex items-center gap-4 btn-ripple cursor-pointer">
                  <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center text-2xl"><i className="fas fa-leaf"></i></div>
                  <div className="flex-1">
                    <h3 className="font-black text-emerald-900 text-lg">{t('womensSpace')}</h3>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest">Period tracking</p>
                  </div>
                  <i className="fas fa-chevron-right text-slate-300 text-xs"></i>
                </div>
              )}
            </div>
          </div>
        );
      case 'account':
        return <MyAccount state={compositeState} setCurrentView={setSubView} t={t} onLogout={handleLogout} />;
      default: return null;
    }
  };

  return (
    <div className="app-viewport animate-fade-in" dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}>
      <main className="flex-1 overflow-hidden relative w-full h-full">
        {renderContent()}
      </main>

      {!subView && (
        <nav className="bottom-nav">
          <button onClick={() => setActiveTab('home')} className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}>
            <i className="fas fa-house"></i>
            <span className="text-[10px] font-black uppercase tracking-tighter">Home</span>
          </button>
          <button onClick={() => setActiveTab('prayer')} className={`nav-item ${activeTab === 'prayer' ? 'active' : ''}`}>
            <i className="fas fa-kaaba"></i>
            <span className="text-[10px] font-black uppercase tracking-tighter">Prayer</span>
          </button>
          <button onClick={() => setActiveTab('tracker')} className={`nav-item ${activeTab === 'tracker' ? 'active' : ''}`}>
            <i className="fas fa-chart-simple"></i>
            <span className="text-[10px] font-black uppercase tracking-tighter">Tracker</span>
          </button>
          <button onClick={() => setActiveTab('challenges')} className={`nav-item ${activeTab === 'challenges' ? 'active' : ''}`}>
            <i className="fas fa-bolt"></i>
            <span className="text-[10px] font-black uppercase tracking-tighter">Tasks</span>
          </button>
          <button onClick={() => setActiveTab('account')} className={`nav-item ${activeTab === 'account' ? 'active' : ''}`}>
            <i className="fas fa-user"></i>
            <span className="text-[10px] font-black uppercase tracking-tighter">Account</span>
          </button>
        </nav>
      )}
    </div>
  );
};

export default App;