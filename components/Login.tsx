
import React, { useState } from 'react';
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

  const validate = () => {
    if (!formData.username.trim()) return "Username is required.";
    if (!formData.password.trim()) return "Password is required.";
    if (mode === 'register') {
      if (!formData.name.trim()) return "Full name is required.";
      if (!formData.age) return "Age is required.";
      if (!formData.place.trim()) return "Place/Location is required.";
      if (users[formData.username.trim()]) return "Username already exists.";
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

    // Simulate authentication delay for a professional feel
    setTimeout(() => {
      if (mode === 'login') {
        const user = users[formData.username.trim()];
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
          username: formData.username.trim(),
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
    }, 1000);
  };

  const inputClasses = "w-full px-4 py-2.5 bg-white border border-emerald-50 rounded-[16px] focus:ring-2 focus:ring-emerald-600/5 focus:border-emerald-200 outline-none shadow-sm transition-all font-semibold text-emerald-900 placeholder:text-slate-200 text-xs";
  const labelClasses = "block text-[8px] font-bold text-slate-500 uppercase tracking-widest ml-1 mb-0.5";

  return (
    <div className="p-5 flex flex-col items-center justify-center h-full bg-[#fdfbf7] view-transition overflow-hidden">
      <div className="w-14 h-14 bg-emerald-900 rounded-[24px] flex items-center justify-center mb-3 shadow-xl border-2 border-white rotate-3 shrink-0">
        <i className="fas fa-mosque text-xl text-emerald-100"></i>
      </div>
      <h1 className="text-2xl font-black text-emerald-900 mb-1 tracking-tighter shrink-0">Ibadathi</h1>
      <div className="h-0.5 w-6 bg-gold-classic rounded-full mb-4 shrink-0"></div>
      
      <div className="flex bg-emerald-50 p-1 rounded-xl mb-4 w-full max-w-[200px] shrink-0">
        <button 
          onClick={() => { setMode('login'); setError(null); }}
          className={`flex-1 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${mode === 'login' ? 'bg-emerald-900 text-white shadow-lg' : 'text-emerald-900/40'}`}
        >
          {t('login')}
        </button>
        <button 
          onClick={() => { setMode('register'); setError(null); }}
          className={`flex-1 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${mode === 'register' ? 'bg-emerald-900 text-white shadow-lg' : 'text-emerald-900/40'}`}
        >
          {t('register')}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="w-full space-y-2.5 max-w-[280px] flex-1 flex flex-col justify-center overflow-hidden">
        {error && (
          <div className="bg-rose-50 text-rose-600 p-2 rounded-lg text-[8px] font-bold text-center border border-rose-100 animate-pulse shrink-0">
            <i className="fas fa-exclamation-circle mr-1"></i> {error}
          </div>
        )}

        <div className="space-y-0.5 shrink-0">
          <label className={labelClasses}>{t('username')}</label>
          <input 
            type="text" 
            className={inputClasses}
            placeholder="muslim_seeker"
            value={formData.username}
            onChange={e => setFormData({...formData, username: e.target.value})}
          />
        </div>

        {mode === 'register' ? (
          <div className="space-y-2 shrink-0">
            <div className="space-y-0.5">
              <label className={labelClasses}>{t('name')}</label>
              <input 
                type="text"
                className={inputClasses}
                placeholder="Abdullah Al-Fulan"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-0.5">
                <label className={labelClasses}>{t('age')}</label>
                <input 
                  type="number"
                  className={inputClasses}
                  placeholder="25"
                  value={formData.age}
                  onChange={e => setFormData({...formData, age: e.target.value})}
                />
              </div>
              <div className="space-y-0.5">
                <label className={labelClasses}>{t('sex')}</label>
                <select 
                  className={`${inputClasses} appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%2364748b%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%20%2F%3E%3C%2Fsvg%3E')] bg-[length:0.7em_0.7em] bg-[right_0.75rem_center] bg-no-repeat`}
                  value={formData.sex}
                  onChange={e => setFormData({...formData, sex: e.target.value as 'male' | 'female'})}
                >
                  <option value="male">{t('male')}</option>
                  <option value="female">{t('female')}</option>
                </select>
              </div>
            </div>

            <div className="space-y-0.5">
              <label className={labelClasses}>{t('place')}</label>
              <input 
                type="text"
                className={inputClasses}
                placeholder="Makkah, KSA"
                value={formData.place}
                onChange={e => setFormData({...formData, place: e.target.value})}
              />
            </div>
          </div>
        ) : null}

        <div className="space-y-0.5 shrink-0">
          <label className={labelClasses}>{t('password')}</label>
          <input 
            type="password"
            className={inputClasses}
            placeholder="••••••••"
            value={formData.password}
            onChange={e => setFormData({...formData, password: e.target.value})}
          />
        </div>

        <button 
          type="submit"
          disabled={isAuthenticating}
          className="w-full btn-emerald font-black py-3 rounded-[16px] transition-all active-scale mt-2 uppercase tracking-[0.2em] text-[9px] flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
        >
          {isAuthenticating ? (
            <i className="fas fa-spinner fa-spin"></i>
          ) : (
            mode === 'login' ? t('login') : t('register')
          )}
        </button>
      </form>
      
      <div className="mt-4 flex items-center gap-2 opacity-5 shrink-0">
        <i className="fas fa-hand-holding-heart text-emerald-900 text-lg"></i>
      </div>
    </div>
  );
};

export default Login;
