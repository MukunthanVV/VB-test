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
    <div
      className={`flex items-center justify-center gap-2.5 py-1 select-none pointer-events-auto ${className}`}
      role="tablist"
      aria-label="Image gallery pagination"
    >
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
            className="group/dot relative p-1 focus:outline-none cursor-pointer transition-transform duration-200 hover:scale-125 flex items-center justify-center"
            aria-label={`Go to image ${idx + 1} of ${total}`}
            aria-selected={isActive}
            role="tab"
          >
            {isActive ? (
              /* Active Dot: Concentric ring with center dot (matches user Adobe Stock reference) */
              <span className="w-3.5 h-3.5 rounded-full border-[1.8px] border-white bg-black/20 backdrop-blur-[2px] flex items-center justify-center shadow-[0_1px_4px_rgba(0,0,0,0.6)] transition-all">
                <span className="w-1.5 h-1.5 rounded-full bg-white block shadow-sm" />
              </span>
            ) : (
              /* Inactive Dot: Clean stroked hollow circle */
              <span className="w-3 h-3 rounded-full border-[1.5px] border-white/75 hover:border-white bg-black/15 backdrop-blur-[1px] block transition-all shadow-[0_1px_3px_rgba(0,0,0,0.5)]" />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default SwipeDots;
