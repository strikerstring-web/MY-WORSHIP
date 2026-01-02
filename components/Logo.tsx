
import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  withText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = '', size = 'md', withText = false }) => {
  const sizeMap = {
    sm: 'w-10',
    md: 'w-16',
    lg: 'w-32',
    xl: 'w-48'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`${sizeMap[size]} aspect-square relative flex items-center justify-center`}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
          {/* Main Background Glow (Subtle) */}
          <circle cx="50" cy="50" r="45" fill="rgba(10, 74, 82, 0.05)" />
          
          {/* Deep Teal Crescent */}
          <path 
            d="M 50 15 A 35 35 0 1 0 50 85 A 28 28 0 1 1 50 15" 
            fill="#1a6d75" 
            transform="rotate(-15 50 50)"
          />
          
          {/* Golden Mihrab Arch */}
          <g transform="translate(0, 5)">
            {/* The Arch Body */}
            <path 
              d="M 38 70 L 38 45 C 38 32 62 32 62 45 L 62 70" 
              fill="none" 
              stroke="#e9c46a" 
              strokeWidth="4.5" 
              strokeLinecap="round"
            />
            {/* Dome Top */}
            <path 
              d="M 45 35 L 50 28 L 55 35" 
              fill="#e9c46a"
            />
            {/* Small Top Finial */}
            <path 
              d="M 49 25 A 2 2 0 1 1 51 25" 
              fill="none" 
              stroke="#e9c46a" 
              strokeWidth="1"
            />
            <circle cx="50" cy="23" r="1.2" fill="#e9c46a" />
          </g>
        </svg>
      </div>
      
      {withText && (
        <div className="mt-2 text-center">
          <span className="text-3xl font-black text-[#e9c46a] arabic-font block leading-tight tracking-widest drop-shadow-md" dir="rtl">
            عبادتي
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
