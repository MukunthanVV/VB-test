import React from 'react';

interface CarStatusStampProps {
  status: 'Live' | 'Booked' | 'Sold' | string;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  title?: string;
}

export const CarStatusStamp: React.FC<CarStatusStampProps> = ({
  status,
  className = '',
  onClick,
  title
}) => {
  const normalized = status ? status.trim().toLowerCase() : '';

  if (!normalized || normalized === 'none') {
    return null;
  }

  // Pure negative-space editorial status presentation:
  // Fine horizontal line + terminal micro-dot + wide-tracked bold text + terminal micro-dot + fine horizontal line
  const config = {
    live: {
      label: 'LIVE',
      title: 'Status: Live (Available for Acquisition)',
      colorClass: 'text-[#1B4A32] dark:text-[#4ADE80]',
    },
    booked: {
      label: 'BOOKED',
      title: 'Status: Privately Reserved',
      colorClass: 'text-[#8A451C] dark:text-[#FB923C]',
    },
    sold: {
      label: 'SOLD',
      title: 'Status: Curated Specimen Officially Sold',
      colorClass: 'text-[#7A1B29] dark:text-[#F87171]',
    },
  }[normalized];

  if (!config) return null;

  return (
    <div
      onClick={onClick}
      title={title || config.title}
      className={`inline-flex items-center gap-3 sm:gap-4 select-none transition-opacity duration-300 hover:opacity-80 ${config.colorClass} ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {/* Leading horizontal line with terminal dot */}
      <div className="flex items-center">
        <span className="w-10 sm:w-14 md:w-20 h-[1.5px] bg-current opacity-70 block" />
        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-current block -ml-0.5 flex-shrink-0 shadow-sm" />
      </div>

      {/* Bold wide-tracked status text */}
      <span className="font-sans font-black text-sm sm:text-base md:text-lg tracking-[0.38em] uppercase select-none px-1">
        {config.label}
      </span>

      {/* Trailing terminal dot with horizontal line */}
      <div className="flex items-center">
        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-current block -mr-0.5 flex-shrink-0 shadow-sm" />
        <span className="w-10 sm:w-14 md:w-20 h-[1.5px] bg-current opacity-70 block" />
      </div>
    </div>
  );
};

export default CarStatusStamp;
