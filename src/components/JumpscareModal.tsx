import React, { useEffect, useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import { SvgEntityGenerator } from '../procedural/SvgEntityGenerator';
import { AudioEngine } from '../audio/AudioEngine';

interface JumpscareModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export const JumpscareModal: React.FC<JumpscareModalProps> = ({ isOpen, onComplete }) => {
  const { settings } = useSettings();
  const [strobeState, setStrobeState] = useState(0);

  useEffect(() => {
    if (!isOpen) return;

    // Release any pointer lock immediately so cursor is freed
    if (document.pointerLockElement) {
      document.exitPointerLock?.();
    }

    // Trigger procedural audio stinger or atmospheric fade
    AudioEngine.triggerDeathSound();

    // Sudden harsh analog strobe (black, negative, high contrast)
    const strobe = setInterval(() => {
      setStrobeState((s) => (s + 1) % 4);
    }, 60);

    const timer = setTimeout(() => {
      clearInterval(strobe);
      onComplete();
    }, settings.enableJumpscares ? 2400 : 3200);

    return () => {
      clearInterval(strobe);
      clearTimeout(timer);
    };
  }, [isOpen, settings.enableJumpscares, onComplete]);

  if (!isOpen) return null;

  if (settings.enableJumpscares) {
    // VISCERAL ANALOG HORROR JUMPSCARE (Less AI Slop, raw found-footage horror)
    return (
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center bg-black overflow-hidden select-none pointer-events-auto ${
          strobeState === 1 ? 'invert' : ''
        }`}
      >
        {/* Grain & VHS Noise Layer */}
        <div className="absolute inset-0 bg-black/40 pointer-events-none" />

        {/* Uncanny Analog Visage lunging forward */}
        <div className="relative w-[105vmin] h-[105vmin] scale-110 md:scale-125 transition-transform duration-75">
          <SvgEntityGenerator intensity={1.8} />
        </div>

        {/* Distorted VHS OSD (On-Screen Display) */}
        <div className="absolute top-8 left-8 font-mono text-zinc-100 text-sm tracking-widest uppercase opacity-80">
          PLAY ▶ 00:00:00 [CORRUPT]
        </div>

        <div className="absolute bottom-8 font-mono text-center text-zinc-100 font-extrabold tracking-widest text-lg md:text-xl uppercase drop-shadow-[0_2px_10px_rgba(0,0,0,1)]">
          // SIGNAL OVERWRITE //
        </div>
      </div>
    );
  }

  // ATMOSPHERIC NO-JUMPSCARE FADE-OUT
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black text-zinc-400 font-mono select-none pointer-events-auto transition-opacity duration-1000 p-6">
      <div className="text-center space-y-4 max-w-md">
        <div className="text-xs uppercase tracking-widest text-zinc-600">
          ● LOGGING TERMINATED
        </div>
        <div className="text-xl font-bold text-zinc-200 tracking-wider">
          THRESHOLD COLLAPSE
        </div>
        <p className="text-sm text-zinc-500 leading-relaxed">
          The quiet architecture has shifted. You have faded into the floorboards without a sound.
        </p>
      </div>
    </div>
  );
};
