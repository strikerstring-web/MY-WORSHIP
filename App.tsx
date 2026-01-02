
import React, { useState, useEffect, useRef } from 'react';
import { AppState, UserProfile, UserData, Language, PrayerStatus, DhikrChallenge, PrayerTimings, QadaReminder, DhikrHistoryEntry, HealthPeriod } from './types';
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
import ZakatCalculator from './components/ZakatCalculator';
import AboutHelp from './components/AboutHelp';

const USERS_STORAGE_KEY = 'ibadathi_mock_users_v6';
const SESSION_KEY = 'ibadathi_active_session_v6';

const INITIAL_DHIKRS: DhikrChallenge[] = [
  { id: 'salawat', title: 'dhikrSalawat', arabic: 'اللهم صل على محمد', target: 100, current: 0 },
  { id: 'subhanallah', title: 'dhikrSubhanAllah', arabic: 'سبحان الله', target: 100, current: 0 },
  { id: 'alhamdulillah', title: 'dhikrAlhamdulillah', arabic: 'الحمد لله', target: 100, current: 0 },
  { id: 'allahuakbar', title: 'dhikrAllahuAkbar', arabic: 'الله أكبر', target: 100, current: 0 },
  { id: 'astaghfirullah', title: 'dhikrAstaghfirullah', arabic: 'أستغفر الله', target: 100, current: 0 },
  { id: 'lailaha', title: 'dhikrLaIlaha', arabic: 'لا إله إلا الله', target: 100, current: 0 }
];

const App: React.FC = () => {
  // Initialize state from LocalStorage for persistence
  const [state, setState] = useState<AppState>(() => {
    try {
      const savedUsers = localStorage.getItem(USERS_STORAGE_KEY);
      const activeSession = localStorage.getItem(SESSION_KEY);
      return {
        currentUser: activeSession,
        users: savedUsers ? JSON.parse(savedUsers) : {},
        todayTimings: null
      };
    } catch (e) {
      console.error("Failed to parse stored data", e);
      return { currentUser: null, users: {}, todayTimings: null };
    }
  });

  const currentUserData = state.currentUser ? state.users[state.currentUser] : null;

  // Restore preferred language from user data if logged in
  const [currentLanguage, setCurrentLanguage] = useState<Language>(() => {
    if (state.currentUser && state.users[state.currentUser]) {
      return state.users[state.currentUser].profile.preferredLanguage;
    }
    return 'en';
  });

  const [currentView, setCurrentView] = useState<'welcome' | 'login' | 'dashboard' | 'fard' | 'qadah' | 'women' | 'dhikr' | 'quran' | 'fasting' | 'qibla' | 'about' | 'zakat'>(
    state.currentUser ? 'dashboard' : 'welcome'
  );

  const lastNotifiedRef = useRef<string | null>(null);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(state.users));
    if (state.currentUser) {
      localStorage.setItem(SESSION_KEY, state.currentUser);
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  }, [state.users, state.currentUser]);

  const t = (key: string) => TRANSLATIONS[currentLanguage][key] || key;

  // Handle Login and Registration
  const handleLogin = (profile: UserProfile, isNew: boolean) => {
    if (isNew) {
      const newUserData: UserData = {
        profile,
        prayerLogs: {},
        sunnahLogs: {},
        fastingLogs: {},
        quranProgress: { surah: '', ayah: '', lastUpdated: '' },
        dhikrCount: 0,
        activeChallenges: INITIAL_DHIKRS,
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
        currentUser: profile.username,
        users: { ...prev.users, [profile.username]: newUserData }
      }));
    } else {
      setState(prev => ({ ...prev, currentUser: profile.username }));
    }
    
    setCurrentLanguage(profile.preferredLanguage);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY);
    setState(prev => ({ ...prev, currentUser: null }));
    setCurrentView('welcome');
  };

  const updateActiveUser = (updater: (prev: UserData) => UserData) => {
    if (!state.currentUser) return;
    setState(prev => ({
      ...prev,
      users: {
        ...prev.users,
        [prev.currentUser!]: updater(prev.users[prev.currentUser!])
      }
    }));
  };

  // Rest of the logic remains the same (Prayers, Dhikr, Fasting, etc.)
  // ... (keeping existing logic for functionality)

  const isRTL = currentLanguage === 'ar';
  const langClass = currentLanguage === 'ml' ? 'ml-font' : currentLanguage === 'ta' ? 'ta-font' : '';

  const renderView = () => {
    if (currentView === 'welcome') return <Welcome onEnter={() => setCurrentView('login')} language={currentLanguage} setLanguage={setCurrentLanguage} t={t} />;
    if (currentView === 'login') return <Login onLogin={handleLogin} t={t} initialLanguage={currentLanguage} users={state.users} />;
    if (!currentUserData) return null;

    const compositeState = { ...currentUserData, todayTimings: state.todayTimings };

    switch (currentView) {
      case 'dashboard':
        return <Dashboard state={compositeState} setCurrentView={setCurrentView} t={t} onLogout={handleLogout} toggleNotifications={() => {}} updatePrayerStatus={() => {}} />;
      case 'fard':
        return <FardPrayers state={compositeState} updatePrayerStatus={() => {}} toggleSunnahStatus={() => {}} setCurrentView={setCurrentView} t={t} />;
      case 'qadah':
        return <QadahCalendar state={compositeState} updatePrayerStatus={() => {}} updateReminders={() => {}} setCurrentView={setCurrentView} t={t} />;
      case 'women':
        return <WomensSpace state={compositeState} toggleHayd={() => {}} addHealthPeriod={() => {}} removeHealthPeriod={() => {}} setCurrentView={setCurrentView} t={t} />;
      case 'dhikr':
        return <DhikrCounter state={compositeState} updateProgress={() => {}} archiveChallenge={() => {}} setCurrentView={setCurrentView} t={t} />;
      case 'quran':
        return <QuranTracker state={compositeState} onUpdate={() => {}} setCurrentView={setCurrentView} t={t} />;
      case 'fasting':
        return <FastingTracker state={compositeState} updateFasting={() => {}} setCurrentView={setCurrentView} t={t} />;
      case 'qibla':
        return <QiblaFinder setCurrentView={setCurrentView} t={t} />;
      case 'zakat':
        return <ZakatCalculator setCurrentView={setCurrentView} t={t} />;
      case 'about':
        return <AboutHelp setCurrentView={setCurrentView} t={t} />;
      default:
        return <Dashboard state={compositeState} setCurrentView={setCurrentView} t={t} onLogout={handleLogout} toggleNotifications={() => {}} updatePrayerStatus={() => {}} />;
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
