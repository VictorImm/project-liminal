/**
 * Centralized Level-Specific Lore Repository
 * Authors high-quality, atmospheric, and diegetic narratives for Letters (Notes) and Telephones.
 * 100% authored offline data - zero external dependencies or online API calls.
 */

export interface NoteLore {
  id: string;
  title: string;
  text: string;
}

export interface PhoneCallLore {
  id: string;
  caller: string;
  transcript: string;
}

export interface LevelLoreCollection {
  notes: NoteLore[];
  phoneCalls: PhoneCallLore[];
}

export const LEVEL_LORE: Record<number, LevelLoreCollection> = {
  // --- LEVEL 0: DREAM SANCTUARY ---
  // Theme: peaceful dreamcore, forgotten childhood memories, nostalgia, quiet sanctuary.
  0: {
    notes: [
      {
        id: 'note_dream_1',
        title: 'A Faded Childhood Postcard',
        text: 'Wish you were here. The clouds never move, and the grass stays warm even when the sun goes behind the pillars. There is nothing here that can harm you. If you ever decide to leave, the solitary white doorway is waiting on the eastern knoll.',
      },
      {
        id: 'note_dream_2',
        title: 'Weathered Journal Fragment: Summer 1997',
        text: "The breeze smells like warm rain and distant lilacs from an afternoon I can't quite place. No fluorescent hum. No footsteps behind me. I think this is where lost things rest before they are completely forgotten.",
      },
      {
        id: 'note_dream_3',
        title: 'Polaroid of the Playground (1995)',
        text: 'The swings were still swaying in the picture, but no one was sitting on them. It felt as though someone had jumped off only a second before the shutter clicked. The shadows never lengthen here.',
      },
      {
        id: 'note_dream_4',
        title: 'Notebook Page: The Ridge Bell',
        text: 'If the red telephone rings by the marble arch, take your time. There is no urgency in this meadow. The operator only remembers songs from before the threshold closed.',
      },
    ],
    phoneCalls: [
      {
        id: 'phone_call_dream_1',
        caller: 'Distant Switchboard // Circuit 04',
        transcript:
          '...soft vinyl hiss... "Thank you for holding. All lines to August 1998 are currently occupied. The weather across the meadow will remain pleasant indefinitely. You don\'t have to wake up yet... please stay as long as you need."',
      },
      {
        id: 'phone_call_dream_2',
        caller: 'Faded Magnetic Tape // 1994',
        transcript:
          '...gentle piano chords echoing in the distance... "Hi, it\'s me. If you found the hill with the three columns, wait there. I left the picnic blanket by the oak tree. The sun isn\'t setting, so take all the time you want."',
      },
      {
        id: 'phone_call_dream_3',
        caller: 'Unassigned Switchboard',
        transcript:
          '...warm analog tape hum... A quiet voice hums a faint, familiar lullaby over the receiver. After a moment, a whisper: "Do you remember the sound of the wind through the screen door? Keep walking east when you are ready."',
      },
    ],
  },

  // --- LEVEL 1: THE YELLOW HALLS ---
  // Theme: monotonous office spaces, abandoned institutional environments, Backrooms familiarity.
  1: {
    notes: [
      {
        id: 'note_1',
        title: 'Facility Maintenance Memo #412',
        text: 'The 60Hz ballast hum must remain within spec (42-48 dB). Several staff reported a drop in volume near Sector C. Remember: if the fluorescent hum drops to total silence, turn off all torches immediately and face the partition wall until vibration resumes.',
      },
      {
        id: 'note_2',
        title: 'Unfinished Shift Log (Desk 14-B)',
        text: 'Third week auditing this floor plan. Room 108 is labeled on the blueprint as an archive, but every doorway on this corridor opens into another hallway of the exact same dimensions. The dampness in the carpet smells like old cellulose. I haven\'t seen the janitor in days.',
      },
      {
        id: 'note_3',
        title: 'Torn Steno Pad Note',
        text: 'Do not follow the telephone rings into narrow alcoves. Yesterday I swore I heard keyboard clicking from the next cubicle, but when I rounded the partition, it was just another blank drywall corner with three reality anchors vibrating on the floor.',
      },
    ],
    phoneCalls: [
      {
        id: 'phone_call_yellow_1',
        caller: 'Internal Extension 104 // Facility Dispatch',
        transcript:
          '...crackle of a heavy telephone receiver being lifted... "Night shift, is that you? We have an anomaly on the floor telemetry—your terminal shows you\'re in the west annex, but the west annex was demolished in \'89. Don\'t touch the wallpaper seam... hello? Who is this?"',
      },
      {
        id: 'phone_call_yellow_2',
        caller: 'Automated Building Announcement',
        transcript:
          '...monotone chime... "Attention all personnel: The fluorescent lighting schedule has been suspended. Please remain at your designated cubicle. If your hallway appears longer than 200 meters, do not attempt to reach the exit door. Maintenance has been notified."',
      },
      {
        id: 'phone_call_yellow_3',
        caller: 'Crossed Wire // Sector 1',
        transcript:
          '...distant paper shuffling and low murmuring... "I checked the floorplan again. None of these four hallways connect to the elevator shaft. If you\'re on the line, listen to the ballast hum—when the pitch shifts sharp, step into the nearest open room."',
      },
    ],
  },

  // --- LEVEL 2: SUBLIMITY POOLS ---
  // SKIP THIS LEVEL: 100% PRESERVED AND UNTOUCHED.
  2: {
    notes: [
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
    ],
    phoneCalls: [
      {
        id: 'phone_call_pool',
        caller: 'The Static Voice',
        transcript:
          '...do not let the fluorescent lights turn off... when the hum drops, it crawls along the ceiling... find the 3 anchors... hurry...',
      },
    ],
  },

  // --- LEVEL 3: ENDLESS ARCHIVES ---
  // Theme: endless records, forgotten identities, repetitive history, unreliable memory, infinite loop.
  3: {
    notes: [
      {
        id: 'note_1',
        title: 'Accession Ledger #1924-B',
        text: 'Item 884: Mahogany filing cabinet, drawer 2 ajar. Cataloger note: The records inside list residents who died in 1912, but their birth certificates are dated 1968. I replaced the ledger this morning, yet the same page was already open on the counter.',
      },
      {
        id: 'note_2',
        title: "Librarian's Margin Note",
        text: 'I counted the stack rows four times. Each loop contains twelve bookshelves, one brass wall sconce, and one portrait of an unnamed gentleman. On the third pass, the portrait was tilted three degrees to the left. The architecture is remembering itself incorrectly.',
      },
      {
        id: 'note_3',
        title: 'Torn Bookmark Slip',
        text: 'If you feel you have walked past this crimson carpet runner before, do not check your watch. Time does not record forward in the stacks. Collect the three relics before the index numbers begin repeating your own name.',
      },
    ],
    phoneCalls: [
      {
        id: 'phone_call_archive_1',
        caller: 'Archive Central Catalog System',
        transcript:
          '...heavy mechanical relay click... "You have reached the Central Index. The record you requested does not exist in this epoch. Records for today have been duplicated seventeen times. If you are experiencing spatial repetition, please return to your origin shelf."',
      },
      {
        id: 'phone_call_archive_2',
        caller: 'Unknown Extension // Reading Room 3',
        transcript:
          '...faint ticking clock and rustling pages... "Hello? Front desk? I\'ve been walking toward the north reading room for three hours, but every door leads back to stack row 14. Even the dust on the encyclopedia volumes is identical. Are you still there?"',
      },
      {
        id: 'phone_call_archive_3',
        caller: 'Curator Dictaphone Cylinder',
        transcript:
          '...scratchy cylinder recording... "Observation note 44: The archives are not expanding outward; they are reprinting the same corridor with microscopic variations. A drawer left open in room 2, a sconce flickering in room 4... it is preserving people who never left."',
      },
    ],
  },

  // --- LEVEL 4: MACHINE SUB-CORE ---
  // Theme: abandoned machinery, system maintenance, industrial infrastructure, malfunctioning environment.
  4: {
    notes: [
      {
        id: 'note_1',
        title: 'Boiler Sector Incident Report 04',
        text: 'Main turbine steam pressure fluctuating between 85 and 110 PSI. Condensation haze has exceeded standard ventilation limits. The exhaust fans in the upper shafts are still rotating, but the intake air is colder than ambient ground temperature.',
      },
      {
        id: 'note_2',
        title: 'Engineering Shift Handover Memo',
        text: 'To incoming shift: Do not open bypass valve 3 without the manual pressure key. The steam vents have begun hissing in harmonic intervals. When the fog density increases, use the emergency hazard stripes to track your way back to the blast bulkhead.',
      },
      {
        id: 'note_3',
        title: 'Scratched on Turbine Casing',
        text: "The heartbeat in the metal pipes isn't the boiler feedwater pump. The pistons stopped cycling twenty years ago. If the steam pressure gauge needle drops to zero while the pipes are hot, seal the airlock immediately.",
      },
    ],
    phoneCalls: [
      {
        id: 'phone_call_core_1',
        caller: 'Sub-Core Intercom // Station B-2',
        transcript:
          '...loud hydraulic valve hiss and mechanical clatter... "Control room! Pressure on boiler four is spiking into the red arc! The steam relief line won\'t respond to the manual wheel! If you\'re on the catwalk, kill the feed pump before the bulkhead seals!"',
      },
      {
        id: 'phone_call_core_2',
        caller: 'Industrial Telemetry Beacon',
        transcript:
          '...harsh electronic alert buzz... "Warning: Atmospheric moisture levels in Sub-Level 4 have exceeded safe operating parameters. Steam density is unmonitored. All maintenance personnel must secure three isolation fuses to cycle the hydraulic blast gate."',
      },
      {
        id: 'phone_call_core_3',
        caller: 'Remote Pump Gallery Dispatch',
        transcript:
          '...rhythmic metallic hammering over the wire... "This is operator Miller at the lower sump. None of the floor gauges match the schematic. The pipes are vibrating at sixty cycles... whatever is in the core, it isn\'t running on steam. Don\'t let the lights trip."',
      },
    ],
  },
};

/**
 * Retrieve notes for a specific level.
 */
export function getLevelNotes(level: number): NoteLore[] {
  return LEVEL_LORE[level]?.notes || LEVEL_LORE[1].notes;
}

/**
 * Retrieve a telephone call for a specific level, cycling through authored messages deterministically.
 */
export function getLevelPhoneCall(level: number, callIndex: number = 0): PhoneCallLore {
  const calls = LEVEL_LORE[level]?.phoneCalls || LEVEL_LORE[1].phoneCalls;
  const safeIdx = Math.abs(callIndex) % calls.length;
  return calls[safeIdx];
}
