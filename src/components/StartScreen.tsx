import React, { useState, useEffect } from 'react';
import { useSettings, DifficultyLevel } from '../context/SettingsContext';
import {
  Headphones,
  ShieldAlert,
  Sparkles,
  SlidersHorizontal,
  Play,
  Layers,
  Copy,
  Check,
  Droplets,
  BookOpen,
  Cog,
  Radio,
  Compass,
  ShieldCheck,
} from 'lucide-react';

interface StartScreenProps {
  onStartGame: (seed: string, level: number) => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStartGame }) => {
  const { settings, updateSettings } = useSettings();
  const [seed, setSeed] = useState(() => 'LIMINAL-' + Math.floor(Math.random() * 900000 + 100000));
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (document.pointerLockElement) {
      document.exitPointerLock?.();
    }
  }, []);

  const generateNewSeed = () => {
    setSeed('LIMINAL-' + Math.floor(Math.random() * 900000 + 100000));
  };

  const copySeed = () => {
    navigator.clipboard?.writeText(seed);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const difficulties: { id: DifficultyLevel; label: string; desc: string; badge: string; color: string }[] = [
    {
      id: 'explorer',
      label: 'Explorer',
      badge: 'PEACEFUL',
      desc: 'Zero entity danger. Calm architecture study. Player is immortal.',
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    },
    {
      id: 'easy',
      label: 'Easy',
      badge: 'RECOMMENDED',
      desc: '65s safe grace period. Slower entity with obvious audio static cues.',
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    },
    {
      id: 'normal',
      label: 'Normal',
      badge: 'STANDARD',
      desc: '40s safe grace period. Entity actively stalks deep corridors.',
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    },
    {
      id: 'nightmare',
      label: 'Nightmare',
      badge: 'HARDCORE',
      desc: 'Short 18s grace period, swift aggressive entity, frequent light flickers.',
      color: 'text-red-400 bg-red-500/10 border-red-500/30',
    },
  ];

  const levelOptions = [
    {
      lv: 0,
      title: 'DREAM SANCTUARY',
      sub: 'Peaceful Meadow',
      threat: 'SAFE ZONE',
      threatBadge: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      icon: Sparkles,
      accent: 'border-emerald-500/80 text-emerald-400 bg-emerald-500/10',
      desc: 'Pastel horizon, rolling grassy hills, doric ruins. Zero threat.',
    },
    {
      lv: 1,
      title: 'THE YELLOW HALLS',
      sub: 'Mono-Yellow Backrooms',
      threat: 'LOW THREAT',
      threatBadge: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      icon: Radio,
      accent: 'border-amber-500/80 text-amber-400 bg-amber-500/10',
      desc: 'Moist yellow wallpaper, damp carpet, fluorescent hum, cubicles.',
    },
    {
      lv: 2,
      title: 'SUBLIMITY POOLS',
      sub: 'Flooded Aqueducts',
      threat: 'MODERATE',
      threatBadge: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
      icon: Droplets,
      accent: 'border-cyan-500/80 text-cyan-400 bg-cyan-500/10',
      desc: 'White ceramic tiles, calm reflecting basins, echoing mist.',
    },
    {
      lv: 3,
      title: 'ENDLESS ARCHIVES',
      sub: 'Grand Hotel & Stacks',
      threat: 'HIGH THREAT',
      threatBadge: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
      icon: BookOpen,
      accent: 'border-orange-500/80 text-orange-400 bg-orange-500/10',
      desc: 'Victorian mahogany wainscoting, crimson carpets, infinite books.',
    },
    {
      lv: 4,
      title: 'MACHINE SUB-CORE',
      threat: 'CRITICAL',
      threatBadge: 'text-red-400 bg-red-500/10 border-red-500/30',
      sub: 'Boiler & Steam Core',
      icon: Cog,
      accent: 'border-red-500/80 text-red-400 bg-red-500/10',
      desc: 'Hazard-striped blast walls, steaming pipes, scorching boiler firebox.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 text-zinc-100 font-mono select-none p-3 md:p-6 overflow-y-auto pointer-events-auto">
      {/* Dynamic Liminal Ambient Lighting Background */}
      <div className="absolute inset-0 bg-[radial-gradient(#222_1px,transparent_1px)] [background-size:20px_20px] opacity-35 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-80 bg-gradient-to-b from-amber-500/15 via-transparent to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Main Terminal Card Container */}
      <div className="relative w-full max-w-3xl my-auto border border-zinc-800/90 bg-zinc-950/90 rounded-2xl shadow-[0_35px_80px_-20px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl p-6 md:p-8 text-left">
        {/* Terminal Header */}
        <div className="border-b border-zinc-800/80 pb-4 mb-5">
          <div className="flex justify-between items-center text-[10px] text-zinc-500 uppercase tracking-widest font-semibold mb-1.5">
            <span className="flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-amber-500" />
              <span>EXPEDITION PROTOCOL // SECTOR TELEMETRY</span>
            </span>
            <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-amber-400/90 font-bold">
              BUILD 2.0 // LIMINAL DRIFT
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white uppercase flex items-center gap-3">
            <span>The Threshold</span>
          </h1>
          <p className="mt-1 text-xs text-zinc-400 leading-relaxed max-w-xl">
            Procedural multi-level liminal space expedition. Locate 3 Reality Anchors per sector, manage battery life, and breach the airlock containment gate.
          </p>
        </div>

        {/* 1. SECTOR SELECTOR CARDS */}
        <div className="space-y-2 mb-5">
          <div className="flex justify-between items-center text-xs font-semibold text-zinc-300">
            <span className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-zinc-400">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Select Starting Floor</span>
            </span>
            <span className="text-cyan-400 text-xs font-bold">
              STARTING AT LEVEL {selectedLevel}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5">
            {levelOptions.map((item) => {
              const IconComp = item.icon;
              const isSelected = selectedLevel === item.lv;
              return (
                <button
                  key={item.lv}
                  type="button"
                  onClick={() => setSelectedLevel(item.lv)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between min-h-[110px] ${
                    isSelected
                      ? `${item.accent} shadow-[0_0_20px_rgba(0,0,0,0.6)] ring-1 ring-amber-500/50`
                      : 'border-zinc-800/90 bg-zinc-900/40 hover:bg-zinc-800/50 hover:border-zinc-700 text-zinc-400'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold tracking-widest px-1.5 py-0.5 rounded bg-black/40">
                      LV {item.lv}
                    </span>
                    <IconComp className={`w-4 h-4 ${isSelected ? 'opacity-100' : 'opacity-60'}`} />
                  </div>
                  <div>
                    <div className="text-xs font-black leading-tight uppercase text-zinc-100 truncate">
                      {item.title}
                    </div>
                    <div className="text-[10px] text-zinc-400/90 truncate mt-0.5">
                      {item.sub}
                    </div>
                    <div className={`mt-1.5 text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded border inline-block uppercase ${item.threatBadge}`}>
                      {item.threat}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. DIFFICULTY SELECTOR */}
        <div className="space-y-2 mb-5">
          <div className="flex justify-between items-center text-xs font-semibold text-zinc-300">
            <span className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-zinc-400">
              <SlidersHorizontal className="w-4 h-4 text-amber-500" />
              <span>Threat Intensity / Difficulty</span>
            </span>
            <span className="text-amber-400 uppercase font-bold text-xs">{settings.difficulty}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {difficulties.map((diff) => {
              const isSelected = settings.difficulty === diff.id;
              return (
                <button
                  key={diff.id}
                  type="button"
                  onClick={() => updateSettings({ difficulty: diff.id })}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-amber-500 bg-amber-500/10 text-white ring-1 ring-amber-500/50'
                      : 'border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800/60 text-zinc-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-white">
                      {diff.label}
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase ${diff.color}`}>
                      {diff.badge}
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-1 leading-snug">
                    {diff.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. JUMPSCARE & ACCESSIBILITY CONTROLS */}
        <div className="border border-zinc-800/80 bg-zinc-900/50 p-3.5 mb-5 rounded-xl transition-colors hover:border-zinc-700/80">
          <label className="flex items-start gap-3.5 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.enableJumpscares}
              onChange={(e) => updateSettings({ enableJumpscares: e.target.checked })}
              className="mt-0.5 w-4 h-4 accent-amber-500 cursor-pointer rounded"
            />
            <div className="text-xs">
              <div className="flex items-center gap-2 font-bold text-zinc-200 uppercase tracking-wider">
                <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Jumpscares: {settings.enableJumpscares ? 'ENABLED' : 'DISABLED (ATMOSPHERIC)'}</span>
              </div>
              <p className="mt-0.5 text-zinc-400 text-[11px] leading-relaxed">
                {settings.enableJumpscares
                  ? 'Visceral analog horror flash and sudden noise upon capture.'
                  : 'Calm atmospheric analog signal loss ("SIGNAL TERMINATED"). Zero screamers.'}
              </p>
            </div>
          </label>
        </div>

        {/* 4. PROCEDURAL SEED GENERATOR */}
        <div className="mb-5 space-y-1.5">
          <div className="flex justify-between items-center text-xs text-zinc-400 uppercase tracking-wider">
            <span>Procedural Reality Seed</span>
            <span className="text-[10px] text-zinc-500">SHARE SEED WITH FELLOW DRIFTERS</span>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={seed}
                onChange={(e) => setSeed(e.target.value.toUpperCase())}
                className="w-full bg-zinc-900/80 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-xs text-amber-400 font-mono font-bold tracking-wider focus:outline-none focus:border-amber-500 select-text"
              />
            </div>
            <button
              type="button"
              onClick={copySeed}
              className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-3.5 py-2.5 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer transition-colors text-zinc-300 font-bold"
              title="Copy seed"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              type="button"
              onClick={generateNewSeed}
              className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-4 py-2.5 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer transition-colors text-zinc-300 font-bold"
              title="Roll random seed"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Reroll</span>
            </button>
          </div>
        </div>

        {/* 5. KEYBOARD CONTROLS CHIPS */}
        <div className="mb-6 border-t border-zinc-800/80 pt-3.5">
          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
            <span className="flex items-center gap-1 px-2 py-1 bg-zinc-900 border border-zinc-800 rounded font-bold text-zinc-300">
              <kbd>WASD</kbd> Move
            </span>
            <span className="flex items-center gap-1 px-2 py-1 bg-zinc-900 border border-zinc-800 rounded font-bold text-zinc-300">
              <kbd>SHIFT</kbd> Sprint
            </span>
            <span className="flex items-center gap-1 px-2 py-1 bg-zinc-900 border border-zinc-800 rounded font-bold text-zinc-300">
              <kbd>C</kbd> / <kbd>CTRL</kbd> Crouch
            </span>
            <span className="flex items-center gap-1 px-2 py-1 bg-zinc-900 border border-zinc-800 rounded font-bold text-zinc-300">
              <kbd>MOUSE</kbd> Look
            </span>
            <span className="flex items-center gap-1 px-2 py-1 bg-zinc-900 border border-zinc-800 rounded font-bold text-zinc-300">
              <kbd>F</kbd> Flashlight
            </span>
            <span className="flex items-center gap-1 px-2 py-1 bg-zinc-900 border border-zinc-800 rounded font-bold text-zinc-300">
              <kbd>E</kbd> / <kbd>CLICK</kbd> Interact
            </span>
            <span className="flex items-center gap-1 px-2 py-1 bg-zinc-900 border border-zinc-800 rounded font-bold text-zinc-300">
              <kbd>M</kbd> Radar
            </span>
            <span className="flex items-center gap-1 px-2 py-1 bg-zinc-900 border border-zinc-800 rounded font-bold text-zinc-300">
              <kbd>ESC</kbd> Pause Menu
            </span>
          </div>
        </div>

        {/* 6. PRIMARY CTA INITIALIZE BUTTON */}
        <button
          type="button"
          onClick={() => onStartGame(seed, selectedLevel)}
          className="w-full group relative overflow-hidden bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 active:scale-[0.99] text-zinc-950 font-black py-4 px-6 rounded-xl text-xs uppercase tracking-widest shadow-[0_8px_28px_rgba(245,158,11,0.25)] transition-all cursor-pointer flex items-center justify-center gap-3"
        >
          <Play className="w-5 h-5 fill-current transition-transform group-hover:scale-110" />
          <span className="text-sm font-black">INITIALIZE EXPEDITION // LEVEL {selectedLevel}</span>
        </button>

        {/* Audio Note */}
        <div className="mt-3.5 text-center text-xs text-zinc-500 flex items-center justify-center gap-2">
          <Headphones className="w-4 h-4 text-zinc-400" />
          <span>Stereo headphones strongly recommended for 3D binaural footsteps & hum</span>
        </div>
      </div>
    </div>
  );
};
