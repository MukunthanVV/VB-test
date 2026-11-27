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

  if (normalized === 'live') {
    return (
      <div
        onClick={onClick}
        title={title}
        className={`relative inline-block select-none transform rotate-0 transition-transform duration-200 hover:scale-105 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      >
        <svg
          viewBox="0 0 170 70"
          className="w-32 sm:w-40 md:w-44 h-auto drop-shadow-md"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <filter id="grunge-live" x="0%" y="0%" width="100%" height="100%">
              <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" result="noise" />
              <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 16 -6" result="contrast" />
              <feComposite in="SourceGraphic" in2="contrast" operator="out" />
            </filter>
          </defs>

          {/* Outer Thin Green Border */}
          <rect x="2" y="2" width="166" height="66" rx="4" stroke="#15803D" strokeWidth="2.5" />

          {/* Solid Green Inked Body */}
          <rect x="5.5" y="5.5" width="159" height="59" rx="3" fill="#16A34A" />

          {/* Inner Distressed White Border Frame */}
          <rect
            x="8.5"
            y="8.5"
            width="153"
            height="53"
            rx="2"
            stroke="#FFFFFF"
            strokeWidth="2"
            strokeDasharray="14 1 28 2 40 1 20 2"
          />

          {/* LIVE Bold Inked Text */}
          <text
            x="85"
            y="49"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="38"
            fontWeight="900"
            fontFamily="Impact, 'Arial Black', -apple-system, sans-serif"
            letterSpacing="6"
            className="select-none"
          >
            LIVE
          </text>

          {/* Distressed Weathered Speckles Overlay */}
          <g fill="#FFFFFF" opacity="0.6" filter="url(#grunge-live)">
            <circle cx="18" cy="18" r="1.5" />
            <circle cx="32" cy="12" r="1.2" />
            <circle cx="55" cy="15" r="1.8" />
            <circle cx="78" cy="11" r="1" />
            <circle cx="110" cy="14" r="1.6" />
            <circle cx="145" cy="18" r="1.4" />
            <circle cx="22" cy="54" r="1.6" />
            <circle cx="68" cy="56" r="1.2" />
            <circle cx="120" cy="55" r="1.5" />
            <circle cx="152" cy="50" r="1.8" />
            <circle cx="95" cy="22" r="1" />
            <circle cx="40" cy="40" r="1.4" />
            <circle cx="130" cy="35" r="1.3" />
            <rect x="28" y="22" width="3" height="1.5" rx="0.5" />
            <rect x="85" y="16" width="4" height="1" rx="0.5" />
            <rect x="140" y="30" width="3" height="1.5" rx="0.5" />
            <rect x="50" y="50" width="5" height="1.2" rx="0.5" />
          </g>

          {/* Subtle Grunge Cutouts across the green background */}
          <g fill="#000000" opacity="0.12">
            <circle cx="35" cy="28" r="1.5" />
            <circle cx="125" cy="45" r="1.8" />
            <circle cx="70" cy="20" r="1.2" />
            <circle cx="140" cy="58" r="1.6" />
          </g>
        </svg>
      </div>
    );
  }

  if (normalized === 'booked') {
    return (
      <div
        onClick={onClick}
        title={title}
        className={`relative inline-block select-none transform rotate-0 transition-transform duration-200 hover:scale-105 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      >
        <svg
          viewBox="0 0 190 76"
          className="w-36 sm:w-44 md:w-48 h-auto drop-shadow-md"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer Thin Distressed Red Border */}
          <rect
            x="3"
            y="3"
            width="184"
            height="70"
            rx="3"
            stroke="#B91C1C"
            strokeWidth="2.5"
            strokeDasharray="25 1 40 2 30 1 50 2"
          />

          {/* Inner Thick Heavy Red Stamp Border */}
          <rect
            x="8"
            y="8"
            width="174"
            height="60"
            rx="2"
            stroke="#B91C1C"
            strokeWidth="5"
            strokeDasharray="18 1.5 50 1 35 2 45 1.5"
          />

          {/* BOOKED Bold Inked Typography */}
          <text
            x="95"
            y="52"
            textAnchor="middle"
            fill="#B91C1C"
            fontSize="34"
            fontWeight="900"
            fontFamily="Impact, 'Arial Black', -apple-system, sans-serif"
            letterSpacing="5"
            className="select-none"
          >
            BOOKED
          </text>

          {/* Weathered Chipped Ink Splatter and Specks */}
          <g fill="#B91C1C" opacity="0.85">
            <circle cx="14" cy="14" r="1.5" />
            <circle cx="28" cy="9" r="1.2" />
            <circle cx="48" cy="11" r="1.8" />
            <circle cx="82" cy="7" r="1.4" />
            <circle cx="120" cy="10" r="1.6" />
            <circle cx="160" cy="13" r="1.5" />
            <circle cx="180" cy="22" r="1.8" />
            <circle cx="178" cy="55" r="1.6" />
            <circle cx="165" cy="67" r="1.4" />
            <circle cx="130" cy="65" r="1.7" />
            <circle cx="75" cy="68" r="1.5" />
            <circle cx="30" cy="66" r="1.8" />
            <circle cx="12" cy="58" r="1.6" />
            <circle cx="9" cy="35" r="1.3" />
            <circle cx="58" cy="42" r="1.2" />
            <circle cx="138" cy="38" r="1.4" />
            <circle cx="102" cy="24" r="1.2" />
          </g>

          {/* Weathered Inset Nick Marks simulating rubber stamp wear */}
          <g fill="#D7D1C9" opacity="0.9">
            <circle cx="20" cy="8" r="1.8" />
            <circle cx="65" cy="8" r="1.4" />
            <circle cx="140" cy="8" r="2" />
            <circle cx="174" cy="30" r="1.6" />
            <circle cx="174" cy="50" r="1.8" />
            <circle cx="100" cy="68" r="2.2" />
            <circle cx="45" cy="68" r="1.5" />
            <circle cx="8" cy="45" r="1.7" />
            <circle cx="92" cy="36" r="1.3" />
            <circle cx="125" cy="48" r="1.4" />
          </g>
        </svg>
      </div>
    );
  }

  if (normalized === 'sold') {
    return (
      <div
        onClick={onClick}
        title={title}
        className={`relative inline-block select-none transform rotate-0 transition-transform duration-200 hover:scale-105 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      >
        <svg
          viewBox="0 0 180 78"
          className="w-36 sm:w-44 md:w-48 h-auto drop-shadow-md"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Heavy Rounded Rect Outer Border */}
          <rect
            x="3"
            y="3"
            width="174"
            height="72"
            rx="16"
            stroke="#DC2626"
            strokeWidth="4.5"
            strokeDasharray="22 1.5 45 2 30 1.5 50 2"
          />

          {/* Rounded Rect Inner Border */}
          <rect
            x="8.5"
            y="8.5"
            width="163"
            height="61"
            rx="11"
            stroke="#DC2626"
            strokeWidth="2"
            strokeDasharray="15 1 35 1.5 25 1 40 1.5"
          />

          {/* Stencil SOLD Inked Typography */}
          <text
            x="90"
            y="54"
            textAnchor="middle"
            fill="#DC2626"
            fontSize="42"
            fontWeight="900"
            fontFamily="Impact, 'Arial Black', -apple-system, sans-serif"
            letterSpacing="7"
            className="select-none"
          >
            SOLD
          </text>

          {/* Stencil Horizontal Cutout Lines (characteristic of stencil SOLD stamps) */}
          <g fill="#D7D1C9" opacity="0.95">
            {/* Cut slit through S */}
            <rect x="42" y="36" width="16" height="3" rx="0.5" />
            {/* Cut slits through O */}
            <rect x="68" y="24" width="22" height="3.5" rx="0.5" />
            <rect x="68" y="46" width="22" height="3.5" rx="0.5" />
            {/* Cut slit through L */}
            <rect x="99" y="44" width="14" height="3" rx="0.5" />
            {/* Cut slits through D */}
            <rect x="122" y="26" width="22" height="3.5" rx="0.5" />
            <rect x="122" y="47" width="22" height="3.5" rx="0.5" />
          </g>

          {/* Distressed Weathered Speckles Overlay */}
          <g fill="#DC2626" opacity="0.85">
            <circle cx="16" cy="18" r="1.5" />
            <circle cx="34" cy="12" r="1.3" />
            <circle cx="70" cy="10" r="1.8" />
            <circle cx="112" cy="11" r="1.4" />
            <circle cx="152" cy="18" r="1.6" />
            <circle cx="166" cy="36" r="1.5" />
            <circle cx="158" cy="58" r="1.8" />
            <circle cx="122" cy="68" r="1.6" />
            <circle cx="68" cy="67" r="1.5" />
            <circle cx="28" cy="62" r="1.7" />
            <circle cx="14" cy="44" r="1.5" />
            <circle cx="55" cy="58" r="1.2" />
            <circle cx="135" cy="35" r="1.4" />
          </g>

          {/* Worn/Distressed stamp border nicks */}
          <g fill="#D7D1C9" opacity="0.9">
            <circle cx="28" cy="4" r="1.8" />
            <circle cx="95" cy="3" r="2.2" />
            <circle cx="145" cy="5" r="1.6" />
            <circle cx="174" cy="25" r="2" />
            <circle cx="174" cy="52" r="1.7" />
            <circle cx="135" cy="74" r="2" />
            <circle cx="50" cy="74" r="1.8" />
            <circle cx="4" cy="38" r="2.2" />
          </g>
        </svg>
      </div>
    );
  }

  return null;
};
