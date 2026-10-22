import React, { useEffect, useState } from 'react';

interface SvgEntityProps {
  intensity?: number;
  className?: string;
}

/**
 * Authentic Analog Horror Visage Generator
 * Uncanny, high-contrast, distressed photonegative entity designed to avoid cheap "AI slop".
 * Uses visceral frame-skips, inverted shadows, anatomical distortion, and organic noise.
 */
export const SvgEntityGenerator: React.FC<SvgEntityProps> = ({
  intensity = 1.0,
  className = '',
}) => {
  const [frame, setFrame] = useState(0);
  const [glitchPhase, setGlitchPhase] = useState(0);

  useEffect(() => {
    let animId: number;
    let tick = 0;
    const animate = () => {
      tick++;
      // Jerky, low-framerate analog horror shutter speed (15-20 fps feel)
      if (tick % 2 === 0) {
        setFrame((f) => (f + 1) % 100);
        if (Math.random() > 0.82) {
          setGlitchPhase(Math.floor(Math.random() * 4));
        }
      }
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Violent jerky spasms
  const spasmX = (Math.sin(frame * 1.8) * 12 + (Math.random() - 0.5) * 18) * intensity;
  const spasmY = (Math.cos(frame * 1.5) * 10 + (Math.random() - 0.5) * 14) * intensity;
  const jawDrop = 55 + Math.sin(frame * 0.4) * 35 * intensity;

  return (
    <div
      className={`relative w-full h-full flex items-center justify-center overflow-hidden select-none ${className}`}
      style={{
        transform: `translate(${spasmX}px, ${spasmY}px) scale(${1 + intensity * 0.2})`,
        filter: glitchPhase === 1 ? 'invert(1) contrast(200%)' : 'contrast(180%) brightness(85%)',
      }}
    >
      <svg
        viewBox="-250 -300 500 600"
        className="w-full h-full filter drop-shadow-[0_0_30px_rgba(0,0,0,1)]"
      >
        <defs>
          {/* Gritty high-contrast noise texture filter */}
          <filter id="analogGrain" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" result="noise" />
            <feColorMatrix type="saturate" values="0" />
            <feBlend in="SourceGraphic" in2="noise" mode="multiply" />
          </filter>

          {/* Somber monochrome charcoal gradient */}
          <radialGradient id="faceShade" cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#d4d4d4" stopOpacity="0.95" />
            <stop offset="45%" stopColor="#737373" stopOpacity="0.9" />
            <stop offset="75%" stopColor="#262626" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#080808" stopOpacity="1" />
          </radialGradient>
        </defs>

        {/* Shrouded, towering shadow torso */}
        <path
          d="M -160,260 C -120,140 -80,100 0,95 C 80,100 120,140 160,260 Z"
          fill="#050505"
        />

        {/* Contorted, uncanny cranium */}
        <path
          d="M -85,-110 C -120,-220 120,-220 85,-110 C 95,-20 85,45 0,65 C -85,45 -95,-20 -85,-110 Z"
          fill="url(#faceShade)"
          stroke="#000000"
          strokeWidth="4"
          filter="url(#analogGrain)"
        />

        {/* Sunken, hollow eye sockets (pure void) */}
        {/* Left eye socket */}
        <g transform="translate(-46, -95)">
          <path
            d="M -24,-14 C -10,-24 16,-20 22,-8 C 26,10 6,24 -14,20 C -26,16 -30,0 -24,-14 Z"
            fill="#030303"
          />
          {/* Glitching pinprick white pupil */}
          <circle
            cx={(Math.random() - 0.5) * 6}
            cy={(Math.random() - 0.5) * 4}
            r="2.5"
            fill="#ffffff"
            opacity={Math.random() > 0.15 ? 1 : 0}
          />
          {/* Dark tear running down cheek */}
          <path
            d="M -2,12 Q -6,45 -3,80"
            stroke="#0a0a0a"
            strokeWidth="4"
            fill="none"
            opacity="0.8"
          />
        </g>

        {/* Right eye socket (asymmetrically gouged & wider) */}
        <g transform="translate(48, -98)">
          <path
            d="M -20,-16 C -4,-28 20,-20 26,-6 C 30,12 12,28 -10,24 C -24,20 -28,2 -20,-16 Z"
            fill="#020202"
          />
          {/* Bleeding hollow socket with dead white glare */}
          <circle
            cx={2 + (Math.random() - 0.5) * 4}
            cy={(Math.random() - 0.5) * 3}
            r="3"
            fill="#ffffff"
            opacity={Math.random() > 0.3 ? 0.9 : 0.1}
          />
          <path
            d="M 2,14 Q 8,50 4,95"
            stroke="#080808"
            strokeWidth="5"
            fill="none"
            opacity="0.85"
          />
        </g>

        {/* Gaping, unhinged jaw dropping into the abyss */}
        <g transform={`translate(0, ${jawDrop * 0.35})`}>
          {/* Deep oral void */}
          <path
            d={`M -48,15 C -65,${30 + jawDrop} 65,${30 + jawDrop} 48,15 C 30,${-5 + jawDrop * 0.1} -30,${-5 + jawDrop * 0.1} -48,15 Z`}
            fill="#000000"
            stroke="#1a1a1a"
            strokeWidth="3"
          />

          {/* Jagged, broken human-like teeth */}
          {[-38, -26, -14, -2, 10, 22, 34].map((tx, idx) => (
            <rect
              key={`upper-tooth-${idx}`}
              x={tx}
              y={14}
              width={idx % 2 === 0 ? 7 : 5}
              height={14 + (idx % 3) * 5}
              fill="#e5e5e5"
              stroke="#262626"
              strokeWidth="1"
            />
          ))}

          {/* Lower teeth rising from bottom of jaw */}
          {[-32, -20, -8, 4, 16, 28].map((bx, idx) => (
            <rect
              key={`lower-tooth-${idx}`}
              x={bx}
              y={15 + jawDrop - 16}
              width={6}
              height={12 + (idx % 2) * 6}
              fill="#d4d4d4"
              stroke="#171717"
              strokeWidth="1"
            />
          ))}
        </g>

        {/* Analog VHS horizontal tracking scan lines */}
        {[ -200, -140, -80, -20, 40, 100, 160, 220 ].map((yPos, i) => (
          <line
            key={`tracking-${i}`}
            x1="-240"
            y1={yPos + ((frame * 6 + i * 20) % 60) - 30}
            x2="240"
            y2={yPos + ((frame * 6 + i * 20) % 60) - 30}
            stroke="#ffffff"
            strokeWidth={i % 2 === 0 ? '1.5' : '0.8'}
            opacity={Math.random() > 0.4 ? '0.12' : '0.02'}
          />
        ))}
      </svg>
    </div>
  );
};
