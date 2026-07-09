import React, { useEffect, useState } from 'react';

const PremiumToggle: React.FC = () => {
  const [isDark, setIsDark] = useState(() => {
    // Check initial state
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <div className="flex items-center gap-3">
      <span className={`font-label-caps text-[13px] uppercase tracking-widest font-semibold transition-colors duration-300 ${isDark ? 'text-gold' : 'text-primary'}`}>
        {isDark ? 'SPORTS' : 'ECO'}
      </span>
      <button
        onClick={() => setIsDark(!isDark)}
        className={`relative w-[60px] h-[32px] rounded-full transition-all duration-300 ease-in-out flex-shrink-0 ${
          isDark 
            ? 'bg-gold shadow-[0_0_15px_rgba(200,160,93,0.3)]' 
            : 'bg-[#D7D1C9]'
        }`}
        aria-label="Toggle theme"
      >
        <div 
          className={`absolute top-[4px] w-[24px] h-[24px] rounded-full transition-all duration-300 ease-in-out flex items-center justify-center ${
            isDark 
              ? 'translate-x-[32px] bg-[#111111]' 
              : 'translate-x-[4px] bg-[#F5F2ED] shadow-sm'
          }`}
        >
          {isDark && (
            <span className="material-symbols-outlined text-[16px] text-gold leading-none">auto_awesome</span>
          )}
        </div>
      </button>
    </div>
  );
};

export default PremiumToggle;
