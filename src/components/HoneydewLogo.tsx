import React from 'react';

export const YesadoLogo: React.FC<{ className?: string }> = ({ className = 'w-8 h-8' }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      fill="none"
      className={className}
    >
      <defs>
        <linearGradient id="yesadoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <linearGradient id="sparkleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
      </defs>
      {/* Soft rounded squircle badge */}
      <rect x="2" y="2" width="28" height="28" rx="8" fill="url(#yesadoGrad)" />
      
      {/* Friendly house roof accent */}
      <path
        d="M9 13.5L16 8L23 13.5"
        stroke="#A7F3D0"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.9"
      />
      
      {/* Bold joyful celebratory checkmark */}
      <path
        d="M10 18.5L14 22.5L22.5 13.5"
        stroke="#FFFFFF"
        strokeWidth="2.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Playful celebratory star sparkle in upper right */}
      <path
        d="M24 5L24.8 7.2L27 8L24.8 8.8L24 11L23.2 8.8L21 8L23.2 7.2Z"
        fill="url(#sparkleGrad)"
      />
    </svg>
  );
};

export const HoneydewLogo = YesadoLogo;
