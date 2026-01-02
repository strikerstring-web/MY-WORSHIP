
import React, { useState, useMemo } from 'react';
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
      `${base}_ibadathi`,
      `${base}_seeker`
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

  const inputClasses = "w-full px-5 py-4 bg-white border border-slate-100 rounded-[24px] focus:ring-4 focus:ring-emerald-600/5 focus:border-emerald-200 outline-none shadow-sm transition-all font-semibold text-emerald-900 placeholder:text-slate-300 text-sm";
  const labelClasses = "block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2";

  return (
    <div className="flex flex-col h-full bg-[#fdfbf7] w-full overflow-hidden">
      {/* Scrollable Form Container */}
      <div className="flex-1 overflow-y-auto px-6 pt-12 pb-8 flex flex-col items-center">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8 shrink-0">
          <div className="w-20 h-20 bg-emerald-900 rounded-[32px] flex items-center justify-center mb-4 shadow-2xl border-4 border-white rotate-3 group active:rotate-0 transition-transform">
            <i className="fas fa-mosque text-3xl text-emerald-100"></i>
          </div>
          <h1 className="text-4xl font-black text-emerald-900 mb-1 tracking-tighter">Ibadathi</h1>
          <p className="text-[11px] font-black text-emerald-800/40 uppercase tracking-[0.3em]">Sacred Companion</p>
        </div>

        {/* Mode Switcher */}
        <div className="flex bg-emerald-50/50 p-1.5 rounded-[24px] mb-8 w-full max-w-[280px] shrink-0 border border-emerald-100/50">
          <button 
            type="button"
            onClick={() => { setMode('login'); setError(null); }}
            className={`flex-1 py-3 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'login' ? 'bg-emerald-900 text-white shadow-lg' : 'text-emerald-900/40 hover:text-emerald-900/60'}`}
          >
            {t('login')}
          </button>
          <button 
            type="button"
            onClick={() => { setMode('register'); setError(null); }}
            className={`flex-1 py-3 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'register' ? 'bg-emerald-900 text-white shadow-lg' : 'text-emerald-900/40 hover:text-emerald-900/60'}`}
          >
            {t('register')}
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full max-w-[360px] space-y-6 flex flex-col">
          {error && (
            <div className="bg-rose-50 text-rose-600 p-4 rounded-[20px] text-[11px] font-bold text-center border border-rose-100 animate-shake shrink-0">
              <i className="fas fa-exclamation-circle mr-2"></i> {error}
            </div>
          )}

          {/* Username Field - ALWAYS VISIBLE */}
          <div className="space-y-2">
            <label className={labelClasses}>{t('username')}</label>
            <div className="relative">
              <input 
                type="text" 
                className={`${inputClasses} ${usernameStatus === 'taken' ? 'border-rose-300' : usernameStatus === 'available' ? 'border-emerald-400' : ''}`}
                placeholder="muslim_seeker"
                value={formData.username}
                onChange={e => setFormData({...formData, username: e.target.value.toLowerCase().replace(/\s/g, '')})}
                required
              />
              <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {usernameStatus === 'available' && <i className="fas fa-check-circle text-emerald-500 animate-fade-in"></i>}
                {usernameStatus === 'taken' && <i className="fas fa-times-circle text-rose-500 animate-fade-in"></i>}
              </div>
            </div>
            {usernameStatus === 'taken' && mode === 'register' && (
              <div className="animate-fade-up bg-rose-50/50 p-4 rounded-[20px] border border-rose-100/50 mt-2">
                <p className="text-[9px] font-black text-rose-800/60 uppercase tracking-widest mb-3">{t('suggestions')}</p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map(s => (
                    <button 
                      key={s} 
                      type="button"
                      onClick={() => setFormData({...formData, username: s})}
                      className="bg-white px-3 py-2 rounded-xl text-[10px] font-black text-rose-900 border border-rose-100 active:scale-95 transition-all shadow-sm"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Registration Extra Fields */}
          {mode === 'register' && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
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
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
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
                <div className="space-y-2">
                  <label className={labelClasses}>{t('sex')}</label>
                  <select 
                    className={`${inputClasses} appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%23cbd5e1%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%20%2F%3E%3C%2Fsvg%3E')] bg-[length:1em_1em] bg-[right_1.25rem_center] bg-no-repeat`}
                    value={formData.sex}
                    onChange={e => setFormData({...formData, sex: e.target.value as 'male' | 'female'})}
                  >
                    <option value="male">{t('male')}</option>
                    <option value="female">{t('female')}</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
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
          )}

          {/* Password Field */}
          <div className="space-y-2">
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

          {/* Action Button */}
          <button 
            type="submit"
            disabled={isAuthenticating || (mode === 'register' && usernameStatus !== 'available')}
            className="w-full bg-emerald-900 text-white font-black py-5 rounded-[28px] transition-all active:scale-[0.98] mt-4 uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 disabled:opacity-30 shadow-2xl shadow-emerald-900/20"
          >
            {isAuthenticating ? (
              <i className="fas fa-spinner fa-spin"></i>
            ) : (
              <>
                {mode === 'login' ? t('login') : t('register')}
                <i className="fas fa-arrow-right text-[10px] opacity-40"></i>
              </>
            )}
          </button>
        </form>
        
        <div className="mt-12 text-slate-200 text-[10px] font-black uppercase tracking-[0.3em]">
           Ibadathi © 1446
        </div>
      </div>
    </div>
  );
};

export default Login;
