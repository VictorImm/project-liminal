export type RoomBiome = 'mono_yellow' | 'poolroom' | 'archive' | 'sublevel_red' | 'exit_airlock';

export interface RoomDoor {
  direction: 'north' | 'south' | 'east' | 'west';
  isOpen: boolean;
  isLocked?: boolean;
}

export interface WorldItem {
  id: string;
  type: 'anchor' | 'battery' | 'note' | 'phone';
  name: string;
  description: string;
  roomX: number;
  roomZ: number;
  localPos: [number, number, number]; // relative to room center
  collected?: boolean;
}

export interface MapRoom {
  x: number;
  z: number;
  biome: RoomBiome;
  doors: RoomDoor[];
  items: WorldItem[];
  hasLightFlicker: boolean;
  lightColor: string;
  pillarPositions?: [number, number][]; // for poolrooms
  artSeed?: number;
}

export interface GeneratedLabyrinth {
  rooms: MapRoom[];
  spawnRoom: { x: number; z: number };
  exitRoom: { x: number; z: number };
  anchorsCount: number;
  seed: string;
  level: number;
  levelTitle: string;
}

// Simple seeded PRNG (Mulberry32)
class PRNG {
  private s: number;
  constructor(seedStr: string) {
    let hash = 0;
    for (let i = 0; i < seedStr.length; i++) {
      hash = Math.imul(31, hash) + seedStr.charCodeAt(i) | 0;
    }
    this.s = hash || 123456789;
  }
  next(): number {
    let t = this.s += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

export class LabyrinthGenerator {
  public static generate(customSeed?: string, level: number = 1): GeneratedLabyrinth {
    const seed = customSeed || 'LIMINAL-' + Math.floor(Math.random() * 900000 + 100000);
    const rng = new PRNG(`${seed}-LV${level}`);

    const levelTitles = [
      'LEVEL 1 // THE YELLOW MONO-HALLS',
      'LEVEL 2 // SUBLIMITY POOLROOMS',
      'LEVEL 3 // ENDLESS ARCHIVE & HOTEL',
      'LEVEL 4 // THE MACHINE SUB-LEVEL & BOILER',
    ];
    const currentLevel = Math.max(1, Math.min(4, level));
    const levelTitle = levelTitles[currentLevel - 1];

    // --- PROCEDURAL MAP TOPOLOGY PER LEVEL (ZERO REPETITION) ---
    // Level 1: Sprawling 5x5 office labyrinth with interconnected loops & dead ends
    // Level 2: Elongated 7x3 flooded aqueduct & central open bath atriums
    // Level 3: Grand 6x5 hotel corridor spine with branching archive suites
    // Level 4: Claustrophobic 6x6 serpentine boiler trench & machine core
    let gridW = 5;
    let gridH = 5;
    let targetRoomCount = 14;
    let startCoord = { x: 0, z: 0 };

    if (currentLevel === 2) {
      gridW = 7;
      gridH = 3;
      targetRoomCount = 13;
      startCoord = { x: 0, z: 1 };
    } else if (currentLevel === 3) {
      gridW = 6;
      gridH = 5;
      targetRoomCount = 14;
      startCoord = { x: 0, z: 2 };
    } else if (currentLevel === 4) {
      gridW = 6;
      gridH = 6;
      targetRoomCount = 16;
      startCoord = { x: 0, z: 0 };
    }

    const visited = new Set<string>();
    const queue: [number, number][] = [[startCoord.x, startCoord.z]];
    visited.add(`${startCoord.x},${startCoord.z}`);

    // Procedural room growth guided by level topology rules
    while (queue.length > 0 && visited.size < targetRoomCount) {
      const current = queue.shift()!;
      const [cx, cz] = current;

      let neighbors: [number, number, 'north' | 'south' | 'east' | 'west'][] = [
        [cx, cz - 1, 'north'],
        [cx, cz + 1, 'south'],
        [cx + 1, cz, 'east'],
        [cx - 1, cz, 'west'],
      ];

      // Shuffle neighbors
      for (let i = neighbors.length - 1; i > 0; i--) {
        const j = Math.floor(rng.next() * (i + 1));
        [neighbors[i], neighbors[j]] = [neighbors[j], neighbors[i]];
      }

      // Level 3 Architecture Bias: Hotel Spine along z=2
      if (currentLevel === 3 && cz === 2 && rng.next() > 0.3) {
        neighbors.sort((a, b) => (a[1] === 2 ? -1 : 1));
      }

      // Level 2 Architecture Bias: Aqueduct eastward expansion
      if (currentLevel === 2 && rng.next() > 0.35) {
        neighbors.sort((a, b) => (a[2] === 'east' ? -1 : 1));
      }

      for (const [nx, nz] of neighbors) {
        if (nx >= 0 && nx < gridW && nz >= 0 && nz < gridH) {
          const key = `${nx},${nz}`;
          if (!visited.has(key) && visited.size < targetRoomCount) {
            visited.add(key);
            queue.push([nx, nz]);
          }
        }
      }
    }

    const roomCoords = Array.from(visited).map((k) => {
      const [x, z] = k.split(',').map(Number);
      return { x, z };
    });

    const spawnCoord = roomCoords[0];
    const exitCoord = roomCoords[roomCoords.length - 1]; // Farthest carved room

    const activeRooms: Map<string, MapRoom> = new Map();

    // Build room objects - 100% Dedicated Pure Biomes Per Level
    roomCoords.forEach((coord) => {
      const isExit = coord.x === exitCoord.x && coord.z === exitCoord.z;

      let biome: RoomBiome = 'mono_yellow';
      let lightColor = '#fff5d1';

      if (isExit) {
        biome = 'exit_airlock';
        lightColor = '#ff2233';
      } else {
        if (currentLevel === 2) {
          biome = 'poolroom';
          lightColor = '#67e8f9';
        } else if (currentLevel === 3) {
          biome = 'archive';
          lightColor = '#fed7aa';
        } else if (currentLevel === 4) {
          biome = 'sublevel_red';
          lightColor = '#ef4444';
        } else {
          biome = 'mono_yellow';
          lightColor = '#fef08a';
        }
      }

      const doors: RoomDoor[] = [];
      const neighbors: { dir: 'north' | 'south' | 'east' | 'west'; x: number; z: number }[] = [
        { dir: 'north', x: coord.x, z: coord.z - 1 },
        { dir: 'south', x: coord.x, z: coord.z + 1 },
        { dir: 'east', x: coord.x + 1, z: coord.z },
        { dir: 'west', x: coord.x - 1, z: coord.z },
      ];

      neighbors.forEach((n) => {
        if (visited.has(`${n.x},${n.z}`)) {
          doors.push({
            direction: n.dir,
            isOpen: false,
            isLocked: false,
          });
        }
      });

      const room: MapRoom = {
        x: coord.x,
        z: coord.z,
        biome,
        doors,
        items: [],
        hasLightFlicker: rng.next() > 0.45,
        lightColor,
        artSeed: Math.floor(rng.next() * 10000),
      };

      if (biome === 'poolroom') {
        room.pillarPositions = [
          [-2.4, -2.4],
          [2.4, -2.4],
          [-2.4, 2.4],
          [2.4, 2.4],
        ];
      }

      activeRooms.set(`${coord.x},${coord.z}`, room);
    });

    // Distribute 3 Reality Anchors (Uniquely Themed per Level)
    const nonSpecialRooms = roomCoords.filter(
      (c) => !(c.x === spawnCoord.x && c.z === spawnCoord.z) && !(c.x === exitCoord.x && c.z === exitCoord.z)
    );

    // Shuffle non-special rooms
    for (let i = nonSpecialRooms.length - 1; i > 0; i--) {
      const j = Math.floor(rng.next() * (i + 1));
      [nonSpecialRooms[i], nonSpecialRooms[j]] = [nonSpecialRooms[j], nonSpecialRooms[i]];
    }

    // Level-specific Reality Anchor Definitions
    let anchorDefs = [
      {
        id: 'anchor_cassette_lv1',
        name: 'The 1988 Microcassette',
        description: 'Looping magnetic tape recording of an office switchboard ringing endlessly in empty halls.',
      },
      {
        id: 'anchor_polaroid_lv1',
        name: 'Developing Polaroid Photo',
        description: 'A damp photograph of an identical yellow corridor with no doors and no shadows.',
      },
      {
        id: 'anchor_badge_lv1',
        name: 'Sector 0 Laminated Badge',
        description: 'A faded staff ID badge with the name chemically scraped off.',
      },
    ];

    if (currentLevel === 2) {
      anchorDefs = [
        {
          id: 'anchor_drain_key_lv2',
          name: 'Solid Brass Drain Key',
          description: 'A heavy T-bar key used to seal the subterranean chlorination aqueduct.',
        },
        {
          id: 'anchor_goggles_lv2',
          name: 'Fogged Diving Goggles',
          description: 'Swim goggles encrusted with dry white pool sediment, catching faint turquoise light.',
        },
        {
          id: 'anchor_hydro_vial_lv2',
          name: 'Resonator Hydro-Vial',
          description: 'A sealed glass ampoule holding pristine, luminescent turquoise poolroom water.',
        },
      ];
    } else if (currentLevel === 3) {
      anchorDefs = [
        {
          id: 'anchor_ledger_lv3',
          name: '1924 Vault Registry Ledger',
          description: 'A vellum-bound volume recording guests who entered the archives and never checked out.',
        },
        {
          id: 'anchor_keycard_lv3',
          name: 'Embossed Brass Room 304 Key',
          description: 'A heavy hotel skeleton key with a dark mahogany tassel tag.',
        },
        {
          id: 'anchor_prism_lv3',
          name: 'Faceted Reading Lamp Crystal',
          description: 'A heavy cut glass prism that refracts shadows into warm antique amber.',
        },
      ];
    } else if (currentLevel === 4) {
      anchorDefs = [
        {
          id: 'anchor_boiler_valve_lv4',
          name: 'Cast Iron Pressure Valve',
          description: 'Heavy four-spoke industrial valve wheel that locks the superheated steam conduit.',
        },
        {
          id: 'anchor_fuse_core_lv4',
          name: 'Ceramic High-Voltage Fuse Core',
          description: 'A buzzing ceramic cylinder charged with erratic industrial static electricity.',
        },
        {
          id: 'anchor_hazard_filter_lv4',
          name: 'Sub-Level 4 Respirator Cartridge',
          description: 'A filter canister stamped with the hazard insignia of the deep boiler sub-core.',
        },
      ];
    }

    anchorDefs.forEach((a, i) => {
      const targetRoomCoord = nonSpecialRooms[i % nonSpecialRooms.length];
      const room = activeRooms.get(`${targetRoomCoord.x},${targetRoomCoord.z}`)!;
      room.items.push({
        id: a.id,
        type: 'anchor',
        name: a.name,
        description: a.description,
        roomX: room.x,
        roomZ: room.z,
        localPos: [(rng.next() - 0.5) * 3.5, 0.8, (rng.next() - 0.5) * 3.5],
      });
    });

    // Distribute Spare Batteries (3 items)
    for (let b = 0; b < 3; b++) {
      const roomCoord = nonSpecialRooms[(b + 3) % nonSpecialRooms.length];
      const room = activeRooms.get(`${roomCoord.x},${roomCoord.z}`)!;
      room.items.push({
        id: `battery_${b}`,
        type: 'battery',
        name: 'Heavy Duty 9V Cell',
        description: 'Restores 45% flashlight charge.',
        roomX: room.x,
        roomZ: room.z,
        localPos: [(rng.next() - 0.5) * 4, 0.4, (rng.next() - 0.5) * 4],
      });
    }

    // Place Ringing Telephone
    const phoneRoomCoord = nonSpecialRooms[rng.next() > 0.5 ? 0 : nonSpecialRooms.length - 1];
    const phoneRoom = activeRooms.get(`${phoneRoomCoord.x},${phoneRoomCoord.z}`)!;
    phoneRoom.items.push({
      id: 'rotary_phone',
      type: 'phone',
      name: 'Ringing Rotary Telephone',
      description: 'A black rotary phone sitting on a bare table, bells clattering with static.',
      roomX: phoneRoom.x,
      roomZ: phoneRoom.z,
      localPos: [1.2, 0.75, -1.2],
    });

    // Level-specific Cryptic Notes & Lore
    let levelNotes = [
      {
        id: 'note_1',
        title: 'Facility Maintenance Notice',
        text: 'The 60Hz hum must never stop. If the ballast sound drops to silence, turn off your flashlight and face the wall.',
      },
      {
        id: 'note_2',
        title: 'Torn Spiral Notebook Page',
        text: 'Every yellow room looks identical, but there are 3 anchors that resonate. Collect them to unlock the airlock.',
      },
      {
        id: 'note_3',
        title: 'Memo to Sector 0 Personnel',
        text: 'Do not follow voices calling from adjacent corridors. The carpet dampness increases near danger.',
      },
    ];

    if (currentLevel === 2) {
      levelNotes = [
        {
          id: 'note_1',
          title: 'Sublimity Hydro-Log',
          text: 'The pool water is warm and calm. Do not submerge your head; you will hear footsteps swimming beneath the floor tiles.',
        },
        {
          id: 'note_2',
          title: 'Diving Instructor Note',
          text: 'Find the 3 submerged anchors (Brass Key, Fogged Goggles, Hydro-Vial) to pressurize the aqueduct airlock.',
        },
        {
          id: 'note_3',
          title: 'Scratched on White Tile',
          text: 'The water ripples even when no one is moving. When the tiles turn dark, get out of the water.',
        },
      ];
    } else if (currentLevel === 3) {
      levelNotes = [
        {
          id: 'note_1',
          title: 'Archive Curator Diary Entry',
          text: 'Books here are dated up to the year 2340. None of them contain words, only numbers and floorplan blueprints.',
        },
        {
          id: 'note_2',
          title: 'Grand Hotel Reception Slip',
          text: 'Room 304 cannot be locked from the outside. The 3 archives relics will open the vault door at the end of the hall.',
        },
        {
          id: 'note_3',
          title: 'Bookmarker Inscription',
          text: 'Listen to the wooden floorboards creaking. It moves through the bookshelves when your back is turned.',
        },
      ];
    } else if (currentLevel === 4) {
      levelNotes = [
        {
          id: 'note_1',
          title: 'Boiler Core Emergency Override',
          text: 'Superheated steam exceeds 450°C. Do not touch metal grating without insulation. The red hazard lights signal its hunt.',
        },
        {
          id: 'note_2',
          title: 'Sub-Level 4 Engineering Protocol',
          text: 'Collect the Valve, Fuse Core, and Hazard Filter to override the hydraulic blast gate.',
        },
        {
          id: 'note_3',
          title: 'Warning Painted in Rust',
          text: 'The engine heartbeat you hear is not the machinery. Run when the pipes start hammering.',
        },
      ];
    }

    levelNotes.forEach((note, idx) => {
      const roomCoord = nonSpecialRooms[(idx + 1) % nonSpecialRooms.length];
      const room = activeRooms.get(`${roomCoord.x},${roomCoord.z}`)!;
      room.items.push({
        id: note.id,
        type: 'note',
        name: note.title,
        description: note.text,
        roomX: room.x,
        roomZ: room.z,
        localPos: [(rng.next() - 0.5) * 3, 0.6, (rng.next() - 0.5) * 3],
      });
    });

    return {
      rooms: Array.from(activeRooms.values()),
      spawnRoom: spawnCoord,
      exitRoom: exitCoord,
      anchorsCount: 3,
      seed,
      level: currentLevel,
      levelTitle,
    };
  }
}
