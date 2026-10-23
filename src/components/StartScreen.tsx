import React, { useState, useEffect } from 'react';
import { useSettings, DifficultyLevel } from '../context/SettingsContext';
import { AudioEngine } from '../audio/AudioEngine';
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
  Volume2,
} from 'lucide-react';

interface StartScreenProps {
  onStartGame: (seed: string, level: number) => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStartGame }) => {
  const { settings, updateSettings } = useSettings();
  const [seed, setSeed] = useState(() => 'LIMINAL-' + Math.floor(Math.random() * 900000 + 100000));
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const [copied, setCopied] = useState(false);
  const [audioActive, setAudioActive] = useState(() => AudioEngine.isAudioRunning());

  useEffect(() => {
    if (document.pointerLockElement) {
      document.exitPointerLock?.();
    }
    // Attempt starting ambient soundscape on mount
    AudioEngine.startMenuAmbience('main');
    setAudioActive(AudioEngine.isAudioRunning());

    const unlockAudio = () => {
      AudioEngine.resumeContext().then(() => {
        AudioEngine.startMenuAmbience('main');
        setAudioActive(true);
      });
    };

    window.addEventListener('pointerdown', unlockAudio, { passive: true });
    window.addEventListener('keydown', unlockAudio, { passive: true });
    window.addEventListener('touchstart', unlockAudio, { passive: true });

    return () => {
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
  }, []);

  const handleContainerClick = () => {
    // Unlocks browser Web Audio policy on first user interaction gesture
    AudioEngine.resumeContext().then(() => {
      AudioEngine.startMenuAmbience('main');
      setAudioActive(true);
    });
  };

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
      desc: 'Zero entity hazard. Immortal architecture study. Ideal for atmospheric walks.',
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    },
    {
      id: 'easy',
      label: 'Easy',
      badge: 'RECOMMENDED',
      desc: '65s safe exploration grace period. Slower entity with prominent audio cues.',
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    },
    {
      id: 'normal',
      label: 'Normal',
      badge: 'STANDARD',
      desc: '40s grace period. Entity actively stalks deep corridors and flickers lights.',
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    },
    {
      id: 'nightmare',
      label: 'Nightmare',
      badge: 'HARDCORE',
      desc: '18s short grace, swift aggressive entity, frequent brownouts and whispers.',
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
      accent: 'border-emerald-500/80 text-emerald-300 bg-emerald-500/10',
      desc: 'Pastel horizon, rolling grassy hills, doric ruins. Zero threat.',
    },
    {
      lv: 1,
      title: 'THE YELLOW HALLS',
      sub: 'Mono-Yellow Backrooms',
      threat: 'LOW THREAT',
      threatBadge: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      icon: Radio,
      accent: 'border-amber-500/80 text-amber-300 bg-amber-500/10',
      desc: 'Moist yellow wallpaper, damp carpet, fluorescent hum, cubicles.',
    },
    {
      lv: 2,
      title: 'SUBLIMITY POOLS',
      sub: 'Flooded Aqueducts',
      threat: 'MODERATE',
      threatBadge: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
      icon: Droplets,
      accent: 'border-cyan-500/80 text-cyan-300 bg-cyan-500/10',
      desc: 'White ceramic tiles, calm reflecting basins, echoing mist.',
    },
    {
      lv: 3,
      title: 'ENDLESS ARCHIVES',
      sub: 'Grand Hotel & Stacks',
      threat: 'HIGH THREAT',
      threatBadge: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
      icon: BookOpen,
      accent: 'border-orange-500/80 text-orange-300 bg-orange-500/10',
      desc: 'Victorian mahogany wainscoting, crimson carpets, infinite books.',
    },
    {
      lv: 4,
      title: 'MACHINE SUB-CORE',
      sub: 'Boiler & Steam Core',
      threat: 'CRITICAL',
      threatBadge: 'text-red-400 bg-red-500/10 border-red-500/30',
      icon: Cog,
      accent: 'border-red-500/80 text-red-300 bg-red-500/10',
      desc: 'Hazard-striped blast walls, steaming pipes, scorching boiler firebox.',
    },
  ];

  return (
    <div
      onClick={handleContainerClick}
      className="fixed inset-0 z-50 flex flex-col items-center justify-start bg-black/95 text-zinc-100 font-mono select-none overflow-y-auto pointer-events-auto py-10 md:py-16 px-4 sm:px-6 md:px-10"
    >
      {/* Dynamic Liminal Ambient Lighting Background */}
      <div className="fixed inset-0 bg-[radial-gradient(#222_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-96 bg-gradient-to-b from-amber-500/10 via-transparent to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Main Expansive Container with Intentional Whitespace */}
      <div className="relative w-full max-w-4xl mx-auto space-y-10 md:space-y-12">
        
        {/* HEADER SECTION: Clean Typographic Hierarchy */}
        <header className="space-y-4 text-left border-b border-zinc-800/80 pb-8">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] md:text-xs text-zinc-500 uppercase tracking-widest font-semibold">
            <span className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
              </span>
              <span>CLASSIFIED EXPEDITION ARCHIVE // PROTOCOL 2.0</span>
            </span>
            <span className="text-zinc-600 font-mono">SECTOR RECONNAISSANCE SYSTEM</span>
          </div>

          <div className="pt-2">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-light tracking-[0.25em] md:tracking-[0.35em] text-zinc-100 uppercase">
              The Threshold
            </h1>
            <p className="mt-3 text-xs md:text-sm text-zinc-400 font-mono leading-relaxed max-w-2xl">
              An expedition into unmapped, repeating liminal sectors. Locate 3 Reality Anchors per floor, conserve flashlight battery life, and breach the sector containment airlocks.
            </p>
          </div>
        </header>

        {/* PRIMARY CALL-TO-ACTION: Standout, Uncluttered, Prominent */}
        <section className="space-y-3">
          <button
            type="button"
            onClick={() => onStartGame(seed, selectedLevel)}
            className="w-full group relative overflow-hidden bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 active:scale-[0.99] text-zinc-950 font-black py-5 px-8 rounded-2xl text-sm md:text-base uppercase tracking-widest shadow-[0_10px_35px_rgba(245,158,11,0.25)] transition-all cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-zinc-950/20 rounded-xl">
                <Play className="w-5 h-5 fill-current transition-transform group-hover:scale-110" />
              </div>
              <div className="text-left">
                <span className="text-xs text-zinc-900/80 font-bold block tracking-wider">DEPLOYMENT PROTOCOL</span>
                <span className="text-base md:text-lg font-black tracking-widest">
                  INITIALIZE EXPEDITION // LEVEL {selectedLevel}
                </span>
              </div>
            </div>
            <span className="hidden sm:inline-block text-xs bg-black/20 text-zinc-950 px-3 py-1.5 rounded-lg font-mono font-bold tracking-wider">
              {levelOptions.find((l) => l.lv === selectedLevel)?.title}
            </span>
          </button>
        </section>

        {/* 1. SECTOR SELECTOR CARDS: Generous Breathing Room */}
        <section className="space-y-4">
          <div className="flex justify-between items-center text-xs">
            <span className="flex items-center gap-2 uppercase tracking-wider text-zinc-400 font-bold text-xs">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>01 // Select Starting Sector</span>
            </span>
            <span className="text-cyan-400 font-mono text-xs font-bold">
              {levelOptions.find((l) => l.lv === selectedLevel)?.title}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 md:gap-4">
            {levelOptions.map((item) => {
              const IconComp = item.icon;
              const isSelected = selectedLevel === item.lv;
              return (
                <button
                  key={item.lv}
                  type="button"
                  onClick={() => setSelectedLevel(item.lv)}
                  className={`p-4 md:p-5 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between min-h-[130px] ${
                    isSelected
                      ? `${item.accent} shadow-[0_0_24px_rgba(0,0,0,0.8)] ring-1 ring-amber-500/50 bg-zinc-900/90`
                      : 'border-zinc-800/80 bg-zinc-950/70 hover:bg-zinc-900/60 hover:border-zinc-700 text-zinc-400'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] font-bold tracking-widest px-2 py-0.5 rounded-md bg-black/50 border border-zinc-800">
                      LV {item.lv}
                    </span>
                    <IconComp className={`w-4 h-4 ${isSelected ? 'opacity-100 text-amber-400' : 'opacity-50'}`} />
                  </div>
                  <div>
                    <div className="text-xs md:text-sm font-bold uppercase text-zinc-100 leading-tight">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-zinc-500 mt-0.5 truncate">
                      {item.sub}
                    </div>
                    <div className={`mt-2.5 text-[9px] font-bold tracking-wider px-2 py-0.5 rounded border inline-block uppercase ${item.threatBadge}`}>
                      {item.threat}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* 2. DIFFICULTY SELECTOR: Ample Whitespace */}
        <section className="space-y-4">
          <div className="flex justify-between items-center text-xs">
            <span className="flex items-center gap-2 uppercase tracking-wider text-zinc-400 font-bold text-xs">
              <SlidersHorizontal className="w-4 h-4 text-amber-500" />
              <span>02 // Threat Intensity & Difficulty</span>
            </span>
            <span className="text-amber-400 uppercase font-bold text-xs font-mono">{settings.difficulty}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {difficulties.map((diff) => {
              const isSelected = settings.difficulty === diff.id;
              return (
                <button
                  key={diff.id}
                  type="button"
                  onClick={() => updateSettings({ difficulty: diff.id })}
                  className={`p-4 md:p-5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-amber-500 bg-amber-500/10 text-white ring-1 ring-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
                      : 'border-zinc-800/80 bg-zinc-950/70 hover:bg-zinc-900/60 hover:border-zinc-700 text-zinc-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs md:text-sm font-bold uppercase tracking-wider text-white">
                      {diff.label}
                    </span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${diff.color}`}>
                      {diff.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    {diff.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        {/* 3. EXPEDITION PARAMETERS & JUMPSCARE ACCESSIBILITY */}
        <section className="space-y-4 pt-2">
          <div className="flex justify-between items-center text-xs">
            <span className="flex items-center gap-2 uppercase tracking-wider text-zinc-400 font-bold text-xs">
              <Compass className="w-4 h-4 text-emerald-400" />
              <span>03 // Expedition Parameters</span>
            </span>
            <span className="text-zinc-500 text-[11px]">CUSTOM TELEMETRY</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* JUMPSCARE ACCESSIBILITY TOGGLE */}
            <div className="border border-zinc-800/80 bg-zinc-950/70 p-5 rounded-2xl transition-colors hover:border-zinc-700/80 flex flex-col justify-between">
              <label className="flex items-start gap-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enableJumpscares}
                  onChange={(e) => updateSettings({ enableJumpscares: e.target.checked })}
                  className="mt-1 w-4 h-4 accent-amber-500 cursor-pointer rounded"
                />
                <div>
                  <div className="flex items-center gap-2 font-bold text-xs uppercase text-zinc-200">
                    <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Jumpscares: {settings.enableJumpscares ? 'ENABLED' : 'DISABLED (ATMOSPHERIC)'}</span>
                  </div>
                  <p className="mt-1.5 text-zinc-400 text-[11px] leading-relaxed">
                    {settings.enableJumpscares
                      ? 'Visceral analog horror flash and sudden noise upon capture.'
                      : 'Calm atmospheric analog signal loss ("SIGNAL TERMINATED"). Zero loud screamers.'}
                  </p>
                </div>
              </label>
            </div>

            {/* PROCEDURAL SEED GENERATOR */}
            <div className="border border-zinc-800/80 bg-zinc-950/70 p-5 rounded-2xl space-y-3">
              <div className="flex justify-between items-center text-xs text-zinc-400 uppercase tracking-wider">
                <span>Procedural Reality Seed</span>
                <span className="text-[10px] text-zinc-500">SHAREABLE LABYRINTH</span>
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={seed}
                    onChange={(e) => setSeed(e.target.value.toUpperCase())}
                    className="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-amber-400 font-mono font-bold tracking-wider focus:outline-none focus:border-amber-500 select-text"
                  />
                </div>
                <button
                  type="button"
                  onClick={copySeed}
                  className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-colors text-zinc-300 font-bold"
                  title="Copy seed to clipboard"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  type="button"
                  onClick={generateNewSeed}
                  className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-colors text-zinc-300 font-bold"
                  title="Generate new procedural labyrinth seed"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Reroll</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER & CONTROLS REFERENCE */}
        <footer className="border-t border-zinc-800/80 pt-6 pb-8 space-y-4 text-left">
          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
            <span className="text-zinc-500 text-[11px] uppercase mr-2 font-bold tracking-wider">CONTROLS:</span>
            <span className="flex items-center gap-1 px-2.5 py-1 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-300">
              <kbd className="font-bold">WASD</kbd> Move
            </span>
            <span className="flex items-center gap-1 px-2.5 py-1 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-300">
              <kbd className="font-bold">SHIFT</kbd> Sprint
            </span>
            <span className="flex items-center gap-1 px-2.5 py-1 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-300">
              <kbd className="font-bold">C / CTRL</kbd> Crouch
            </span>
            <span className="flex items-center gap-1 px-2.5 py-1 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-300">
              <kbd className="font-bold">MOUSE</kbd> Look
            </span>
            <span className="flex items-center gap-1 px-2.5 py-1 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-300">
              <kbd className="font-bold">F</kbd> Flashlight
            </span>
            <span className="flex items-center gap-1 px-2.5 py-1 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-300">
              <kbd className="font-bold">E / CLICK</kbd> Interact
            </span>
            <span className="flex items-center gap-1 px-2.5 py-1 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-300">
              <kbd className="font-bold">M</kbd> Minimap
            </span>
            <span className="flex items-center gap-1 px-2.5 py-1 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-300">
              <kbd className="font-bold">ESC</kbd> Pause
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-between text-[11px] text-zinc-500 pt-2 border-t border-zinc-900">
            <div className="flex items-center gap-2">
              <Headphones className="w-3.5 h-3.5 text-zinc-400" />
              <span>Stereo headphones strongly recommended for binaural acoustics & hum</span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleContainerClick();
              }}
              className="flex items-center gap-2 hover:text-amber-400 transition-colors cursor-pointer"
            >
              <Volume2 className={`w-3.5 h-3.5 ${audioActive ? 'text-amber-400 animate-pulse' : 'text-zinc-600'}`} />
              <span className="font-mono text-[10px] tracking-wider uppercase">
                {audioActive ? 'SOUNDTRACK: ACTIVE (PIANO & LIMINAL PAD)' : 'CLICK TO ENABLE SOUNDTRACK'}
              </span>
            </button>
          </div>
        </footer>

      </div>
    </div>
  );
};
