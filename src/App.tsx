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

type GameState = 'start' | 'playing' | 'jumpscare' | 'gameover';

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
    }
  }, [settings.mouseSensitivity]);

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
    AudioEngine.setLevelAmbiance(chosenLevel);

    const gen = LabyrinthGenerator.generate(seed, chosenLevel);
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

    // Seamless auto-engage pointer lock directly on user start gesture
    setTimeout(() => {
      canvasContainerRef.current?.requestPointerLock?.();
    }, 50);
  };

  // Mount 3D Scene when entering 'playing'
  useEffect(() => {
    if (gameState !== 'playing' || !labyrinth || !canvasContainerRef.current) return;

    if (worldRef.current) {
      worldRef.current.dispose();
      canvasContainerRef.current.innerHTML = '';
    }

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
        handleInteract();
      },
      onFootstep: (isSprinting) => {
        // Detect exact room biome under player for realistic dynamic audio
        const rx = Math.round(world.camera.position.x / world.roomSize);
        const rz = Math.round(world.camera.position.z / world.roomSize);
        const room = labyrinth?.rooms.find((r) => r.x === rx && r.z === rz);
        let surface: 'carpet' | 'tile' | 'water' | 'metal' = 'carpet';
        if (room?.biome === 'poolroom') surface = 'water';
        else if (room?.biome === 'sublevel_red') surface = 'metal';
        else if (room?.biome === 'archive') surface = 'tile';
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
    controlsRef.current = controls;

    const entity = new LiminalEntityAI(world.scene);
    if (labyrinth.level === 0) {
      // Level 0 Sanctuary is safe zone: entity completely dormant
      entity.isActive = false;
      entity.mesh.position.set(999, -999, 999);
    } else {
      // Spawn entity in far room with the selected difficulty
      const farRoom = labyrinth.rooms[Math.floor(labyrinth.rooms.length / 2)];
      entity.spawn(farRoom, world.roomSize, settings.difficulty);
    }
    entityRef.current = entity;

    let lastTime = performance.now();

    const gameLoop = (now: number) => {
      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      if (!isSettingsOpen) {
        controls.update(delta, (pos) => world.isPositionValid(pos));
        world.update(delta);
        setBatteryLevel(world.batteryLevel);
        setFlashlightOn(world.flashlightOn);

        // Update player position and discovered rooms for Minimap
        const px = world.camera.position.x;
        const pz = world.camera.position.z;
        const rx = Math.round(px / world.roomSize);
        const rz = Math.round(pz / world.roomSize);
        const roomKey = `${rx},${rz}`;
        setVisitedRooms((prev) => {
          if (!prev.has(roomKey)) {
            const next = new Set(prev);
            next.add(roomKey);
            return next;
          }
          return prev;
        });
        setPlayerPos({ x: px, z: pz });

        // Calculate exact compass heading from 3D camera vector (North=0°, East=90°, South=180°, West=270°)
        const camDir = new THREE.Vector3();
        world.camera.getWorldDirection(camDir);
        const headingDeg = Math.atan2(camDir.x, -camDir.z) * (180 / Math.PI);
        setPlayerAngle(headingDeg);

        const target = world.checkInteraction();
        interactionTargetRef.current = target;
        setInteractionTarget(target);

        // Paranoia events and entity updates bypassed in Level 0 Sanctuary
        if (labyrinth.level === 0) {
          AudioEngine.updateProximityStatic(0);
        } else {
          // Random paranoia adrenaline heartbeat bursts (every 20 - 45s of solitude)
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

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      controls.dispose();
      world.dispose();
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
        triggerToast('ALL 3 REALITY ANCHORS SECURED // PROCEED TO EXIT AIRLOCK!', 6000);
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
      if (currentLevel === 0) {
        // Direct transition from Level 0 Dreamcore Sanctuary to Level 1 Yellow Halls
        const nextLevel = 1;
        setCurrentLevel(nextLevel);
        AudioEngine.setLevelAmbiance(nextLevel);
        AudioEngine.playDoor('open');
        triggerToast('STEPPED THROUGH THE THRESHOLD // ENTERING LEVEL 1: THE YELLOW HALLS...', 6000);

        const currentSeed = labyrinth?.seed || 'LIMINAL-000000';
        const nextGen = LabyrinthGenerator.generate(currentSeed, nextLevel);
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

      if (anchorsCollectedRef.current >= 3) {
        if (currentLevel < 4) {
          // Advance to the Next Level!
          const nextLevel = currentLevel + 1;
          setCurrentLevel(nextLevel);
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
          const currentSeed = labyrinth?.seed || 'LIMINAL-000000';
          const nextGen = LabyrinthGenerator.generate(currentSeed, nextLevel);
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
        triggerToast(`AIRLOCK SEALED // 3 REALITY ANCHORS REQUIRED (${anchorsCollectedRef.current}/3)`);
      }
    }
  };

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
          setTimeout(() => {
            canvasContainerRef.current?.requestPointerLock?.();
          }, 40);
        }}
        onRestart={() => {
          setIsSettingsOpen(false);
          if (labyrinth) {
            handleStartGame(labyrinth.seed, currentLevel);
          }
        }}
        onMainMenu={() => {
          setIsSettingsOpen(false);
          controlsRef.current?.unlock();
          if (worldRef.current) {
            worldRef.current.dispose();
            worldRef.current = null;
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
