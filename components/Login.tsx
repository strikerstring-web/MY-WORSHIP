
import React, { useState, useMemo, useEffect } from 'react';
import { UserProfile, UserData, Language } from '../types';
import Logo from './Logo';

interface LoginProps {
  onLogin: (profile: UserProfile, isNew: boolean) => void;
  t: (key: string) => string;
  initialLanguage: Language;
  users: Record<string, UserData>;
  initialMode?: 'login' | 'register';
  onBack?: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, t, initialLanguage, users, initialMode = 'login', onBack }) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    age: '',
    sex: 'male' as 'male' | 'female',
    place: '',
    password: '',
    preferredLanguage: initialLanguage
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const usernameNormalized = useMemo(() => formData.username.trim().toLowerCase(), [formData.username]);
  
  const usernameStatus = useMemo(() => {
    if (mode === 'login' || usernameNormalized.length < 3) return 'idle';
    return users[usernameNormalized] ? 'taken' : 'available';
  }, [usernameNormalized, mode, users]);

  const suggestions = useMemo(() => {
    if (usernameStatus !== 'taken') return [];
    const base = usernameNormalized;
    return [
      `${base}${Math.floor(Math.random() * 99) + 1}`,
      `${base}_i`,
      `${base}786`
    ].filter(s => !users[s.toLowerCase()]);
  }, [usernameStatus, usernameNormalized, users]);

  const validate = () => {
    if (!usernameNormalized) return "Username is required.";
    if (!formData.password) return "Password is required.";
    if (mode === 'register') {
      if (!formData.name.trim()) return "Full name is required.";
      if (!formData.age || isNaN(parseInt(formData.age))) return "Valid age is required.";
      if (!formData.place.trim()) return "Place/Location is required.";
      if (usernameStatus === 'taken') return t('usernameTaken');
    }
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setIsAuthenticating(true);
    setTimeout(() => {
      if (mode === 'login') {
        const user = users[usernameNormalized];
        if (!user || user.profile.password !== formData.password) {
          setError(!user ? "User not found." : "Incorrect password.");
          setIsAuthenticating(false);
          return;
        }
        onLogin(user.profile, false);
      } else {
        const newProfile: UserProfile = {
          username: usernameNormalized,
          name: formData.name.trim(),
          age: parseInt(formData.age) || 0,
          sex: formData.sex,
          place: formData.place.trim(),
          preferredLanguage: formData.preferredLanguage,
          password: formData.password
        };
        onLogin(newProfile, true);
      }
      setIsAuthenticating(false);
    }, 800);
  };

  const inputClasses = "w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-emerald-600/5 focus:border-emerald-200 outline-none shadow-sm transition-all font-black text-emerald-900 dark:text-emerald-50 placeholder:text-slate-300 text-sm";
  const labelClasses = "block text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1";

  return (
    <div className="flex flex-col h-full bg-[#fdfbf7] dark:bg-slate-900 w-full overflow-hidden animate-fade-in">
      {onBack && (
        <header className="px-6 py-4 flex items-center z-10 shrink-0">
          <button onClick={onBack} className="w-9 h-9 bg-emerald-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-emerald-900 dark:text-emerald-500 border border-emerald-100 dark:border-slate-700 active:scale-90 transition-all">
            <i className="fas fa-chevron-left text-xs"></i>
          </button>
        </header>
      )}

      <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col items-center">
        <div className="flex flex-col items-center mb-6 shrink-0">
          <Logo size="md" className="mb-3" />
          <h1 className="text-2xl font-black text-emerald-900 dark:text-emerald-50 mb-0.5 tracking-tighter">Ibadathi</h1>
          <p className="text-[7px] font-black text-emerald-800/40 dark:text-emerald-400/30 uppercase tracking-[0.3em]">Sacred Companion</p>
        </div>

        <div className="flex bg-emerald-50/50 dark:bg-slate-800/50 p-1 rounded-2xl mb-6 w-full max-w-[240px] shrink-0 border border-emerald-100/50 dark:border-slate-700">
          <button 
            type="button"
            onClick={() => { setMode('login'); setError(null); }}
            className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${mode === 'login' ? 'bg-emerald-900 text-white shadow-md' : 'text-emerald-900/40 dark:text-slate-500'}`}
          >
            {t('login')}
          </button>
          <button 
            type="button"
            onClick={() => { setMode('register'); setError(null); }}
            className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${mode === 'register' ? 'bg-emerald-900 text-white shadow-md' : 'text-emerald-900/40 dark:text-slate-500'}`}
          >
            {t('register')}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="w-full max-w-[320px] space-y-3.5 flex flex-col pb-10">
          {error && (
            <div className="bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 p-3 rounded-xl text-[10px] font-black text-center border border-rose-100 dark:border-rose-900/30 animate-shake">
              <i className="fas fa-exclamation-circle mr-1.5"></i> {error}
            </div>
          )}

          <div className="space-y-1">
            <label className={labelClasses}>{t('username')}</label>
            <div className="relative">
              <input 
                type="text" 
                className={`${inputClasses} ${usernameStatus === 'taken' ? 'border-rose-300' : usernameStatus === 'available' ? 'border-emerald-400' : ''}`}
                placeholder="username"
                value={formData.username}
                onChange={e => setFormData({...formData, username: e.target.value.toLowerCase().replace(/\s/g, '')})}
                required
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                {usernameStatus === 'available' && <i className="fas fa-check-circle text-emerald-500 text-xs"></i>}
                {usernameStatus === 'taken' && <i className="fas fa-times-circle text-rose-500 text-xs"></i>}
              </div>
            </div>
            {usernameStatus === 'taken' && mode === 'register' && (
              <div className="bg-rose-50/50 dark:bg-rose-950/10 p-2 rounded-xl border border-rose-100/50 dark:border-rose-900/20 mt-1">
                <p className="text-[7px] font-black text-rose-800/50 uppercase tracking-widest mb-1">{t('suggestions')}</p>
                <div className="flex flex-wrap gap-1">
                  {suggestions.map(s => (
                    <button 
                      key={s} 
                      type="button"
                      onClick={() => setFormData({...formData, username: s})}
                      className="bg-white dark:bg-slate-700 px-2 py-1 rounded-lg text-[8px] font-black text-rose-900 dark:text-rose-200 border border-rose-100 dark:border-rose-900 shadow-sm"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {mode === 'register' && (
            <div className="space-y-3.5 animate-fade-in">
              <div className="space-y-1">
                <label className={labelClasses}>{t('name')}</label>
                <input 
                  type="text"
                  className={inputClasses}
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className={labelClasses}>{t('age')}</label>
                  <input 
                    type="number"
                    className={inputClasses}
                    placeholder="25"
                    value={formData.age}
                    onChange={e => setFormData({...formData, age: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className={labelClasses}>{t('sex')}</label>
                  <select 
                    className={inputClasses}
                    value={formData.sex}
                    onChange={e => setFormData({...formData, sex: e.target.value as 'male' | 'female'})}
                  >
                    <option value="male" className="font-black">{t('male')}</option>
                    <option value="female" className="font-black">{t('female')}</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className={labelClasses}>{t('place')}</label>
                <input 
                  type="text"
                  className={inputClasses}
                  placeholder="Makkah"
                  value={formData.place}
                  onChange={e => setFormData({...formData, place: e.target.value})}
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className={labelClasses}>{t('password')}</label>
            <input 
              type="password"
              className={inputClasses}
              placeholder="••••••••"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>

          <button 
            type="submit"
            disabled={isAuthenticating || (mode === 'register' && usernameStatus !== 'available')}
            className="w-full bg-emerald-900 text-white font-black py-3.5 rounded-2xl transition-all active:scale-[0.98] mt-2 uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 disabled:opacity-30 shadow-lg shadow-emerald-900/10"
          >
            {isAuthenticating ? <i className="fas fa-spinner fa-spin"></i> : <>{mode === 'login' ? t('login') : t('register')} <i className="fas fa-arrow-right text-[8px] opacity-40"></i></>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
