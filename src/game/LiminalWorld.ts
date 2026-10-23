import * as THREE from 'three';
import { GeneratedLabyrinth, MapRoom, WorldItem } from '../procedural/LabyrinthGenerator';
import { TextureGenerator } from '../procedural/TextureGenerator';
import { SvgHorrorArt } from '../procedural/SvgHorrorArt';
import { AudioEngine } from '../audio/AudioEngine';

export interface InteractionTarget {
  type: 'anchor' | 'battery' | 'note' | 'phone' | 'exit';
  item?: WorldItem;
  prompt: string;
}

export class LiminalWorld {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  public flashlight: THREE.SpotLight;
  public flashlightTarget: THREE.Object3D;
  public flashlightOn: boolean = true;
  public batteryLevel: number = 100; // 0 to 100%
  public currentRoom: MapRoom | null = null;
  public interactables: THREE.Object3D[] = [];
  public itemDataMap: Map<THREE.Object3D, WorldItem> = new Map();
  public exitGateMesh: THREE.Group | null = null;

  public roomSize: number = 10; // 10x10 meters per room
  public roomHeight: number = 3.6;

  public roomGroups: Map<string, THREE.Group> = new Map();
  public roomBounds: Map<string, THREE.Box3> = new Map();
  public levelRootGroup: THREE.Group = new THREE.Group();
  private cameraFrustum = new THREE.Frustum();
  private pvMatrix = new THREE.Matrix4();
  private isMobile: boolean = false;

  private roomCullingList: { group: THREE.Group; bounds: THREE.Box3; centerX: number; centerZ: number }[] = [];
  
  // Fixed Global Light Pool: exactly 3 lights attached directly to root scene.
  // Zero shader recompilations forever regardless of room culling or level.
  private pooledCeilingLights: THREE.PointLight[] = [];
  private roomLightNodes: {
    x: number;
    y: number;
    z: number;
    color: THREE.Color;
    baseIntensity: number;
    intensity: number;
    isWorking: boolean;
    flicker: boolean;
    mesh: THREE.Mesh;
    distSq: number;
  }[] = [];
  private lightPoolTimer: number = 0;
  private static compareLightNodeDist(a: { distSq: number }, b: { distSq: number }) {
    return a.distSq - b.distSq;
  }

  private floatingRelics: THREE.Object3D[] = [];
  private dreamAnimatedObjects: { type: 'monolith' | 'cloud' | 'balloon' | 'swing' | 'motes'; obj: THREE.Object3D; userData: any }[] = [];

  // Level 2 Sublimity Water Ripple Mesh Pool
  private waterRipples: { mesh: THREE.Mesh; life: number; maxLife: number; active: boolean }[] = [];
  // Level 4 Machine Sub-Core dynamic steam fog state
  private steamHissTimer: number = 0;
  private currentLabyrinth: GeneratedLabyrinth | null = null;

  // Zero-allocation reusable scratch objects
  private static readonly _camForward = new THREE.Vector3();
  private static readonly _playerBox = new THREE.Box3();
  private static readonly _playerBoxMin = new THREE.Vector3();
  private static readonly _playerBoxMax = new THREE.Vector3();

  private raycaster = new THREE.Raycaster();
  private wallColliders: THREE.Box3[] = [];
  private spatialColliders: Map<string, THREE.Box3[]> = new Map();
  private currentLevel: number = 1;
  private textures: {
    yellowWall: THREE.CanvasTexture;
    poolTile: THREE.CanvasTexture;
    carpet: THREE.CanvasTexture;
    ceiling: THREE.CanvasTexture;
    rustConcrete: THREE.CanvasTexture;
    exitSign: THREE.CanvasTexture;
    archiveWall: THREE.CanvasTexture;
    hotelCarpet: THREE.CanvasTexture;
    industrialFloor: THREE.CanvasTexture;
    hazardWall: THREE.CanvasTexture;
    softGlow: THREE.CanvasTexture;
    poolPlasterCeiling: THREE.CanvasTexture;
    submergedPoolFloor: THREE.CanvasTexture;
    cofferedCeiling: THREE.CanvasTexture;
    corrugatedCeiling: THREE.CanvasTexture;
    dreamGrass: THREE.CanvasTexture;
    checkeredDream: THREE.CanvasTexture;
    realisticSky: THREE.CanvasTexture;
  };

  constructor(container: HTMLElement) {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);
    this.scene.fog = new THREE.FogExp2(0x000000, 0.09);
    this.scene.add(this.levelRootGroup);

    this.camera = new THREE.PerspectiveCamera(72, window.innerWidth / window.innerHeight, 0.1, 100);

    this.isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < 768;
    this.renderer = new THREE.WebGLRenderer({ antialias: !this.isMobile, powerPreference: 'high-performance' });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    // ponytail: mobile 1.0 pixel ratio saves millions of fragment ops; desktop capped at 1.25 for crisp 60fps
    this.renderer.setPixelRatio(this.isMobile ? 1.0 : Math.min(window.devicePixelRatio, 1.25));
    this.renderer.shadowMap.enabled = false;
    container.appendChild(this.renderer.domElement);

    // Procedural Textures - 5 Dedicated Level Texture Packs (Zero Repetition)
    this.textures = {
      yellowWall: TextureGenerator.createYellowWallpaperTexture(),
      poolTile: TextureGenerator.createPoolTileTexture(),
      carpet: TextureGenerator.createCarpetTexture(),
      ceiling: TextureGenerator.createCeilingTexture(),
      rustConcrete: TextureGenerator.createRustConcreteTexture(),
      exitSign: TextureGenerator.createExitSignTexture(),
      archiveWall: TextureGenerator.createArchiveWallTexture(),
      hotelCarpet: TextureGenerator.createHotelCarpetTexture(),
      industrialFloor: TextureGenerator.createIndustrialFloorTexture(),
      hazardWall: TextureGenerator.createHazardWallTexture(),
      softGlow: TextureGenerator.createSoftGlowTexture(),
      poolPlasterCeiling: TextureGenerator.createPoolPlasterCeilingTexture(),
      submergedPoolFloor: TextureGenerator.createSubmergedPoolFloorTexture(),
      cofferedCeiling: TextureGenerator.createCofferedCeilingTexture(),
      corrugatedCeiling: TextureGenerator.createCorrugatedCeilingTexture(),
      dreamGrass: TextureGenerator.createDreamcoreGrassTexture(),
      checkeredDream: TextureGenerator.createCheckeredDreamTexture(),
      realisticSky: TextureGenerator.createRealisticSkyTexture(),
    };

    // Survival Horror Flashlight (Deep beam + localized fill)
    this.flashlight = new THREE.SpotLight(0xfffaed, 5.5, 26, Math.PI / 4.6, 0.5, 1.4);
    this.flashlightTarget = new THREE.Object3D();
    this.scene.add(this.flashlightTarget);
    this.flashlight.target = this.flashlightTarget;
    this.scene.add(this.flashlight);

    // Faint atmospheric liminal ambient: allows player to vaguely perceive silhouettes in the dark
    const ambient = new THREE.AmbientLight(0x1a1e22, 0.16);
    this.scene.add(ambient);

    // Subtle near-field eye adaptation light: ensures walls and doorframes are faintly distinguishable
    const eyeGlow = new THREE.PointLight(0x28323a, 0.35, 5.0);
    this.camera.add(eyeGlow);
    this.scene.add(this.camera);

    // Fixed Global Light Pool (Attached to root scene, never culled, constant shader count)
    const maxPooled = 3;
    for (let i = 0; i < maxPooled; i++) {
      const pl = new THREE.PointLight(0xfff5d1, 0, 9.5, 2.0);
      pl.position.set(0, -999, 0);
      this.scene.add(pl);
      this.pooledCeilingLights.push(pl);
    }

    // Fixed Water Ripple Mesh Pool for Level 2 Sublimity Poolrooms
    const rippleGeo = new THREE.RingGeometry(0.1, 0.45, 24);
    rippleGeo.rotateX(-Math.PI / 2);
    for (let i = 0; i < 6; i++) {
      const mat = new THREE.MeshBasicMaterial({
        color: 0x67e8f9,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(rippleGeo, mat);
      mesh.visible = false;
      this.scene.add(mesh);
      this.waterRipples.push({ mesh, life: 0, maxLife: 1.2, active: false });
    }

    window.addEventListener('resize', this.onResize);
  }

  private onResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  };

  public toggleFlashlight(): boolean {
    if (this.batteryLevel <= 0) {
      this.flashlightOn = false;
      this.flashlight.intensity = 0;
      return false;
    }
    this.flashlightOn = !this.flashlightOn;
    this.flashlight.intensity = this.flashlightOn ? 6.0 : 0;
    AudioEngine.playFlashlightClick();
    return this.flashlightOn;
  }

  public addBattery(amount: number) {
    this.batteryLevel = Math.min(100, this.batteryLevel + amount);
    if (!this.flashlightOn && this.batteryLevel > 0) {
      this.flashlightOn = true;
      this.flashlight.intensity = 6.0;
    }
  }

  public getGroundHeight(x: number, z: number): number {
    if (this.currentLevel === 0) {
      // Nostalgic dreamcore rolling hills and scenic knolls
      const h1 = Math.sin(x * 0.08) * Math.cos(z * 0.08) * 2.2;
      const h2 = Math.sin(x * 0.16 + z * 0.12) * 0.8;
      const h3 = Math.cos(x * 0.04 - z * 0.05) * 1.0;
      return h1 + h2 + h3;
    }
    return 0;
  }

  public clearCurrentLevel() {
    while (this.levelRootGroup.children.length > 0) {
      const child = this.levelRootGroup.children[0];
      this.levelRootGroup.remove(child);
      child.traverse((obj: any) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m: any) => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
    }

    this.roomGroups.clear();
    this.roomBounds.clear();
    this.roomCullingList = [];
    this.roomLightNodes = [];
    for (let i = 0; i < this.pooledCeilingLights.length; i++) {
      this.pooledCeilingLights[i].intensity = 0;
      this.pooledCeilingLights[i].position.set(0, -999, 0);
    }
    this.floatingRelics = [];
    this.dreamAnimatedObjects = [];
    this.wallColliders = [];
    this.spatialColliders.clear();
    this.interactables = [];
    this.itemDataMap.clear();
    this.exitGateMesh = null;

    for (let i = 0; i < this.waterRipples.length; i++) {
      this.waterRipples[i].active = false;
      this.waterRipples[i].mesh.visible = false;
    }
  }

  public emitWaterRipple(x: number, z: number) {
    if (this.currentLevel !== 2) return;
    const ripple = this.waterRipples.find((r) => !r.active) || this.waterRipples[0];
    ripple.active = true;
    ripple.life = 0;
    ripple.mesh.position.set(x, 0.045, z);
    ripple.mesh.scale.set(0.3, 1, 0.3);
    (ripple.mesh.material as THREE.MeshBasicMaterial).opacity = 0.65;
    ripple.mesh.visible = true;
  }

  public loadLevel(labyrinth: GeneratedLabyrinth) {
    this.clearCurrentLevel();
    this.buildLabyrinth(labyrinth);
    try {
      this.renderer.compile(this.scene, this.camera);
    } catch {
      // Graceful fallback
    }
  }

  public buildLabyrinth(labyrinth: GeneratedLabyrinth) {
    this.currentLevel = labyrinth.level;
    this.currentLabyrinth = labyrinth;

    // --- LEVEL 0 // DREAMCORE SANCTUARY (PEACEFUL OPEN MEADOW & SAFE ZONE) ---
    if (labyrinth.level === 0) {
      this.buildDreamcoreSanctuary(labyrinth);
      return;
    }

    const half = this.roomSize / 2;

    // Distinct Volumetric Liminal Fog & Lighting per Level
    if (labyrinth.level === 2) {
      // Level 2: Sublimity Poolrooms (Cool turquoise sterile aquatic mist)
      this.scene.background = new THREE.Color(0x02161b);
      this.scene.fog = new THREE.FogExp2(0x02161b, 0.070);
    } else if (labyrinth.level === 3) {
      // Level 3: Endless Archive & Hotel (Sepia mahogany antique library fog)
      this.scene.background = new THREE.Color(0x110905);
      this.scene.fog = new THREE.FogExp2(0x110905, 0.075);
    } else if (labyrinth.level === 4) {
      // Level 4: Machine Core & Boiler (Ominous crimson industrial steam fog)
      this.scene.background = new THREE.Color(0x180503);
      this.scene.fog = new THREE.FogExp2(0x180503, 0.080);
    } else {
      // Level 1: Yellow Halls (Oppressive, warm mustard liminal Backrooms fog)
      this.scene.background = new THREE.Color(0x161306);
      this.scene.fog = new THREE.FogExp2(0x161306, 0.068);
    }

    // Set physically accurate texture tiling scales for Level 1
    if (labyrinth.level === 1) {
      this.textures.yellowWall.repeat.set(2, 1);
      this.textures.carpet.repeat.set(4, 4);
      this.textures.ceiling.repeat.set(4, 4);
    }

    // ponytail: shared material pool across all rooms avoids allocating hundreds of identical shaders
    const sharedMaterials = {
      poolroom: {
        wall: new THREE.MeshStandardMaterial({ map: this.textures.poolTile, roughness: 0.25 }),
        floor: new THREE.MeshStandardMaterial({ map: this.textures.submergedPoolFloor, roughness: 0.15 }),
        ceiling: new THREE.MeshStandardMaterial({ map: this.textures.poolPlasterCeiling, roughness: 0.4 }),
      },
      archive: {
        wall: new THREE.MeshStandardMaterial({ map: this.textures.archiveWall, roughness: 0.5 }),
        floor: new THREE.MeshStandardMaterial({ map: this.textures.hotelCarpet, roughness: 0.85 }),
        ceiling: new THREE.MeshStandardMaterial({ map: this.textures.cofferedCeiling, roughness: 0.6 }),
      },
      sublevel_red: {
        wall: new THREE.MeshStandardMaterial({ map: this.textures.hazardWall, roughness: 0.4, metalness: 0.5 }),
        floor: new THREE.MeshStandardMaterial({ map: this.textures.industrialFloor, roughness: 0.5, metalness: 0.7 }),
        ceiling: new THREE.MeshStandardMaterial({ map: this.textures.corrugatedCeiling, roughness: 0.7, metalness: 0.6 }),
      },
      mono_yellow: {
        wall: new THREE.MeshStandardMaterial({ map: this.textures.yellowWall, roughness: 0.75 }),
        floor: new THREE.MeshStandardMaterial({ map: this.textures.carpet, roughness: 0.95 }),
        ceiling: new THREE.MeshStandardMaterial({ map: this.textures.ceiling, roughness: 0.88 }),
      },
    };
    const sharedFloorGeo = new THREE.PlaneGeometry(this.roomSize, this.roomSize);

    labyrinth.rooms.forEach((room) => {
      const rx = room.x * this.roomSize;
      const rz = room.z * this.roomSize;

      // Create isolated Room Group for frustum & distance culling
      const roomGroup = new THREE.Group();
      this.roomGroups.set(`${room.x},${room.z}`, roomGroup);
      this.levelRootGroup.add(roomGroup);

      const min = new THREE.Vector3(rx - half, -0.5, rz - half);
      const max = new THREE.Vector3(rx + half, this.roomHeight + 0.5, rz + half);
      const bounds = new THREE.Box3(min, max);
      this.roomBounds.set(`${room.x},${room.z}`, bounds);
      this.roomCullingList.push({
        group: roomGroup,
        bounds,
        centerX: rx,
        centerZ: rz,
      });

      // Select floor, wall, and ceiling materials uniquely tailored per biome
      let mats = sharedMaterials.mono_yellow;
      let floorSurface: 'carpet' | 'tile' | 'water' | 'metal' = 'carpet';

      if (room.biome === 'poolroom') {
        mats = sharedMaterials.poolroom;
        floorSurface = 'water';
      } else if (room.biome === 'archive') {
        mats = sharedMaterials.archive;
        floorSurface = 'tile';
      } else if (room.biome === 'sublevel_red') {
        mats = sharedMaterials.sublevel_red;
        floorSurface = 'metal';
      }

      // Floor Plane
      const floor = new THREE.Mesh(sharedFloorGeo, mats.floor);
      floor.rotation.x = -Math.PI / 2;
      floor.position.set(rx, 0, rz);
      floor.userData = { surface: floorSurface };
      roomGroup.add(floor);

      // Water reflection overlay for poolroom
      if (room.biome === 'poolroom') {
        const waterGeo = new THREE.PlaneGeometry(this.roomSize * 0.9, this.roomSize * 0.9);
        const waterMat = new THREE.MeshStandardMaterial({
          color: 0x20c9d4,
          transparent: true,
          opacity: 0.35,
          roughness: 0.1,
          metalness: 0.8,
        });
        const water = new THREE.Mesh(waterGeo, waterMat);
        water.rotation.x = -Math.PI / 2;
        water.position.set(rx, 0.04, rz);
        roomGroup.add(water);
      }

      // Ceiling Plane
      const ceiling = new THREE.Mesh(sharedFloorGeo, mats.ceiling);
      ceiling.rotation.x = Math.PI / 2;
      ceiling.position.set(rx, this.roomHeight, rz);
      roomGroup.add(ceiling);

      // Ceiling Light Fixture (Fluorescent troffer fixture with luminescent glow)
      // Level 1: ~84% working fixtures humming in endless repetition, ~16% dead/shadowed
      const isWorkingLight = room.biome === 'exit_airlock' || (this.currentLevel === 1 ? Math.random() > 0.16 : Math.random() > 0.45);
      const fixtureEmissive = isWorkingLight ? new THREE.Color(room.lightColor) : new THREE.Color(0x18241b);

      const lightMat = new THREE.MeshStandardMaterial({
        color: isWorkingLight ? 0xffffff : 0x222222,
        emissive: fixtureEmissive,
        emissiveIntensity: isWorkingLight ? 2.5 : 0.2,
        roughness: 0.2,
      });

      // Commercial 2-tube fluorescent troffer fixture
      const lightMesh = new THREE.Mesh(
        new THREE.BoxGeometry(2.4, 0.08, 0.6),
        lightMat
      );
      lightMesh.position.set(rx, this.roomHeight - 0.04, rz);
      roomGroup.add(lightMesh);

      // Troffer steel frame border in Level 1
      if (this.currentLevel === 1) {
        const frameMat = new THREE.MeshStandardMaterial({ color: 0x5a5448, metalness: 0.5, roughness: 0.6 });
        const trofferFrame = new THREE.Mesh(new THREE.BoxGeometry(2.52, 0.04, 0.72), frameMat);
        trofferFrame.position.set(rx, this.roomHeight - 0.02, rz);
        roomGroup.add(trofferFrame);
      }

      // Soft Luminescent Light Halo underneath working fixtures
      if (isWorkingLight) {
        const halo = new THREE.Mesh(
          new THREE.PlaneGeometry(3.8, 2.4),
          new THREE.MeshBasicMaterial({
            map: this.textures.softGlow,
            color: new THREE.Color(room.lightColor),
            transparent: true,
            opacity: 0.35,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            side: THREE.DoubleSide,
          })
        );
        halo.rotation.x = Math.PI / 2;
        halo.position.set(rx, this.roomHeight - 0.08, rz);
        roomGroup.add(halo);
      }

      // Record ceiling fixture into roomLightNodes for the Fixed Global Light Pool
      // (NO PointLight added to roomGroup, preventing shader recompilation stalls)
      const lightCol = new THREE.Color(room.lightColor);
      const baseInt = isWorkingLight ? 1.15 : 0.0;
      this.roomLightNodes.push({
        x: rx,
        y: this.roomHeight - 0.4,
        z: rz,
        color: lightCol,
        baseIntensity: baseInt,
        intensity: baseInt,
        isWorking: isWorkingLight,
        flicker: isWorkingLight && room.hasLightFlicker,
        mesh: lightMesh,
        distSq: 0,
      });

      // --- 3D PROPS SPECIFIC TO EACH LEVEL (ZERO REPETITION) ---
      // Level 1: Monochromatic Empty Office Corridors (Mundane, repetitive, uncanny emptiness)
      if (room.biome === 'mono_yellow') {
        // Occasional blank duplex outlet plate or HVAC ceiling return grille (18% of rooms)
        const featureRoll = Math.random();
        if (featureRoll > 0.85) {
          const plateMat = new THREE.MeshStandardMaterial({ color: 0xc8be9c, roughness: 0.6 });
          const plate = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.18, 0.02), plateMat);
          plate.position.set(rx + half - 0.02, 0.45, rz + 1.2);
          roomGroup.add(plate);
        } else if (featureRoll < 0.12) {
          // Dark recessed HVAC ceiling vent grille
          const ventMat = new THREE.MeshStandardMaterial({ color: 0x484338, roughness: 0.7 });
          const vent = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.9), ventMat);
          vent.rotation.x = Math.PI / 2;
          vent.position.set(rx - 1.8, this.roomHeight - 0.01, rz + 1.8);
          roomGroup.add(vent);
        }
      }

      // Level 2: Sublimity Poolroom Tiled Columns & Stainless Pool Ladder
      if (room.pillarPositions) {
        const pillarGeo = new THREE.BoxGeometry(0.8, this.roomHeight, 0.8);
        room.pillarPositions.forEach(([px, pz]) => {
          const pillar = new THREE.Mesh(pillarGeo, mats.wall);
          pillar.position.set(rx + px, this.roomHeight / 2, rz + pz);
          roomGroup.add(pillar);

          const pBox = new THREE.Box3().setFromObject(pillar);
          this.wallColliders.push(pBox);
        });

        // Stainless steel pool ladder on wall
        const ladderMat = new THREE.MeshStandardMaterial({ color: 0xdde5ed, metalness: 0.95, roughness: 0.1 });
        const ladderRail1 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.2, 8), ladderMat);
        ladderRail1.position.set(rx - half + 0.15, 1.1, rz - 0.4);
        roomGroup.add(ladderRail1);
        const ladderRail2 = ladderRail1.clone();
        ladderRail2.position.set(rx - half + 0.15, 1.1, rz + 0.4);
        roomGroup.add(ladderRail2);
      }

      // Level 3: Archive Mahogany Bookcases & Shelves on Opposing Walls
      if (room.biome === 'archive') {
        const shelfMat = new THREE.MeshStandardMaterial({ map: this.textures.archiveWall, roughness: 0.5 });
        const shelf1 = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.8, 0.55), shelfMat);
        shelf1.position.set(rx - 3.4, 1.4, rz);
        roomGroup.add(shelf1);
        this.wallColliders.push(new THREE.Box3().setFromObject(shelf1));

        const shelf2 = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.8, 0.55), shelfMat);
        shelf2.position.set(rx + 3.4, 1.4, rz);
        roomGroup.add(shelf2);
        this.wallColliders.push(new THREE.Box3().setFromObject(shelf2));
      }

      // Level 4: Machine Sub-level Overhead Industrial Steam Pipes & Heavy Boiler
      if (room.biome === 'sublevel_red') {
        const pipeMat = new THREE.MeshStandardMaterial({ color: 0x3d170f, metalness: 0.8, roughness: 0.3 });
        const pipeGeo = new THREE.CylinderGeometry(0.18, 0.18, this.roomSize, 8);
        const pipe = new THREE.Mesh(pipeGeo, pipeMat);
        pipe.rotation.z = Math.PI / 2;
        pipe.position.set(rx, this.roomHeight - 0.45, rz - 1.5);
        roomGroup.add(pipe);

        const pipe2 = pipe.clone();
        pipe2.position.set(rx, this.roomHeight - 0.45, rz + 1.5);
        roomGroup.add(pipe2);

        // Cross pipe
        const pipeCross = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, this.roomSize, 8), pipeMat);
        pipeCross.rotation.x = Math.PI / 2;
        pipeCross.position.set(rx, this.roomHeight - 0.65, rz);
        roomGroup.add(pipeCross);

        // Industrial Steam Vent Nozzle & Localized Hot Steam Plume
        if (room.hasSteamVent) {
          const ventNozzle = new THREE.Mesh(
            new THREE.CylinderGeometry(0.25, 0.35, 0.4, 8),
            new THREE.MeshStandardMaterial({ color: 0x241614, metalness: 0.9, roughness: 0.2 })
          );
          ventNozzle.position.set(rx, this.roomHeight - 0.75, rz);
          roomGroup.add(ventNozzle);

          const steamMat = new THREE.MeshBasicMaterial({
            map: this.textures.softGlow,
            color: 0xff4433,
            transparent: true,
            opacity: 0.38,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            side: THREE.DoubleSide,
          });
          const steamPlume = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 2.6), steamMat);
          steamPlume.position.set(rx, this.roomHeight - 1.5, rz);
          roomGroup.add(steamPlume);
        }

        // Heavy industrial boiler drum in select rooms
        if (Math.random() > 0.4) {
          const boilerGeo = new THREE.CylinderGeometry(1.1, 1.1, 2.5, 12);
          const boilerMat = new THREE.MeshStandardMaterial({ color: 0x1f1a18, metalness: 0.85, roughness: 0.3 });
          const boiler = new THREE.Mesh(boilerGeo, boilerMat);
          boiler.position.set(rx - 2.8, 1.25, rz - 2.8);
          roomGroup.add(boiler);
          this.wallColliders.push(new THREE.Box3().setFromObject(boiler));

          // Glowing red firebox grate at bottom of boiler
          const fireMat = new THREE.MeshStandardMaterial({ color: 0xff3300, emissive: 0xff2200, emissiveIntensity: 2.8 });
          const fireGrate = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.4, 0.2), fireMat);
          fireGrate.position.set(rx - 2.8, 0.3, rz - 1.8);
          roomGroup.add(fireGrate);
        }
      }

      // Atmospheric Environmental Luminescence (Pure Emissive Meshes - Zero PointLight Overkill)
      if (room.biome === 'poolroom') {
        // Submerged cyan underwater drain
        const drainMesh = new THREE.Mesh(
          new THREE.CircleGeometry(0.35, 16),
          new THREE.MeshStandardMaterial({ color: 0x00f5d4, emissive: 0x00f5d4, emissiveIntensity: 2.8 })
        );
        drainMesh.rotation.x = -Math.PI / 2;
        drainMesh.position.set(rx, 0.06, rz);
        roomGroup.add(drainMesh);

        // 4 underwater corner perimeter luminescent pods
        const offsets = [[-3, -3], [3, -3], [-3, 3], [3, 3]];
        offsets.forEach(([ox, oz]) => {
          const pod = new THREE.Mesh(
            new THREE.CircleGeometry(0.18, 12),
            new THREE.MeshStandardMaterial({ color: 0x00ffff, emissive: 0x00e5ff, emissiveIntensity: 2.8 })
          );
          pod.rotation.x = -Math.PI / 2;
          pod.position.set(rx + ox, 0.05, rz + oz);
          roomGroup.add(pod);
        });
      } else if (room.biome === 'exit_airlock') {
        // Emergency exit warning glow signs
        const exitBeacon = new THREE.Mesh(
          new THREE.BoxGeometry(0.4, 0.2, 0.15),
          new THREE.MeshStandardMaterial({ color: 0xff2222, emissive: 0xff1122, emissiveIntensity: 3.5 })
        );
        exitBeacon.position.set(rx, 2.9, rz - 4.2);
        roomGroup.add(exitBeacon);
      } else if (room.biome === 'archive') {
        // Warm glowing brass wall sconces on east & west walls
        [-half + 0.15, half - 0.15].forEach((wx, i) => {
          const sconceMesh = new THREE.Mesh(
            new THREE.BoxGeometry(0.12, 0.25, 0.12),
            new THREE.MeshStandardMaterial({ color: 0xffaa44, emissive: 0xff8800, emissiveIntensity: 3.2 })
          );
          sconceMesh.position.set(rx + wx, 2.1, rz + (i === 0 ? -1.5 : 1.5));
          roomGroup.add(sconceMesh);
        });
      } else if (room.biome === 'sublevel_red') {
        // Dual industrial hazard beacon lamps & gauge indicators
        const lampMat = new THREE.MeshStandardMaterial({
          color: 0xff1100,
          emissive: 0xff2200,
          emissiveIntensity: 3.5,
        });
        const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.28, 0.14), lampMat);
        lamp.position.set(rx + half - 0.12, 2.3, rz);
        roomGroup.add(lamp);

        // Secondary amber warning beacon
        const amberBeacon = new THREE.Mesh(
          new THREE.BoxGeometry(0.14, 0.22, 0.14),
          new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xf59e0b, emissiveIntensity: 3.2 })
        );
        amberBeacon.position.set(rx - half + 0.18, 1.8, rz - 2.0);
        roomGroup.add(amberBeacon);
      } else {
        // Yellow Halls: Pure classic Backrooms walls (Zero sci-fi LEDs or modern indicator lights)
        if (Math.random() > 0.88) {
          // Occasional dull grey utility junction box with no LEDs
          const boxMat = new THREE.MeshStandardMaterial({ color: 0x3a362c, roughness: 0.7 });
          const boxMesh = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.28, 0.08), boxMat);
          boxMesh.position.set(rx + half - 0.04, 1.6, rz);
          roomGroup.add(boxMesh);
        }
      }

      // Build 4 Walls (with doorways for connected rooms)
      const rKey = `${room.x},${room.z}`;
      this.buildWall(rx, rz, 'north', room.doors.some((d) => d.direction === 'north'), mats.wall, roomGroup, rKey);
      this.buildWall(rx, rz, 'south', room.doors.some((d) => d.direction === 'south'), mats.wall, roomGroup, rKey);
      this.buildWall(rx, rz, 'east', room.doors.some((d) => d.direction === 'east'), mats.wall, roomGroup, rKey);
      this.buildWall(rx, rz, 'west', room.doors.some((d) => d.direction === 'west'), mats.wall, roomGroup, rKey);

      // Wall picture frames / art (Poolrooms polaroids, Sublevel diagrams, Archive portraits; NEVER in Level 1 Backrooms)
      if (room.artSeed !== undefined && room.biome !== 'exit_airlock' && room.biome !== 'mono_yellow') {
        const artTexture = SvgHorrorArt.createArtTexture(
          room.artSeed,
          room.biome === 'sublevel_red' ? 'diagram' : room.biome === 'poolroom' ? 'polaroid' : 'portrait'
        );
        const frameMesh = new THREE.Mesh(
          new THREE.PlaneGeometry(1.2, 1.6),
          new THREE.MeshStandardMaterial({ map: artTexture, roughness: 0.5 })
        );
        frameMesh.position.set(rx, 1.8, rz - half + 0.05);
        roomGroup.add(frameMesh);
      }

      // Spawn 3D Items in Room
      room.items.forEach((item) => {
        this.spawnItemMesh(item, rx, rz, roomGroup);
      });

      // Special Exit Airlock Gate (Mounted on a solid wall with no doorway)
      if (room.biome === 'exit_airlock') {
        this.buildExitGate(rx, rz, room, roomGroup);
      }
    });

    // Set player starting position in spawn room
    const spawnX = labyrinth.spawnRoom.x * this.roomSize;
    const spawnZ = labyrinth.spawnRoom.z * this.roomSize;
    this.camera.position.set(spawnX, 1.6, spawnZ);

    // Shader Pre-warming: Compile all materials upfront to eliminate in-game stalls
    try {
      this.renderer.compile(this.scene, this.camera);
    } catch {
      // Graceful fallback
    }
  }

  // --- 100% PROCEDURAL DREAMCORE SANCTUARY (LEVEL 0 SAFE ZONE) ---
  private buildDreamcoreSanctuary(labyrinth: GeneratedLabyrinth) {
    // 1. Realistic Atmospheric Sky Dome with Natural Sky Gradient & Golden Horizon Glow
    this.scene.background = this.textures.realisticSky;
    this.scene.fog = new THREE.FogExp2(0xe8edfb, 0.0045); // Expansive soft dreamlike horizon haze

    // 360° Sky Dome Mesh with realistic atmospheric Rayleigh gradient (expanded from 88m to 130m)
    const skyGeo = new THREE.SphereGeometry(130, 32, 24);
    const skyMat = new THREE.MeshBasicMaterial({
      map: this.textures.realisticSky,
      side: THREE.BackSide,
      depthWrite: false,
    });
    const skyDome = new THREE.Mesh(skyGeo, skyMat);
    skyDome.position.set(28, 0, 28);
    this.levelRootGroup.add(skyDome);

    // Warm golden directional sunlight matching the solar angle
    const sun = new THREE.DirectionalLight(0xfff8eb, 2.8);
    sun.position.set(65, 45, 35);
    this.levelRootGroup.add(sun);

    // Radiant natural celestial ambient lighting
    const dreamAmbient = new THREE.AmbientLight(0xfffbf0, 1.25);
    this.levelRootGroup.add(dreamAmbient);

    // Natural sky & meadow bounce light (soft lavender-sky to sage-green ground)
    const hemiLight = new THREE.HemisphereLight(0xa5b4fc, 0x86efac, 0.85);
    this.levelRootGroup.add(hemiLight);

    // 2. Fluffy White Dream Clouds drifting peacefully across the sky
    this.spawnDreamClouds();

    // 3. Floating Dandelion / Dream Dust Motes drifting over the rolling meadow
    this.spawnDreamMotes();

    // 4. Elevated Continuous Rolling Meadow Terrain (Expanded from 90m to 140m)
    const terrainSize = 140;
    const terrainGeo = new THREE.PlaneGeometry(terrainSize, terrainSize, 96, 96);
    terrainGeo.rotateX(-Math.PI / 2);
    // Center terrain over the 7x7 room expanse (center at 28, 28)
    terrainGeo.translate(28, 0, 28);

    const pos = terrainGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vz = pos.getZ(i);
      pos.setY(i, this.getGroundHeight(vx, vz));
    }
    terrainGeo.computeVertexNormals();

    const grassTex = this.textures.dreamGrass;
    grassTex.repeat.set(24, 24);
    const terrainMat = new THREE.MeshStandardMaterial({
      map: grassTex,
      roughness: 0.88,
      metalness: 0.02,
    });
    const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
    terrainMesh.receiveShadow = true;
    terrainMesh.userData = { surface: 'carpet' }; // soft grass footsteps
    this.levelRootGroup.add(terrainMesh);

    // 5. Solitary White Gateway Door on Eastern Summit Knoll
    const exitX = labyrinth.exitRoom.x * this.roomSize;
    const exitZ = labyrinth.exitRoom.z * this.roomSize;
    const exitGroundY = this.getGroundHeight(exitX, exitZ);
    this.buildDreamcoreGatewayDoor(exitX, exitZ, exitGroundY);

    // 6. Surreal Dreamcore Props (Floating Monoliths, Doric Columns, Solitary Bench & Orb Lamp)
    this.spawnDreamcoreProps();

    // 7. Spawn Lore Items (Nostalgic Postcards / Notes)
    labyrinth.rooms.forEach((room) => {
      const rx = room.x * this.roomSize;
      const rz = room.z * this.roomSize;
      room.items.forEach((item) => {
        this.spawnItemMesh(item, rx, rz);
      });
    });

    // 8. Set Player Spawn on Elevated Ground in Starting Meadow
    const spawnX = labyrinth.spawnRoom.x * this.roomSize;
    const spawnZ = labyrinth.spawnRoom.z * this.roomSize;
    const spawnY = this.getGroundHeight(spawnX, spawnZ);
    this.camera.position.set(spawnX, 1.6 + spawnY, spawnZ);
  }

  // Floating Dandelion / Dream Dust Motes drifting over the rolling meadow
  private spawnDreamMotes() {
    const particleCount = 380;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const x = Math.random() * 120 - 30;
      const z = Math.random() * 120 - 30;
      const ground = this.getGroundHeight(x, z);
      const y = ground + 0.6 + Math.random() * 9.5;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Circular particle texture via tiny 32x32 off-screen canvas
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.35, 'rgba(254, 243, 199, 0.85)');
    grad.addColorStop(0.7, 'rgba(253, 230, 138, 0.3)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 32, 32);
    const moteTex = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
      color: 0xfffbeb,
      size: 0.45,
      map: moteTex,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const motes = new THREE.Points(geometry, material);
    this.levelRootGroup.add(motes);
    this.dreamAnimatedObjects.push({
      type: 'motes',
      obj: motes,
      userData: {},
    });
  }

  // Soft dream 3D clouds floating peacefully across the sky
  private spawnDreamClouds() {
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xfffdf5,
      roughness: 0.6,
      emissive: 0xfffbeb,
      emissiveIntensity: 0.15,
    });

    const cloudPositions = [
      { x: 5, y: 32, z: 10, scale: 3.5 },
      { x: 25, y: 38, z: 2, scale: 4.2 },
      { x: 45, y: 30, z: 15, scale: 3.8 },
      { x: 12, y: 34, z: 32, scale: 3.0 },
      { x: 38, y: 40, z: 36, scale: 4.5 },
      { x: 20, y: 33, z: 50, scale: 3.6 },
      { x: 50, y: 36, z: 52, scale: 4.0 },
      { x: -5, y: 32, z: 25, scale: 3.4 },
    ];

    cloudPositions.forEach((cp, idx) => {
      const cloudGroup = new THREE.Group();
      cloudGroup.position.set(cp.x, cp.y, cp.z);

      const offsets = [
        [0, 0, 0, 1.0],
        [-0.8, -0.2, 0.2, 0.75],
        [0.85, -0.15, -0.1, 0.8],
        [0.2, 0.45, 0.1, 0.65],
      ];

      offsets.forEach(([ox, oy, oz, r]) => {
        const sphere = new THREE.Mesh(
          new THREE.DodecahedronGeometry(r * cp.scale, 2),
          cloudMat
        );
        sphere.position.set(ox * cp.scale, oy * cp.scale, oz * cp.scale);
        cloudGroup.add(sphere);
      });

      cloudGroup.userData = {
        isDreamCloud: true,
        baseX: cp.x,
        speed: 0.16 + (idx % 3) * 0.08,
      };
      this.levelRootGroup.add(cloudGroup);
      this.dreamAnimatedObjects.push({ type: 'cloud', obj: cloudGroup, userData: cloudGroup.userData });
    });
  }

  private buildDreamcoreGatewayDoor(rx: number, rz: number, groundY: number) {
    const group = new THREE.Group();
    group.position.set(rx, groundY, rz);

    // Stepped Checkered Pedestal Base
    const stepMat = new THREE.MeshStandardMaterial({
      map: this.textures.checkeredDream,
      roughness: 0.4,
    });
    const step1 = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.25, 4.2), stepMat);
    step1.position.set(0, 0.125, 0);
    group.add(step1);

    const step2 = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.25, 3.2), stepMat);
    step2.position.set(0, 0.375, 0);
    group.add(step2);

    // Solitary White Door Frame
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.25,
    });
    const doorFrame = new THREE.Mesh(new THREE.BoxGeometry(2.4, 3.4, 0.28), frameMat);
    doorFrame.position.set(0, 2.05, 0);
    group.add(doorFrame);

    // Glowing Ethereal Portal Panel (Gateway to Level 1)
    const portalMat = new THREE.MeshBasicMaterial({
      color: 0xfffcf0,
      side: THREE.DoubleSide,
    });
    const portal = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 3.0), portalMat);
    portal.position.set(0, 1.95, 0.01);
    group.add(portal);

    // Soft warm threshold halo
    const portalGlow = new THREE.PointLight(0xfef08a, 2.2, 8.5);
    portalGlow.position.set(0, 2.0, 0.6);
    group.add(portalGlow);

    // Brass Doorknob
    const knobMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.2 });
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), knobMat);
    knob.position.set(0.7, 1.8, 0.16);
    group.add(knob);

    // Ethereal Header Plaque: "THE THRESHOLD // TO THE UNKNOWN"
    const plaqueGeo = new THREE.BoxGeometry(2.2, 0.35, 0.12);
    const plaqueMat = new THREE.MeshStandardMaterial({ color: 0x333b56, roughness: 0.3 });
    const plaque = new THREE.Mesh(plaqueGeo, plaqueMat);
    plaque.position.set(0, 3.55, 0.12);
    group.add(plaque);

    // Generous Interaction Hitbox
    const hitBox = new THREE.Mesh(
      new THREE.BoxGeometry(4.5, 4.0, 4.5),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
    );
    hitBox.position.set(0, 2.0, 0);
    hitBox.userData = { isExitGate: true };
    group.add(hitBox);

    group.userData = { isExitGate: true };
    this.levelRootGroup.add(group);
    this.exitGateMesh = group;
    this.interactables.push(group);
  }

  private spawnDreamcoreProps() {
    // 1. Floating Geometric Monoliths & Checkered Obelisks
    const monolithCoords = [
      { x: 12, z: 14, h: 5.5, s: [1.8, 1.8, 1.8], r: 0.4 },
      { x: 28, z: 10, h: 6.8, s: [1.4, 3.2, 1.4], r: -0.6 },
      { x: 42, z: 18, h: 6.0, s: [2.0, 2.0, 2.0], r: 0.8 },
      { x: 16, z: 36, h: 7.5, s: [1.2, 3.8, 1.2], r: 1.2 },
      { x: 36, z: 38, h: 5.6, s: [2.2, 1.4, 2.2], r: -0.3 },
      { x: 10, z: 46, h: 6.2, s: [1.6, 1.6, 1.6], r: 0.5 },
    ];

    const monolithMat = new THREE.MeshStandardMaterial({
      map: this.textures.checkeredDream,
      roughness: 0.35,
      metalness: 0.15,
    });

    monolithCoords.forEach((m, idx) => {
      const geo = new THREE.BoxGeometry(m.s[0], m.s[1], m.s[2]);
      const mesh = new THREE.Mesh(geo, monolithMat);
      const groundAtM = this.getGroundHeight(m.x, m.z);
      mesh.position.set(m.x, groundAtM + m.h, m.z);
      mesh.rotation.set(m.r, m.r * 1.2, m.r * 0.8);
      mesh.userData = {
        isFloatingMonolith: true,
        baseY: groundAtM + m.h,
        rotSpeed: 0.25 + (idx % 3) * 0.15,
        bobPhase: idx * 1.2,
      };
      this.levelRootGroup.add(mesh);
      this.dreamAnimatedObjects.push({ type: 'monolith', obj: mesh, userData: mesh.userData });
    });

    // 2. Classical White Doric Columns (Surreal Temple Ruins on a Hill)
    const pillarMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.4,
    });
    const columnCenter = { x: 32, z: 24 };
    const columnGround = this.getGroundHeight(columnCenter.x, columnCenter.z);
    const colOffsets = [
      [-3, -2], [0, -2], [3, -2],
      [-3, 2], [0, 2], [3, 2],
    ];

    colOffsets.forEach(([ox, oz]) => {
      const colGeo = new THREE.CylinderGeometry(0.35, 0.4, 4.2, 16);
      const col = new THREE.Mesh(colGeo, pillarMat);
      col.position.set(columnCenter.x + ox, columnGround + 2.1, columnCenter.z + oz);
      this.levelRootGroup.add(col);
      this.wallColliders.push(new THREE.Box3().setFromObject(col));
    });

    // Architrave lintel beams across columns
    const beamGeo = new THREE.BoxGeometry(7.2, 0.4, 0.9);
    const beam1 = new THREE.Mesh(beamGeo, pillarMat);
    beam1.position.set(columnCenter.x, columnGround + 4.3, columnCenter.z - 2);
    this.levelRootGroup.add(beam1);
    const beam2 = new THREE.Mesh(beamGeo, pillarMat);
    beam2.position.set(columnCenter.x, columnGround + 4.3, columnCenter.z + 2);
    this.levelRootGroup.add(beam2);

    // 3. Solitary Wooden Bench & Vintage Streetlamp on rolling crest
    const benchCenter = { x: 18, z: 24 };
    const benchGround = this.getGroundHeight(benchCenter.x, benchCenter.z);

    const woodMat = new THREE.MeshStandardMaterial({ color: 0x5c3a21, roughness: 0.8 });
    const ironMat = new THREE.MeshStandardMaterial({ color: 0x1f2421, metalness: 0.8, roughness: 0.3 });

    const benchSeat = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.1, 0.6), woodMat);
    benchSeat.position.set(benchCenter.x, benchGround + 0.45, benchCenter.z);
    this.levelRootGroup.add(benchSeat);

    const benchBack = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.6, 0.08), woodMat);
    benchBack.position.set(benchCenter.x, benchGround + 0.8, benchCenter.z - 0.28);
    this.levelRootGroup.add(benchBack);
    this.wallColliders.push(new THREE.Box3().setFromObject(benchSeat));

    // Vintage Streetlamp with glowing warm globe
    const lampPost = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 3.6, 8), ironMat);
    lampPost.position.set(benchCenter.x + 1.8, benchGround + 1.8, benchCenter.z);
    this.levelRootGroup.add(lampPost);
    this.wallColliders.push(new THREE.Box3().setFromObject(lampPost));

    const globe = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 16, 16),
      new THREE.MeshStandardMaterial({
        color: 0xffedd5,
        emissive: 0xfef08a,
        emissiveIntensity: 2.2,
        roughness: 0.2,
      })
    );
    globe.position.set(benchCenter.x + 1.8, benchGround + 3.6, benchCenter.z);
    this.levelRootGroup.add(globe);

    const globeLight = new THREE.PointLight(0xfef08a, 1.4, 12.0, 1.5);
    globeLight.position.set(benchCenter.x + 1.8, benchGround + 3.6, benchCenter.z);
    this.levelRootGroup.add(globeLight);

    // 4. Nostalgic Faded Pastel Prism Arch
    const archCenter = { x: 26, z: 38 };
    const archGround = this.getGroundHeight(archCenter.x, archCenter.z);
    const pastelArchColors = [0xfca5a5, 0xfdba74, 0xfef08a, 0xbbf7d0, 0xa5f3fc, 0xc4b5fd];

    pastelArchColors.forEach((col, idx) => {
      const radius = 3.6 - idx * 0.22;
      const archGeo = new THREE.TorusGeometry(radius, 0.09, 8, 32, Math.PI);
      const archMat = new THREE.MeshStandardMaterial({
        color: col,
        emissive: col,
        emissiveIntensity: 0.25,
        roughness: 0.4,
      });
      const archMesh = new THREE.Mesh(archGeo, archMat);
      archMesh.position.set(archCenter.x, archGround + 0.1, archCenter.z);
      this.levelRootGroup.add(archMesh);
    });

    // 5. Floating Muted Pastel Dream Balloons
    const balloonColors = [0xfb7185, 0xfde68a, 0xa5f3fc, 0xc4b5fd, 0xbbf7d0, 0xfecdd3, 0xbae6fd];
    const balloonCoords = [
      { x: 14, z: 20, h: 3.2 },
      { x: 15, z: 21, h: 4.1 },
      { x: 30, z: 16, h: 3.8 },
      { x: 31, z: 15, h: 4.5 },
      { x: 24, z: 30, h: 3.5 },
      { x: 38, z: 32, h: 4.0 },
      { x: 44, z: 42, h: 3.6 },
    ];

    balloonCoords.forEach((b, idx) => {
      const bGround = this.getGroundHeight(b.x, b.z);
      const col = balloonColors[idx % balloonColors.length];
      const balloonGroup = new THREE.Group();
      balloonGroup.position.set(b.x, bGround, b.z);

      // Soft oval balloon
      const balloonGeo = new THREE.SphereGeometry(0.35, 16, 16);
      balloonGeo.scale(1.0, 1.25, 1.0);
      const balloonMat = new THREE.MeshStandardMaterial({
        color: col,
        emissive: col,
        emissiveIntensity: 0.2,
        roughness: 0.3,
      });
      const balloon = new THREE.Mesh(balloonGeo, balloonMat);
      balloon.position.y = b.h;
      balloonGroup.add(balloon);

      // Thin white string anchored to meadow grass
      const stringGeo = new THREE.CylinderGeometry(0.008, 0.008, b.h, 4);
      const stringMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const stringMesh = new THREE.Mesh(stringGeo, stringMat);
      stringMesh.position.y = b.h / 2;
      balloonGroup.add(stringMesh);

      balloonGroup.userData = {
        isDreamBalloon: true,
        baseY: bGround,
        liftH: b.h,
        phase: idx * 1.1,
      };
      this.levelRootGroup.add(balloonGroup);
      this.dreamAnimatedObjects.push({ type: 'balloon', obj: balloonGroup, userData: balloonGroup.userData });
    });

    // 6. The Forgotten Meadow Playground (A-Frame Swings & Retro Slide)
    const playCenter = { x: 20, z: 18 };
    const playGround = this.getGroundHeight(playCenter.x, playCenter.z);
    const swingFrameMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.6 });
    const woodSeatMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.7 });

    const topBar = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 5.2, 8), swingFrameMat);
    topBar.rotation.z = Math.PI / 2;
    topBar.position.set(playCenter.x, playGround + 3.2, playCenter.z);
    this.levelRootGroup.add(topBar);

    const legOffsets = [[-2.5, -1.2], [-2.5, 1.2], [2.5, -1.2], [2.5, 1.2]];
    legOffsets.forEach(([ox, oz]) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 3.6, 8), swingFrameMat);
      leg.position.set(playCenter.x + ox, playGround + 1.6, playCenter.z + oz);
      leg.rotation.x = oz > 0 ? 0.32 : -0.32;
      this.levelRootGroup.add(leg);
      this.wallColliders.push(new THREE.Box3().setFromObject(leg));
    });

    [-1.0, 1.0].forEach((ox, i) => {
      const swingPivot = new THREE.Group();
      swingPivot.position.set(playCenter.x + ox, playGround + 3.2, playCenter.z);
      swingPivot.userData = { isDreamSwing: true, phase: i * 1.5 };

      const chainMat = new THREE.MeshBasicMaterial({ color: 0xcccccc });
      const chain1 = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 2.4, 4), chainMat);
      chain1.position.set(-0.3, -1.2, 0);
      swingPivot.add(chain1);
      const chain2 = chain1.clone();
      chain2.position.set(0.3, -1.2, 0);
      swingPivot.add(chain2);

      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.06, 0.3), woodSeatMat);
      seat.position.set(0, -2.4, 0);
      swingPivot.add(seat);

      this.levelRootGroup.add(swingPivot);
      this.dreamAnimatedObjects.push({ type: 'swing', obj: swingPivot, userData: swingPivot.userData });
    });

    const slideMat = new THREE.MeshStandardMaterial({ color: 0xfde047, roughness: 0.4 });
    const slideChute = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.12, 4.0), slideMat);
    slideChute.position.set(playCenter.x + 3.8, playGround + 1.2, playCenter.z + 1.2);
    slideChute.rotation.x = -0.45;
    this.levelRootGroup.add(slideChute);
    this.wallColliders.push(new THREE.Box3().setFromObject(slideChute));

    // 7. Solitary Ridge Red Telephone Booth
    const boothPos = { x: 38, z: 14 };
    const boothGround = this.getGroundHeight(boothPos.x, boothPos.z);
    const boothGroup = new THREE.Group();
    boothGroup.position.set(boothPos.x, boothGround, boothPos.z);

    const boothFrameMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.5 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.35, roughness: 0.1 });

    const bBase = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.15, 1.4), boothFrameMat);
    bBase.position.y = 0.075;
    boothGroup.add(bBase);

    const bRoof = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.3, 1.5), boothFrameMat);
    bRoof.position.y = 2.85;
    boothGroup.add(bRoof);

    const bGlass = new THREE.Mesh(new THREE.BoxGeometry(1.3, 2.6, 1.3), glassMat);
    bGlass.position.y = 1.45;
    boothGroup.add(bGlass);

    const boothLight = new THREE.PointLight(0xfef08a, 1.5, 6.0, 1.5);
    boothLight.position.set(0, 2.5, 0);
    boothGroup.add(boothLight);

    const phoneMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.4 });
    const boothPhone = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.5, 0.25), phoneMat);
    boothPhone.position.set(0, 1.4, -0.45);
    boothPhone.userData = {
      isInteractable: true,
      item: {
        id: 'phone_ridge_dream',
        type: 'phone',
        name: 'The Solitary Ridge Telephone',
        description:
          '...warm tape hiss hums in your ear... a distant nostalgic operator speaks: "All circuits to 1999 are busy. The weather here will remain perpetual spring. You do not have to wake up yet..."',
        roomX: 4,
        roomZ: 1,
        localPos: [0, 0, 0],
      },
    };
    boothGroup.add(boothPhone);
    this.interactables.push(boothPhone);
    this.levelRootGroup.add(boothGroup);
    this.wallColliders.push(new THREE.Box3().setFromObject(bGlass).translate(new THREE.Vector3(boothPos.x, boothGround, boothPos.z)));

    // 8. Floating Checkered Staircase to Nowhere
    const stairPos = { x: 12, z: 32 };
    const stairGround = this.getGroundHeight(stairPos.x, stairPos.z);
    const stairMat = new THREE.MeshStandardMaterial({ map: this.textures.checkeredDream, roughness: 0.3 });
    for (let step = 0; step < 9; step++) {
      const stepMesh = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.28, 0.8), stairMat);
      stepMesh.position.set(stairPos.x, stairGround + 0.3 + step * 0.45, stairPos.z + step * 0.7);
      this.levelRootGroup.add(stepMesh);
      this.wallColliders.push(new THREE.Box3().setFromObject(stepMesh));
    }

    const cloudBalcony = new THREE.Mesh(
      new THREE.CylinderGeometry(2.0, 2.0, 0.4, 16),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4, emissive: 0xfffbeb, emissiveIntensity: 0.2 })
    );
    cloudBalcony.position.set(stairPos.x, stairGround + 4.4, stairPos.z + 9 * 0.7 + 1.2);
    this.levelRootGroup.add(cloudBalcony);
    this.wallColliders.push(new THREE.Box3().setFromObject(cloudBalcony));

    // 9. Lawn CRT Television & Circle of White Monobloc Chairs
    const lawnCenter = { x: 28, z: 34 };
    const lawnGround = this.getGroundHeight(lawnCenter.x, lawnCenter.z);

    const tvTable = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.7, 0.9), woodMat);
    tvTable.position.set(lawnCenter.x, lawnGround + 0.35, lawnCenter.z);
    this.levelRootGroup.add(tvTable);
    this.wallColliders.push(new THREE.Box3().setFromObject(tvTable));

    const crtMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.5 });
    const crtBody = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.65, 0.6), crtMat);
    crtBody.position.set(lawnCenter.x, lawnGround + 1.02, lawnCenter.z);
    this.levelRootGroup.add(crtBody);

    const screenMat = new THREE.MeshBasicMaterial({ color: 0x67e8f9 });
    const crtScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.65, 0.48), screenMat);
    crtScreen.position.set(lawnCenter.x, lawnGround + 1.02, lawnCenter.z + 0.31);
    this.levelRootGroup.add(crtScreen);

    const crtGlow = new THREE.PointLight(0x67e8f9, 1.6, 6.0, 1.8);
    crtGlow.position.set(lawnCenter.x, lawnGround + 1.1, lawnCenter.z + 0.5);
    this.levelRootGroup.add(crtGlow);

    const monoblocMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.35 });
    for (let c = 0; c < 6; c++) {
      const angle = (c / 6) * Math.PI * 2;
      const cx = lawnCenter.x + Math.cos(angle) * 2.8;
      const cz = lawnCenter.z + Math.sin(angle) * 2.8;
      const cGround = this.getGroundHeight(cx, cz);

      const chairSeat = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.08, 0.6), monoblocMat);
      chairSeat.position.set(cx, cGround + 0.42, cz);
      chairSeat.rotation.y = -angle + Math.PI / 2;
      this.levelRootGroup.add(chairSeat);

      const chairBack = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.5, 0.08), monoblocMat);
      chairBack.position.set(cx + Math.cos(angle) * 0.26, cGround + 0.68, cz + Math.sin(angle) * 0.26);
      chairBack.rotation.y = -angle + Math.PI / 2;
      this.levelRootGroup.add(chairBack);

      this.wallColliders.push(new THREE.Box3().setFromObject(chairSeat));
    }

    // 10. Surreal Pastel Plaster Sculptures
    const sculptureCenter = { x: 38, z: 28 };
    const plasterMats = [
      new THREE.MeshStandardMaterial({ color: 0xfecdd3, roughness: 0.5 }), // Faded dusty rose
      new THREE.MeshStandardMaterial({ color: 0xbae6fd, roughness: 0.5 }), // Faded sky
      new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.5 }), // Pale butter
      new THREE.MeshStandardMaterial({ color: 0xbbf7d0, roughness: 0.5 }), // Muted sage
      new THREE.MeshStandardMaterial({ color: 0xddd6fe, roughness: 0.5 }), // Pale lavender
    ];

    const blockConfigs = [
      { ox: -2.2, oz: -1.8, s: 1.8, type: 'box', matIdx: 0 },
      { ox: 2.2, oz: -2.0, s: 1.6, type: 'cylinder', matIdx: 1 },
      { ox: 0, oz: 2.4, s: 1.9, type: 'box', matIdx: 2 },
      { ox: -2.6, oz: 1.8, s: 1.4, type: 'cone', matIdx: 3 },
      { ox: 2.5, oz: 1.6, s: 1.5, type: 'sphere', matIdx: 4 },
    ];

    blockConfigs.forEach((cfg) => {
      const bx = sculptureCenter.x + cfg.ox;
      const bz = sculptureCenter.z + cfg.oz;
      const bg = this.getGroundHeight(bx, bz);
      let mesh: THREE.Mesh;
      if (cfg.type === 'box') {
        mesh = new THREE.Mesh(new THREE.BoxGeometry(cfg.s, cfg.s, cfg.s), plasterMats[cfg.matIdx]);
        mesh.position.set(bx, bg + cfg.s / 2, bz);
      } else if (cfg.type === 'cone') {
        mesh = new THREE.Mesh(new THREE.ConeGeometry(cfg.s * 0.6, cfg.s * 1.3, 16), plasterMats[cfg.matIdx]);
        mesh.position.set(bx, bg + cfg.s * 0.65, bz);
      } else if (cfg.type === 'cylinder') {
        mesh = new THREE.Mesh(new THREE.CylinderGeometry(cfg.s * 0.5, cfg.s * 0.5, cfg.s, 16), plasterMats[cfg.matIdx]);
        mesh.position.set(bx, bg + cfg.s / 2, bz);
      } else {
        mesh = new THREE.Mesh(new THREE.SphereGeometry(cfg.s * 0.55, 16, 16), plasterMats[cfg.matIdx]);
        mesh.position.set(bx, bg + cfg.s * 0.55, bz);
      }
      this.levelRootGroup.add(mesh);
      this.wallColliders.push(new THREE.Box3().setFromObject(mesh));
    });

    // 11. Vintage Roadside Timber Billboard near spawn knoll
    const bBoardPos = { x: 8, z: 12 };
    const bBoardGround = this.getGroundHeight(bBoardPos.x, bBoardPos.z);

    const postMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.8 });
    const postL = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 4.2, 8), postMat);
    postL.position.set(bBoardPos.x - 2.2, bBoardGround + 2.1, bBoardPos.z);
    this.levelRootGroup.add(postL);

    const postR = postL.clone();
    postR.position.set(bBoardPos.x + 2.2, bBoardGround + 2.1, bBoardPos.z);
    this.levelRootGroup.add(postR);

    const boardPlaque = new THREE.Mesh(
      new THREE.BoxGeometry(5.0, 2.2, 0.18),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 })
    );
    boardPlaque.position.set(bBoardPos.x, bBoardGround + 3.0, bBoardPos.z);
    this.levelRootGroup.add(boardPlaque);
    this.wallColliders.push(new THREE.Box3().setFromObject(boardPlaque));
  }

  private registerCollider(box: THREE.Box3, roomKey?: string) {
    this.wallColliders.push(box);
    if (roomKey) {
      let list = this.spatialColliders.get(roomKey);
      if (!list) {
        list = [];
        this.spatialColliders.set(roomKey, list);
      }
      list.push(box);
    }
  }

  private buildWall(
    rx: number,
    rz: number,
    dir: 'north' | 'south' | 'east' | 'west',
    hasDoor: boolean,
    mat: THREE.Material,
    parentGroup: THREE.Group = this.levelRootGroup,
    roomKey?: string
  ) {
    const half = this.roomSize / 2;
    const doorWidth = 2.2;
    const doorHeight = 2.6;
    const wallThick = 0.3;

    if (!hasDoor) {
      // Solid Wall
      const wallGeo = new THREE.BoxGeometry(
        dir === 'north' || dir === 'south' ? this.roomSize : wallThick,
        this.roomHeight,
        dir === 'east' || dir === 'west' ? this.roomSize : wallThick
      );
      const wall = new THREE.Mesh(wallGeo, mat);

      let wx = rx;
      let wz = rz;
      if (dir === 'north') wz -= half;
      if (dir === 'south') wz += half;
      if (dir === 'west') wx -= half;
      if (dir === 'east') wx += half;

      wall.position.set(wx, this.roomHeight / 2, wz);
      parentGroup.add(wall);

      const box = new THREE.Box3().setFromObject(wall);
      this.registerCollider(box, roomKey);

      // Level 1 Backrooms: Dark vinyl cove baseboard along floor line
      if (this.currentLevel === 1) {
        const bbGeo = new THREE.BoxGeometry(
          dir === 'north' || dir === 'south' ? this.roomSize : wallThick + 0.04,
          0.12,
          dir === 'east' || dir === 'west' ? this.roomSize : wallThick + 0.04
        );
        const baseboard = new THREE.Mesh(
          bbGeo,
          new THREE.MeshStandardMaterial({ color: 0x362f1e, roughness: 0.7 })
        );
        baseboard.position.set(wx, 0.06, wz);
        parentGroup.add(baseboard);
      }
    } else {
      // Wall with central doorway opening
      const segmentWidth = (this.roomSize - doorWidth) / 2;

      const createSegment = (offsetX: number, offsetZ: number, w: number, d: number) => {
        const seg = new THREE.Mesh(new THREE.BoxGeometry(w, this.roomHeight, d), mat);
        seg.position.set(offsetX, this.roomHeight / 2, offsetZ);
        parentGroup.add(seg);
        this.registerCollider(new THREE.Box3().setFromObject(seg), roomKey);

        // Baseboard on doorway wall segments in Level 1
        if (this.currentLevel === 1) {
          const bbSeg = new THREE.Mesh(
            new THREE.BoxGeometry(
              dir === 'north' || dir === 'south' ? w : d + 0.04,
              0.12,
              dir === 'east' || dir === 'west' ? w : d + 0.04
            ),
            new THREE.MeshStandardMaterial({ color: 0x362f1e, roughness: 0.7 })
          );
          bbSeg.position.set(offsetX, 0.06, offsetZ);
          parentGroup.add(bbSeg);
        }
      };

      if (dir === 'north' || dir === 'south') {
        const wz = dir === 'north' ? rz - half : rz + half;
        createSegment(rx - half + segmentWidth / 2, wz, segmentWidth, wallThick);
        createSegment(rx + half - segmentWidth / 2, wz, segmentWidth, wallThick);

        // Header above door
        const header = new THREE.Mesh(
          new THREE.BoxGeometry(doorWidth, this.roomHeight - doorHeight, wallThick),
          mat
        );
        header.position.set(rx, this.roomHeight - (this.roomHeight - doorHeight) / 2, wz);
        parentGroup.add(header);

        // Doorway Threshold Lintel Guidance Beacon (Pure Emissive Beacon - NEVER in classic Level 1)
        if (this.currentLevel !== 1) {
          const diodeColor =
            this.currentLevel === 2 ? 0x00f5d4 : this.currentLevel === 4 ? 0xff4d26 : this.currentLevel === 3 ? 0xf59e0b : 0x38bdf8;
          const diodeMat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            emissive: diodeColor,
            emissiveIntensity: 3.5,
          });
          const diode = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.08, 0.08), diodeMat);
          diode.position.set(rx, doorHeight + 0.08, wz);
          parentGroup.add(diode);
        }
      } else {
        const wx = dir === 'west' ? rx - half : rx + half;
        createSegment(wx, rz - half + segmentWidth / 2, wallThick, segmentWidth);
        createSegment(wx, rz + half - segmentWidth / 2, wallThick, segmentWidth);

        // Header above door
        const header = new THREE.Mesh(
          new THREE.BoxGeometry(wallThick, this.roomHeight - doorHeight, doorWidth),
          mat
        );
        header.position.set(wx, this.roomHeight - (this.roomHeight - doorHeight) / 2, rz);
        parentGroup.add(header);

        // Doorway Threshold Lintel Guidance Beacon (Pure Emissive Beacon - NEVER in classic Level 1)
        if (this.currentLevel !== 1) {
          const diodeColor =
            this.currentLevel === 2 ? 0x00f5d4 : this.currentLevel === 4 ? 0xff4d26 : this.currentLevel === 3 ? 0xf59e0b : 0x38bdf8;
          const diodeMat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            emissive: diodeColor,
            emissiveIntensity: 3.5,
          });
          const diode = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.35), diodeMat);
          diode.position.set(wx, doorHeight + 0.08, rz);
          parentGroup.add(diode);
        }
      }
    }
  }

  private spawnItemMesh(item: WorldItem, rx: number, rz: number, parentGroup: THREE.Group = this.levelRootGroup) {
    const itemGroup = new THREE.Group();
    const [lx, ly, lz] = item.localPos;
    const groundY = this.currentLevel === 0 ? this.getGroundHeight(rx + lx, rz + lz) : 0;
    itemGroup.position.set(rx + lx, groundY + ly, rz + lz);

    if (item.type === 'anchor') {
      // Ornate floating pedestal with glowing crystal / relic
      const ped = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.45, 0.8, 8),
        new THREE.MeshStandardMaterial({ color: 0x1f1b18, metalness: 0.8, roughness: 0.3 })
      );
      ped.position.y = -0.4;
      itemGroup.add(ped);

      const relicGeo = new THREE.OctahedronGeometry(0.25, 0);
      const relicMat = new THREE.MeshStandardMaterial({
        color: 0x00ffff,
        emissive: 0x00f5d4,
        emissiveIntensity: 3.5,
        roughness: 0.1,
      });
      const relic = new THREE.Mesh(relicGeo, relicMat);
      relic.userData = { isFloating: true };
      itemGroup.add(relic);
      this.floatingRelics.push(relic);

      // Soft luminous aura ring disc
      const haloDisc = new THREE.Mesh(
        new THREE.PlaneGeometry(1.6, 1.6),
        new THREE.MeshBasicMaterial({
          map: this.textures.softGlow,
          color: 0x00f5d4,
          transparent: true,
          opacity: 0.5,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          side: THREE.DoubleSide,
        })
      );
      haloDisc.rotation.x = -Math.PI / 2;
      haloDisc.position.y = -0.05;
      itemGroup.add(haloDisc);
    } else if (item.type === 'battery') {
      // 9V Survival Horror Battery Cell with Luminescent LED Indicator
      const batt = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 0.3, 0.12),
        new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.7, roughness: 0.3 })
      );
      itemGroup.add(batt);

      // Bright glowing green power bar diode
      const battDiode = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.04, 0.13),
        new THREE.MeshStandardMaterial({
          color: 0x22c55e,
          emissive: 0x22c55e,
          emissiveIntensity: 3.5,
        })
      );
      battDiode.position.set(0, 0.15, 0);
      itemGroup.add(battDiode);
    } else if (item.type === 'phone') {
      // Rotary Telephone on Desk
      const desk = new THREE.Mesh(
        new THREE.BoxGeometry(1.4, 0.75, 0.9),
        new THREE.MeshStandardMaterial({ color: 0x2e241c })
      );
      desk.position.y = -0.375;
      itemGroup.add(desk);

      const phoneBase = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.14, 0.26),
        new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 0.3 })
      );
      itemGroup.add(phoneBase);
    } else if (item.type === 'note') {
      // Luminescent Yellowed Paper Sheet (Phosphor UV glow in the dark)
      const paper = new THREE.Mesh(
        new THREE.PlaneGeometry(0.38, 0.48),
        new THREE.MeshStandardMaterial({
          color: 0xfef9c3,
          emissive: 0xfef08a,
          emissiveIntensity: 1.2,
          roughness: 0.4,
          side: THREE.DoubleSide,
        })
      );
      paper.rotation.x = -Math.PI / 2;
      itemGroup.add(paper);
    }

    // Generous transparent interaction hit-sphere to make aiming easy & forgiving
    const hitSphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.65, 8, 8),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
    );
    itemGroup.add(hitSphere);

    itemGroup.userData = { isInteractable: true, item };
    parentGroup.add(itemGroup);
    this.interactables.push(itemGroup);
    this.itemDataMap.set(itemGroup, item);
  }

  private buildExitGate(rx: number, rz: number, room?: MapRoom, parentGroup: THREE.Group = this.levelRootGroup) {
    const group = new THREE.Group();
    group.position.set(rx, 0, rz);

    // Find a solid wall (no doorway) so the blast door never blocks the entrance
    if (room && room.doors) {
      const doorDirs = room.doors.map((d) => d.direction);
      let targetWall: 'north' | 'south' | 'east' | 'west' = 'north';
      if (!doorDirs.includes('north')) targetWall = 'north';
      else if (!doorDirs.includes('south')) targetWall = 'south';
      else if (!doorDirs.includes('east')) targetWall = 'east';
      else if (!doorDirs.includes('west')) targetWall = 'west';

      if (targetWall === 'south') {
        group.rotation.y = Math.PI;
      } else if (targetWall === 'west') {
        group.rotation.y = Math.PI / 2;
      } else if (targetWall === 'east') {
        group.rotation.y = -Math.PI / 2;
      }
    }

    // Massive steel reinforced blast door frame
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(3.6, 3.2, 0.4),
      new THREE.MeshStandardMaterial({ color: 0x222629, metalness: 0.9, roughness: 0.2 })
    );
    frame.position.set(0, 1.6, -4.7);
    group.add(frame);

    // Exit sign above door with high emissive luminescence
    const sign = new THREE.Mesh(
      new THREE.PlaneGeometry(1.6, 0.7),
      new THREE.MeshStandardMaterial({
        map: this.textures.exitSign,
        emissive: 0xff1122,
        emissiveIntensity: 3.2,
        roughness: 0.2,
      })
    );
    sign.position.set(0, 3.1, -4.48);
    group.add(sign);

    // Glowing red emergency beacon bulbs on top corners of frame
    [-1.6, 1.6].forEach((bx) => {
      const beaconBulb = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 8, 8),
        new THREE.MeshStandardMaterial({
          color: 0xff0022,
          emissive: 0xff0022,
          emissiveIntensity: 3.5,
        })
      );
      beaconBulb.position.set(bx, 3.25, -4.6);
      group.add(beaconBulb);
    });

    // 3 Socket Pedestals for Reality Anchors
    [-1.2, 0, 1.2].forEach((x, i) => {
      const socket = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.26, 0.9, 8),
        new THREE.MeshStandardMaterial({ color: 0x333b42, metalness: 0.7 })
      );
      socket.position.set(x, 0.45, -3.8);
      socket.userData = { isSocket: true, socketIndex: i };
      group.add(socket);
    });

    // Generous interaction hit volume for Exit Gate
    const exitHitBox = new THREE.Mesh(
      new THREE.BoxGeometry(5.0, 3.6, 3.0),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
    );
    exitHitBox.position.set(0, 1.8, -4.0);
    exitHitBox.userData = { isExitGate: true };
    group.add(exitHitBox);

    group.userData = { isExitGate: true };
    parentGroup.add(group);
    this.exitGateMesh = group;
    this.interactables.push(group);
  }

  public checkInteraction(): InteractionTarget | null {
    this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
    const intersects = this.raycaster.intersectObjects(this.interactables, true);

    if (intersects.length > 0 && intersects[0].distance < 4.8) {
      let topObj: THREE.Object3D | null = intersects[0].object;
      while (topObj && !topObj.userData.isInteractable && !topObj.userData.isExitGate) {
        topObj = topObj.parent;
      }

      if (topObj && topObj.userData.isInteractable) {
        const item = topObj.userData.item as WorldItem;
        if (!item.collected) {
          let prompt = `[E] Take ${item.name}`;
          if (item.type === 'phone') prompt = `[E] Answer Phone`;
          if (item.type === 'note') prompt = `[E] Read Note`;
          return { type: item.type, item, prompt };
        }
      } else if (topObj && (topObj.userData.isExitGate || topObj.parent?.userData.isExitGate)) {
        if (this.currentLevel === 0) {
          return { type: 'exit', prompt: `[E] Enter The Threshold (Level 1)` };
        }
        return { type: 'exit', prompt: `[E] Escape Airlock` };
      }
    }
    return null;
  }

  public removeItem(item: WorldItem) {
    item.collected = true;
    for (let i = 0; i < this.interactables.length; i++) {
      const obj = this.interactables[i];
      if (obj.userData.item && obj.userData.item.id === item.id) {
        // Crucial: remove from its actual parent (roomGroup or levelRootGroup)
        if (obj.parent) {
          obj.parent.remove(obj);
        } else {
          this.scene.remove(obj);
        }
        obj.visible = false;
        obj.traverse((child: any) => {
          if (child.geometry) child.geometry.dispose();
          if (child.material) {
            if (Array.isArray(child.material)) child.material.forEach((m: any) => m.dispose());
            else child.material.dispose();
          }
        });
        this.interactables.splice(i, 1);
        break;
      }
    }
    const relicIdx = this.floatingRelics.findIndex((r) => r.parent?.userData.item?.id === item.id);
    if (relicIdx !== -1) {
      this.floatingRelics.splice(relicIdx, 1);
    }
    this.itemDataMap.forEach((v, k) => {
      if (v.id === item.id) this.itemDataMap.delete(k);
    });
  }

  public isPositionValid(pos: THREE.Vector3): boolean {
    if (this.currentLevel === 0) {
      // Expanded rolling dream meadow boundary (140m terrain: allows free exploration)
      if (pos.x < -18 || pos.x > 74 || pos.z < -18 || pos.z > 74) {
        return false;
      }
    }
    const playerRadius = 0.35;
    LiminalWorld._playerBoxMin.set(pos.x - playerRadius, pos.y - 1.2, pos.z - playerRadius);
    LiminalWorld._playerBoxMax.set(pos.x + playerRadius, pos.y + 0.2, pos.z + playerRadius);
    LiminalWorld._playerBox.set(LiminalWorld._playerBoxMin, LiminalWorld._playerBoxMax);

    // O(1) Fast Spatial Partitioning: only test walls in current room and 8 adjacent rooms
    if (this.spatialColliders.size > 0) {
      const rx = Math.round(pos.x / this.roomSize);
      const rz = Math.round(pos.z / this.roomSize);

      for (let ox = -1; ox <= 1; ox++) {
        for (let oz = -1; oz <= 1; oz++) {
          const list = this.spatialColliders.get(`${rx + ox},${rz + oz}`);
          if (list) {
            for (let i = 0; i < list.length; i++) {
              if (list[i].intersectsBox(LiminalWorld._playerBox)) {
                return false;
              }
            }
          }
        }
      }
      return true;
    }

    // Fallback for Level 0 open meadow terrain and isolated props
    for (let i = 0; i < this.wallColliders.length; i++) {
      if (this.wallColliders[i].intersectsBox(LiminalWorld._playerBox)) {
        return false;
      }
    }
    return true;
  }

  public update(delta: number) {
    // Battery drain (Level 0 Sanctuary has infinite battery / safe zone)
    if (this.currentLevel === 0) {
      this.batteryLevel = 100;
      this.flashlightOn = true;
      this.flashlight.intensity = 4.5;
    } else if (this.flashlightOn) {
      this.batteryLevel = Math.max(0, this.batteryLevel - delta * 1.1); // ~90 sec battery
      if (this.batteryLevel <= 0) {
        this.flashlightOn = false;
        this.flashlight.intensity = 0;
      } else if (this.batteryLevel < 20) {
        // Low battery jitter / flicker
        this.flashlight.intensity = Math.random() > 0.3 ? 6.0 : 0.8;
      }
    }

    // Update Flashlight position & direction (zero-allocation scratch vector)
    this.flashlight.position.copy(this.camera.position);
    LiminalWorld._camForward.set(0, 0, -1).applyQuaternion(this.camera.quaternion);
    this.flashlightTarget.position.copy(this.camera.position).add(LiminalWorld._camForward);

    // Floating item animations (Reality Anchors - explicit list, zero scene hierarchy traversal)
    if (this.floatingRelics.length > 0) {
      const time = Date.now() * 0.003;
      const rotStep = delta * 1.5;
      const bobY = Math.sin(time) * 0.08;
      for (let i = 0; i < this.floatingRelics.length; i++) {
        const relic = this.floatingRelics[i];
        relic.rotation.y += rotStep;
        relic.position.y = bobY;
      }
    }

    // Level 2 Sublimity Poolrooms: Update active water ripples & surface caustics
    if (this.currentLevel === 2) {
      this.textures.submergedPoolFloor.offset.x = (this.textures.submergedPoolFloor.offset.x + delta * 0.015) % 1;
      this.textures.submergedPoolFloor.offset.y = (this.textures.submergedPoolFloor.offset.y + delta * 0.012) % 1;

      for (let i = 0; i < this.waterRipples.length; i++) {
        const r = this.waterRipples[i];
        if (r.active) {
          r.life += delta;
          const progress = r.life / r.maxLife;
          if (progress >= 1.0) {
            r.active = false;
            r.mesh.visible = false;
          } else {
            const currentScale = 0.2 + progress * 2.4;
            r.mesh.scale.set(currentScale, 1, currentScale);
            (r.mesh.material as THREE.MeshBasicMaterial).opacity = (1 - progress) * 0.65;
          }
        }
      }
    }

    // Level 4 Machine Sub-Core: Dynamic localized steam fog density & hiss
    if (this.currentLevel === 4 && this.currentLabyrinth && this.scene.fog instanceof THREE.FogExp2) {
      const rx = Math.round(this.camera.position.x / this.roomSize);
      const rz = Math.round(this.camera.position.z / this.roomSize);
      const room = this.currentLabyrinth.rooms.find((r) => r.x === rx && r.z === rz);
      const targetDensity = room?.steamDensity ?? 0.080;
      this.scene.fog.density = THREE.MathUtils.lerp(this.scene.fog.density, targetDensity, delta * 1.5);

      if (room?.hasSteamVent) {
        this.steamHissTimer -= delta;
        if (this.steamHissTimer <= 0) {
          this.steamHissTimer = 4.5 + Math.random() * 5.0;
          AudioEngine.playSteamHiss(0.12);
        }
      }
    }

    const timeSec = performance.now() * 0.001;

    // Floating monolith rotation, cloud drift, motes sway & balloon bob in Dreamcore (direct array, zero scene traversal)
    if (this.currentLevel === 0 && this.dreamAnimatedObjects.length > 0) {
      for (let i = 0; i < this.dreamAnimatedObjects.length; i++) {
        const entry = this.dreamAnimatedObjects[i];
        const obj = entry.obj;
        const d = entry.userData;
        if (entry.type === 'monolith') {
          obj.rotation.x += delta * (d.rotSpeed * 0.5);
          obj.rotation.y += delta * d.rotSpeed;
          obj.position.y = d.baseY + Math.sin(timeSec * 0.8 + d.bobPhase) * 0.35;
        } else if (entry.type === 'cloud') {
          obj.position.x += delta * d.speed;
          if (obj.position.x > 115) {
            obj.position.x = -45;
          }
        } else if (entry.type === 'balloon') {
          obj.position.y = d.baseY + Math.sin(timeSec * 1.5 + d.phase) * 0.18;
          obj.rotation.z = Math.sin(timeSec * 1.2 + d.phase) * 0.08;
        } else if (entry.type === 'swing') {
          obj.rotation.x = Math.sin(timeSec * 1.3 + d.phase) * 0.14;
        } else if (entry.type === 'motes') {
          obj.rotation.y = timeSec * 0.015;
          obj.position.y = Math.sin(timeSec * 0.4) * 0.25;
        }
      }
    }

    // Flickering ceiling light fixtures (realistic intermittent starter sputter, non-exhausting)
    for (let i = 0; i < this.roomLightNodes.length; i++) {
      const node = this.roomLightNodes[i];
      if (node.flicker) {
        // Restrained, periodic electrical sputter (~7.5s cycle)
        const cycle = (timeSec * 3.2 + i * 1.9) % 7.5;
        let off = false;
        if (cycle < 0.28) {
          off = Math.sin(cycle * 42) > 0.15;
        }
        node.intensity = off ? 0.08 : node.baseIntensity;
        const mat = node.mesh.material as THREE.MeshStandardMaterial;
        if (mat) {
          mat.color.setHex(off ? 0x2e2e2e : 0xffffff);
          mat.emissive.copy(off ? new THREE.Color(0x181e18) : node.color);
          mat.emissiveIntensity = off ? 0.25 : 2.5;
        }
      }
    }

    // ponytail: Frustum & Distance Culling for tiles (pre-cached coordinates, zero string splits)
    if (this.currentLevel !== 0 && this.roomCullingList.length > 0) {
      this.pvMatrix.multiplyMatrices(this.camera.projectionMatrix, this.camera.matrixWorldInverse);
      this.cameraFrustum.setFromProjectionMatrix(this.pvMatrix);

      const camX = this.camera.position.x;
      const camZ = this.camera.position.z;
      const maxDistSq = (this.isMobile ? 26 : 38) ** 2;

      for (let i = 0; i < this.roomCullingList.length; i++) {
        const item = this.roomCullingList[i];
        const distSq = (camX - item.centerX) ** 2 + (camZ - item.centerZ) ** 2;

        if (distSq > maxDistSq) {
          item.group.visible = false;
        } else {
          item.group.visible = this.cameraFrustum.intersectsBox(item.bounds);
        }
      }
    }

    // ponytail: Fixed Global Light Pool - update position & intensity of the 3 static scene lights
    // (Never toggles light.visible = false, ensuring NUM_POINT_LIGHTS is constant and 0 shader recompilations)
    if (this.currentLevel !== 0 && this.roomLightNodes.length > 0) {
      this.lightPoolTimer += delta;
      if (this.lightPoolTimer >= 0.06) {
        this.lightPoolTimer = 0;
        const camX = this.camera.position.x;
        const camZ = this.camera.position.z;

        for (let i = 0; i < this.roomLightNodes.length; i++) {
          const node = this.roomLightNodes[i];
          node.distSq = (camX - node.x) ** 2 + (camZ - node.z) ** 2;
        }

        this.roomLightNodes.sort(LiminalWorld.compareLightNodeDist);

        const maxActive = this.isMobile ? 2 : 3;
        for (let i = 0; i < this.pooledCeilingLights.length; i++) {
          const pLight = this.pooledCeilingLights[i];
          if (i < maxActive && i < this.roomLightNodes.length && this.roomLightNodes[i].isWorking) {
            const node = this.roomLightNodes[i];
            pLight.position.set(node.x, node.y, node.z);
            pLight.color.copy(node.color);
            pLight.intensity = node.intensity;
          } else {
            pLight.intensity = 0;
          }
        }
      }
    }

    this.renderer.render(this.scene, this.camera);
  }

  public dispose() {
    window.removeEventListener('resize', this.onResize);
    this.renderer.dispose();
  }
}
