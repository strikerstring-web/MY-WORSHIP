import React, { useState, useEffect, useRef } from 'react';
import { AppState, UserProfile, UserData, Language, PrayerStatus, DhikrChallenge, PersonalDhikr, PrayerTimings, QadaReminder, DhikrHistoryEntry, HealthPeriod, FastingLog, QuranProgress } from './types';
import { TRANSLATIONS, PRAYERS } from './constants';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import FardPrayers from './components/FardPrayers';
import PrayerCalendar from './components/PrayerCalendar';
import WomensSpace from './components/WomensSpace';
import DhikrCounter from './components/DhikrCounter';
import QuranTracker from './components/QuranTracker';
import FastingTracker from './components/FastingTracker';
import Welcome from './components/Welcome';
import QiblaFinder from './components/QiblaFinder';
import AboutHelp from './components/AboutHelp';
import MyAccount from './components/MyAccount';
import { PrayerTimes, Coordinates, CalculationMethod } from 'https://esm.sh/adhan@4.4.0';

const USERS_DB_KEY = 'ibadathi_v6_users_database';
const SESSION_KEY = 'ibadathi_v6_active_session';

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
    try { parsedUsers = savedUsers ? JSON.parse(savedUsers) : {}; } catch (e) { console.error("Data Parse Error", e); }
    const currentUser = (activeSession && parsedUsers[activeSession.toLowerCase()]) ? activeSession.toLowerCase() : null;
    return { currentUser, users: parsedUsers, todayTimings: DEFAULT_TIMINGS, location: null };
  });

  const [activeTab, setActiveTab] = useState<'home' | 'prayer' | 'tracker' | 'challenges' | 'account'>('home');
  const [subView, setSubView] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastAlertedPrayer = useRef<string | null>(null);

  const [currentLanguage, setCurrentLanguage] = useState<Language>(() => {
    const session = localStorage.getItem(SESSION_KEY);
    const savedUsers = localStorage.getItem(USERS_DB_KEY);
    let users = {};
    try { users = savedUsers ? JSON.parse(savedUsers) : {}; } catch(e) {}
    if (session && users[session.toLowerCase()]) {
      return users[session.toLowerCase()].profile.preferredLanguage;
    }
    return 'en';
  });

  // Persist user data
  useEffect(() => {
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(state.users));
    if (state.currentUser) {
      localStorage.setItem(SESSION_KEY, state.currentUser);
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  }, [state.users, state.currentUser]);

  // Handle Location & Automated Timings
  useEffect(() => {
    const updateLocationAndTimings = () => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition((pos) => {
          const coords = new Coordinates(pos.coords.latitude, pos.coords.longitude);
          const params = CalculationMethod.MuslimWorldLeague();
          const date = new Date();
          const prayerTimes = new PrayerTimes(coords, date, params);

          const formatTime = (t: Date) => t.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

          const newTimings: PrayerTimings = {
            Fajr: formatTime(prayerTimes.fajr),
            Sunrise: formatTime(prayerTimes.sunrise),
            Dhuhr: formatTime(prayerTimes.dhuhr),
            Asr: formatTime(prayerTimes.asr),
            Maghrib: formatTime(prayerTimes.maghrib),
            Isha: formatTime(prayerTimes.isha),
          };

          setState(prev => ({ ...prev, location: { lat: pos.coords.latitude, lng: pos.coords.longitude }, todayTimings: newTimings }));
        }, (err) => {
          console.warn("Location access denied. Using defaults.", err);
        });
      }
    };

    updateLocationAndTimings();
    // Re-check every 30 minutes for location change/date rollover
    const interval = setInterval(updateLocationAndTimings, 1800000);
    return () => clearInterval(interval);
  }, []);

  // Minute-by-minute Alarm System
  useEffect(() => {
    const checkAlarms = () => {
      if (!state.todayTimings || !state.currentUser) return;
      const user = state.users[state.currentUser];
      if (!user.settings.notificationsEnabled) return;

      const now = new Date();
      const currentTime = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

      // Identify if current time matches any prayer
      const matchedPrayer = PRAYERS.find(p => {
        const timeKey = p.charAt(0).toUpperCase() + p.slice(1) as keyof PrayerTimings;
        return state.todayTimings![timeKey] === currentTime;
      });

      if (matchedPrayer && lastAlertedPrayer.current !== `${matchedPrayer}-${currentTime}`) {
        triggerAlert(matchedPrayer);
        lastAlertedPrayer.current = `${matchedPrayer}-${currentTime}`;
      }
    };

    const triggerAlert = (prayerName: string) => {
      // 1. Notification
      if (Notification.permission === 'granted') {
        new Notification(t('prayerAlertTitle'), {
          body: t('prayerAlertBody').replace('{prayer}', t(prayerName)),
          icon: 'https://picsum.photos/192/192',
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission();
      }

      // 2. Audio (Beep/Chime)
      if (!audioRef.current) {
        audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      }
      audioRef.current.play().catch(e => console.log("Audio play blocked until interaction."));
    };

    const interval = setInterval(checkAlarms, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [state.todayTimings, state.currentUser, state.users]);

  // Sync Global Theme classes
  useEffect(() => {
    const isDark = state.currentUser ? state.users[state.currentUser].settings.theme === 'dark' : true;
    if (isDark) {
      document.body.classList.add('dark', 'dark-mode-active');
    } else {
      document.body.classList.remove('dark', 'dark-mode-active');
    }
  }, [state.currentUser, state.users]);

  const updateActiveUser = (updater: (prev: UserData) => UserData) => {
    if (!state.currentUser) return;
    setState(prev => {
      const current = prev.currentUser!;
      if (!prev.users[current]) return prev;
      const updated = updater(prev.users[current]);
      return { ...prev, users: { ...prev.users, [current]: updated } };
    });
  };

  const handleLogin = (profile: UserProfile, isNew: boolean) => {
    const username = profile.username.toLowerCase();
    if (isNew) {
      const newUserData: UserData = {
        profile: { ...profile, username },
        prayerLogs: {}, sunnahLogs: {}, fastingLogs: {},
        quranProgress: { surah: '', ayah: '', juz: '', lastUpdated: '' },
        dhikrCount: 0, activeChallenges: INITIAL_DHIKRS, personalDhikrs: [],
        activeDhikrId: null, dhikrHistory: [], isHaydNifas: false, haydStartDate: null, healthPeriods: [],
        settings: { 
          notificationsEnabled: true, // Enabled by default
          locationEnabled: true, 
          theme: 'dark', 
          ecoMode: false,
          qadaReminders: []
        }
      };
      setState(prev => ({ ...prev, currentUser: username, users: { ...prev.users, [username]: newUserData } }));
    } else {
      setState(prev => ({ ...prev, currentUser: username }));
    }
    setSubView(null);
    setActiveTab('home');
    
    // Request notification permission early
    if ("Notification" in window) Notification.requestPermission();
  };

  const handleLogout = () => {
    setState(prev => ({ ...prev, currentUser: null }));
    setActiveTab('home');
    setSubView(null);
  };

  const updatePrayerStatus = (date: string, prayer: any, status: PrayerStatus) => {
    updateActiveUser(user => {
      const logs = user.prayerLogs[date] || { fajr: PrayerStatus.PENDING, dhuhr: PrayerStatus.PENDING, asr: PrayerStatus.PENDING, maghrib: PrayerStatus.PENDING, isha: PrayerStatus.PENDING };
      return { ...user, prayerLogs: { ...user.prayerLogs, [date]: { ...logs, [prayer]: status } } };
    });
  };

  const t = (key: string) => TRANSLATIONS[currentLanguage][key] || key;
  const compositeState = state.currentUser ? { ...state.users[state.currentUser], todayTimings: state.todayTimings } : null;

  // Render Logic
  if (!state.currentUser) {
    const isDark = true;
    return (
      <div className={`app-viewport ${isDark ? 'dark bg-slate-950' : 'bg-ivory'} animate-fade-in`}>
        {subView === 'auth' ? (
          <Login onLogin={handleLogin} t={t} initialLanguage={currentLanguage} users={state.users} onBack={() => setSubView(null)} />
        ) : (
          <Welcome onEnter={() => setSubView('auth')} language={currentLanguage} setLanguage={setCurrentLanguage} t={t} />
        )}
      </div>
    );
  }

  const renderView = () => {
    if (subView === 'qibla') return <QiblaFinder setCurrentView={() => setSubView(null)} t={t} />;
    if (subView === 'about') return <AboutHelp setCurrentView={() => setSubView(null)} t={t} />;
    if (subView === 'quran') return <QuranTracker state={compositeState!} onUpdate={(p) => updateActiveUser(u => ({ ...u, quranProgress: p }))} setCurrentView={() => setSubView(null)} t={t} />;
    if (subView === 'fasting') return <FastingTracker state={compositeState!} updateFasting={(d, l) => updateActiveUser(u => ({ ...u, fastingLogs: { ...u.fastingLogs, [d]: l } }))} setCurrentView={() => setSubView(null)} t={t} />;
    if (subView === 'women') return <WomensSpace state={compositeState!} toggleHayd={(a) => updateActiveUser(u => ({ ...u, isHaydNifas: a }))} addHealthPeriod={(s, e) => updateActiveUser(u => ({ ...u, healthPeriods: [...u.healthPeriods, { id: Date.now().toString(), start: s, end: e }] }))} removeHealthPeriod={(id) => updateActiveUser(u => ({ ...u, healthPeriods: u.healthPeriods.filter(p => p.id !== id) }))} setCurrentView={() => setSubView(null)} t={t} />;

    switch (activeTab) {
      case 'home': return <Dashboard state={compositeState!} setCurrentView={setSubView} t={t} updatePrayerStatus={updatePrayerStatus} onLogout={handleLogout} />;
      case 'prayer': return <PrayerCalendar state={compositeState!} updatePrayerStatus={updatePrayerStatus} setCurrentView={setSubView} t={t} />;
      case 'challenges': return (
        <DhikrCounter 
          state={compositeState!} 
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
            return { ...u, activeChallenges: u.activeChallenges.map(x => x.id === id ? { ...x, current: 0 } : x), dhikrHistory: [...u.dhikrHistory, { id: `${id}-${Date.now()}`, title: c.title, target: c.target, current: c.current, date: new Date().toISOString() }], activeDhikrId: null };
          })}
          setActiveDhikr={(id) => updateActiveUser(u => ({ ...u, activeDhikrId: id }))}
          setCurrentView={setSubView} t={t} 
        />
      );
      case 'tracker': return (
        <div className="scroll-container px-6 pt-12 content-limit w-full">
          <h1 className="text-4xl font-black text-emerald-950 dark:text-emerald-50 mb-8 tracking-tighter">My Spiritual Path</h1>
          <div className="grid grid-cols-1 gap-4">
             <div onClick={() => setSubView('quran')} className="card-premium flex items-center gap-6 cursor-pointer hover:scale-[1.02] active:scale-95 transition-all !p-5">
                <div className="w-16 h-16 bg-amber-50 dark:bg-amber-900/30 text-amber-600 rounded-3xl flex items-center justify-center text-3xl"><i className="fas fa-book-open"></i></div>
                <div className="flex-1">
                  <h3 className="font-black text-emerald-900 dark:text-emerald-50 text-xl tracking-tight">{t('quran')}</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{compositeState?.quranProgress.surah || 'Not Started'}</p>
                </div>
                <i className="fas fa-chevron-right text-slate-200"></i>
             </div>
             <div onClick={() => setSubView('fasting')} className="card-premium flex items-center gap-6 cursor-pointer hover:scale-[1.02] active:scale-95 transition-all !p-5">
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-3xl flex items-center justify-center text-3xl"><i className="fas fa-moon"></i></div>
                <div className="flex-1">
                  <h3 className="font-black text-emerald-900 dark:text-emerald-50 text-xl tracking-tight">{t('fasting')}</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Holy Ramadan Log</p>
                </div>
                <i className="fas fa-chevron-right text-slate-200"></i>
             </div>
             <div onClick={() => setSubView('women')} className="card-premium flex items-center gap-6 cursor-pointer hover:scale-[1.02] active:scale-95 transition-all !p-5">
                <div className="w-16 h-16 bg-rose-50 dark:bg-rose-900/30 text-rose-600 rounded-3xl flex items-center justify-center text-3xl"><i className="fas fa-leaf"></i></div>
                <div className="flex-1">
                  <h3 className="font-black text-emerald-900 dark:text-emerald-50 text-xl tracking-tight">{t('womensSpace')}</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Exemption Tracker</p>
                </div>
                <i className="fas fa-chevron-right text-slate-200"></i>
             </div>
          </div>
        </div>
      );
      case 'account': return <MyAccount state={compositeState!} setCurrentView={setSubView} t={t} onLogout={handleLogout} toggleTheme={() => updateActiveUser(u => ({ ...u, settings: { ...u.settings, theme: u.settings.theme === 'dark' ? 'light' : 'dark' } }))} toggleEcoMode={() => updateActiveUser(u => ({ ...u, settings: { ...u.settings, ecoMode: !u.settings.ecoMode } }))} toggleNotifications={() => updateActiveUser(u => ({ ...u, settings: { ...u.settings, notificationsEnabled: !u.settings.notificationsEnabled } }))} />;
      default: return null;
    }
  };

  const isDarkMode = compositeState ? compositeState.settings.theme === 'dark' : true;

  return (
    <div className={`app-viewport ${isDarkMode ? 'dark bg-slate-950' : 'bg-ivory'}`} dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}>
      <main className="flex-1 overflow-hidden relative w-full h-full flex flex-col">
        {renderView()}
      </main>
      {!subView && (
        <nav className="bottom-nav">
          <button onClick={() => setActiveTab('home')} className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}><i className="fas fa-mosque"></i><span className="text-[9px] font-black uppercase tracking-widest">Home</span></button>
          <button onClick={() => setActiveTab('prayer')} className={`nav-item ${activeTab === 'prayer' ? 'active' : ''}`}><i className="fas fa-kaaba"></i><span className="text-[9px] font-black uppercase tracking-widest">Worship</span></button>
          <button onClick={() => setActiveTab('tracker')} className={`nav-item ${activeTab === 'tracker' ? 'active' : ''}`}><i className="fas fa-compass"></i><span className="text-[9px] font-black uppercase tracking-widest">Path</span></button>
          <button onClick={() => setActiveTab('challenges')} className={`nav-item ${activeTab === 'challenges' ? 'active' : ''}`}><i className="fas fa-star-and-crescent"></i><span className="text-[9px] font-black uppercase tracking-widest">Dhikr</span></button>
          <button onClick={() => setActiveTab('account')} className={`nav-item ${activeTab === 'account' ? 'active' : ''}`}><i className="fas fa-user"></i><span className="text-[9px] font-black uppercase tracking-widest">Me</span></button>
        </nav>
      )}
    </div>
  );
};

export default App;