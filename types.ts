
export type Language = 'en' | 'ml' | 'ta' | 'ar';

export enum PrayerStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  MISSED = 'missed',
  EXCUSED = 'excused'
}

export interface UserProfile {
  username: string;
  name: string;
  age: number;
  sex: 'male' | 'female';
  place: string;
  preferredLanguage: Language;
  password?: string; // Stored in mock backend
}

export interface PrayerLog {
  fajr: PrayerStatus;
  dhuhr: PrayerStatus;
  asr: PrayerStatus;
  maghrib: PrayerStatus;
  isha: PrayerStatus;
}

export interface FastingLog {
  status: 'none' | 'completed' | 'missed' | 'excused';
  type: 'ramadan' | 'sunnah';
}

export interface QuranProgress {
  surah: string;
  ayah: string;
  lastUpdated: string;
}

export interface DhikrChallenge {
  id: string;
  title: string;
  arabic: string;
  target: number;
  current: number;
  lastReset?: string;
}

export interface DhikrHistoryEntry {
  id: string;
  title: string;
  target: number;
  current: number;
  date: string;
}

export interface PrayerTimings {
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  Sunrise: string;
}

export interface QadaReminder {
  id: string;
  time: string;
  enabled: boolean;
}

export interface HealthPeriod {
  id: string;
  start: string; // ISO Date string
  end: string | null; // null if active
}

// This represents the data for a SINGLE user
export interface UserData {
  profile: UserProfile;
  prayerLogs: Record<string, PrayerLog>;
  sunnahLogs: Record<string, string[]>;
  fastingLogs: Record<string, FastingLog>;
  quranProgress: QuranProgress;
  dhikrCount: number;
  activeChallenges: DhikrChallenge[];
  dhikrHistory: DhikrHistoryEntry[];
  isHaydNifas: boolean; // Kept for quick toggle, but periods are primary
  haydStartDate: string | null;
  healthPeriods: HealthPeriod[]; // New range-based storage
  settings: {
    notificationsEnabled: boolean;
    locationEnabled: boolean;
    qadaReminders: QadaReminder[];
  };
}

export interface AppState {
  currentUser: string | null; // username
  users: Record<string, UserData>; // Mock database
  todayTimings: PrayerTimings | null;
}
