import React, { useEffect, useState } from 'react';
import { useSettings, DifficultyLevel } from '../context/SettingsContext';
import { AudioEngine } from '../audio/AudioEngine';
import {
  X,
  Volume2,
  ShieldAlert,
  Eye,
  Sliders,
  RotateCcw,
  Home,
  Play,
  Monitor,
  Flame,
  AlertTriangle,
  Activity,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestart?: () => void;
  onMainMenu?: () => void;
  currentLevel?: number;
  levelTitle?: string;
  seed?: string;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onRestart,
  onMainMenu,
  currentLevel = 1,
  levelTitle,
  seed,
}) => {
  const { settings, updateSettings, resetSettings } = useSettings();
  const [activeTab, setActiveTab] = useState<'controls' | 'settings'>('controls');
  const [confirmRestart, setConfirmRestart] = useState(false);
  const [confirmMainMenu, setConfirmMainMenu] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (document.pointerLockElement) {
        document.exitPointerLock?.();
      }
      setConfirmRestart(false);
      setConfirmMainMenu(false);
    }
  }, [isOpen]);

  // Keyboard shortcut listener: ESC to resume
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    updateSettings({ masterVolume: vol });
    AudioEngine.setVolume(vol);
  };

  const handleJumpscareToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.checked;
    updateSettings({ enableJumpscares: val });
    AudioEngine.setJumpscareSetting(val);
  };

  const difficulties: { id: DifficultyLevel; label: string; desc: string }[] = [
    { id: 'explorer', label: 'Explorer', desc: 'No entity attacks.' },
    { id: 'easy', label: 'Easy', desc: '60s safe exploration.' },
    { id: 'normal', label: 'Normal', desc: '40s safe period.' },
    { id: 'nightmare', label: 'Nightmare', desc: 'Short grace, swift entity.' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 font-mono select-none pointer-events-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg border border-zinc-800/90 bg-zinc-950/95 rounded-xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.06)] text-zinc-100 p-6 md:p-7 overflow-hidden text-left">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Bar */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3.5 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
            </span>
            <div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">
                SYSTEM PAUSED // SECTOR TELEMETRY
              </div>
              <h2 className="text-sm font-bold text-zinc-100 tracking-wider uppercase">
                {levelTitle || `LEVEL ${currentLevel} // EXPEDITION`}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-white bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800/80 rounded-lg p-1.5 transition-colors cursor-pointer"
            title="Resume [ESC]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Diagnostic Pill Banner */}
        <div className="flex items-center justify-between bg-zinc-900/70 border border-zinc-800/80 rounded-lg px-3 py-2 text-[11px] text-zinc-400 mb-5">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>SEED:</span>
            <span className="text-amber-400 font-bold">{seed || 'LIMINAL-LOCAL'}</span>
          </span>
          <span className="text-zinc-500">PRESS [ESC] TO RESUME</span>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-zinc-800/80 mb-5">
          <button
            type="button"
            onClick={() => setActiveTab('controls')}
            className={`pb-2 px-3 text-xs font-bold tracking-wider uppercase transition-colors cursor-pointer border-b-2 flex items-center gap-2 ${
              activeTab === 'controls'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>Game Actions</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`pb-2 px-3 text-xs font-bold tracking-wider uppercase transition-colors cursor-pointer border-b-2 flex items-center gap-2 ${
              activeTab === 'settings'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Audio & Controls</span>
          </button>
        </div>

        {/* Tab 1: Game Actions (Resume, Restart, Main Menu) */}
        {activeTab === 'controls' && (
          <div className="space-y-3.5">
            {/* RESUME BUTTON */}
            <button
              type="button"
              onClick={onClose}
              className="w-full group relative overflow-hidden bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 active:scale-[0.99] text-zinc-950 font-extrabold py-3.5 px-4 rounded-lg text-xs uppercase tracking-widest shadow-[0_4px_16px_rgba(245,158,11,0.25)] transition-all cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <Play className="w-4 h-4 fill-current" />
                <span className="text-sm font-bold">Resume Expedition</span>
              </div>
              <span className="text-[10px] bg-black/20 text-zinc-900 px-2 py-0.5 rounded font-mono font-semibold">
                [ESC]
              </span>
            </button>

            {/* RESTART BUTTON */}
            {confirmRestart ? (
              <div className="border border-red-500/50 bg-red-950/20 p-3 rounded-lg flex items-center justify-between gap-3 animate-in fade-in duration-100">
                <div className="flex items-center gap-2 text-xs text-red-300">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>Restart this level from beginning?</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmRestart(false)}
                    className="px-2.5 py-1 text-[11px] text-zinc-400 hover:text-white bg-zinc-900 rounded border border-zinc-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmRestart(false);
                      onRestart?.();
                    }}
                    className="px-3 py-1 text-[11px] font-bold text-white bg-red-600 hover:bg-red-500 rounded cursor-pointer"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmRestart(true)}
                className="w-full bg-zinc-900/80 hover:bg-zinc-800/80 active:scale-[0.99] border border-zinc-800 hover:border-zinc-700 text-zinc-200 py-3 px-4 rounded-lg text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <RotateCcw className="w-4 h-4 text-amber-400" />
                  <span>Restart Sector (Reset Anchors)</span>
                </div>
                <span className="text-[10px] text-zinc-500 font-mono">LEVEL {currentLevel}</span>
              </button>
            )}

            {/* BACK TO MAIN MENU BUTTON */}
            {confirmMainMenu ? (
              <div className="border border-red-500/50 bg-red-950/20 p-3 rounded-lg flex items-center justify-between gap-3 animate-in fade-in duration-100">
                <div className="flex items-center gap-2 text-xs text-red-300">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>Abort expedition and return to menu?</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmMainMenu(false)}
                    className="px-2.5 py-1 text-[11px] text-zinc-400 hover:text-white bg-zinc-900 rounded border border-zinc-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmMainMenu(false);
                      onMainMenu?.();
                    }}
                    className="px-3 py-1 text-[11px] font-bold text-white bg-red-600 hover:bg-red-500 rounded cursor-pointer"
                  >
                    Exit Run
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmMainMenu(true)}
                className="w-full bg-zinc-900/80 hover:bg-red-950/30 active:scale-[0.99] border border-zinc-800 hover:border-red-900/50 text-zinc-300 hover:text-red-300 py-3 px-4 rounded-lg text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <Home className="w-4 h-4 text-zinc-400" />
                  <span>Back to Main Menu</span>
                </div>
                <span className="text-[10px] text-zinc-500 font-mono">ABORT</span>
              </button>
            )}

            {/* Current Objective Reminder */}
            <div className="border border-zinc-800/80 bg-zinc-900/40 p-3.5 rounded-lg mt-4 text-[11px] leading-relaxed text-zinc-400">
              <div className="text-zinc-200 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>Sector Objective:</span>
              </div>
              <span>Locate all 3 Reality Anchors in this sector. Insert them into the airlock sockets to breach the containment gate and descend.</span>
            </div>
          </div>
        )}

        {/* Tab 2: System Settings */}
        {activeTab === 'settings' && (
          <div className="space-y-4">
            {/* DIFFICULTY SELECTOR */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-semibold text-zinc-300">
                <span className="text-zinc-400 uppercase tracking-wider text-[11px]">Difficulty</span>
                <span className="text-amber-400 font-bold uppercase text-[11px]">{settings.difficulty}</span>
              </div>
              <div className="grid grid-cols-4 gap-1 p-1 bg-zinc-900/80 border border-zinc-800 rounded-lg">
                {difficulties.map((diff) => (
                  <button
                    key={diff.id}
                    type="button"
                    onClick={() => updateSettings({ difficulty: diff.id })}
                    className={`py-1.5 text-center text-xs font-bold uppercase rounded transition-all cursor-pointer ${
                      settings.difficulty === diff.id
                        ? 'bg-amber-500 text-zinc-950 font-extrabold shadow'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                    }`}
                  >
                    {diff.label}
                  </button>
                ))}
              </div>
            </div>

            {/* JUMPSCARE TOGGLE */}
            <div className="border border-zinc-800/80 bg-zinc-900/50 p-3 rounded-lg">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enableJumpscares}
                  onChange={handleJumpscareToggle}
                  className="mt-0.5 w-4 h-4 accent-amber-500 cursor-pointer"
                />
                <div>
                  <div className="flex items-center gap-2 font-bold text-xs uppercase text-zinc-200">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                    <span>Jumpscares: {settings.enableJumpscares ? 'ENABLED' : 'DISABLED (ATMOSPHERIC)'}</span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-zinc-400 leading-relaxed">
                    {settings.enableJumpscares
                      ? 'Visceral analog visual stinger on capture.'
                      : 'Calm atmospheric analog signal loss. Zero screamers.'}
                  </p>
                </div>
              </label>
            </div>

            {/* MASTER VOLUME */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-zinc-400 text-[11px] uppercase tracking-wider">
                  <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Master Volume</span>
                </span>
                <span className="text-amber-400 font-mono text-[11px]">
                  {Math.round(settings.masterVolume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.masterVolume}
                onChange={handleVolumeChange}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* MOUSE SENSITIVITY */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-zinc-400 text-[11px] uppercase tracking-wider">
                  <Eye className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Look Sensitivity</span>
                </span>
                <span className="text-cyan-400 font-mono text-[11px]">{settings.mouseSensitivity.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.4"
                max="2.5"
                step="0.1"
                value={settings.mouseSensitivity}
                onChange={(e) => updateSettings({ mouseSensitivity: parseFloat(e.target.value) })}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            {/* WALKING MOTION / HEAD BOB ACCESSIBILITY */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-zinc-400 text-[11px] uppercase tracking-wider">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Walking Motion (Anti-Motion Sickness)</span>
                </span>
                <span className="text-emerald-400 font-mono text-[11px]">
                  {settings.headBobIntensity === 0
                    ? 'OFF (STABLE)'
                    : settings.headBobIntensity <= 0.4
                    ? 'MINIMAL'
                    : 'SUBTLE'}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.2"
                value={settings.headBobIntensity}
                onChange={(e) => updateSettings({ headBobIntensity: parseFloat(e.target.value) })}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <p className="text-[10px] text-zinc-500">
                Purely translational subtle displacement (zero rotation/tilt). Set to 0 to completely freeze camera horizon.
              </p>
            </div>

            {/* RETRO CRT SHADER */}
            <label className="flex items-center justify-between cursor-pointer border border-zinc-800/80 p-2.5 bg-zinc-900/50 rounded-lg">
              <span className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
                <Monitor className="w-3.5 h-3.5 text-zinc-400" />
                <span>CRT Scanlines & Analog Grain</span>
              </span>
              <input
                type="checkbox"
                checked={settings.enableCRTShader}
                onChange={(e) => updateSettings({ enableCRTShader: e.target.checked })}
                className="w-4 h-4 accent-amber-500 cursor-pointer"
              />
            </label>

            {/* Reset Button */}
            <div className="pt-2 text-right">
              <button
                type="button"
                onClick={resetSettings}
                className="text-[11px] text-zinc-500 hover:text-zinc-300 underline cursor-pointer"
              >
                Reset Default Settings
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-5 border-t border-zinc-800/80 pt-3 flex justify-between items-center text-[10px] text-zinc-500">
          <span>THE THRESHOLD // LIMINAL DRIFT</span>
          <button
            type="button"
            onClick={onClose}
            className="text-amber-400 hover:text-amber-300 font-bold uppercase tracking-wider cursor-pointer"
          >
            [Close Menu]
          </button>
        </div>
      </div>
    </div>
  );
};
