import React, { useEffect, useState, useRef } from 'react';

export type VHSIntensity = 'full' | 'subtle' | 'off';

interface VHSOsdOverlayProps {
  isPaused?: boolean;
  intensity?: VHSIntensity;
  levelTitle?: string;
}

export const VHSOsdOverlay: React.FC<VHSOsdOverlayProps> = ({
  isPaused = false,
  intensity = 'full',
  levelTitle,
}) => {
  const [frameTime, setFrameTime] = useState({ minutes: 14, seconds: 28, frames: 12 });
  const [currentTimeStr, setCurrentTimeStr] = useState('03:45:12 PM');
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const frameAccumRef = useRef<number>(0);

  // Update real-time clock and tape timecode (30 FPS NTSC standard)
  useEffect(() => {
    if (intensity === 'off') return;

    const interval = setInterval(() => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      const hoursStr = String(hours).padStart(2, '0');
      setCurrentTimeStr(`${hoursStr}:${minutes}:${seconds} ${ampm}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [intensity]);

  // Tape Timecode Frame Counter (Advances when not paused)
  useEffect(() => {
    if (intensity === 'off') return;

    const updateTimecode = (now: number) => {
      const delta = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      if (!isPaused) {
        frameAccumRef.current += delta;
        // 30 FPS tape frame advance
        if (frameAccumRef.current >= 1 / 30) {
          const addedFrames = Math.floor(frameAccumRef.current / (1 / 30));
          frameAccumRef.current %= (1 / 30);

          setFrameTime((prev) => {
            let nextFrames = prev.frames + addedFrames;
            let nextSeconds = prev.seconds;
            let nextMinutes = prev.minutes;

            if (nextFrames >= 30) {
              nextSeconds += Math.floor(nextFrames / 30);
              nextFrames = nextFrames % 30;
            }
            if (nextSeconds >= 60) {
              nextMinutes += Math.floor(nextSeconds / 60);
              nextSeconds = nextSeconds % 60;
            }
            return { minutes: nextMinutes, seconds: nextSeconds, frames: nextFrames };
          });
        }
      }

      animFrameRef.current = requestAnimationFrame(updateTimecode);
    };

    animFrameRef.current = requestAnimationFrame(updateTimecode);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPaused, intensity]);

  if (intensity === 'off') return null;

  const mm = String(frameTime.minutes).padStart(2, '0');
  const ss = String(frameTime.seconds).padStart(2, '0');
  const ff = String(frameTime.frames).padStart(2, '0');

  return (
    <div className="pointer-events-none fixed inset-0 z-10 select-none overflow-hidden">
      {/* 1. Full-Screen Phosphor Color Bleed & CRT Grading */}
      <div className="vhs-color-grade" />

      {/* 2. Full-Screen Magnetic Static & Tape Noise Grain */}
      <div className="vhs-tape-noise" />

      {/* 3. Full-Screen NTSC Interlaced Scanlines */}
      <div className="vhs-interlace-lines" />

      {/* 4. Full-Screen Tape Tracking Roll Bar & Helical Head Switching Noise (Full intensity) */}
      {intensity === 'full' && (
        <>
          <div className="vhs-roll-bar" />
          <div className="vhs-tracking-noise-bar" />
          <div className="vhs-flutter-line" />
        </>
      )}

      {/* 5. VCR On-Screen Display (OSD) HUD (Positioned strictly in Top-Left & Bottom-Left) */}
      {/* Leaves Top-Right (Battery HUD), Top-Center (Anchors), and Bottom-Right (Minimap) 100% unobstructed */}
      <div className="absolute inset-0 p-4 md:p-6 flex flex-col justify-between text-white font-mono text-xs md:text-sm z-20">
        {/* Top-Left OSD Stack */}
        <div className="flex justify-between items-start">
          <div className="space-y-1 bg-black/35 p-2 rounded border border-white/5 backdrop-blur-[1px] max-w-fit">
            {/* Playback Status & Camcorder Rec */}
            <div className="flex items-center gap-3">
              {isPaused ? (
                <span className="vhs-osd-text text-amber-300 font-extrabold tracking-widest text-sm md:text-base animate-pulse">
                  PAUSE ❚❚
                </span>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="vhs-osd-text text-emerald-400 font-extrabold tracking-widest text-sm md:text-base">
                    PLAY ▶
                  </span>
                  <span className="vhs-osd-text text-zinc-300 text-[10px] md:text-xs">
                    SP
                  </span>
                </div>
              )}

              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-vhs-rec shadow-[0_0_8px_rgba(239,68,68,0.9)]" />
                <span className="vhs-osd-text vhs-chromatic-text text-red-100 text-[11px] md:text-xs tracking-wider">
                  REC [AUTO]
                </span>
              </div>
            </div>

            {/* Retro Date & Real-time Clock (Moved from top-right to top-left to avoid battery overlap) */}
            <div className="flex items-center gap-2 text-[10px] md:text-[11px] text-zinc-200">
              <span className="vhs-osd-text tracking-wider">OCT. 22 1998</span>
              <span className="text-zinc-500">•</span>
              <span className="vhs-osd-text text-zinc-300 tracking-wider">{currentTimeStr}</span>
            </div>

            {levelTitle && (
              <div className="vhs-osd-text text-amber-400 text-[10px] uppercase tracking-wider opacity-90 pt-0.5">
                {levelTitle}
              </div>
            )}
          </div>

          {/* Top-Right deliberately kept empty for Battery Meter & Settings Gear Button in HUD */}
          <div />
        </div>

        {/* Bottom-Left OSD Stack */}
        <div className="flex justify-between items-end pb-2">
          <div className="space-y-1 bg-black/35 p-2 rounded border border-white/5 backdrop-blur-[1px] max-w-fit">
            <div className="flex items-center gap-2 text-[10px] md:text-xs text-zinc-300">
              <span className="vhs-osd-text tracking-widest px-1 py-0.5 border border-zinc-600/80 rounded bg-black/50">
                Hi-Fi STEREO
              </span>
              <span className="vhs-osd-text text-zinc-400 text-[10px]">
                CH 03
              </span>
            </div>

            <div className="vhs-osd-text vhs-chromatic-text text-sm md:text-base tracking-widest font-extrabold text-white">
              TC 00:{mm}:{ss}:{ff}
            </div>

            <div className="vhs-osd-text text-zinc-400 text-[10px] tracking-wider">
              AUTO TRACKING [|||||··]
            </div>
          </div>

          {/* Bottom-Right deliberately kept empty for Minimap Radar */}
          <div />
        </div>
      </div>
    </div>
  );
};
