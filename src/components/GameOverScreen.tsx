import React from 'react';
import { RotateCcw, CheckCircle, Skull, Share2 } from 'lucide-react';

interface GameOverScreenProps {
  isVictory: boolean;
  timeElapsed: number; // in seconds
  anchorsCollected: number;
  totalAnchors: number;
  seed: string;
  levelReached?: number;
  onRestart: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({
  isVictory,
  timeElapsed,
  anchorsCollected,
  totalAnchors,
  seed,
  levelReached = 1,
  onRestart,
}) => {
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = Math.floor(secs % 60);
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  };

  const copySeed = () => {
    navigator.clipboard.writeText(seed);
    alert(`Seed "${seed}" copied to clipboard!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 text-zinc-100 font-mono select-none p-4">
      <div
        className={`relative w-full max-w-md border-2 p-6 md:p-8 shadow-2xl backdrop-blur-md ${
          isVictory ? 'border-emerald-600 bg-emerald-950/20' : 'border-red-900 bg-zinc-950/90'
        }`}
      >
        {/* Header */}
        <div className="text-center space-y-2 border-b border-zinc-800 pb-4">
          <div className="flex justify-center mb-2">
            {isVictory ? (
              <CheckCircle className="w-12 h-12 text-emerald-400" />
            ) : (
              <Skull className="w-12 h-12 text-red-500" />
            )}
          </div>
          <h2
            className={`text-2xl md:text-3xl font-extrabold tracking-wider uppercase ${
              isVictory ? 'text-emerald-400' : 'text-red-500'
            }`}
          >
            {isVictory ? 'THRESHOLD ESCAPED' : 'CONSCIOUSNESS LOST'}
          </h2>
          <p className="text-xs text-zinc-400">
            {isVictory
              ? 'All 3 Reality Anchors stabilized the airlock seal. You crossed back to the waking world.'
              : 'The entity closed the space between you. Your signal was swallowed by the yellow walls.'}
          </p>
        </div>

        {/* Stats */}
        <div className="mt-5 space-y-3 bg-zinc-900/60 border border-zinc-800 p-4 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-zinc-400">Deepest Sub-Level:</span>
            <span className="font-bold text-cyan-400 font-mono">LEVEL {levelReached}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-zinc-400">Exploration Time:</span>
            <span className="font-bold text-amber-400 font-mono">{formatTime(timeElapsed)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-zinc-400">Reality Anchors Found:</span>
            <span className="font-bold text-cyan-400 font-mono">
              {anchorsCollected} / {totalAnchors}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-zinc-400">Sector Seed:</span>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-zinc-300">{seed}</span>
              <button
                onClick={copySeed}
                className="text-zinc-500 hover:text-white p-1"
                title="Copy Seed"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Restart Button */}
        <button
          onClick={onRestart}
          className={`mt-6 w-full flex items-center justify-center gap-2 py-3 px-6 text-sm font-bold uppercase tracking-wider transition-all shadow-lg ${
            isVictory
              ? 'bg-emerald-600 hover:bg-emerald-500 text-black'
              : 'bg-red-700 hover:bg-red-600 text-white'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>Enter Next Threshold</span>
        </button>
      </div>
    </div>
  );
};
