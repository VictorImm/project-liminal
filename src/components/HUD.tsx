import React, { useState } from 'react';
import { InteractionTarget } from '../game/LiminalWorld';
import { WorldItem } from '../procedural/LabyrinthGenerator';
import { Battery, BatteryCharging, BatteryWarning, Flashlight, Settings, Hand, X } from 'lucide-react';

interface HUDProps {
  batteryLevel: number;
  flashlightOn: boolean;
  anchorsCollected: number;
  totalAnchors: number;
  interactionTarget: InteractionTarget | null;
  activeInspectItem: WorldItem | null;
  hudToast: string | null;
  levelTitle?: string;
  vhsActive?: boolean;
  onCloseInspect: () => void;
  onOpenSettings: () => void;
  onToggleFlashlight: () => void;
  onInteract: () => void;
  onJoystickMove?: (x: number, y: number) => void;
  onTouchLook?: (dx: number, dy: number) => void;
}

export const HUD: React.FC<HUDProps> = ({
  batteryLevel,
  flashlightOn,
  anchorsCollected,
  totalAnchors,
  interactionTarget,
  activeInspectItem,
  hudToast,
  levelTitle,
  vhsActive = true,
  onCloseInspect,
  onOpenSettings,
  onToggleFlashlight,
  onInteract,
  onJoystickMove,
  onTouchLook,
}) => {
  const [touchActive, setTouchActive] = useState(false);
  const [lastTouch, setLastTouch] = useState<{ x: number; y: number } | null>(null);

  // Mobile Right Screen Touch Look
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (touch.clientX > window.innerWidth / 2) {
      setLastTouch({ x: touch.clientX, y: touch.clientY });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!lastTouch || !onTouchLook) return;
    const touch = e.touches[0];
    if (touch.clientX > window.innerWidth / 2) {
      const dx = touch.clientX - lastTouch.x;
      const dy = touch.clientY - lastTouch.y;
      onTouchLook(dx, dy);
      setLastTouch({ x: touch.clientX, y: touch.clientY });
    }
  };

  const handleTouchEnd = () => {
    setLastTouch(null);
  };

  return (
    <div
      className="pointer-events-none fixed inset-0 z-30 select-none font-mono"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* TOP BAR */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
        {/* VHS Timestamp & Status (Rendered if VHS overlay is off) */}
        {!vhsActive ? (
          <div className="bg-black/75 border border-zinc-800 p-2.5 rounded backdrop-blur-sm text-xs space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
              <span className="text-zinc-200 font-bold tracking-wider">REC ● CAM_01</span>
            </div>
            <div className="text-zinc-400 font-mono uppercase">{levelTitle || 'SECTOR_0 // LIMINAL THRESHOLD'}</div>
          </div>
        ) : (
          <div className="w-32 md:w-48" /> /* Spacer so top center anchors align beautifully */
        )}

        {/* Reality Anchors or Sanctuary Safe Zone Indicator */}
        {totalAnchors > 0 ? (
          <div className="bg-black/80 border border-zinc-700/80 px-3 py-1.5 rounded backdrop-blur-sm text-xs shadow-lg">
            <div className="vhs-osd-text text-amber-400 font-bold uppercase tracking-widest text-[11px] md:text-xs mb-1 text-center">
              [ANCHORS: {anchorsCollected} / {totalAnchors}]
            </div>
            <div className="flex gap-1.5 justify-center">
              {Array.from({ length: totalAnchors }).map((_, i) => (
                <span
                  key={i}
                  className={`inline-block w-3.5 h-3.5 border ${
                    i < anchorsCollected
                      ? 'bg-amber-400 border-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.9)]'
                      : 'border-zinc-700 bg-zinc-900/60'
                  }`}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-black/80 border border-emerald-600/70 px-3 py-1.5 rounded backdrop-blur-sm text-xs shadow-lg">
            <div className="vhs-osd-text text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5 text-[11px] md:text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              SANCTUARY // SAFE ZONE
            </div>
            <div className="text-emerald-300/80 text-[10px] mt-0.5 text-center">
              PEACEFUL MEADOW • NO THREAT
            </div>
          </div>
        )}

        {/* Flashlight Battery & Settings Button */}
        <div className="flex items-center gap-2 md:gap-3">
          <div className="bg-black/80 border border-zinc-700/80 px-2.5 py-1.5 rounded backdrop-blur-sm flex items-center gap-2 text-xs">
            <Flashlight className={`w-3.5 h-3.5 ${flashlightOn ? 'text-amber-400' : 'text-zinc-600'}`} />
            <span className="vhs-osd-text text-[11px] text-zinc-300 font-bold hidden sm:inline">
              PWR:
            </span>
            <div className="w-14 sm:w-20 bg-zinc-900 border border-zinc-700 h-2 rounded overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  batteryLevel < 20 ? 'bg-red-500 animate-pulse' : 'bg-amber-400'
                }`}
                style={{ width: `${batteryLevel}%` }}
              />
            </div>
            <span className="vhs-osd-text font-bold text-zinc-200 text-[11px] w-7 text-right">
              {Math.round(batteryLevel)}%
            </span>
          </div>

          <button
            onClick={onOpenSettings}
            className="pointer-events-auto bg-black/80 hover:bg-zinc-800 border border-zinc-700 px-2.5 py-1.5 rounded text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5"
            title="Settings / Pause [ESC]"
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="vhs-osd-text text-[11px] hidden sm:inline font-bold">MENU</span>
          </button>
        </div>
      </div>

      {/* CENTER CROSSHAIR & INTERACTION PROMPT */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        {/* Camcorder Autofocus Target Brackets */}
        <div className="relative flex items-center justify-center">
          <div
            className={`relative flex items-center justify-center transition-all duration-150 ${
              interactionTarget ? 'scale-125' : 'scale-100 opacity-75'
            }`}
          >
            <span
              className={`block w-1.5 h-1.5 rounded-full transition-all duration-150 ${
                interactionTarget
                  ? 'bg-cyan-400 shadow-[0_0_10px_rgba(0,255,255,1)] scale-125'
                  : 'bg-zinc-300/80 shadow-[0_0_2px_#000]'
              }`}
            />
            {/* Viewfinder Target Notches */}
            <span className="absolute -left-3 -top-3 w-2 h-2 border-t border-l border-zinc-400/70" />
            <span className="absolute -right-3 -top-3 w-2 h-2 border-t border-r border-zinc-400/70" />
            <span className="absolute -left-3 -bottom-3 w-2 h-2 border-b border-l border-zinc-400/70" />
            <span className="absolute -right-3 -bottom-3 w-2 h-2 border-b border-r border-zinc-400/70" />
          </div>

          {/* Interactive Prompt Banner */}
          {interactionTarget && (
            <div className="absolute top-8 whitespace-nowrap px-3.5 py-1.5 bg-black/90 border border-cyan-400/80 text-cyan-300 text-xs tracking-wider uppercase font-bold shadow-2xl backdrop-blur-sm vhs-osd-text animate-fade-in">
              {interactionTarget.prompt}
            </div>
          )}
        </div>
      </div>

      {/* HUD TOAST NOTIFICATION (Non-blocking: Camera rotation remains active) */}
      {hudToast && (
        <div className="pointer-events-none absolute top-20 left-1/2 -translate-x-1/2 px-4 py-2 bg-red-950/90 border border-red-500 text-red-200 text-xs font-bold tracking-widest uppercase shadow-2xl backdrop-blur-md animate-pulse">
          {hudToast}
        </div>
      )}

      {/* SEAMLESS DIEGETIC TRANSCRIPT / LOGS (Non-blocking: 100% Seamless Exploration) */}
      {activeInspectItem && (
        <div className="pointer-events-none absolute bottom-16 left-1/2 -translate-x-1/2 w-full max-w-xl px-4 animate-fade-in">
          <div className="bg-black/95 border border-amber-500/80 p-4 rounded-xl shadow-2xl backdrop-blur-md text-left">
            <div className="flex items-center justify-between border-b border-amber-900/60 pb-1.5 mb-2 text-xs font-bold text-amber-400 uppercase tracking-widest">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span>
                  {activeInspectItem.type === 'phone' ? 'INCOMING TRANSMISSION' : 'DOCUMENT RECOVERED'} // {activeInspectItem.name}
                </span>
              </div>
              <span className="text-[10px] text-zinc-400 font-mono">
                {activeInspectItem.type === 'phone' ? '[AUDIO TRANSCRIPT]' : '[FIELD NOTE]'}
              </span>
            </div>
            <p className="text-xs text-zinc-200 leading-relaxed font-mono whitespace-pre-wrap">
              "{activeInspectItem.description}"
            </p>
          </div>
        </div>
      )}

      {/* MOBILE CONTROLS (Only visible on touch devices) */}
      <div className="pointer-events-auto md:hidden absolute bottom-6 left-6 right-6 flex justify-between items-end">
        {/* Virtual D-pad / Move buttons */}
        <div className="grid grid-cols-3 gap-2 w-32 h-32">
          <div />
          <button
            onPointerDown={() => onJoystickMove?.(0, -1)}
            onPointerUp={() => onJoystickMove?.(0, 0)}
            className="bg-black/60 active:bg-zinc-700 border border-zinc-700 rounded text-center text-xs text-zinc-300 font-bold py-2"
          >
            ▲
          </button>
          <div />
          <button
            onPointerDown={() => onJoystickMove?.(-1, 0)}
            onPointerUp={() => onJoystickMove?.(0, 0)}
            className="bg-black/60 active:bg-zinc-700 border border-zinc-700 rounded text-center text-xs text-zinc-300 font-bold py-2"
          >
            ◀
          </button>
          <div />
          <button
            onPointerDown={() => onJoystickMove?.(1, 0)}
            onPointerUp={() => onJoystickMove?.(0, 0)}
            className="bg-black/60 active:bg-zinc-700 border border-zinc-700 rounded text-center text-xs text-zinc-300 font-bold py-2"
          >
            ▶
          </button>
          <div />
          <button
            onPointerDown={() => onJoystickMove?.(0, 1)}
            onPointerUp={() => onJoystickMove?.(0, 0)}
            className="bg-black/60 active:bg-zinc-700 border border-zinc-700 rounded text-center text-xs text-zinc-300 font-bold py-2"
          >
            ▼
          </button>
          <div />
        </div>

        {/* Action Buttons: Flashlight & Interact */}
        <div className="flex gap-3">
          <button
            onClick={onToggleFlashlight}
            className="w-14 h-14 rounded-full bg-black/70 active:bg-amber-600 border border-amber-600/80 flex items-center justify-center text-amber-400 shadow-lg"
          >
            <Flashlight className="w-6 h-6" />
          </button>
          <button
            onClick={onInteract}
            className="w-14 h-14 rounded-full bg-black/70 active:bg-cyan-600 border border-cyan-500/80 flex items-center justify-center text-cyan-300 shadow-lg"
          >
            <Hand className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};
