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
  const isHiddenRef = useRef<boolean>(false);

  // Track document visibility to pause animation loops when tab is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      isHiddenRef.current = document.hidden;
      lastTimeRef.current = performance.now();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Update real-time clock (1 sec interval, freezes when paused or tab hidden)
  useEffect(() => {
    if (intensity === 'off') return;

    const interval = setInterval(() => {
      if (isPaused || isHiddenRef.current) return;
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
  }, [intensity, isPaused]);

  // Tape Timecode Frame Counter (Advances at 30 FPS NTSC standard when not paused)
  useEffect(() => {
    if (intensity === 'off') return;

    lastTimeRef.current = performance.now();

    const updateTimecode = (now: number) => {
      const delta = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      if (!isPaused && !isHiddenRef.current) {
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
    <div className="pointer-events-none fixed inset-0 z-20 select-none overflow-hidden">
      {/* 1. Camcorder 90% Safe Area Optical Viewfinder Corner Marks */}
      <div className="vhs-viewfinder-frame">
        <div className="vhs-corner-tl" />
        <div className="vhs-corner-tr" />
        <div className="vhs-corner-bl" />
        <div className="vhs-corner-br" />
      </div>

      {/* 2. Full-Screen Phosphor Color Grading & CRT Grading */}
      <div className="vhs-color-grade" />

      {/* 3. Magnetic Static & Tape Noise Grain */}
      <div className="vhs-tape-noise" />
      <div className={`vhs-analog-grain ${intensity === 'subtle' ? 'opacity-30' : 'opacity-65'}`} />

      {/* 4. NTSC Interlaced Scanlines */}
      <div className={`vhs-interlace-lines ${intensity === 'subtle' ? 'opacity-35' : 'opacity-65'}`} />

      {/* 5. Radial Lens Chromatic Aberration & Optical Vignette */}
      <div className="vhs-lens-aberration" />

      {/* 6. Subtle AGC Luminance Instability Breathing */}
      {intensity === 'full' && <div className="vhs-luma-drift" />}

      {/* 7. Physical Tape Flaws: Roll Bar, Flutter Line, Tracking Glitch & Helical Head-Switch Noise */}
      {intensity === 'full' && (
        <>
          <div className="vhs-roll-bar" />
          <div className="vhs-flutter-line" />
          <div className="vhs-tracking-glitch" />
          <div className="vhs-tracking-noise-bar" />
        </>
      )}

      {/* 8. VCR On-Screen Display (OSD) Viewfinder (Substantially Larger & Packed with Camcorder Telemetry) */}
      {/* Positioned in Top-Left & Bottom-Left to leave Top-Right (HUD Battery/Menu) and Bottom-Right (Minimap) clear */}
      <div className="absolute inset-0 p-4 md:p-6 flex flex-col justify-between">
        {/* Top-Left OSD Hero Stack */}
        <div className="flex justify-between items-start">
          <div className="space-y-1.5 bg-black/45 p-3 rounded-lg border border-white/10 backdrop-blur-[2px] max-w-fit animate-vhs-jitter shadow-2xl">
            {/* Row 1: Massive Camcorder REC & Playback Header */}
            <div className="flex items-center gap-3 md:gap-4 flex-wrap">
              <span className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-red-600 animate-vhs-rec shadow-[0_0_16px_rgba(239,68,68,1)] ring-2 ring-red-400" />
              <span className="vhs-osd-text vhs-chromatic-text text-red-500 font-black tracking-widest text-3xl md:text-5xl drop-shadow-[0_0_12px_rgba(239,68,68,0.8)]">
                REC
              </span>
              <span className="vhs-osd-text text-zinc-200 font-black text-xl md:text-3xl tracking-wider pl-2 border-l-2 border-zinc-600">
                SP
              </span>

              <div className="pl-1">
                {isPaused ? (
                  <span className="vhs-osd-text text-amber-300 font-black tracking-widest text-xl md:text-3xl animate-pulse">
                    PAUSE ❚❚
                  </span>
                ) : (
                  <span className="vhs-osd-text text-emerald-400 font-black tracking-widest text-xl md:text-3xl">
                    PLAY ▶
                  </span>
                )}
              </div>
            </div>

            {/* Row 2: Optical Sensor & Camcorder Telemetry */}
            <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm text-zinc-300 font-bold flex-wrap pt-0.5 border-t border-zinc-700/60">
              <span className="vhs-osd-text text-cyan-300">AF [AUTO]</span>
              <span className="text-zinc-600">•</span>
              <span className="vhs-osd-text">ZOOM: 1.0X</span>
              <span className="text-zinc-600">•</span>
              <span className="vhs-osd-text text-amber-300">GAIN: +6dB</span>
              <span className="text-zinc-600">•</span>
              <span className="vhs-osd-text">WB: ATW</span>
              <span className="text-zinc-600">•</span>
              <span className="vhs-osd-text text-zinc-400">1/60s</span>
            </div>

            {/* Row 3: Tape Remaining & Camcorder Battery Telemetry */}
            <div className="flex items-center gap-2.5 text-xs md:text-sm text-zinc-200 font-bold flex-wrap">
              <span className="vhs-osd-text text-amber-400">TAPE 📼 [|||||··]</span>
              <span className="vhs-osd-text text-zinc-400">REM: 01:15:32</span>
              <span className="text-zinc-600">•</span>
              <div className="flex items-center gap-1.5 text-zinc-300">
                <span className="vhs-osd-text">BATT:</span>
                <div className="flex gap-0.5 border border-zinc-500 p-0.5 rounded-sm bg-black/60">
                  <span className="w-2.5 h-3 bg-emerald-400" />
                  <span className="w-2.5 h-3 bg-emerald-400" />
                  <span className="w-2.5 h-3 bg-emerald-400" />
                  <span className="w-2.5 h-3 bg-zinc-700" />
                </div>
                <span className="vhs-osd-text text-zinc-400 text-[11px]">7.2V</span>
              </div>
            </div>

            {/* Row 4: Diegetic Level / Tape Title */}
            {levelTitle && (
              <div className="vhs-osd-text text-amber-400 text-xs md:text-sm font-bold uppercase tracking-wider opacity-90 pt-0.5">
                TAPE // {levelTitle}
              </div>
            )}
          </div>

          {/* Top-Right deliberately kept empty for Battery Meter & Settings Menu Button in HUD */}
          <div />
        </div>

        {/* Bottom-Left OSD Stack (Bigger & Richer with Live Audio VU Meters) */}
        <div className="flex justify-between items-end pb-2">
          {/* Offset on mobile above touch D-pad */}
          <div className="space-y-1.5 bg-black/45 p-3 rounded-lg border border-white/10 backdrop-blur-[2px] max-w-fit bottom-36 md:bottom-1 relative animate-vhs-jitter shadow-2xl">
            {/* Row 1: Massive Tape Timecode Counter */}
            <div className="vhs-osd-text vhs-chromatic-text text-2xl md:text-4xl tracking-widest font-black text-white">
              TC 00:{mm}:{ss}:{ff}
            </div>

            {/* Row 2: Retro Camcorder Date & Clock */}
            <div className="flex items-center gap-3 text-base md:text-2xl text-zinc-100 font-black">
              <span className="vhs-osd-text tracking-wider">OCT. 22 1998</span>
              <span className="text-zinc-500">•</span>
              <span className="vhs-osd-text text-zinc-200 tracking-wider">{currentTimeStr}</span>
            </div>

            {/* Row 3: Live Camcorder Microphone Audio VU Meters */}
            <div className="space-y-1 pt-1 border-t border-zinc-700/60">
              <div className="flex items-center gap-2 text-xs text-zinc-300 font-bold">
                <span className="vhs-osd-text w-12 text-zinc-400">CH-1 L:</span>
                <div className="w-24 sm:w-32 bg-zinc-900 border border-zinc-700 h-2 rounded-sm overflow-hidden p-[1px]">
                  <div className="h-full bg-gradient-to-r from-emerald-400 via-emerald-300 to-amber-400 animate-vu-1 rounded-sm" />
                </div>
                <span className="vhs-osd-text text-[10px] text-zinc-400">-12dB</span>
              </div>

              <div className="flex items-center gap-2 text-xs text-zinc-300 font-bold">
                <span className="vhs-osd-text w-12 text-zinc-400">CH-2 R:</span>
                <div className="w-24 sm:w-32 bg-zinc-900 border border-zinc-700 h-2 rounded-sm overflow-hidden p-[1px]">
                  <div className="h-full bg-gradient-to-r from-emerald-400 via-emerald-300 to-amber-400 animate-vu-2 rounded-sm" />
                </div>
                <span className="vhs-osd-text text-[10px] text-zinc-400">-14dB</span>
              </div>
            </div>

            {/* Row 4: Audio Standard & Tracking Telemetry */}
            <div className="flex items-center gap-2.5 text-xs text-zinc-300 flex-wrap pt-0.5">
              <span className="vhs-osd-text tracking-widest px-1.5 py-0.5 border border-zinc-500/80 rounded bg-black/60 shadow-md">
                Hi-Fi STEREO
              </span>
              <span className="vhs-osd-text text-zinc-400">
                CH 03
              </span>
              <span className="text-zinc-600">•</span>
              <span className="vhs-osd-text text-zinc-400 tracking-wider">
                AUTO TRACKING [|||||··]
              </span>
              <span className="text-zinc-600">•</span>
              <span className="vhs-osd-text text-zinc-500 text-[10px]">NTSC 525/60</span>
            </div>
          </div>

          {/* Bottom-Right deliberately kept empty for Minimap Radar */}
          <div />
        </div>
      </div>
    </div>
  );
};
