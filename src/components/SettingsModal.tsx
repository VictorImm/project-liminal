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
  Video,
  Layers,
  Sparkles,
  Radio,
  Droplets,
  BookOpen,
  Cog,
  ShieldCheck,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestart?: () => void;
  onMainMenu?: () => void;
  onSwitchLevel?: (level: number) => void;
  currentLevel?: number;
  levelTitle?: string;
  seed?: string;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onRestart,
  onMainMenu,
  onSwitchLevel,
  currentLevel = 1,
  levelTitle,
  seed,
}) => {
  const { settings, updateSettings, resetSettings } = useSettings();
  const [activeTab, setActiveTab] = useState<'sectors' | 'controls' | 'settings'>('sectors');
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
    { id: 'explorer', label: 'Explorer', desc: 'Zero entity danger. Safe architecture exploration. Immortal (Cannot die).' },
    { id: 'easy', label: 'Easy', desc: '60s safe period. Slower stalker with audio cues.' },
    { id: 'normal', label: 'Normal', desc: '40s safe period. Stalker actively searches halls.' },
    { id: 'nightmare', label: 'Nightmare', desc: 'Short grace, swift aggressive entity.' },
  ];

  const sectorOptions = [
    {
      lv: 0,
      title: 'DREAM SANCTUARY',
      subtitle: 'Peaceful Meadow',
      threat: 'SAFE ZONE',
      threatColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      icon: Sparkles,
      desc: 'Pastel sky, undulating meadow, rolling hills. Zero danger.',
    },
    {
      lv: 1,
      title: 'THE YELLOW HALLS',
      subtitle: 'Mono-Yellow Backrooms',
      threat: 'LOW THREAT',
      threatColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      icon: Radio,
      desc: 'Endless damp carpet, mono-yellow wallpaper, 60Hz buzzing hum.',
    },
    {
      lv: 2,
      title: 'SUBLIMITY POOLS',
      subtitle: 'Flooded Aqueducts',
      threat: 'MODERATE',
      threatColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
      icon: Droplets,
      desc: 'White ceramic tiles, calm reflective water basins, echoing mist.',
    },
    {
      lv: 3,
      title: 'ENDLESS ARCHIVES',
      subtitle: 'Grand Hotel & Stacks',
      threat: 'HIGH THREAT',
      threatColor: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
      icon: BookOpen,
      desc: 'Victorian mahogany wainscoting, crimson carpets, labyrinthine stacks.',
    },
    {
      lv: 4,
      title: 'MACHINE SUB-CORE',
      subtitle: 'Boiler & Steam Core',
      threat: 'CRITICAL',
      threatColor: 'text-red-400 bg-red-500/10 border-red-500/30',
      icon: Cog,
      desc: 'Hazard blast walls, steaming high-pressure pipes, dark fireboxes.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 md:p-6 font-mono select-none pointer-events-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col border border-zinc-800/90 bg-zinc-950/95 rounded-2xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,255,255,0.08)] text-zinc-100 p-5 md:p-7 overflow-hidden text-left">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Bar */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3 mb-4 shrink-0">
          <div className="flex items-center gap-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
            </span>
            <div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">
                EXPEDITION TELEMETRY // SYSTEM PAUSED
              </div>
              <h2 className="text-base md:text-lg font-bold text-zinc-100 tracking-wider uppercase">
                {levelTitle || `LEVEL ${currentLevel} // EXPEDITION`}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-white bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 rounded-lg p-2 transition-colors cursor-pointer"
            title="Resume [ESC]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Diagnostic Pill Banner */}
        <div className="flex items-center justify-between bg-zinc-900/70 border border-zinc-800/80 rounded-lg px-3.5 py-2 text-xs text-zinc-400 mb-4 shrink-0">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>SEED:</span>
            <span className="text-amber-400 font-bold tracking-wider">{seed || 'LIMINAL-LOCAL'}</span>
          </span>
          <span className="text-zinc-500 text-[11px] hidden sm:inline">PRESS [ESC] OR CLICK RESUME</span>
        </div>

        {/* Tab Navigation (UI/UX Pro Max Clean Sizing) */}
        <div className="flex border-b border-zinc-800/80 mb-4 shrink-0 gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('sectors')}
            className={`pb-2.5 px-3 md:px-4 text-xs font-bold tracking-wider uppercase transition-colors cursor-pointer border-b-2 flex items-center gap-2 ${
              activeTab === 'sectors'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Sector Switcher</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('controls')}
            className={`pb-2.5 px-3 md:px-4 text-xs font-bold tracking-wider uppercase transition-colors cursor-pointer border-b-2 flex items-center gap-2 ${
              activeTab === 'controls'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>Expedition Actions</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`pb-2.5 px-3 md:px-4 text-xs font-bold tracking-wider uppercase transition-colors cursor-pointer border-b-2 flex items-center gap-2 ${
              activeTab === 'settings'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Audio & Controls</span>
          </button>
        </div>

        {/* Tab Body (Scrollable for mobile comfort) */}
        <div className="overflow-y-auto flex-1 pr-1 space-y-4">
          {/* TAB 1: SECTOR SWITCHER (Instant Fast-Travel) */}
          {activeTab === 'sectors' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs text-zinc-400">
                <span>SELECT ANY SECTOR TO SHIFT IMMEDIATELY:</span>
                <span className="text-amber-400 font-bold">CURRENT: LEVEL {currentLevel}</span>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {sectorOptions.map((s) => {
                  const Icon = s.icon;
                  const isCurrent = currentLevel === s.lv;
                  return (
                    <button
                      key={s.lv}
                      type="button"
                      onClick={() => onSwitchLevel?.(s.lv)}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative flex items-start justify-between gap-3 ${
                        isCurrent
                          ? 'border-amber-500/80 bg-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/40'
                          : 'border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800/60 hover:border-zinc-700 text-zinc-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2.5 rounded-lg border shrink-0 ${isCurrent ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' : 'bg-zinc-800/80 border-zinc-700/80 text-zinc-400'}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black tracking-wider text-white uppercase">
                              LV {s.lv} // {s.title}
                            </span>
                            {isCurrent && (
                              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-500 text-zinc-950">
                                ACTIVE
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-zinc-400 font-semibold mt-0.5">{s.subtitle}</div>
                          <p className="text-[11px] text-zinc-400/90 mt-1 leading-relaxed">{s.desc}</p>
                        </div>
                      </div>

                      <span className={`text-[10px] font-bold tracking-wider px-2 py-1 rounded border uppercase shrink-0 ${s.threatColor}`}>
                        {s.threat}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: EXPEDITION ACTIONS */}
          {activeTab === 'controls' && (
            <div className="space-y-3.5">
              {/* RESUME BUTTON */}
              <button
                type="button"
                onClick={onClose}
                className="w-full group relative overflow-hidden bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 active:scale-[0.99] text-zinc-950 font-black py-4 px-5 rounded-xl text-xs uppercase tracking-widest shadow-[0_6px_20px_rgba(245,158,11,0.25)] transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Play className="w-5 h-5 fill-current" />
                  <span className="text-sm font-bold">Resume Expedition</span>
                </div>
                <span className="text-[10px] bg-black/20 text-zinc-900 px-2 py-0.5 rounded font-mono font-semibold">
                  [ESC]
                </span>
              </button>

              {/* RESTART BUTTON */}
              {confirmRestart ? (
                <div className="border border-red-500/50 bg-red-950/20 p-3.5 rounded-xl flex items-center justify-between gap-3 animate-in fade-in duration-100">
                  <div className="flex items-center gap-2 text-xs text-red-300">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>Restart this level from beginning?</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setConfirmRestart(false)}
                      className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white bg-zinc-900 rounded-lg border border-zinc-800 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setConfirmRestart(false);
                        onRestart?.();
                      }}
                      className="px-3.5 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-lg cursor-pointer"
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmRestart(true)}
                  className="w-full bg-zinc-900/80 hover:bg-zinc-800/80 active:scale-[0.99] border border-zinc-800 hover:border-zinc-700 text-zinc-200 py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-between"
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
                <div className="border border-red-500/50 bg-red-950/20 p-3.5 rounded-xl flex items-center justify-between gap-3 animate-in fade-in duration-100">
                  <div className="flex items-center gap-2 text-xs text-red-300">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>Abort expedition and return to menu?</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setConfirmMainMenu(false)}
                      className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white bg-zinc-900 rounded-lg border border-zinc-800 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setConfirmMainMenu(false);
                        onMainMenu?.();
                      }}
                      className="px-3.5 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-lg cursor-pointer"
                    >
                      Exit Run
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmMainMenu(true)}
                  className="w-full bg-zinc-900/80 hover:bg-red-950/30 active:scale-[0.99] border border-zinc-800 hover:border-red-900/50 text-zinc-300 hover:text-red-300 py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <Home className="w-4 h-4 text-zinc-400" />
                    <span>Back to Main Menu</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono">ABORT</span>
                </button>
              )}

              {/* Current Objective Reminder */}
              <div className="border border-zinc-800/80 bg-zinc-900/40 p-4 rounded-xl text-xs leading-relaxed text-zinc-400">
                <div className="text-zinc-200 font-bold uppercase tracking-wider mb-1 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-500" />
                  <span>Sector Directives:</span>
                </div>
                <span>
                  Locate all 3 Reality Anchors scattered throughout this sector. Deposit them at the exit airlock sockets to breach the containment seal and descend.
                </span>
              </div>

              {/* Keyboard Controls Guide */}
              <div className="border border-zinc-800/80 bg-zinc-900/40 p-4 rounded-xl text-xs space-y-2.5">
                <div className="text-zinc-300 font-bold uppercase tracking-wider text-[11px]">
                  Expedition Controls Reference:
                </div>
                <div className="grid grid-cols-2 gap-2 text-zinc-400 text-[11px]">
                  <div><kbd className="px-1.5 py-0.5 bg-black/80 border border-zinc-700 rounded text-zinc-300 font-bold mr-1.5">WASD</kbd> Move</div>
                  <div><kbd className="px-1.5 py-0.5 bg-black/80 border border-zinc-700 rounded text-zinc-300 font-bold mr-1.5">SHIFT</kbd> Sprint</div>
                  <div><kbd className="px-1.5 py-0.5 bg-black/80 border border-zinc-700 rounded text-zinc-300 font-bold mr-1.5">C / CTRL</kbd> Crouch</div>
                  <div><kbd className="px-1.5 py-0.5 bg-black/80 border border-zinc-700 rounded text-zinc-300 font-bold mr-1.5">F</kbd> Flashlight</div>
                  <div><kbd className="px-1.5 py-0.5 bg-black/80 border border-zinc-700 rounded text-zinc-300 font-bold mr-1.5">E / LMB</kbd> Interact</div>
                  <div><kbd className="px-1.5 py-0.5 bg-black/80 border border-zinc-700 rounded text-zinc-300 font-bold mr-1.5">M</kbd> Minimap</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AUDIO & CONTROLS SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-4">
              {/* DIFFICULTY SELECTOR */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-semibold text-zinc-300">
                  <span className="text-zinc-400 uppercase tracking-wider text-[11px]">Difficulty / Threat Level</span>
                  <span className="text-amber-400 font-bold uppercase text-[11px]">{settings.difficulty}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1.5 bg-zinc-900/80 border border-zinc-800 rounded-xl">
                  {difficulties.map((diff) => (
                    <button
                      key={diff.id}
                      type="button"
                      onClick={() => updateSettings({ difficulty: diff.id })}
                      className={`py-2 text-center text-xs font-bold uppercase rounded-lg transition-all cursor-pointer ${
                        settings.difficulty === diff.id
                          ? 'bg-amber-500 text-zinc-950 font-extrabold shadow'
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                      }`}
                    >
                      {diff.label}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-zinc-500 italic px-1">
                  {difficulties.find((d) => d.id === settings.difficulty)?.desc}
                </p>
              </div>

              {/* JUMPSCARE TOGGLE */}
              <div className="border border-zinc-800/80 bg-zinc-900/50 p-3.5 rounded-xl">
                <label className="flex items-start gap-3.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.enableJumpscares}
                    onChange={handleJumpscareToggle}
                    className="mt-0.5 w-4 h-4 accent-amber-500 cursor-pointer rounded"
                  />
                  <div>
                    <div className="flex items-center gap-2 font-bold text-xs uppercase text-zinc-200">
                      <ShieldAlert className="w-4 h-4 text-amber-500" />
                      <span>Jumpscares: {settings.enableJumpscares ? 'ENABLED' : 'DISABLED (ATMOSPHERIC)'}</span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-zinc-400 leading-relaxed">
                      {settings.enableJumpscares
                        ? 'Visceral analog visual stinger on capture.'
                        : 'Calm atmospheric analog signal loss ("SIGNAL TERMINATED"). Zero screamers.'}
                    </p>
                  </div>
                </label>
              </div>

              {/* MASTER VOLUME */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-zinc-400 text-[11px] uppercase tracking-wider">
                    <Volume2 className="w-4 h-4 text-amber-400" />
                    <span>Master Volume</span>
                  </span>
                  <span className="text-amber-400 font-mono text-xs">
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
                  className="w-full accent-amber-500 cursor-pointer h-2 bg-zinc-800 rounded-lg"
                />
              </div>

              {/* MOUSE SENSITIVITY */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-zinc-400 text-[11px] uppercase tracking-wider">
                    <Eye className="w-4 h-4 text-cyan-400" />
                    <span>Look Sensitivity</span>
                  </span>
                  <span className="text-cyan-400 font-mono text-xs">{settings.mouseSensitivity.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.4"
                  max="2.5"
                  step="0.1"
                  value={settings.mouseSensitivity}
                  onChange={(e) => updateSettings({ mouseSensitivity: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-500 cursor-pointer h-2 bg-zinc-800 rounded-lg"
                />
              </div>

              {/* WALKING MOTION / HEAD BOB ACCESSIBILITY */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-zinc-400 text-[11px] uppercase tracking-wider">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <span>Walking Motion (Anti-Motion Sickness)</span>
                  </span>
                  <span className="text-emerald-400 font-mono text-xs">
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
                  className="w-full accent-emerald-500 cursor-pointer h-2 bg-zinc-800 rounded-lg"
                />
                <p className="text-[10px] text-zinc-500">
                  Purely translational subtle displacement (zero rotation/tilt). Set to 0 to completely freeze horizon.
                </p>
              </div>

              {/* 1990s VHS TAPE AESTHETIC */}
              <div className="space-y-1.5 border border-zinc-800/80 p-3 bg-zinc-900/50 rounded-xl">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-zinc-300 text-[11px] uppercase tracking-wider">
                    <Video className="w-4 h-4 text-amber-400" />
                    <span>1990s VHS Tape / VCR Camcorder</span>
                  </span>
                  <span className="text-amber-400 font-mono text-xs uppercase">
                    {settings.vhsIntensity || 'FULL'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  {(['full', 'subtle', 'off'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => updateSettings({ vhsIntensity: mode })}
                      className={`py-1.5 text-xs font-bold rounded-lg uppercase tracking-wider transition-colors cursor-pointer border ${
                        settings.vhsIntensity === mode
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                          : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* RETRO CRT SHADER */}
              <label className="flex items-center justify-between cursor-pointer border border-zinc-800/80 p-3 bg-zinc-900/50 rounded-xl">
                <span className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
                  <Monitor className="w-4 h-4 text-zinc-400" />
                  <span>CRT Scanlines & Analog Grain</span>
                </span>
                <input
                  type="checkbox"
                  checked={settings.enableCRTShader}
                  onChange={(e) => updateSettings({ enableCRTShader: e.target.checked })}
                  className="w-4 h-4 accent-amber-500 cursor-pointer rounded"
                />
              </label>

              {/* Reset Button */}
              <div className="pt-2 text-right">
                <button
                  type="button"
                  onClick={resetSettings}
                  className="text-xs text-zinc-500 hover:text-zinc-300 underline cursor-pointer"
                >
                  Reset Default Settings
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 border-t border-zinc-800/80 pt-3 flex justify-between items-center text-xs text-zinc-500 shrink-0">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>THE THRESHOLD // LIMINAL DRIFT 2.0</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-amber-400 hover:text-amber-300 font-bold uppercase tracking-wider cursor-pointer"
          >
            [Close Menu & Resume]
          </button>
        </div>
      </div>
    </div>
  );
};
