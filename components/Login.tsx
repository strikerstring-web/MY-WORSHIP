
import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile, UserData, Language } from '../types';

interface LoginProps {
  onLogin: (profile: UserProfile, isNew: boolean) => void;
  t: (key: string) => string;
  initialLanguage: Language;
  users: Record<string, UserData>;
}

const Login: React.FC<LoginProps> = ({ onLogin, t, initialLanguage, users }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
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

  // Normalize username for checks
  const usernameNormalized = useMemo(() => formData.username.trim().toLowerCase(), [formData.username]);
  
  // Instant availability check
  const usernameStatus = useMemo(() => {
    if (mode === 'login' || usernameNormalized.length < 3) return 'idle';
    return users[usernameNormalized] ? 'taken' : 'available';
  }, [usernameNormalized, mode, users]);

  // Dynamic suggestions
  const suggestions = useMemo(() => {
    if (usernameStatus !== 'taken') return [];
    const base = usernameNormalized;
    const items = [
      `${base}${Math.floor(Math.random() * 99) + 1}`,
      `${base}_ibadathi`,
      `${base}_seeker`
    ];
    // Filter out duplicates if random luck is bad
    return [...new Set(items)].filter(s => !users[s.toLowerCase()]);
  }, [usernameStatus, usernameNormalized, users]);

  const validate = () => {
    if (!usernameNormalized) return "Username is required.";
    if (!formData.password.trim()) return "Password is required.";
    
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

    // Simulate premium delay
    setTimeout(() => {
      if (mode === 'login') {
        const user = users[usernameNormalized];
        if (!user) {
          setError("User not found.");
          setIsAuthenticating(false);
          return;
        }
        if (user.profile.password !== formData.password) {
          setError("Incorrect password.");
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
    }, 600);
  };

  const inputClasses = "w-full px-4 py-3 bg-white border border-slate-100 rounded-[20px] focus:ring-2 focus:ring-emerald-600/10 focus:border-emerald-200 outline-none shadow-sm transition-all font-semibold text-emerald-900 placeholder:text-slate-200 text-sm";
  const labelClasses = "block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5";

  return (
    <div className="p-6 flex flex-col items-center justify-center h-full bg-[#fdfbf7] view-transition overflow-hidden">
      <div className="w-16 h-16 bg-emerald-900 rounded-[28px] flex items-center justify-center mb-4 shadow-2xl border-2 border-white rotate-3 shrink-0">
        <i className="fas fa-mosque text-2xl text-emerald-100"></i>
      </div>
      <h1 className="text-3xl font-black text-emerald-900 mb-1 tracking-tighter shrink-0">Ibadathi</h1>
      <p className="text-[10px] font-black text-emerald-800/40 uppercase tracking-[0.2em] mb-6 shrink-0">Sacred Companion</p>
      
      <div className="flex bg-emerald-50 p-1.5 rounded-2xl mb-6 w-full max-w-[240px] shrink-0 border border-emerald-100/50">
        <button 
          type="button"
          onClick={() => { setMode('login'); setError(null); }}
          className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'login' ? 'bg-emerald-900 text-white shadow-lg' : 'text-emerald-900/40'}`}
        >
          {t('login')}
        </button>
        <button 
          type="button"
          onClick={() => { setMode('register'); setError(null); }}
          className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'register' ? 'bg-emerald-900 text-white shadow-lg' : 'text-emerald-900/40'}`}
        >
          {t('register')}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="w-full space-y-4 max-w-[320px] flex-1 flex flex-col justify-center overflow-y-auto pr-1">
        {error && (
          <div className="bg-rose-50 text-rose-600 p-3 rounded-2xl text-[10px] font-bold text-center border border-rose-100 animate-fade-up shrink-0">
            <i className="fas fa-exclamation-circle mr-2"></i> {error}
          </div>
        )}

        <div className="space-y-1.5 shrink-0">
          <label className={labelClasses}>{t('username')}</label>
          <div className="relative">
            <input 
              type="text" 
              className={`${inputClasses} ${usernameStatus === 'taken' ? 'border-rose-300 bg-rose-50/10' : usernameStatus === 'available' ? 'border-emerald-300 bg-emerald-50/10' : ''}`}
              placeholder="muslim_seeker"
              value={formData.username}
              onChange={e => setFormData({...formData, username: e.target.value.toLowerCase().replace(/\s/g, '')})}
              required
            />
            {usernameStatus === 'available' && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-600 animate-fade-in">
                <i className="fas fa-check-circle"></i>
              </div>
            )}
            {usernameStatus === 'taken' && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-rose-600 animate-shake">
                <i className="fas fa-times-circle"></i>
              </div>
            )}
          </div>
          
          {/* Real-time availability messages */}
          {usernameStatus === 'available' && (
            <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest ml-1 animate-fade-up">
              <i className="fas fa-info-circle mr-1"></i> {t('usernameAvailable')}
            </p>
          )}
          {usernameStatus === 'taken' && (
            <div className="animate-fade-up">
              <p className="text-[9px] font-black text-rose-600 uppercase tracking-widest ml-1">
                <i className="fas fa-exclamation-triangle mr-1"></i> {t('usernameTaken')}
              </p>
              
              {/* Dynamic Suggestions */}
              <div className="mt-3 p-3 bg-rose-50/50 rounded-2xl border border-rose-100/50">
                <p className="text-[8px] font-black text-rose-800/60 uppercase tracking-widest mb-2">{t('suggestions')}</p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map(s => (
                    <button 
                      key={s} 
                      type="button"
                      onClick={() => setFormData({...formData, username: s})}
                      className="bg-white px-2.5 py-1.5 rounded-xl text-[9px] font-black text-rose-900 border border-rose-200 active:scale-95 transition-all shadow-sm hover:border-emerald-400 hover:text-emerald-700"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {mode === 'register' ? (
          <div className="space-y-4 shrink-0 animate-fade-up">
            <div className="space-y-1.5">
              <label className={labelClasses}>{t('name')}</label>
              <input 
                type="text"
                className={inputClasses}
                placeholder="Abdullah Al-Fulan"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
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
              <div className="space-y-1.5">
                <label className={labelClasses}>{t('sex')}</label>
                <select 
                  className={`${inputClasses} appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%2364748b%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%20%2F%3E%3C%2Fsvg%3E')] bg-[length:0.8em_0.8em] bg-[right_1rem_center] bg-no-repeat`}
                  value={formData.sex}
                  onChange={e => setFormData({...formData, sex: e.target.value as 'male' | 'female'})}
                >
                  <option value="male">{t('male')}</option>
                  <option value="female">{t('female')}</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className={labelClasses}>{t('place')}</label>
              <input 
                type="text"
                className={inputClasses}
                placeholder="Makkah, KSA"
                value={formData.place}
                onChange={e => setFormData({...formData, place: e.target.value})}
                required
              />
            </div>
          </div>
        ) : null}

        <div className="space-y-1.5 shrink-0">
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
          className="w-full bg-emerald-900 text-white font-black py-4 rounded-[24px] transition-all active:scale-[0.98] mt-4 uppercase tracking-[0.25em] text-[10px] flex items-center justify-center gap-3 shrink-0 disabled:opacity-30 shadow-2xl shadow-emerald-900/20"
        >
          {isAuthenticating ? (
            <i className="fas fa-spinner fa-spin"></i>
          ) : (
            <>
              {mode === 'login' ? t('login') : t('register')}
              <i className="fas fa-arrow-right text-[8px] opacity-40"></i>
            </>
          )}
        </button>
      </form>
      
      <div className="mt-8 flex items-center gap-2 opacity-5 shrink-0 grayscale">
        <i className="fas fa-award text-emerald-900 text-xl"></i>
      </div>
    </div>
  );
};

export default Login;
