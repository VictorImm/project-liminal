import React from 'react';
import { GeneratedLabyrinth } from '../procedural/LabyrinthGenerator';
import { Compass, Map as MapIcon, AlertTriangle } from 'lucide-react';

interface MinimapProps {
  labyrinth: GeneratedLabyrinth | null;
  playerPos: { x: number; z: number };
  playerAngle: number; // Exact compass heading in degrees (0 = North, 90 = East, 180 = South, 270 = West)
  visitedRooms: Set<string>;
  isOpen: boolean;
  onToggle: () => void;
  roomSize?: number;
}

export const Minimap: React.FC<MinimapProps> = ({
  labyrinth,
  playerPos,
  playerAngle,
  visitedRooms,
  isOpen,
  onToggle,
  roomSize = 10,
}) => {
  if (!labyrinth) return null;

  // Compute dynamic grid bounds from labyrinth rooms
  let maxGridX = 3;
  let maxGridZ = 3;
  labyrinth.rooms.forEach((r) => {
    maxGridX = Math.max(maxGridX, r.x);
    maxGridZ = Math.max(maxGridZ, r.z);
  });
  const cols = maxGridX + 1;
  const rows = maxGridZ + 1;

  const totalWorldW = cols * roomSize;
  const totalWorldH = rows * roomSize;

  // Continuous percentage coordinate on the blueprint [0% to 100%]
  const clampedX = Math.max(-roomSize * 0.45, Math.min(totalWorldW - roomSize * 0.55, playerPos.x));
  const clampedZ = Math.max(-roomSize * 0.45, Math.min(totalWorldH - roomSize * 0.55, playerPos.z));

  const percentX = ((clampedX + roomSize * 0.5) / totalWorldW) * 100;
  const percentY = ((clampedZ + roomSize * 0.5) / totalWorldH) * 100;

  // Current room coordinates
  const currentRx = Math.round(playerPos.x / roomSize);
  const currentRz = Math.round(playerPos.z / roomSize);

  const isCorrupted = labyrinth.level === 3;

  return (
    <div className="fixed bottom-4 right-4 z-40 select-none font-mono">
      {isOpen ? (
        <div
          className={`p-3 rounded shadow-2xl backdrop-blur-md w-64 text-left transition-colors ${
            isCorrupted
              ? 'border border-red-600/90 bg-red-950/40 shadow-[0_0_25px_rgba(239,68,68,0.25)]'
              : 'border border-cyan-800/90 bg-zinc-950/95'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5 mb-2.5">
            <div
              className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest ${
                isCorrupted ? 'text-red-400 animate-pulse' : 'text-cyan-400'
              }`}
            >
              {isCorrupted ? <AlertTriangle className="w-3.5 h-3.5" /> : <Compass className="w-3.5 h-3.5" />}
              <span>{isCorrupted ? 'RADAR // CORRUPTED' : `RADAR // SEC-${labyrinth.level}`}</span>
            </div>
            <button
              onClick={onToggle}
              className="text-[10px] text-zinc-500 hover:text-zinc-300 uppercase cursor-pointer"
            >
              [Hide M]
            </button>
          </div>

          {isCorrupted ? (
            /* Glitched, Malfunctioning Non-Euclidean Radar Screen for Level 3 */
            <div className="relative w-full aspect-square bg-black border border-red-900/60 p-2 rounded overflow-hidden flex flex-col justify-center items-center text-center">
              {/* Scanline CRT glitch stripes */}
              <div
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255, 0, 0, 0.4) 2px, rgba(255, 0, 0, 0.4) 4px)',
                }}
              />

              {/* Scrambled static digital artifacts */}
              <div className="text-[10px] text-red-500/70 font-mono tracking-widest mb-2 select-none">
                ERR: 0x8F_COLLAPSE
              </div>
              <div className="text-[11px] font-extrabold text-red-400 tracking-wider animate-pulse mb-1">
                NON-EUCLIDEAN TOPOLOGY
              </div>
              <div className="text-[9px] text-zinc-400 leading-tight px-1 mb-3">
                SPATIAL METRIC UNRESOLVED // INFINITE RECURSIVE LOOP DETECTED
              </div>

              {/* Distorted broken radar compass */}
              <div className="relative w-12 h-12 rounded-full border border-red-500/40 flex items-center justify-center animate-spin [animation-duration:8s]">
                <div className="w-8 h-8 rounded-full border border-dashed border-red-400/30" />
                <div className="absolute w-full h-0.5 bg-red-500/20" />
                <div className="absolute h-full w-0.5 bg-red-500/20" />
                <span className="text-[9px] text-red-400 font-bold">?</span>
              </div>

              <div className="mt-3 text-[8px] text-red-400/80 tracking-tighter uppercase font-mono">
                [GRID SIGNAL DESYNCHRONIZED]
              </div>
            </div>
          ) : (
            /* Standard Functional Radar Blueprint */
            <div className="relative w-full aspect-square bg-black border border-zinc-800 p-1 rounded overflow-hidden">
              {/* Grid Cells (Rooms) */}
              <div
                className={`w-full h-full grid ${cols > 6 || rows > 6 ? 'gap-0.5' : 'gap-1'}`}
                style={{
                  gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                  gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
                }}
              >
                {Array.from({ length: rows }).map((_, z) =>
                  Array.from({ length: cols }).map((_, x) => {
                    const key = `${x},${z}`;
                    const room = labyrinth.rooms.find((r) => r.x === x && r.z === z);
                    const isVisited = visitedRooms.has(key);
                    const isExit = labyrinth.exitRoom.x === x && labyrinth.exitRoom.z === z;
                    const isSpawn = labyrinth.spawnRoom.x === x && labyrinth.spawnRoom.z === z;
                    const hasAnchor = room?.items.some((it) => it.type === 'anchor' && !it.collected);

                    if (!room) {
                      return (
                        <div
                          key={key}
                          className="border border-zinc-900/30 bg-zinc-950/40 rounded-xs"
                        />
                      );
                    }

                    return (
                      <div
                        key={key}
                        className={`relative flex items-center justify-center border rounded-xs text-[9px] font-bold transition-colors ${
                          isVisited
                            ? isExit
                              ? 'border-red-600/80 bg-red-950/30 text-red-400'
                              : isSpawn
                              ? 'border-amber-600/60 bg-amber-950/20 text-amber-300'
                              : 'border-cyan-900/80 bg-zinc-900/70 text-zinc-400'
                            : 'border-zinc-900/60 bg-zinc-950/80'
                        }`}
                      >
                        {/* Doorway notches on visited rooms */}
                        {isVisited && (
                          <>
                            {room.doors.some((d) => d.direction === 'north') && (
                              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-0.5 bg-cyan-700/60" />
                            )}
                            {room.doors.some((d) => d.direction === 'south') && (
                              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-0.5 bg-cyan-700/60" />
                            )}
                            {room.doors.some((d) => d.direction === 'east') && (
                              <span className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-2 bg-cyan-700/60" />
                            )}
                            {room.doors.some((d) => d.direction === 'west') && (
                              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-2 bg-cyan-700/60" />
                            )}

                            {isExit && (
                              <span className="text-[8px] text-red-500 font-extrabold tracking-tighter">
                                EXIT
                              </span>
                            )}
                            {hasAnchor && !isExit && (
                              <span className="text-cyan-300 text-[11px] animate-pulse">◆</span>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Continuous, Smoothly Tracked Player Marker with Exact Direction Vector */}
              <div
                className="absolute pointer-events-none transition-transform duration-75 ease-out"
                style={{
                  left: `${percentX}%`,
                  top: `${percentY}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                {/* Outer pulsing ping ring */}
                <div className="absolute -inset-1.5 rounded-full border border-cyan-400/50 animate-ping" />

                {/* Player directional compass pointer */}
                <div
                  className="relative w-3.5 h-3.5 flex items-center justify-center transition-transform duration-50"
                  style={{
                    transform: `rotate(${playerAngle}deg)`,
                  }}
                >
                  {/* Heading Arrow Pointer */}
                  <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[9px] border-b-cyan-300 shadow-[0_0_8px_rgba(0,255,255,1)] -mt-1" />
                  {/* Center Core Dot */}
                  <div className="absolute w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
                </div>
              </div>
            </div>
          )}

          {/* Coordinates & Compass OSD */}
          <div className="mt-2 pt-1.5 border-t border-zinc-800 flex justify-between items-center text-[9px] text-zinc-400">
            {isCorrupted ? (
              <>
                <span className="text-red-500/80 animate-pulse font-mono font-bold">LOC: [??, ??]</span>
                <span className="font-mono text-red-400 font-bold">HDG: ERR°</span>
                <span className="text-red-500 font-semibold">EXIT: [UNRESOLVED]</span>
              </>
            ) : (
              <>
                <span className="text-zinc-500">
                  LOC: [{currentRx}, {currentRz}]
                </span>
                <span className="font-mono text-cyan-400 font-bold">
                  HDG: {Math.round((playerAngle + 360) % 360)}°
                </span>
                <span className="text-red-400 font-semibold">
                  EXIT: [{labyrinth.exitRoom.x},{labyrinth.exitRoom.z}]
                </span>
              </>
            )}
          </div>
        </div>
      ) : (
        <button
          onClick={onToggle}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs uppercase tracking-wider backdrop-blur-sm cursor-pointer shadow-lg transition-colors ${
            isCorrupted
              ? 'bg-red-950/80 hover:bg-red-900 border border-red-600/90 text-red-300 animate-pulse'
              : 'bg-black/85 hover:bg-zinc-900 border border-cyan-800/90 text-cyan-400'
          }`}
          title="Toggle Radar [M]"
        >
          {isCorrupted ? <AlertTriangle className="w-3.5 h-3.5 text-red-400" /> : <MapIcon className="w-3.5 h-3.5" />}
          <span>{isCorrupted ? 'Radar [ERR]' : 'Radar [M]'}</span>
        </button>
      )}
    </div>
  );
};
