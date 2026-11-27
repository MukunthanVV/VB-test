import React from 'react';

interface SwipeDotsProps {
  total: number;
  activeIndex: number;
  onSelect?: (index: number) => void;
  className?: string;
}

export const SwipeDots: React.FC<SwipeDotsProps> = ({
  total,
  activeIndex,
  onSelect,
  className = ''
}) => {
  if (total <= 1) return null;

  return (
    <div className={`flex items-center justify-center gap-2 px-3 py-1.5 rounded-full bg-black/35 backdrop-blur-md border border-white/10 shadow-lg ${className}`}>
      {Array.from({ length: total }).map((_, idx) => {
        const isActive = idx === activeIndex;
        return (
          <button
            key={idx}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect?.(idx);
            }}
            className="group/dot relative p-1 focus:outline-none transition-transform hover:scale-125 cursor-pointer"
            aria-label={`Go to slide ${idx + 1}`}
          >
            {/* Concentric ring matching user specification (outline ring with inner filled dot when active) */}
            <span
              className={`block rounded-full transition-all duration-300 flex items-center justify-center ${
                isActive
                  ? 'w-3.5 h-3.5 border-2 border-white bg-transparent shadow-sm'
                  : 'w-3 h-3 border-2 border-white/60 hover:border-white bg-transparent'
              }`}
            >
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-white block" />
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default SwipeDots;
