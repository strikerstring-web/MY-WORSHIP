
import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const sizeMap = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32'
  };

  return (
    <div className={`relative ${sizeMap[size]} rounded-[28%] bg-[#000d1a] flex items-center justify-center overflow-hidden shadow-2xl ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full p-2">
        {/* Large Crescent Background */}
        <path 
          d="M 50 15 A 35 35 0 1 0 50 85 A 30 30 0 1 1 50 15" 
          fill="#0a4a52" 
          transform="rotate(-20 50 50)"
        />
        
        {/* Golden Arch (Mihrab) */}
        <path 
          d="M 35 75 L 35 45 C 35 30 65 30 65 45 L 65 75" 
          fill="none" 
          stroke="#d4af37" 
          strokeWidth="6" 
          strokeLinecap="round"
        />
        <path 
          d="M 45 32 L 50 25 L 55 32" 
          fill="#d4af37"
        />
        <circle cx="50" cy="22" r="2" fill="#d4af37" />

        {/* Tasbih Beads (Curved Pattern) */}
        <g fill="#4ade80">
          <circle cx="50" cy="40" r="1.5" />
          <circle cx="53" cy="43" r="1.5" />
          <circle cx="55" cy="47" r="1.5" />
          <circle cx="54" cy="51" r="1.5" />
          <circle cx="51" cy="54" r="1.5" />
          <circle cx="47" cy="56" r="1.5" />
          <circle cx="43" cy="58" r="1.5" />
          <circle cx="40" cy="62" r="1.5" />
          <circle cx="39" cy="66" r="1.5" />
          <circle cx="41" cy="70" r="1.5" />
          <circle cx="45" cy="72" r="1.5" />
          <circle cx="50" cy="73" r="1.5" />
          <circle cx="55" cy="72" r="1.5" />
          <circle cx="59" cy="69" r="1.5" />
          <circle cx="61" cy="64" r="1.5" />
          
          <circle cx="51" cy="45" r="1.2" opacity="0.6" />
          <circle cx="48" cy="48" r="1.2" opacity="0.6" />
          <circle cx="45" cy="52" r="1.2" opacity="0.6" />
        </g>
      </svg>
    </div>
  );
};

export default Logo;
