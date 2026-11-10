/**
 * MirrorAction - Brand Logo Component
 * Identidad visual que fusiona el concepto de 'Mirror' (simetría reflectiva, prismas de cristal)
 * con 'Action' (flecha cinética ascendente, vector de impulso bursátil en #00E5FF y #2979FF).
 * 
 * @license Apache-2.0
 */

import React from 'react';

interface LogoProps {
  size?: number;
  showText?: boolean;
  compact?: boolean;
  className?: string;
}

export const MirrorActionLogo: React.FC<LogoProps> = ({
  size = 36,
  showText = true,
  compact = false,
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Icono vectorial SVG de alta precisión */}
      <div
        className="relative flex items-center justify-center shrink-0"
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_0_12px_rgba(0,229,255,0.4)]"
        >
          <defs>
            {/* Gradiente Cyan Eléctrico a Azul Moderno */}
            <linearGradient id="mirrorGradPrimary" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00E5FF" />
              <stop offset="100%" stopColor="#2979FF" />
            </linearGradient>

            {/* Gradiente Espejado y Translúcido */}
            <linearGradient id="mirrorGradFacet" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2979FF" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#00E5FF" stopOpacity="0.25" />
            </linearGradient>

            {/* Reflejo metálico sutil */}
            <linearGradient id="mirrorGlow" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#00E5FF" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Faceta Izquierda (El 'Mirror' o Espejo Base) */}
          <path
            d="M 14 38 L 8 26 L 22 10 L 22 38 Z"
            fill="url(#mirrorGradFacet)"
            stroke="#00E5FF"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />

          {/* Faceta Derecha (El 'Action' Vector Ascendente Activo) */}
          <path
            d="M 26 10 L 40 22 L 34 38 L 26 38 Z"
            fill="url(#mirrorGradPrimary)"
            stroke="#00E5FF"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* Vector Central Cinético (Flecha de Impulso / Breakout Bursátil) */}
          <path
            d="M 24 6 L 38 18 L 31 19 L 36 30 L 30 32 L 25 21 L 20 25 Z"
            fill="#FFFFFF"
            className="filter drop-shadow-[0_0_6px_#00E5FF]"
          />

          {/* Línea Divisoria del Espejo / Eje de Reflexión */}
          <line
            x1="24"
            y1="6"
            x2="24"
            y2="42"
            stroke="url(#mirrorGlow)"
            strokeWidth="1.2"
            strokeDasharray="2 2"
          />

          {/* Sparkle / Chispa de Acción en el vértice superior */}
          <circle cx="24" cy="6" r="2" fill="#00E5FF" />
        </svg>
      </div>

      {/* Tipografía de la Marca */}
      {showText && (
        <div className="flex flex-col select-none">
          <div className="flex items-center tracking-tight leading-none">
            <span className="text-white font-extrabold text-base tracking-wide uppercase">
              Mirror
            </span>
            <span className="text-[#00E5FF] font-black text-base tracking-wide uppercase ml-1">
              Action
            </span>
          </div>
          {!compact && (
            <span className="text-[10px] text-[#9E9E9E] font-medium tracking-wider uppercase mt-0.5">
              Smart Market Tracker
            </span>
          )}
        </div>
      )}
    </div>
  );
};
