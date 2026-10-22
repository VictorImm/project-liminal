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

  private ceilingLights: { light: THREE.PointLight; mesh: THREE.Mesh; flicker: boolean }[] = [];
  private raycaster = new THREE.Raycaster();
  private wallColliders: THREE.Box3[] = [];
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
  };

  constructor(container: HTMLElement) {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);
    this.scene.fog = new THREE.FogExp2(0x000000, 0.09);

    this.camera = new THREE.PerspectiveCamera(72, window.innerWidth / window.innerHeight, 0.1, 100);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.BasicShadowMap;
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

  public buildLabyrinth(labyrinth: GeneratedLabyrinth) {
    this.currentLevel = labyrinth.level;

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
      // Level 1: Yellow Halls (Classic warm mono-yellow Backrooms fog)
      this.scene.background = new THREE.Color(0x130f04);
      this.scene.fog = new THREE.FogExp2(0x130f04, 0.075);
    }

    labyrinth.rooms.forEach((room) => {
      const rx = room.x * this.roomSize;
      const rz = room.z * this.roomSize;

      // Select floor, wall, and ceiling materials uniquely tailored per biome
      let wallMat: THREE.Material;
      let floorMat: THREE.Material;
      let ceilingMat: THREE.Material;
      let floorSurface: 'carpet' | 'tile' | 'water' | 'metal' = 'carpet';

      if (room.biome === 'poolroom') {
        wallMat = new THREE.MeshStandardMaterial({ map: this.textures.poolTile, roughness: 0.25 });
        floorMat = new THREE.MeshStandardMaterial({ map: this.textures.submergedPoolFloor, roughness: 0.15 });
        ceilingMat = new THREE.MeshStandardMaterial({ map: this.textures.poolPlasterCeiling, roughness: 0.4 });
        floorSurface = 'water';
      } else if (room.biome === 'archive') {
        wallMat = new THREE.MeshStandardMaterial({ map: this.textures.archiveWall, roughness: 0.5 });
        floorMat = new THREE.MeshStandardMaterial({ map: this.textures.hotelCarpet, roughness: 0.85 });
        ceilingMat = new THREE.MeshStandardMaterial({ map: this.textures.cofferedCeiling, roughness: 0.6 });
        floorSurface = 'tile';
      } else if (room.biome === 'sublevel_red') {
        wallMat = new THREE.MeshStandardMaterial({ map: this.textures.hazardWall, roughness: 0.4, metalness: 0.5 });
        floorMat = new THREE.MeshStandardMaterial({ map: this.textures.industrialFloor, roughness: 0.5, metalness: 0.7 });
        ceilingMat = new THREE.MeshStandardMaterial({ map: this.textures.corrugatedCeiling, roughness: 0.7, metalness: 0.6 });
        floorSurface = 'metal';
      } else {
        // mono_yellow
        wallMat = new THREE.MeshStandardMaterial({ map: this.textures.yellowWall, roughness: 0.7 });
        floorMat = new THREE.MeshStandardMaterial({ map: this.textures.carpet, roughness: 0.9 });
        ceilingMat = new THREE.MeshStandardMaterial({ map: this.textures.ceiling, roughness: 0.85 });
        floorSurface = 'carpet';
      }

      // Floor Plane
      const floorGeo = new THREE.PlaneGeometry(this.roomSize, this.roomSize);
      const floor = new THREE.Mesh(floorGeo, floorMat);
      floor.rotation.x = -Math.PI / 2;
      floor.position.set(rx, 0, rz);
      floor.receiveShadow = true;
      floor.userData = { surface: floorSurface };
      this.scene.add(floor);

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
        this.scene.add(water);
      }

      // Ceiling Plane
      const ceiling = new THREE.Mesh(floorGeo, ceilingMat);
      ceiling.rotation.x = Math.PI / 2;
      ceiling.position.set(rx, this.roomHeight, rz);
      this.scene.add(ceiling);

      // Ceiling Light Fixture (Fluorescent tube with luminescent glow)
      const isWorkingLight = room.biome === 'exit_airlock' || Math.random() > 0.45;
      const fixtureEmissive = isWorkingLight ? new THREE.Color(room.lightColor) : new THREE.Color(0x18241b);

      const lightMat = new THREE.MeshStandardMaterial({
        color: isWorkingLight ? 0xffffff : 0x222222,
        emissive: fixtureEmissive,
        emissiveIntensity: isWorkingLight ? 2.8 : 0.3,
        roughness: 0.2,
      });

      const lightMesh = new THREE.Mesh(
        new THREE.BoxGeometry(2.4, 0.1, 0.5),
        lightMat
      );
      lightMesh.position.set(rx, this.roomHeight - 0.05, rz);
      this.scene.add(lightMesh);

      // Soft Luminescent Light Halo underneath working fixtures
      if (isWorkingLight) {
        const halo = new THREE.Mesh(
          new THREE.PlaneGeometry(3.6, 2.2),
          new THREE.MeshBasicMaterial({
            map: this.textures.softGlow,
            color: new THREE.Color(room.lightColor),
            transparent: true,
            opacity: 0.4,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            side: THREE.DoubleSide,
          })
        );
        halo.rotation.x = Math.PI / 2;
        halo.position.set(rx, this.roomHeight - 0.12, rz);
        this.scene.add(halo);
      }

      const ptLight = new THREE.PointLight(
        new THREE.Color(room.lightColor),
        isWorkingLight ? 1.05 : 0.0,
        8.5,
        2.0
      );
      ptLight.position.set(rx, this.roomHeight - 0.4, rz);
      this.scene.add(ptLight);

      this.ceilingLights.push({
        light: ptLight,
        mesh: lightMesh,
        flicker: isWorkingLight && room.hasLightFlicker,
      });

      // --- 3D PROPS SPECIFIC TO EACH LEVEL (ZERO REPETITION) ---
      // Level 1: Office Cubicle Divider Partition & Metal Filing Cabinet
      if (room.biome === 'mono_yellow' && Math.random() > 0.4) {
        const dividerMat = new THREE.MeshStandardMaterial({ color: 0x8f886d, roughness: 0.8 });
        const divider = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.8, 0.12), dividerMat);
        divider.position.set(rx - 1.2, 0.9, rz + 1.2);
        this.scene.add(divider);
        this.wallColliders.push(new THREE.Box3().setFromObject(divider));

        const cabinetMat = new THREE.MeshStandardMaterial({ color: 0x47494d, metalness: 0.7, roughness: 0.4 });
        const cabinet = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.6, 0.6), cabinetMat);
        cabinet.position.set(rx + 3.2, 0.8, rz - 3.2);
        this.scene.add(cabinet);
        this.wallColliders.push(new THREE.Box3().setFromObject(cabinet));
      }

      // Level 2: Sublimity Poolroom Tiled Columns & Stainless Pool Ladder
      if (room.pillarPositions) {
        const pillarGeo = new THREE.BoxGeometry(0.8, this.roomHeight, 0.8);
        room.pillarPositions.forEach(([px, pz]) => {
          const pillar = new THREE.Mesh(pillarGeo, wallMat);
          pillar.position.set(rx + px, this.roomHeight / 2, rz + pz);
          this.scene.add(pillar);

          const pBox = new THREE.Box3().setFromObject(pillar);
          this.wallColliders.push(pBox);
        });

        // Stainless steel pool ladder on wall
        const ladderMat = new THREE.MeshStandardMaterial({ color: 0xdde5ed, metalness: 0.95, roughness: 0.1 });
        const ladderRail1 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.2, 8), ladderMat);
        ladderRail1.position.set(rx - half + 0.15, 1.1, rz - 0.4);
        this.scene.add(ladderRail1);
        const ladderRail2 = ladderRail1.clone();
        ladderRail2.position.set(rx - half + 0.15, 1.1, rz + 0.4);
        this.scene.add(ladderRail2);
      }

      // Level 3: Archive Mahogany Bookcases & Shelves on Opposing Walls
      if (room.biome === 'archive') {
        const shelfMat = new THREE.MeshStandardMaterial({ map: this.textures.archiveWall, roughness: 0.5 });
        const shelf1 = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.8, 0.55), shelfMat);
        shelf1.position.set(rx - 3.4, 1.4, rz);
        this.scene.add(shelf1);
        this.wallColliders.push(new THREE.Box3().setFromObject(shelf1));

        const shelf2 = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.8, 0.55), shelfMat);
        shelf2.position.set(rx + 3.4, 1.4, rz);
        this.scene.add(shelf2);
        this.wallColliders.push(new THREE.Box3().setFromObject(shelf2));
      }

      // Level 4: Machine Sub-level Overhead Industrial Steam Pipes & Heavy Boiler
      if (room.biome === 'sublevel_red') {
        const pipeMat = new THREE.MeshStandardMaterial({ color: 0x3d170f, metalness: 0.8, roughness: 0.3 });
        const pipeGeo = new THREE.CylinderGeometry(0.18, 0.18, this.roomSize, 8);
        const pipe = new THREE.Mesh(pipeGeo, pipeMat);
        pipe.rotation.z = Math.PI / 2;
        pipe.position.set(rx, this.roomHeight - 0.45, rz - 1.5);
        this.scene.add(pipe);

        const pipe2 = pipe.clone();
        pipe2.position.set(rx, this.roomHeight - 0.45, rz + 1.5);
        this.scene.add(pipe2);

        // Cross pipe
        const pipeCross = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, this.roomSize, 8), pipeMat);
        pipeCross.rotation.x = Math.PI / 2;
        pipeCross.position.set(rx, this.roomHeight - 0.65, rz);
        this.scene.add(pipeCross);

        // Heavy industrial boiler drum in select rooms
        if (Math.random() > 0.4) {
          const boilerGeo = new THREE.CylinderGeometry(1.1, 1.1, 2.5, 12);
          const boilerMat = new THREE.MeshStandardMaterial({ color: 0x1f1a18, metalness: 0.85, roughness: 0.3 });
          const boiler = new THREE.Mesh(boilerGeo, boilerMat);
          boiler.position.set(rx - 2.8, 1.25, rz - 2.8);
          this.scene.add(boiler);
          this.wallColliders.push(new THREE.Box3().setFromObject(boiler));

          // Glowing red firebox grate at bottom of boiler
          const fireMat = new THREE.MeshStandardMaterial({ color: 0xff3300, emissive: 0xff2200, emissiveIntensity: 2.8 });
          const fireGrate = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.4, 0.2), fireMat);
          fireGrate.position.set(rx - 2.8, 0.3, rz - 1.8);
          this.scene.add(fireGrate);
        }
      }

      // Abundant Atmospheric Mini Light Sources & Environmental Luminescence
      if (room.biome === 'poolroom') {
        // Submerged cyan underwater drain & 4 perimeter glow emitters
        const drainMesh = new THREE.Mesh(
          new THREE.CircleGeometry(0.35, 16),
          new THREE.MeshStandardMaterial({ color: 0x00f5d4, emissive: 0x00f5d4, emissiveIntensity: 2.5 })
        );
        drainMesh.rotation.x = -Math.PI / 2;
        drainMesh.position.set(rx, 0.06, rz);
        this.scene.add(drainMesh);

        const poolGlow = new THREE.PointLight(0x00e5ff, 1.1, 7.0, 1.8);
        poolGlow.position.set(rx, 0.25, rz);
        this.scene.add(poolGlow);

        // 4 underwater corner perimeter luminescent pods
        const offsets = [[-3, -3], [3, -3], [-3, 3], [3, 3]];
        offsets.forEach(([ox, oz]) => {
          const pod = new THREE.Mesh(
            new THREE.CircleGeometry(0.18, 12),
            new THREE.MeshStandardMaterial({ color: 0x00ffff, emissive: 0x00e5ff, emissiveIntensity: 2.2 })
          );
          pod.rotation.x = -Math.PI / 2;
          pod.position.set(rx + ox, 0.05, rz + oz);
          this.scene.add(pod);

          const podLight = new THREE.PointLight(0x00f5d4, 0.55, 4.2);
          podLight.position.set(rx + ox, 0.2, rz + oz);
          this.scene.add(podLight);
        });
      } else if (room.biome === 'exit_airlock') {
        // Glowing emergency exit beacons
        const exitBeacon = new THREE.PointLight(0xff1122, 1.8, 8.5, 1.6);
        exitBeacon.position.set(rx, 2.9, rz - 4.2);
        this.scene.add(exitBeacon);

        const guideBeacon = new THREE.PointLight(0x00ffaa, 1.1, 5.0, 1.8);
        guideBeacon.position.set(rx, 1.2, rz - 3.8);
        this.scene.add(guideBeacon);
      } else if (room.biome === 'archive') {
        // Warm glowing brass wall sconces on east & west walls
        [-half + 0.15, half - 0.15].forEach((wx, i) => {
          const sconceMesh = new THREE.Mesh(
            new THREE.BoxGeometry(0.12, 0.25, 0.12),
            new THREE.MeshStandardMaterial({ color: 0xffaa44, emissive: 0xff8800, emissiveIntensity: 2.6 })
          );
          sconceMesh.position.set(rx + wx, 2.1, rz + (i === 0 ? -1.5 : 1.5));
          this.scene.add(sconceMesh);

          const sconceLight = new THREE.PointLight(0xffa233, 0.85, 5.2, 2.0);
          sconceLight.position.set(rx + wx + (i === 0 ? 0.2 : -0.2), 2.1, rz + (i === 0 ? -1.5 : 1.5));
          this.scene.add(sconceLight);
        });
      } else if (room.biome === 'sublevel_red') {
        // Dual industrial hazard beacon lamps & gauge indicators
        const lampMat = new THREE.MeshStandardMaterial({
          color: 0xff1100,
          emissive: 0xff2200,
          emissiveIntensity: 3.2,
        });
        const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.28, 0.14), lampMat);
        lamp.position.set(rx + half - 0.12, 2.3, rz);
        this.scene.add(lamp);

        const lampLight = new THREE.PointLight(0xff2200, 1.4, 6.0, 2.0);
        lampLight.position.set(rx + half - 0.25, 2.3, rz);
        this.scene.add(lampLight);

        // Secondary amber warning beacon
        const amberLight = new THREE.PointLight(0xf59e0b, 0.9, 4.8, 2.0);
        amberLight.position.set(rx - half + 0.25, 1.8, rz - 2.0);
        this.scene.add(amberLight);
      } else {
        // Yellow Halls: Dual wall electrical conduit boxes with bright green & amber status LEDs
        const boxMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.5 });
        const boxMesh = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.3, 0.09), boxMat);
        boxMesh.position.set(rx + half - 0.15, 1.7, rz);
        this.scene.add(boxMesh);

        // Emerald LED
        const ledMatGreen = new THREE.MeshStandardMaterial({
          color: 0x00ff88,
          emissive: 0x00ff88,
          emissiveIntensity: 3.0,
        });
        const ledGreen = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), ledMatGreen);
        ledGreen.position.set(rx + half - 0.2, 1.8, rz);
        this.scene.add(ledGreen);

        const ledPoint = new THREE.PointLight(0x00ff88, 0.85, 4.8, 2.0);
        ledPoint.position.set(rx + half - 0.28, 1.8, rz);
        this.scene.add(ledPoint);

        // Floor baseboard amber emergency marker diode along opposing wall
        const markerMat = new THREE.MeshStandardMaterial({
          color: 0xf59e0b,
          emissive: 0xf59e0b,
          emissiveIntensity: 2.8,
        });
        const marker = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.05, 0.05), markerMat);
        marker.position.set(rx - half + 0.1, 0.12, rz);
        this.scene.add(marker);

        const markerLight = new THREE.PointLight(0xf59e0b, 0.55, 3.8);
        markerLight.position.set(rx - half + 0.2, 0.2, rz);
        this.scene.add(markerLight);
      }

      // Build 4 Walls (with doorways for connected rooms)
      this.buildWall(rx, rz, 'north', room.doors.some((d) => d.direction === 'north'), wallMat);
      this.buildWall(rx, rz, 'south', room.doors.some((d) => d.direction === 'south'), wallMat);
      this.buildWall(rx, rz, 'east', room.doors.some((d) => d.direction === 'east'), wallMat);
      this.buildWall(rx, rz, 'west', room.doors.some((d) => d.direction === 'west'), wallMat);

      // Wall picture frames / art
      if (room.artSeed !== undefined && room.biome !== 'exit_airlock') {
        const artTexture = SvgHorrorArt.createArtTexture(
          room.artSeed,
          room.biome === 'sublevel_red' ? 'diagram' : room.biome === 'poolroom' ? 'polaroid' : 'portrait'
        );
        const frameMesh = new THREE.Mesh(
          new THREE.PlaneGeometry(1.2, 1.6),
          new THREE.MeshStandardMaterial({ map: artTexture, roughness: 0.5 })
        );
        frameMesh.position.set(rx, 1.8, rz - half + 0.05);
        this.scene.add(frameMesh);
      }

      // Spawn 3D Items in Room
      room.items.forEach((item) => {
        this.spawnItemMesh(item, rx, rz);
      });

      // Special Exit Airlock Gate
      if (room.biome === 'exit_airlock') {
        this.buildExitGate(rx, rz);
      }
    });

    // Set player starting position in spawn room
    const spawnX = labyrinth.spawnRoom.x * this.roomSize;
    const spawnZ = labyrinth.spawnRoom.z * this.roomSize;
    this.camera.position.set(spawnX, 1.6, spawnZ);
  }

  // --- 100% PROCEDURAL DREAMCORE SANCTUARY (LEVEL 0 SAFE ZONE) ---
  private buildDreamcoreSanctuary(labyrinth: GeneratedLabyrinth) {
    // 1. Nostalgic Pastel Atmosphere: Periwinkle / lavender dream sky & warm gentle mist
    this.scene.background = new THREE.Color(0xa5b4fc);
    this.scene.fog = new THREE.FogExp2(0xc7d2fe, 0.018);

    // Warm, soothing dreamcore directional sunlight
    const sun = new THREE.DirectionalLight(0xffedd5, 1.8);
    sun.position.set(30, 45, 20);
    this.scene.add(sun);

    const dreamAmbient = new THREE.AmbientLight(0xc4b5fd, 0.95);
    this.scene.add(dreamAmbient);

    // 2. Elevated Continuous Rolling Meadow Terrain
    const terrainSize = 90;
    const terrainGeo = new THREE.PlaneGeometry(terrainSize, terrainSize, 72, 72);
    terrainGeo.rotateX(-Math.PI / 2);
    // Center terrain over the 6x6 room expanse (x: 0 to 50, z: 0 to 50 -> center 25, 25)
    terrainGeo.translate(25, 0, 25);

    const pos = terrainGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vz = pos.getZ(i);
      pos.setY(i, this.getGroundHeight(vx, vz));
    }
    terrainGeo.computeVertexNormals();

    const grassTex = this.textures.dreamGrass;
    grassTex.repeat.set(16, 16);
    const terrainMat = new THREE.MeshStandardMaterial({
      map: grassTex,
      roughness: 0.85,
      metalness: 0.05,
    });
    const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
    terrainMesh.receiveShadow = true;
    terrainMesh.userData = { surface: 'carpet' }; // soft grass footsteps
    this.scene.add(terrainMesh);

    // 3. Solitary White Gateway Door on Eastern Summit Knoll
    const exitX = labyrinth.exitRoom.x * this.roomSize;
    const exitZ = labyrinth.exitRoom.z * this.roomSize;
    const exitGroundY = this.getGroundHeight(exitX, exitZ);
    this.buildDreamcoreGatewayDoor(exitX, exitZ, exitGroundY);

    // 4. Surreal Dreamcore Props (Floating Monoliths, Doric Columns, Solitary Bench & Orb Lamp)
    this.spawnDreamcoreProps();

    // 5. Spawn Lore Items (Nostalgic Postcards / Notes)
    labyrinth.rooms.forEach((room) => {
      const rx = room.x * this.roomSize;
      const rz = room.z * this.roomSize;
      room.items.forEach((item) => {
        this.spawnItemMesh(item, rx, rz);
      });
    });

    // 6. Set Player Spawn on Elevated Ground in Starting Meadow
    const spawnX = labyrinth.spawnRoom.x * this.roomSize;
    const spawnZ = labyrinth.spawnRoom.z * this.roomSize;
    const spawnY = this.getGroundHeight(spawnX, spawnZ);
    this.camera.position.set(spawnX, 1.6 + spawnY, spawnZ);
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
    this.wallColliders.push(new THREE.Box3().setFromObject(step1).translate(new THREE.Vector3(rx, groundY, rz)));

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

    // Ethereal Header Plaque: "THE THRESHOLD"
    const plaqueGeo = new THREE.BoxGeometry(1.8, 0.35, 0.12);
    const plaqueMat = new THREE.MeshStandardMaterial({ color: 0x312e81, roughness: 0.3 });
    const plaque = new THREE.Mesh(plaqueGeo, plaqueMat);
    plaque.position.set(0, 3.55, 0.12);
    group.add(plaque);

    // Generous Interaction Hitbox
    const hitBox = new THREE.Mesh(
      new THREE.BoxGeometry(4.5, 4.0, 4.5),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    hitBox.position.set(0, 2.0, 0);
    hitBox.userData = { isExitGate: true };
    group.add(hitBox);

    group.userData = { isExitGate: true };
    this.scene.add(group);
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
      this.scene.add(mesh);
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
      this.scene.add(col);
      this.wallColliders.push(new THREE.Box3().setFromObject(col));
    });

    // Architrave lintel beams across columns
    const beamGeo = new THREE.BoxGeometry(7.2, 0.4, 0.9);
    const beam1 = new THREE.Mesh(beamGeo, pillarMat);
    beam1.position.set(columnCenter.x, columnGround + 4.3, columnCenter.z - 2);
    this.scene.add(beam1);
    const beam2 = new THREE.Mesh(beamGeo, pillarMat);
    beam2.position.set(columnCenter.x, columnGround + 4.3, columnCenter.z + 2);
    this.scene.add(beam2);

    // 3. Solitary Wooden Bench & Vintage Streetlamp on rolling crest
    const benchCenter = { x: 18, z: 24 };
    const benchGround = this.getGroundHeight(benchCenter.x, benchCenter.z);

    const woodMat = new THREE.MeshStandardMaterial({ color: 0x5c3a21, roughness: 0.8 });
    const ironMat = new THREE.MeshStandardMaterial({ color: 0x1f2421, metalness: 0.8, roughness: 0.3 });

    const benchSeat = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.1, 0.6), woodMat);
    benchSeat.position.set(benchCenter.x, benchGround + 0.45, benchCenter.z);
    this.scene.add(benchSeat);

    const benchBack = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.6, 0.08), woodMat);
    benchBack.position.set(benchCenter.x, benchGround + 0.8, benchCenter.z - 0.28);
    this.scene.add(benchBack);
    this.wallColliders.push(new THREE.Box3().setFromObject(benchSeat));

    // Vintage Streetlamp with glowing warm globe
    const lampPost = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 3.6, 8), ironMat);
    lampPost.position.set(benchCenter.x + 1.8, benchGround + 1.8, benchCenter.z);
    this.scene.add(lampPost);
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
    this.scene.add(globe);

    const globeLight = new THREE.PointLight(0xfef08a, 1.4, 12.0, 1.5);
    globeLight.position.set(benchCenter.x + 1.8, benchGround + 3.6, benchCenter.z);
    this.scene.add(globeLight);
  }

  private buildWall(
    rx: number,
    rz: number,
    dir: 'north' | 'south' | 'east' | 'west',
    hasDoor: boolean,
    mat: THREE.Material
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
      this.scene.add(wall);

      const box = new THREE.Box3().setFromObject(wall);
      this.wallColliders.push(box);
    } else {
      // Wall with central doorway opening
      const segmentWidth = (this.roomSize - doorWidth) / 2;

      const createSegment = (offsetX: number, offsetZ: number, w: number, d: number) => {
        const seg = new THREE.Mesh(new THREE.BoxGeometry(w, this.roomHeight, d), mat);
        seg.position.set(offsetX, this.roomHeight / 2, offsetZ);
        this.scene.add(seg);
        this.wallColliders.push(new THREE.Box3().setFromObject(seg));
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
        this.scene.add(header);

        // Doorway Threshold Lintel Guidance Beacon (Mini source light)
        const diodeColor =
          this.currentLevel === 2 ? 0x00f5d4 : this.currentLevel === 4 ? 0xff4d26 : this.currentLevel === 3 ? 0xf59e0b : 0x38bdf8;
        const diodeMat = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          emissive: diodeColor,
          emissiveIntensity: 3.0,
        });
        const diode = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.08, 0.08), diodeMat);
        diode.position.set(rx, doorHeight + 0.08, wz);
        this.scene.add(diode);

        const diodeLight = new THREE.PointLight(diodeColor, 0.55, 3.8, 2.0);
        diodeLight.position.set(rx, doorHeight - 0.1, wz);
        this.scene.add(diodeLight);
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
        this.scene.add(header);

        // Doorway Threshold Lintel Guidance Beacon (Mini source light)
        const diodeColor =
          this.currentLevel === 2 ? 0x00f5d4 : this.currentLevel === 4 ? 0xff4d26 : this.currentLevel === 3 ? 0xf59e0b : 0x38bdf8;
        const diodeMat = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          emissive: diodeColor,
          emissiveIntensity: 3.0,
        });
        const diode = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.35), diodeMat);
        diode.position.set(wx, doorHeight + 0.08, rz);
        this.scene.add(diode);

        const diodeLight = new THREE.PointLight(diodeColor, 0.55, 3.8, 2.0);
        diodeLight.position.set(wx, doorHeight - 0.1, rz);
        this.scene.add(diodeLight);
      }
    }
  }

  private spawnItemMesh(item: WorldItem, rx: number, rz: number) {
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

      const glowLight = new THREE.PointLight(0x00f5d4, 2.2, 5.5, 2.0);
      itemGroup.add(glowLight);
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
          emissiveIntensity: 3.2,
        })
      );
      battDiode.position.set(0, 0.15, 0);
      itemGroup.add(battDiode);

      const battLight = new THREE.PointLight(0x22c55e, 1.25, 3.2, 2.0);
      battLight.position.set(0, 0.22, 0);
      itemGroup.add(battLight);
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
          emissiveIntensity: 0.75,
          roughness: 0.4,
          side: THREE.DoubleSide,
        })
      );
      paper.rotation.x = -Math.PI / 2;
      itemGroup.add(paper);

      const noteLight = new THREE.PointLight(0xfef08a, 0.5, 2.5);
      noteLight.position.set(0, 0.1, 0);
      itemGroup.add(noteLight);
    }

    // Generous invisible interaction hit-sphere to make aiming easy & forgiving
    const hitSphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.65, 8, 8),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    itemGroup.add(hitSphere);

    itemGroup.userData = { isInteractable: true, item };
    this.scene.add(itemGroup);
    this.interactables.push(itemGroup);
    this.itemDataMap.set(itemGroup, item);
  }

  private buildExitGate(rx: number, rz: number) {
    const group = new THREE.Group();
    group.position.set(rx, 0, rz);

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

      const beaconLight = new THREE.PointLight(0xff0022, 1.4, 6.0);
      beaconLight.position.set(bx, 3.25, -4.4);
      group.add(beaconLight);
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
      new THREE.MeshBasicMaterial({ visible: false })
    );
    exitHitBox.position.set(0, 1.8, -4.0);
    exitHitBox.userData = { isExitGate: true };
    group.add(exitHitBox);

    group.userData = { isExitGate: true };
    this.scene.add(group);
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
        this.scene.remove(obj);
        this.interactables.splice(i, 1);
        break;
      }
    }
  }

  public isPositionValid(pos: THREE.Vector3): boolean {
    if (this.currentLevel === 0) {
      // Keep player inside the peaceful rolling dream meadow boundary
      if (pos.x < -4 || pos.x > 54 || pos.z < -4 || pos.z > 54) {
        return false;
      }
    }
    const playerRadius = 0.35;
    const playerBox = new THREE.Box3(
      new THREE.Vector3(pos.x - playerRadius, pos.y - 1.2, pos.z - playerRadius),
      new THREE.Vector3(pos.x + playerRadius, pos.y + 0.2, pos.z + playerRadius)
    );

    for (const collider of this.wallColliders) {
      if (collider.intersectsBox(playerBox)) {
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

    // Update Flashlight position & direction
    this.flashlight.position.copy(this.camera.position);
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
    this.flashlightTarget.position.copy(this.camera.position).add(forward);

    // Floating item animations (Reality Anchors)
    const time = Date.now() * 0.003;
    this.interactables.forEach((obj) => {
      obj.traverse((child) => {
        if (child.userData.isFloating) {
          child.rotation.y += delta * 1.5;
          child.position.y = Math.sin(time) * 0.08;
        }
      });
    });

    // Floating monolith rotation & slow bobbing in Dreamcore
    if (this.currentLevel === 0) {
      const timeSec = performance.now() * 0.001;
      this.scene.traverse((obj) => {
        if (obj.userData?.isFloatingMonolith) {
          obj.rotation.x += delta * (obj.userData.rotSpeed * 0.5);
          obj.rotation.y += delta * obj.userData.rotSpeed;
          obj.position.y = obj.userData.baseY + Math.sin(timeSec * 0.8 + obj.userData.bobPhase) * 0.35;
        }
      });
    }

    // Flickering ceiling lights
    this.ceilingLights.forEach((cl) => {
      if (cl.flicker && Math.random() > 0.985) {
        const off = Math.random() > 0.4;
        cl.light.intensity = off ? 0.05 : 0.75;
        (cl.mesh.material as THREE.MeshBasicMaterial).color.setHex(off ? 0x222222 : 0xfff5d1);
      }
    });

    this.renderer.render(this.scene, this.camera);
  }

  public dispose() {
    window.removeEventListener('resize', this.onResize);
    this.renderer.dispose();
  }
}
