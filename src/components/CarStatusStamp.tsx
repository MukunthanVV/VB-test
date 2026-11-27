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

  // Bespoke Luxury Atelier Hallmarks / Chassis Specification Plaques
  // Designed exclusively to match the VB Associates architectural luxury template:
  // - Clean vector hairlines with museum provenance framing
  // - Muted jewel-toned body (Deep Atelier Evergreen, Cognac Terracotta, Noble Bordeaux)
  // - Wide-tracked archival micro-typography in warm champagne ecru and gold

  if (normalized === 'live') {
    return (
      <div
        onClick={onClick}
        title={title || 'Status: Available for Acquisition'}
        className={`relative inline-block select-none transform rotate-0 transition-all duration-300 hover:scale-[1.03] ${onClick ? 'cursor-pointer' : ''} ${className}`}
      >
        <svg
          viewBox="0 0 250 74"
          className="w-48 sm:w-56 md:w-60 h-auto drop-shadow-md"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer Plaque Chassis Frame */}
          <rect x="2" y="2" width="246" height="70" rx="4" fill="#1B3B2B" stroke="#2B5B43" strokeWidth="2" />

          {/* Inset Hairline Double Frame */}
          <rect x="6" y="6" width="238" height="62" rx="2" stroke="#E3DACB" strokeWidth="0.9" strokeOpacity="0.8" />
          <rect x="9" y="9" width="232" height="56" rx="1.5" stroke="#C8A774" strokeWidth="0.6" strokeOpacity="0.45" />

          {/* Corner Provenance Diamonds */}
          <path d="M 14 14 L 16 12 L 18 14 L 16 16 Z" fill="#C8A774" />
          <path d="M 232 14 L 234 12 L 236 14 L 234 16 Z" fill="#C8A774" />
          <path d="M 14 60 L 16 58 L 18 60 L 16 62 Z" fill="#C8A774" />
          <path d="M 232 60 L 234 58 L 236 60 L 234 62 Z" fill="#C8A774" />

          {/* Top Archival Header */}
          <text
            x="125"
            y="21"
            textAnchor="middle"
            fill="#D5CBBB"
            fontSize="7"
            fontWeight="600"
            fontFamily="'JetBrains Mono', monospace"
            letterSpacing="2.6"
            className="select-none"
          >
            VB ARCHIVE • VERIFIED SPECIMEN
          </text>

          {/* Flanking Hairlines */}
          <line x1="24" y1="41" x2="66" y2="41" stroke="#C8A774" strokeWidth="0.8" strokeOpacity="0.6" />
          <circle cx="68" cy="41" r="1.5" fill="#C8A774" />
          <line x1="184" y1="41" x2="226" y2="41" stroke="#C8A774" strokeWidth="0.8" strokeOpacity="0.6" />
          <circle cx="182" cy="41" r="1.5" fill="#C8A774" />

          {/* LIVE Bold Center Editorial Title */}
          <text
            x="125"
            y="48"
            textAnchor="middle"
            fill="#FAF6EE"
            fontSize="24"
            fontWeight="900"
            fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
            letterSpacing="7"
            className="select-none"
          >
            LIVE
          </text>

          {/* Bottom Acquisition Subline */}
          <text
            x="125"
            y="61"
            textAnchor="middle"
            fill="#B8AE9E"
            fontSize="6.5"
            fontWeight="500"
            fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
            letterSpacing="2.2"
            className="select-none"
          >
            AVAILABLE FOR ACQUISITION
          </text>
        </svg>
      </div>
    );
  }

  if (normalized === 'booked') {
    return (
      <div
        onClick={onClick}
        title={title || 'Status: Privately Reserved'}
        className={`relative inline-block select-none transform rotate-0 transition-all duration-300 hover:scale-[1.03] ${onClick ? 'cursor-pointer' : ''} ${className}`}
      >
        <svg
          viewBox="0 0 250 74"
          className="w-48 sm:w-56 md:w-60 h-auto drop-shadow-md"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer Plaque Chassis Frame */}
          <rect x="2" y="2" width="246" height="70" rx="4" fill="#5E2C14" stroke="#874320" strokeWidth="2" />

          {/* Inset Hairline Double Frame */}
          <rect x="6" y="6" width="238" height="62" rx="2" stroke="#EADCCF" strokeWidth="0.9" strokeOpacity="0.8" />
          <rect x="9" y="9" width="232" height="56" rx="1.5" stroke="#DDA874" strokeWidth="0.6" strokeOpacity="0.45" />

          {/* Corner Provenance Diamonds */}
          <path d="M 14 14 L 16 12 L 18 14 L 16 16 Z" fill="#DDA874" />
          <path d="M 232 14 L 234 12 L 236 14 L 234 16 Z" fill="#DDA874" />
          <path d="M 14 60 L 16 58 L 18 60 L 16 62 Z" fill="#DDA874" />
          <path d="M 232 60 L 234 58 L 236 60 L 234 62 Z" fill="#DDA874" />

          {/* Top Archival Header */}
          <text
            x="125"
            y="21"
            textAnchor="middle"
            fill="#DFD0C3"
            fontSize="7"
            fontWeight="600"
            fontFamily="'JetBrains Mono', monospace"
            letterSpacing="2.6"
            className="select-none"
          >
            VB ARCHIVE • CLIENT ALLOCATION
          </text>

          {/* Flanking Hairlines */}
          <line x1="24" y1="41" x2="52" y2="41" stroke="#DDA874" strokeWidth="0.8" strokeOpacity="0.6" />
          <circle cx="54" cy="41" r="1.5" fill="#DDA874" />
          <line x1="198" y1="41" x2="226" y2="41" stroke="#DDA874" strokeWidth="0.8" strokeOpacity="0.6" />
          <circle cx="196" cy="41" r="1.5" fill="#DDA874" />

          {/* BOOKED Bold Center Editorial Title */}
          <text
            x="125"
            y="48"
            textAnchor="middle"
            fill="#FAF5EE"
            fontSize="23"
            fontWeight="900"
            fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
            letterSpacing="6.5"
            className="select-none"
          >
            BOOKED
          </text>

          {/* Bottom Acquisition Subline */}
          <text
            x="125"
            y="61"
            textAnchor="middle"
            fill="#C9B4A2"
            fontSize="6.5"
            fontWeight="500"
            fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
            letterSpacing="2.2"
            className="select-none"
          >
            RESERVATION CONFIRMED • PENDING DELIVERY
          </text>
        </svg>
      </div>
    );
  }

  if (normalized === 'sold') {
    return (
      <div
        onClick={onClick}
        title={title || 'Status: Officially Delivered'}
        className={`relative inline-block select-none transform rotate-0 transition-all duration-300 hover:scale-[1.03] ${onClick ? 'cursor-pointer' : ''} ${className}`}
      >
        <svg
          viewBox="0 0 250 74"
          className="w-48 sm:w-56 md:w-60 h-auto drop-shadow-md"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer Plaque Chassis Frame */}
          <rect x="2" y="2" width="246" height="70" rx="4" fill="#4E121B" stroke="#751F2D" strokeWidth="2" />

          {/* Inset Hairline Double Frame */}
          <rect x="6" y="6" width="238" height="62" rx="2" stroke="#EADBDD" strokeWidth="0.9" strokeOpacity="0.8" />
          <rect x="9" y="9" width="232" height="56" rx="1.5" stroke="#D397A1" strokeWidth="0.6" strokeOpacity="0.45" />

          {/* Corner Provenance Diamonds */}
          <path d="M 14 14 L 16 12 L 18 14 L 16 16 Z" fill="#D397A1" />
          <path d="M 232 14 L 234 12 L 236 14 L 234 16 Z" fill="#D397A1" />
          <path d="M 14 60 L 16 58 L 18 60 L 16 62 Z" fill="#D397A1" />
          <path d="M 232 60 L 234 58 L 236 60 L 234 62 Z" fill="#D397A1" />

          {/* Top Archival Header */}
          <text
            x="125"
            y="21"
            textAnchor="middle"
            fill="#DDC6C9"
            fontSize="7"
            fontWeight="600"
            fontFamily="'JetBrains Mono', monospace"
            letterSpacing="2.6"
            className="select-none"
          >
            VB ARCHIVE • HISTORIC RECORD
          </text>

          {/* Flanking Hairlines */}
          <line x1="24" y1="41" x2="62" y2="41" stroke="#D397A1" strokeWidth="0.8" strokeOpacity="0.6" />
          <circle cx="64" cy="41" r="1.5" fill="#D397A1" />
          <line x1="188" y1="41" x2="226" y2="41" stroke="#D397A1" strokeWidth="0.8" strokeOpacity="0.6" />
          <circle cx="186" cy="41" r="1.5" fill="#D397A1" />

          {/* SOLD Bold Center Editorial Title */}
          <text
            x="125"
            y="48"
            textAnchor="middle"
            fill="#FAF3F4"
            fontSize="24"
            fontWeight="900"
            fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
            letterSpacing="7"
            className="select-none"
          >
            SOLD
          </text>

          {/* Bottom Acquisition Subline */}
          <text
            x="125"
            y="61"
            textAnchor="middle"
            fill="#C39EA5"
            fontSize="6.5"
            fontWeight="500"
            fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
            letterSpacing="2.2"
            className="select-none"
          >
            CURATED SPECIMEN • OFFICIALLY DELIVERED
          </text>
        </svg>
      </div>
    );
  }

  return null;
};

export default CarStatusStamp;
