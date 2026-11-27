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

  // Refined palette matching VB Associates template:
  // LIVE: Deep heritage forest / spruce (#224835)
  // BOOKED: Warm luxury cognac / terracotta bronze (#8C4E23)
  // SOLD: Rich heritage wine / burgundy crimson (#78202A)

  if (normalized === 'live') {
    return (
      <div
        onClick={onClick}
        title={title}
        className={`relative inline-block select-none transform rotate-0 transition-transform duration-200 hover:scale-105 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      >
        <svg
          viewBox="0 0 170 70"
          className="w-32 sm:w-40 md:w-44 h-auto drop-shadow-sm"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer Thin Deep Forest Border */}
          <rect x="2" y="2" width="166" height="66" rx="4" stroke="#1E3F2E" strokeWidth="2.5" />

          {/* Solid Muted Forest Green Inked Body */}
          <rect x="5.5" y="5.5" width="159" height="59" rx="3" fill="#25503B" />

          {/* Inner Warm Linen Border Frame */}
          <rect
            x="8.5"
            y="8.5"
            width="153"
            height="53"
            rx="2"
            stroke="#F5F2ED"
            strokeWidth="1.8"
            strokeOpacity="0.85"
            strokeDasharray="14 1 28 2 40 1 20 2"
          />

          {/* LIVE Bold Inked Text in Warm Ivory Linen */}
          <text
            x="85"
            y="49"
            textAnchor="middle"
            fill="#F5F2ED"
            fontSize="38"
            fontWeight="900"
            fontFamily="Impact, 'Arial Black', -apple-system, sans-serif"
            letterSpacing="6"
            className="select-none"
          >
            LIVE
          </text>

          {/* Subtle Weathered Specks */}
          <g fill="#F5F2ED" opacity="0.35">
            <circle cx="22" cy="18" r="1.2" />
            <circle cx="55" cy="15" r="1.5" />
            <circle cx="110" cy="14" r="1.4" />
            <circle cx="145" cy="18" r="1.2" />
            <circle cx="22" cy="54" r="1.4" />
            <circle cx="120" cy="55" r="1.2" />
            <circle cx="152" cy="50" r="1.5" />
          </g>

          {/* Weathered Inset Nick Marks */}
          <g fill="#000000" opacity="0.18">
            <circle cx="35" cy="28" r="1.5" />
            <circle cx="125" cy="45" r="1.6" />
            <circle cx="70" cy="20" r="1.2" />
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
          className="w-36 sm:w-44 md:w-48 h-auto drop-shadow-sm"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer Thin Cognac Bronze Border */}
          <rect
            x="3"
            y="3"
            width="184"
            height="70"
            rx="3"
            stroke="#8C4E23"
            strokeWidth="2.5"
            strokeDasharray="25 1 40 2 30 1 50 2"
          />

          {/* Inner Thick Heavy Cognac Border */}
          <rect
            x="8"
            y="8"
            width="174"
            height="60"
            rx="2"
            stroke="#8C4E23"
            strokeWidth="5"
            strokeDasharray="18 1.5 50 1 35 2 45 1.5"
          />

          {/* BOOKED Bold Inked Typography in Warm Cognac Bronze */}
          <text
            x="95"
            y="52"
            textAnchor="middle"
            fill="#8C4E23"
            fontSize="34"
            fontWeight="900"
            fontFamily="Impact, 'Arial Black', -apple-system, sans-serif"
            letterSpacing="5"
            className="select-none"
          >
            BOOKED
          </text>

          {/* Weathered Chipped Ink Splatter */}
          <g fill="#8C4E23" opacity="0.8">
            <circle cx="14" cy="14" r="1.5" />
            <circle cx="48" cy="11" r="1.6" />
            <circle cx="120" cy="10" r="1.5" />
            <circle cx="160" cy="13" r="1.4" />
            <circle cx="178" cy="55" r="1.6" />
            <circle cx="130" cy="65" r="1.5" />
            <circle cx="30" cy="66" r="1.6" />
            <circle cx="12" cy="58" r="1.4" />
            <circle cx="58" cy="42" r="1.2" />
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
          className="w-36 sm:w-44 md:w-48 h-auto drop-shadow-sm"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Heavy Rounded Rect Outer Border in Heritage Burgundy */}
          <rect
            x="3"
            y="3"
            width="174"
            height="72"
            rx="16"
            stroke="#78202A"
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
            stroke="#78202A"
            strokeWidth="2"
            strokeDasharray="15 1 35 1.5 25 1 40 1.5"
          />

          {/* Stencil Mask so the card background shines through the cuts */}
          <defs>
            <mask id="sold-stencil-mask">
              <rect width="180" height="78" fill="#FFFFFF" />
              {/* Slits through S */}
              <rect x="42" y="36" width="16" height="3" rx="0.5" fill="#000000" />
              {/* Slits through O */}
              <rect x="68" y="24" width="22" height="3.5" rx="0.5" fill="#000000" />
              <rect x="68" y="46" width="22" height="3.5" rx="0.5" fill="#000000" />
              {/* Slit through L */}
              <rect x="99" y="44" width="14" height="3" rx="0.5" fill="#000000" />
              {/* Slits through D */}
              <rect x="122" y="26" width="22" height="3.5" rx="0.5" fill="#000000" />
              <rect x="122" y="47" width="22" height="3.5" rx="0.5" fill="#000000" />
            </mask>
          </defs>

          {/* Stencil SOLD Inked Typography in Deep Burgundy */}
          <text
            x="90"
            y="54"
            textAnchor="middle"
            fill="#78202A"
            fontSize="42"
            fontWeight="900"
            fontFamily="Impact, 'Arial Black', -apple-system, sans-serif"
            letterSpacing="7"
            mask="url(#sold-stencil-mask)"
            className="select-none"
          >
            SOLD
          </text>

          {/* Distressed Weathered Speckles in Burgundy */}
          <g fill="#78202A" opacity="0.8">
            <circle cx="16" cy="18" r="1.5" />
            <circle cx="34" cy="12" r="1.3" />
            <circle cx="70" cy="10" r="1.6" />
            <circle cx="112" cy="11" r="1.4" />
            <circle cx="152" cy="18" r="1.5" />
            <circle cx="166" cy="36" r="1.4" />
            <circle cx="158" cy="58" r="1.6" />
            <circle cx="122" cy="68" r="1.5" />
            <circle cx="68" cy="67" r="1.4" />
            <circle cx="28" cy="62" r="1.6" />
            <circle cx="14" cy="44" r="1.4" />
            <circle cx="55" cy="58" r="1.2" />
            <circle cx="135" cy="35" r="1.3" />
          </g>
        </svg>
      </div>
    );
  }

  return null;
};
