
import React, { useState, useEffect, useCallback } from 'react';

interface QiblaFinderProps {
  setCurrentView: (view: any) => void;
  t: (key: string) => string;
}

const KAABA_COORDS = { lat: 21.422487, lng: 39.826206 };

const QiblaFinder: React.FC<QiblaFinderProps> = ({ setCurrentView, t }) => {
  const [qiblaAngle, setQiblaAngle] = useState<number | null>(null);
  const [compassHeading, setCompassHeading] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [locationLoaded, setLocationLoaded] = useState(false);

  const calculateQibla = useCallback((lat: number, lng: number) => {
    const phiK = (KAABA_COORDS.lat * Math.PI) / 180;
    const phi = (lat * Math.PI) / 180;
    const deltaL = ((KAABA_COORDS.lng - lng) * Math.PI) / 180;

    const angle = Math.atan2(
      Math.sin(deltaL),
      Math.cos(phi) * Math.tan(phiK) - Math.sin(phi) * Math.cos(deltaL)
    );

    let qiblaDegree = (angle * 180) / Math.PI;
    if (qiblaDegree < 0) qiblaDegree += 360;
    setQiblaAngle(qiblaDegree);
  }, []);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          calculateQibla(position.coords.latitude, position.coords.longitude);
          setLocationLoaded(true);
        },
        (err) => {
          setError("Location access denied. Please enable location to find Qibla direction.");
          console.error(err);
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
    }
  }, [calculateQibla]);

  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      let heading = 0;
      // iOS check
      if ((event as any).webkitCompassHeading !== undefined) {
        heading = (event as any).webkitCompassHeading;
      } else if (event.alpha !== null) {
        // Android absolute orientation
        heading = 360 - event.alpha;
      }
      setCompassHeading(heading);
    };

    // Permission check for iOS 13+
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      (DeviceOrientationEvent as any).requestPermission()
        .then((permissionState: string) => {
          if (permissionState === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation);
          }
        })
        .catch(console.error);
    } else {
      window.addEventListener('deviceorientation', handleOrientation);
    }

    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, []);

  const relativeQibla = qiblaAngle !== null ? (qiblaAngle - compassHeading + 360) % 360 : 0;
  const isAligned = Math.abs(relativeQibla) < 5 || Math.abs(relativeQibla - 360) < 5;

  return (
    <div className="flex flex-col h-full bg-[#fdfbf7] animate-fade-up">
      {/* Header */}
      <div className="p-4 pt-10 pb-6 bg-[#064e3b] text-white flex items-center gap-3 shadow-xl rounded-b-[40px] z-20 shrink-0">
        <button onClick={() => setCurrentView('dashboard')} className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-xl hover:bg-white/20 transition-all border border-white/10 active:scale-90 rtl:rotate-180">
          <i className="fas fa-chevron-left text-xs"></i>
        </button>
        <div>
          <h1 className="text-xl font-bold tracking-tight">{t('qibla')}</h1>
          <p className="text-[9px] text-emerald-300/80 font-bold uppercase tracking-[0.2em] mt-0.5">Direction Finder</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 gap-4 overflow-hidden"> {/* No scroll here */}
        <div className="text-center max-w-xs shrink-0">
          <p className="text-[#064e3b]/60 text-xs font-black uppercase tracking-widest mb-1">Direction of Kaaba</p>
          <h2 className="text-xl font-bold text-[#064e3b]">Holy Masjid al-Haram</h2>
          <p className="text-slate-400 text-[9px] mt-1 italic">Makkah, Saudi Arabia</p>
        </div>

        {error ? (
          <div className="bg-rose-50 border border-rose-100 p-4 rounded-[28px] text-center max-w-xs w-full shrink-0">
            <i className="fas fa-location-slash text-rose-500 text-2xl mb-3"></i>
            <p className="text-rose-900 text-sm font-bold">{error}</p>
          </div>
        ) : (
          <div className="relative w-48 h-48 flex items-center justify-center max-w-full">
            {/* Outer Compass Ring */}
            <div 
              className="absolute inset-0 border-[8px] border-emerald-50 rounded-full shadow-inner transition-transform duration-200"
              style={{ transform: `rotate(${-compassHeading}deg)` }}
            >
              <div className="absolute top-1.5 left-1/2 -translate-x-1/2 text-[8px] font-black text-emerald-800">N</div>
              <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 text-[8px] font-black text-emerald-800">S</div>
              <div className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[8px] font-black text-emerald-800">W</div>
              <div className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[8px] font-black text-emerald-800">E</div>
            </div>

            {/* Qibla Indicator */}
            <div 
              className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${isAligned ? 'scale-110' : ''}`}
              style={{ transform: `rotate(${relativeQibla}deg)` }}
            >
              <div className="relative flex flex-col items-center">
                {/* Arrow head */}
                <div className={`w-6 h-6 flex items-center justify-center mb-[-3px] transition-colors ${isAligned ? 'text-emerald-500 animate-bounce' : 'text-slate-300'}`}>
                   <i className="fas fa-kaaba text-xl"></i>
                </div>
                <div className={`w-0.5 h-20 rounded-full transition-colors ${isAligned ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-slate-200'}`}></div>
                <div className="absolute -top-8">
                   <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${isAligned ? 'bg-emerald-600 text-white shadow-md' : 'bg-transparent text-slate-300'}`}>
                      {isAligned ? 'Aligned' : ''}
                   </div>
                </div>
              </div>
            </div>

            {/* Center Point */}
            <div className="w-10 h-10 bg-white rounded-full shadow-lg border-2 border-emerald-50 z-10 flex items-center justify-center overflow-hidden">
               <i className="fas fa-star-and-crescent text-base text-emerald-600"></i>
            </div>
          </div>
        )}

        <div className="w-full max-w-xs bg-white p-4 rounded-[28px] shadow-xl shadow-emerald-900/5 border border-emerald-50 flex flex-col items-center text-center shrink-0">
           {!locationLoaded && !error && (
             <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs">
                <i className="fas fa-spinner fa-spin"></i>
                Locating your position...
             </div>
           )}
           {locationLoaded && (
             <>
               <span className="text-[9px] font-black text-emerald-800/40 uppercase tracking-[0.2em] mb-2">Compass Instructions</span>
               <p className="text-slate-500 text-[10px] leading-relaxed">
                 {t('qibla') === 'بوصلة القبلة' 
                    ? "أمسك جهازك بشكل أفقي وقم بالتدوير حتى يشير رمز الكعبة إلى الأعلى مباشرة."
                    : "Hold your device flat and rotate until the Kaaba icon is pointing directly up."}
                 {isAligned && <span className="text-emerald-600 font-bold block mt-1">You are now facing the Qibla!</span>}
               </p>
             </>
           )}
        </div>
        
        <p className="text-[8px] text-slate-300 font-bold uppercase tracking-[0.2em] shrink-0">
           Precision based on magnetic sensors
        </p>
      </div>
    </div>
  );
};

export default QiblaFinder;
