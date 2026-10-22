import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { AudioEngine } from './audio/AudioEngine';
import { LabyrinthGenerator, GeneratedLabyrinth, WorldItem } from './procedural/LabyrinthGenerator';
import { LiminalWorld, InteractionTarget } from './game/LiminalWorld';
import { FPSControls } from './game/FPSControls';
import { LiminalEntityAI } from './game/LiminalEntityAI';
import { HUD } from './components/HUD';
import { Minimap } from './components/Minimap';
import { StartScreen } from './components/StartScreen';
import { SettingsModal } from './components/SettingsModal';
import { JumpscareModal } from './components/JumpscareModal';
import { GameOverScreen } from './components/GameOverScreen';
import { VHSOsdOverlay } from './components/VHSOsdOverlay';

type GameState = 'start' | 'playing' | 'jumpscare' | 'gameover';

// Zero-allocation reusable scratch vector for camera heading calculation
const _scratchCamDir = new THREE.Vector3();

const GameContainer: React.FC = () => {
  const { settings } = useSettings();
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  const [gameState, setGameState] = useState<GameState>('start');
  const [labyrinth, setLabyrinth] = useState<GeneratedLabyrinth | null>(null);
  const [anchorsCollected, setAnchorsCollected] = useState(0);
  const anchorsCollectedRef = useRef(0);
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [flashlightOn, setFlashlightOn] = useState(true);
  const [interactionTarget, setInteractionTarget] = useState<InteractionTarget | null>(null);
  const interactionTargetRef = useRef<InteractionTarget | null>(null);
  const [activeInspectItem, setActiveInspectItem] = useState<WorldItem | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isVictory, setIsVictory] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const currentLevelRef = useRef<number>(1);
  const labyrinthRef = useRef<GeneratedLabyrinth | null>(null);
  const handleInteractRef = useRef<() => void>(() => {});

  useEffect(() => {
    currentLevelRef.current = currentLevel;
  }, [currentLevel]);

  useEffect(() => {
    labyrinthRef.current = labyrinth;
  }, [labyrinth]);

  // High-performance UI throttle and room transition refs (prevent React re-render thrashing)
  const uiThrottleTimerRef = useRef(0);
  const lastRoomCoordsRef = useRef({ rx: 9999, rz: 9999 });

  // Seamless HUD Transmissions & Non-blocking Notifications
  const [hudToast, setHudToast] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const inspectTimerRef = useRef<number | null>(null);
  const randomHeartbeatTimerRef = useRef(18 + Math.random() * 15);

  const triggerToast = (msg: string, durationMs: number = 4000) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setHudToast(msg);
    toastTimerRef.current = window.setTimeout(() => {
      setHudToast(null);
    }, durationMs);
  };

  // Minimap & Spatial State
  const [visitedRooms, setVisitedRooms] = useState<Set<string>>(() => new Set());
  const [isMinimapOpen, setIsMinimapOpen] = useState(true);
  const [playerPos, setPlayerPos] = useState<{ x: number; z: number }>({ x: 0, z: 0 });
  const [playerAngle, setPlayerAngle] = useState(0);

  // References to game systems
  const worldRef = useRef<LiminalWorld | null>(null);
  const controlsRef = useRef<FPSControls | null>(null);
  const entityRef = useRef<LiminalEntityAI | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  // Audio Engine Sync with settings
  useEffect(() => {
    AudioEngine.setVolume(settings.masterVolume);
    AudioEngine.setJumpscareSetting(settings.enableJumpscares);
  }, [settings.masterVolume, settings.enableJumpscares]);

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.sensitivity = settings.mouseSensitivity;
      controlsRef.current.bobIntensity = settings.headBobIntensity;
    }
  }, [settings.mouseSensitivity, settings.headBobIntensity]);

  // Pointer lock release safeguard
  useEffect(() => {
    if (gameState !== 'playing' || isSettingsOpen) {
      if (document.pointerLockElement) {
        document.exitPointerLock?.();
      }
      controlsRef.current?.unlock();
    }
  }, [gameState, isSettingsOpen]);

  // Start new game run
  const handleStartGame = (seed: string, startLevel: number = 1) => {
    AudioEngine.init();
    AudioEngine.resumeContext();

    const chosenLevel = Math.max(0, Math.min(4, startLevel));
    setCurrentLevel(chosenLevel);
    currentLevelRef.current = chosenLevel;
    AudioEngine.setLevelAmbiance(chosenLevel);

    const gen = LabyrinthGenerator.generate(seed, chosenLevel);
    labyrinthRef.current = gen;
    setLabyrinth(gen);
    anchorsCollectedRef.current = 0;
    setAnchorsCollected(0);
    setBatteryLevel(100);
    setFlashlightOn(true);
    setIsVictory(false);
    setTimeElapsed(0);
    startTimeRef.current = Date.now();

    const initialVisited = new Set<string>();
    initialVisited.add(`${gen.spawnRoom.x},${gen.spawnRoom.z}`);
    setVisitedRooms(initialVisited);

    setGameState('playing');
    // ponytail: synchronously request lock on direct user start gesture
    controlsRef.current?.requestLock();
  };

  // Switch level directly from in-game menu or exit portal without disposing canvas
  const handleSwitchLevel = (targetLevel: number) => {
    const chosenLevel = Math.max(0, Math.min(4, targetLevel));
    setCurrentLevel(chosenLevel);
    currentLevelRef.current = chosenLevel;
    AudioEngine.setLevelAmbiance(chosenLevel);
    AudioEngine.playDoor('open');

    const currentSeed = labyrinth?.seed || 'LIMINAL-000000';
    const nextGen = LabyrinthGenerator.generate(currentSeed, chosenLevel);
    labyrinthRef.current = nextGen;
    setLabyrinth(nextGen);

    anchorsCollectedRef.current = 0;
    setAnchorsCollected(0);

    const newVisited = new Set<string>();
    newVisited.add(`${nextGen.spawnRoom.x},${nextGen.spawnRoom.z}`);
    setVisitedRooms(newVisited);

    setIsSettingsOpen(false);
    triggerToast(`SHIFTING SECTOR // ${nextGen.levelTitle}...`, 5000);
    controlsRef.current?.requestLock();
  };

  // Sync difficulty dynamically
  useEffect(() => {
    if (entityRef.current) {
      entityRef.current.setDifficulty(settings.difficulty);
    }
  }, [settings.difficulty]);

  // Mount or Update 3D Scene (Single persistent canvas & controls instance)
  useEffect(() => {
    if (gameState !== 'playing' || !labyrinth || !canvasContainerRef.current) return;

    if (!worldRef.current) {
      canvasContainerRef.current.innerHTML = '';
      const world = new LiminalWorld(canvasContainerRef.current);
      world.buildLabyrinth(labyrinth);
      worldRef.current = world;

      const controls = new FPSControls(world.camera, world.renderer.domElement, {
        getGroundHeight: (x, z) => world.getGroundHeight(x, z),
        onToggleFlashlight: () => {
          const state = world.toggleFlashlight();
          setFlashlightOn(state);
        },
        onInteract: () => {
          handleInteractRef.current();
        },
        onFootstep: (isSprinting) => {
          const rx = Math.round(world.camera.position.x / world.roomSize);
          const rz = Math.round(world.camera.position.z / world.roomSize);
          const lab = labyrinthRef.current;
          const room = lab?.rooms.find((r) => r.x === rx && r.z === rz);
          let surface: 'carpet' | 'tile' | 'water' | 'metal' = 'carpet';
          if (room?.biome === 'poolroom') {
            surface = 'water';
            world.emitWaterRipple(world.camera.position.x, world.camera.position.z);
          } else if (room?.biome === 'sublevel_red') {
            surface = 'metal';
          } else if (room?.biome === 'archive') {
            surface = 'tile';
          }
          AudioEngine.playFootstep(surface, isSprinting);
        },
        onOpenSettings: () => {
          setIsSettingsOpen(true);
        },
        onToggleMinimap: () => {
          setIsMinimapOpen((prev) => !prev);
        },
      });
      controls.sensitivity = settings.mouseSensitivity;
      controls.bobIntensity = settings.headBobIntensity;
      controlsRef.current = controls;

      const entity = new LiminalEntityAI(world.scene);
      if (labyrinth.level === 0) {
        entity.isActive = false;
        entity.mesh.position.set(999, -999, 999);
      } else {
        const farRoom = labyrinth.rooms[Math.floor(labyrinth.rooms.length / 2)];
        entity.spawn(farRoom, world.roomSize, settings.difficulty);
      }
      entityRef.current = entity;

      let lastTime = performance.now();

      const gameLoop = (now: number) => {
        const delta = Math.min((now - lastTime) / 1000, 0.1);
        lastTime = now;

        if (!isSettingsOpen) {
          const currentLvl = currentLevelRef.current;
          if (currentLvl === 2) {
            controls.speedMultiplier = 0.65; // Slowness from wading in water
          } else {
            controls.speedMultiplier = 1.0;
          }

          controls.update(delta, (pos) => world.isPositionValid(pos));
          world.update(delta);

          const px = world.camera.position.x;
          const pz = world.camera.position.z;
          const rx = Math.round(px / world.roomSize);
          const rz = Math.round(pz / world.roomSize);

          // Update visited rooms only on room boundaries (avoids 60Hz React state queue spam)
          if (rx !== lastRoomCoordsRef.current.rx || rz !== lastRoomCoordsRef.current.rz) {
            lastRoomCoordsRef.current = { rx, rz };
            const roomKey = `${rx},${rz}`;
            setVisitedRooms((prev) => {
              if (!prev.has(roomKey)) {
                const next = new Set(prev);
                next.add(roomKey);
                return next;
              }
              return prev;
            });
          }

          // Camera heading using zero-allocation scratch vector
          world.camera.getWorldDirection(_scratchCamDir);
          const headingDeg = Math.atan2(_scratchCamDir.x, -_scratchCamDir.z) * (180 / Math.PI);

          // Throttled UI state updates (~12Hz / 80ms interval) for Minimap, Angle & Battery HUD
          // Keeps React virtual DOM diffing minimal and preserves silky smooth 60 FPS WebGL thread
          uiThrottleTimerRef.current += delta;
          if (uiThrottleTimerRef.current >= 0.08) {
            uiThrottleTimerRef.current = 0;
            setPlayerPos({ x: px, z: pz });
            setPlayerAngle(headingDeg);
            setBatteryLevel(world.batteryLevel);
            setFlashlightOn(world.flashlightOn);
          }

          // Selective Interaction Target Dispatch: only trigger re-render if target actually changed
          const target = world.checkInteraction();
          interactionTargetRef.current = target;
          setInteractionTarget((prev) => {
            if (!prev && !target) return prev;
            if (
              prev &&
              target &&
              prev.type === target.type &&
              prev.prompt === target.prompt &&
              prev.item?.id === target.item?.id
            ) {
              return prev;
            }
            return target;
          });

          if (labyrinth.level === 0) {
            AudioEngine.updateProximityStatic(0);
          } else {
            randomHeartbeatTimerRef.current -= delta;
            if (randomHeartbeatTimerRef.current <= 0) {
              randomHeartbeatTimerRef.current = 22 + Math.random() * 26;
              AudioEngine.triggerParanoiaHeartbeatBurst(Math.floor(3 + Math.random() * 3));
            }

            entity.update(
              delta,
              world.camera.position,
              world.flashlightOn,
              controls.isSprinting,
              () => {
                controls.unlock();
                setGameState('jumpscare');
              }
            );
          }
        }

        animFrameRef.current = requestAnimationFrame(gameLoop);
      };

      animFrameRef.current = requestAnimationFrame(gameLoop);
    } else {
      // ponytail: level transition without recreating canvas/controls/webgl context
      worldRef.current.loadLevel(labyrinth);
      const spawnX = labyrinth.spawnRoom.x * worldRef.current.roomSize;
      const spawnZ = labyrinth.spawnRoom.z * worldRef.current.roomSize;
      const spawnY = worldRef.current.getGroundHeight(spawnX, spawnZ);
      controlsRef.current?.resetPosition(new THREE.Vector3(spawnX, 1.6 + spawnY, spawnZ));

      if (labyrinth.level === 0) {
        if (entityRef.current) {
          entityRef.current.isActive = false;
          entityRef.current.mesh.position.set(999, -999, 999);
        }
      } else {
        const farRoom = labyrinth.rooms[Math.floor(labyrinth.rooms.length / 2)];
        entityRef.current?.spawn(farRoom, worldRef.current.roomSize, settings.difficulty);
      }
    }

    return () => {
      if (gameState !== 'playing') {
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        controlsRef.current?.dispose();
        controlsRef.current = null;
        worldRef.current?.dispose();
        worldRef.current = null;
        entityRef.current = null;
      }
    };
  }, [gameState, labyrinth]);

  // Handle Player Interaction
  const handleInteract = () => {
    if (!worldRef.current) return;
    const target = worldRef.current.checkInteraction() || interactionTargetRef.current;
    if (!target) return;

    if (target.type === 'anchor' && target.item) {
      worldRef.current.removeItem(target.item);
      anchorsCollectedRef.current += 1;
      const count = anchorsCollectedRef.current;
      setAnchorsCollected(count);
      entityRef.current?.setAnchors(count); // Gradual difficulty escalation!
      AudioEngine.playPickup();

      if (count >= 3) {
        triggerToast('ALL 3 REALITY ANCHORS SECURED! AIRLOCK UNSEALED // PROCEED TO EXIT!', 6000);
      } else {
        triggerToast(`REALITY ANCHOR RECOVERED // [${count}/3] SECURED`, 3500);
      }

      interactionTargetRef.current = null;
      setInteractionTarget(null);
    } else if (target.type === 'battery' && target.item) {
      worldRef.current.removeItem(target.item);
      worldRef.current.addBattery(45);
      setBatteryLevel(worldRef.current.batteryLevel);
      AudioEngine.playPickup();
      triggerToast('+45% FLASHLIGHT BATTERY RESTORED', 2500);
      interactionTargetRef.current = null;
      setInteractionTarget(null);
    } else if (target.type === 'note' && target.item) {
      // Seamless note reading: DO NOT unlock cursor! Player can keep moving freely
      if (inspectTimerRef.current) clearTimeout(inspectTimerRef.current);
      setActiveInspectItem(target.item);
      AudioEngine.playPickup();
      inspectTimerRef.current = window.setTimeout(() => {
        setActiveInspectItem(null);
      }, 7000);
    } else if (target.type === 'phone' && target.item) {
      // Seamless phone recording: DO NOT unlock cursor!
      if (inspectTimerRef.current) clearTimeout(inspectTimerRef.current);
      AudioEngine.playRotaryPhone();
      setActiveInspectItem({
        id: 'phone_call',
        type: 'phone',
        name: 'The Static Voice',
        description:
          '...do not let the fluorescent lights turn off... when the hum drops, it crawls along the ceiling... find the 3 anchors... hurry...',
        roomX: 0,
        roomZ: 0,
        localPos: [0, 0, 0],
      });
      inspectTimerRef.current = window.setTimeout(() => {
        setActiveInspectItem(null);
      }, 8500);
    } else if (target.type === 'exit') {
      const activeLvl = currentLevelRef.current;
      if (activeLvl === 0) {
        // Direct transition from Level 0 Dreamcore Sanctuary to Level 1 Yellow Halls
        const nextLevel = 1;
        setCurrentLevel(nextLevel);
        currentLevelRef.current = nextLevel;
        AudioEngine.setLevelAmbiance(nextLevel);
        AudioEngine.playDoor('open');
        triggerToast('STEPPED THROUGH THE THRESHOLD // ENTERING LEVEL 1: THE YELLOW HALLS...', 6000);

        const currentSeed = labyrinthRef.current?.seed || 'LIMINAL-000000';
        const nextGen = LabyrinthGenerator.generate(currentSeed, nextLevel);
        labyrinthRef.current = nextGen;
        setLabyrinth(nextGen);

        anchorsCollectedRef.current = 0;
        setAnchorsCollected(0);

        const newVisited = new Set<string>();
        newVisited.add(`${nextGen.spawnRoom.x},${nextGen.spawnRoom.z}`);
        setVisitedRooms(newVisited);

        interactionTargetRef.current = null;
        setInteractionTarget(null);
        return;
      }

      const collected = anchorsCollectedRef.current;
      if (collected >= 3) {
        if (activeLvl < 4) {
          // Advance to the Next Level!
          const nextLevel = activeLvl + 1;
          setCurrentLevel(nextLevel);
          currentLevelRef.current = nextLevel;
          AudioEngine.setLevelAmbiance(nextLevel);
          AudioEngine.playDoor('open');

          const nextLevelNames = [
            'LEVEL 1: THE YELLOW HALLS',
            'LEVEL 2: SUBLIMITY POOLROOMS',
            'LEVEL 3: ENDLESS ARCHIVES',
            'LEVEL 4: MACHINE SUB-LEVEL',
          ];
          triggerToast(`AIRLOCK BREACHED // DESCENDING INTO ${nextLevelNames[nextLevel - 1]}...`, 6000);

          // Generate next level layout
          const currentSeed = labyrinthRef.current?.seed || 'LIMINAL-000000';
          const nextGen = LabyrinthGenerator.generate(currentSeed, nextLevel);
          labyrinthRef.current = nextGen;
          setLabyrinth(nextGen);

          // Reset anchors for the new level
          anchorsCollectedRef.current = 0;
          setAnchorsCollected(0);

          // Reset visited rooms to new spawn room
          const newVisited = new Set<string>();
          newVisited.add(`${nextGen.spawnRoom.x},${nextGen.spawnRoom.z}`);
          setVisitedRooms(newVisited);

          interactionTargetRef.current = null;
          setInteractionTarget(null);
        } else {
          // Ultimate Escape after conquering all 4 Levels!
          controlsRef.current?.unlock();
          const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
          setTimeElapsed(elapsed);
          setIsVictory(true);
          setGameState('gameover');
        }
      } else {
        // Non-blocking HUD toast alert: camera rotation is NEVER interrupted!
        triggerToast(`AIRLOCK SEALED // NEED ${3 - collected} MORE ANCHOR(S) (${collected}/3)`);
      }
    }
  };
  handleInteractRef.current = handleInteract;

  const handleJumpscareComplete = () => {
    controlsRef.current?.unlock();
    const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
    setTimeElapsed(elapsed);
    setIsVictory(false);
    setGameState('gameover');
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-black select-none">
      {/* 3D WebGL Canvas Viewport */}
      <div
        ref={canvasContainerRef}
        onClick={() => {
          if (gameState === 'playing' && !isSettingsOpen && !controlsRef.current?.isLocked) {
            controlsRef.current?.requestLock();
          }
        }}
        className={`w-full h-full ${
          gameState === 'playing' ? 'cursor-crosshair pointer-events-auto' : 'pointer-events-none'
        }`}
      />

      {/* Retro Analog CRT & VHS Scanline Overlays (Toggled in Settings) */}
      {settings.enableCRTShader && (
        <>
          <div className="crt-overlay" />
          <div className="film-grain" />
        </>
      )}

      {/* Start Screen */}
      {gameState === 'start' && <StartScreen onStartGame={handleStartGame} />}

      {/* 1990s VHS Tape / VCR Camcorder OSD & Tracking Overlay */}
      {gameState === 'playing' && (
        <VHSOsdOverlay
          isPaused={isSettingsOpen}
          intensity={settings.vhsIntensity || 'full'}
          levelTitle={labyrinth?.levelTitle}
        />
      )}

      {/* In-Game HUD */}
      {gameState === 'playing' && (
        <>
          <HUD
            batteryLevel={batteryLevel}
            flashlightOn={flashlightOn}
            anchorsCollected={anchorsCollected}
            totalAnchors={3}
            interactionTarget={interactionTarget}
            activeInspectItem={activeInspectItem}
            hudToast={hudToast}
            vhsActive={settings.vhsIntensity !== 'off'}
            onCloseInspect={() => setActiveInspectItem(null)}
            onOpenSettings={() => {
              controlsRef.current?.unlock();
              setIsSettingsOpen(true);
            }}
            onToggleFlashlight={() => {
              if (worldRef.current) {
                const state = worldRef.current.toggleFlashlight();
                setFlashlightOn(state);
              }
            }}
            onInteract={handleInteract}
            onJoystickMove={(x, y) => controlsRef.current?.setJoystickVector(x, y)}
            onTouchLook={(dx, dy) => controlsRef.current?.handleTouchLook(dx, dy)}
          />

          {/* Procedural Labyrinth Radar / Minimap */}
          <Minimap
            labyrinth={labyrinth}
            playerPos={playerPos}
            playerAngle={playerAngle}
            visitedRooms={visitedRooms}
            isOpen={isMinimapOpen}
            onToggle={() => setIsMinimapOpen((p) => !p)}
            roomSize={worldRef.current?.roomSize || 10}
          />
        </>
      )}

      {/* Settings & In-Game Pause Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => {
          setIsSettingsOpen(false);
          controlsRef.current?.requestLock();
        }}
        onRestart={() => {
          setIsSettingsOpen(false);
          if (labyrinth) {
            handleStartGame(labyrinth.seed, currentLevel);
          }
        }}
        onSwitchLevel={handleSwitchLevel}
        onMainMenu={() => {
          setIsSettingsOpen(false);
          controlsRef.current?.unlock();
          if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
          if (worldRef.current) {
            worldRef.current.dispose();
            worldRef.current = null;
          }
          if (controlsRef.current) {
            controlsRef.current.dispose();
            controlsRef.current = null;
          }
          setGameState('start');
        }}
        currentLevel={currentLevel}
        levelTitle={labyrinth?.levelTitle}
        seed={labyrinth?.seed}
      />

      {/* Jumpscare or Atmospheric Fade Modal */}
      <JumpscareModal
        isOpen={gameState === 'jumpscare'}
        onComplete={handleJumpscareComplete}
      />

      {/* Game Over / Victory Screen */}
      {gameState === 'gameover' && (
        <GameOverScreen
          isVictory={isVictory}
          timeElapsed={timeElapsed}
          anchorsCollected={anchorsCollected}
          totalAnchors={3}
          seed={labyrinth?.seed || 'LIMINAL-000000'}
          onRestart={() => {
            controlsRef.current?.unlock();
            setGameState('start');
          }}
        />
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <SettingsProvider>
      <GameContainer />
    </SettingsProvider>
  );
};

export default App;
