
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

// UNIFIED STORAGE KEYS - DO NOT CHANGE
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
  Fajr: "05:12",
  Sunrise: "06:34",
  Dhuhr: "12:28",
  Asr: "15:42",
  Maghrib: "18:22",
  Isha: "19:38"
};

const App: React.FC = () => {
  // Load initial state from LocalStorage
  const [state, setState] = useState<AppState>(() => {
    const savedUsers = localStorage.getItem(USERS_DB_KEY);
    const activeSession = localStorage.getItem(SESSION_KEY);
    const parsedUsers = savedUsers ? JSON.parse(savedUsers) : {};
    
    return {
      currentUser: activeSession, // This is the username
      users: parsedUsers,
      todayTimings: DEFAULT_TIMINGS
    };
  });

  const currentUserData = state.currentUser ? state.users[state.currentUser] : null;

  const [currentLanguage, setCurrentLanguage] = useState<Language>(() => {
    if (state.currentUser && state.users[state.currentUser]) {
      return state.users[state.currentUser].profile.preferredLanguage;
    }
    return 'en';
  });

  const [currentView, setCurrentView] = useState<'welcome' | 'login' | 'dashboard' | 'fard' | 'qadah' | 'women' | 'dhikr' | 'quran' | 'fasting' | 'qibla' | 'about' | 'account'>(() => {
    return state.currentUser ? 'dashboard' : 'welcome';
  });

  // Sync state to LocalStorage whenever users or session changes
  useEffect(() => {
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(state.users));
    if (state.currentUser) {
      localStorage.setItem(SESSION_KEY, state.currentUser);
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  }, [state.users, state.currentUser]);

  const t = (key: string) => TRANSLATIONS[currentLanguage][key] || key;

  const handleLogin = (profile: UserProfile, isNew: boolean) => {
    const username = profile.username.toLowerCase();
    
    if (isNew) {
      const newUserData: UserData = {
        profile: { ...profile, username },
        prayerLogs: {},
        sunnahLogs: {},
        fastingLogs: {},
        quranProgress: { surah: '', ayah: '', lastUpdated: '' },
        dhikrCount: 0,
        activeChallenges: INITIAL_DHIKRS,
        personalDhikrs: [],
        activeDhikrId: null,
        dhikrHistory: [],
        isHaydNifas: false,
        haydStartDate: null,
        healthPeriods: [],
        settings: {
          notificationsEnabled: false,
          locationEnabled: false,
          qadaReminders: []
        }
      };
      
      setState(prev => ({
        ...prev,
        currentUser: username,
        users: { ...prev.users, [username]: newUserData }
      }));
    } else {
      setState(prev => ({ ...prev, currentUser: username }));
    }
    
    setCurrentLanguage(profile.preferredLanguage);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setState(prev => ({ ...prev, currentUser: null }));
    setCurrentView('welcome');
  };

  const updateActiveUser = (updater: (prev: UserData) => UserData) => {
    if (!state.currentUser) return;
    setState(prev => {
      const currentUser = prev.currentUser!;
      const userToUpdate = prev.users[currentUser];
      if (!userToUpdate) return prev;
      
      return {
        ...prev,
        users: {
          ...prev.users,
          [currentUser]: updater(userToUpdate)
        }
      };
    });
  };

  const updatePrayerStatus = (date: string, prayer: typeof PRAYERS[number], status: PrayerStatus) => {
    updateActiveUser(user => {
      const currentLogs = user.prayerLogs[date] || { fajr: PrayerStatus.PENDING, dhuhr: PrayerStatus.PENDING, asr: PrayerStatus.PENDING, maghrib: PrayerStatus.PENDING, isha: PrayerStatus.PENDING };
      return {
        ...user,
        prayerLogs: { ...user.prayerLogs, [date]: { ...currentLogs, [prayer]: status } }
      };
    });
  };

  const toggleSunnahStatus = (date: string, sunnahName: string) => {
    updateActiveUser(user => {
      const current = user.sunnahLogs[date] || [];
      const updated = current.includes(sunnahName) ? current.filter(s => s !== sunnahName) : [...current, sunnahName];
      return { ...user, sunnahLogs: { ...user.sunnahLogs, [date]: updated } };
    });
  };

  const setActiveDhikr = (id: string | null) => {
    updateActiveUser(user => ({ ...user, activeDhikrId: id }));
  };

  const updateDhikrProgress = (id: string, delta: number) => {
    updateActiveUser(user => {
      const updatedChallenges = user.activeChallenges.map(c => 
        c.id === id ? { ...c, current: c.current + delta } : c
      );
      return { ...user, activeChallenges: updatedChallenges, dhikrCount: user.dhikrCount + delta };
    });
  };

  const updatePersonalDhikrProgress = (id: string, delta: number) => {
    updateActiveUser(user => {
      const today = new Date().toISOString().split('T')[0];
      const updatedDhikrs = user.personalDhikrs.map(d => {
        if (d.id === id) {
          const isNewDay = d.lastUpdated.split('T')[0] !== today;
          return {
            ...d,
            totalCount: d.totalCount + delta,
            dailyCount: isNewDay ? delta : d.dailyCount + delta,
            sessionCount: d.sessionCount + delta,
            lastUpdated: new Date().toISOString()
          };
        }
        return d;
      });
      return { ...user, personalDhikrs: updatedDhikrs, dhikrCount: user.dhikrCount + delta };
    });
  };

  const addPersonalDhikr = (name: string) => {
    updateActiveUser(user => {
      const newDhikr: PersonalDhikr = {
        id: `personal-${Date.now()}`,
        name,
        totalCount: 0,
        dailyCount: 0,
        sessionCount: 0,
        lastUpdated: new Date().toISOString()
      };
      return { ...user, personalDhikrs: [newDhikr, ...user.personalDhikrs] };
    });
  };

  const resetPersonalDhikrSession = (id: string) => {
    updateActiveUser(user => {
      const updatedDhikrs = user.personalDhikrs.map(d => 
        d.id === id ? { ...d, sessionCount: 0 } : d
      );
      return { ...user, personalDhikrs: updatedDhikrs };
    });
  };

  const deletePersonalDhikr = (id: string) => {
    updateActiveUser(user => ({
      ...user,
      personalDhikrs: user.personalDhikrs.filter(d => d.id !== id)
    }));
  };

  const archiveDhikrChallenge = (id: string) => {
    updateActiveUser(user => {
      const challenge = user.activeChallenges.find(c => c.id === id);
      if (!challenge) return user;
      const historyEntry: DhikrHistoryEntry = {
        id: `${id}-${Date.now()}`,
        title: challenge.title,
        target: challenge.target,
        current: challenge.current,
        date: new Date().toISOString()
      };
      const resetChallenges = user.activeChallenges.map(c => 
        c.id === id ? { ...c, current: 0 } : c
      );
      return { 
        ...user, 
        activeChallenges: resetChallenges, 
        dhikrHistory: [historyEntry, ...user.dhikrHistory],
        activeDhikrId: null
      };
    });
  };

  const updateQuran = (progress: QuranProgress) => {
    updateActiveUser(user => ({ ...user, quranProgress: progress }));
  };

  const updateFasting = (date: string, log: FastingLog) => {
    updateActiveUser(user => ({
      ...user,
      fastingLogs: { ...user.fastingLogs, [date]: log }
    }));
  };

  const toggleHayd = (active: boolean) => {
    updateActiveUser(user => ({ ...user, isHaydNifas: active }));
  };

  const addHealthPeriod = (start: string, end: string | null) => {
    updateActiveUser(user => ({
      ...user,
      healthPeriods: [...user.healthPeriods, { id: Date.now().toString(), start, end }]
    }));
  };

  const removeHealthPeriod = (id: string) => {
    updateActiveUser(user => ({
      ...user,
      healthPeriods: user.healthPeriods.filter(p => p.id !== id)
    }));
  };

  const isRTL = currentLanguage === 'ar';
  const langClass = currentLanguage === 'ml' ? 'ml-font' : currentLanguage === 'ta' ? 'ta-font' : '';

  const renderView = () => {
    if (currentView === 'welcome') return <Welcome onEnter={() => setCurrentView('login')} language={currentLanguage} setLanguage={setCurrentLanguage} t={t} />;
    if (currentView === 'login') return <Login onLogin={handleLogin} t={t} initialLanguage={currentLanguage} users={state.users} />;
    if (!currentUserData) return <Welcome onEnter={() => setCurrentView('login')} language={currentLanguage} setLanguage={setCurrentLanguage} t={t} />;

    const compositeState = { ...currentUserData, todayTimings: state.todayTimings };

    switch (currentView) {
      case 'dashboard':
        return <Dashboard state={compositeState} setCurrentView={setCurrentView} t={t} onLogout={handleLogout} toggleNotifications={() => {}} updatePrayerStatus={updatePrayerStatus} />;
      case 'fard':
        return <FardPrayers state={compositeState} updatePrayerStatus={updatePrayerStatus} toggleSunnahStatus={toggleSunnahStatus} setCurrentView={setCurrentView} t={t} />;
      case 'qadah':
        return <QadahCalendar state={compositeState} updatePrayerStatus={updatePrayerStatus} updateReminders={() => {}} setCurrentView={setCurrentView} t={t} />;
      case 'women':
        return <WomensSpace state={compositeState} toggleHayd={toggleHayd} addHealthPeriod={addHealthPeriod} removeHealthPeriod={removeHealthPeriod} setCurrentView={setCurrentView} t={t} />;
      case 'dhikr':
        return (
          <DhikrCounter 
            state={compositeState} 
            updateProgress={updateDhikrProgress} 
            updatePersonalProgress={updatePersonalDhikrProgress}
            addPersonalDhikr={addPersonalDhikr}
            resetPersonalSession={resetPersonalDhikrSession}
            deletePersonalDhikr={deletePersonalDhikr}
            archiveChallenge={archiveDhikrChallenge} 
            setActiveDhikr={setActiveDhikr} 
            setCurrentView={setCurrentView} 
            t={t} 
          />
        );
      case 'quran':
        return <QuranTracker state={compositeState} onUpdate={updateQuran} setCurrentView={setCurrentView} t={t} />;
      case 'fasting':
        return <FastingTracker state={compositeState} updateFasting={updateFasting} setCurrentView={setCurrentView} t={t} />;
      case 'qibla':
        return <QiblaFinder setCurrentView={setCurrentView} t={t} />;
      case 'about':
        return <AboutHelp setCurrentView={setCurrentView} t={t} />;
      case 'account':
        return <MyAccount state={compositeState} setCurrentView={setCurrentView} t={t} onLogout={handleLogout} />;
      default:
        return <Dashboard state={compositeState} setCurrentView={setCurrentView} t={t} onLogout={handleLogout} toggleNotifications={() => {}} updatePrayerStatus={updatePrayerStatus} />;
    }
  };

  return (
    <div className="app-viewport">
      <div className="islamic-pattern"></div>
      <div className={`h-full w-full relative overflow-hidden flex flex-col ${isRTL ? 'arabic-font' : ''} ${langClass}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <main className="relative z-10 w-full h-full bg-white flex flex-col overflow-hidden">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

export default App;
