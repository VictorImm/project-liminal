/**
 * Procedural Web Audio API Engine
 * Generates all ambient drones, 60Hz fluorescent ballast hums, surface footsteps,
 * rotary telephone rings, spatial whispers, heartbeats, and jumpscare stingers in real-time.
 * 100% code synthesized - zero external audio assets.
 */

interface DreamChord {
  name: string;
  bass: number;
  voices: number[];
  melody: number;
}

// 4-Chord Liminal Dreamcore Progression: Fmaj9 -> Em7 -> Dm9 -> Cmaj9
// Lush open voicings spanning octaves 3, 4, and 5 for an ethereal, nostalgic ambient pad
const DREAM_CHORDS: DreamChord[] = [
  {
    name: 'Fmaj9',
    bass: 87.31, // F2
    voices: [174.61, 261.63, 329.63, 392.00, 523.25], // F3, C4, E4, G4, C5
    melody: 659.25, // E5 (high singing chime)
  },
  {
    name: 'Em7',
    bass: 82.41, // E2
    voices: [164.81, 246.94, 293.66, 392.00, 493.88], // E3, B3, D4, G4, B4
    melody: 587.33, // D5
  },
  {
    name: 'Dm9',
    bass: 73.42, // D2
    voices: [146.83, 220.00, 261.63, 329.63, 440.00], // D3, A3, C4, E4, A4
    melody: 523.25, // C5
  },
  {
    name: 'Cmaj9',
    bass: 65.41, // C2
    voices: [130.81, 196.00, 246.94, 293.66, 392.00], // C3, G3, B3, D4, G4
    melody: 493.88, // B4
  },
];

class AudioEngineClass {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private humGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private staticGain: GainNode | null = null;
  private staticSource: AudioBufferSourceNode | null = null;
  private dreamcoreGain: GainNode | null = null;
  private dreamcorePadGain: GainNode | null = null;
  private dreamcoreChimeTimer: number | null = null;
  private dreamcoreChordTimer: number | null = null;
  private dreamcoreChordIndex: number = 0;
  private dreamcoreBassOsc: OscillatorNode | null = null;
  private dreamcoreVoiceOscs: OscillatorNode[] = [];
  private activeLevel: number = 1;
  private heartbeatTimer: number | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.8;
  private enableJumpscares: boolean = true;
  private isInitialized: boolean = false;

  public init() {
    if (this.ctx && this.ctx.state === 'running') return;

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.initFluorescentHum();
      this.initProximityStatic();
      this.initLiminalAmbience();
      this.initDreamcoreAmbience();
      this.isInitialized = true;
    } catch (e) {
      console.warn('Web Audio initialization error:', e);
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
  }

  public setJumpscareSetting(enabled: boolean) {
    this.enableJumpscares = enabled;
  }

  public resumeContext() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // --- PROCEDURAL 60Hz FLUORESCENT BALLAST HUM ---
  private initFluorescentHum() {
    if (!this.ctx || !this.masterGain) return;

    // 60Hz main hum + 120Hz, 180Hz, 300Hz transformer electrical ballast harmonics
    const osc60 = this.ctx.createOscillator();
    osc60.type = 'sawtooth';
    osc60.frequency.setValueAtTime(60, this.ctx.currentTime);

    const osc120 = this.ctx.createOscillator();
    osc120.type = 'sine';
    osc120.frequency.setValueAtTime(120, this.ctx.currentTime);

    const osc180 = this.ctx.createOscillator();
    osc180.type = 'triangle';
    osc180.frequency.setValueAtTime(180, this.ctx.currentTime);

    const osc300 = this.ctx.createOscillator();
    osc300.type = 'sine';
    osc300.frequency.setValueAtTime(300, this.ctx.currentTime);

    // Filter to give that metallic ballast resonance
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(380, this.ctx.currentTime);
    filter.Q.setValueAtTime(3.5, this.ctx.currentTime);

    this.humGain = this.ctx.createGain();
    this.humGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

    const gain180 = this.ctx.createGain();
    gain180.gain.setValueAtTime(0.35, this.ctx.currentTime);
    osc180.connect(gain180);

    const gain300 = this.ctx.createGain();
    gain300.gain.setValueAtTime(0.2, this.ctx.currentTime);
    osc300.connect(gain300);

    osc60.connect(filter);
    osc120.connect(filter);
    gain180.connect(filter);
    gain300.connect(filter);
    filter.connect(this.humGain);
    this.humGain.connect(this.masterGain);

    osc60.start();
    osc120.start();
    osc180.start();
    osc300.start();
  }

  public setHumFlicker(flicker: boolean) {
    if (!this.humGain || !this.ctx) return;
    const now = this.ctx.currentTime;
    if (flicker) {
      this.humGain.gain.cancelScheduledValues(now);
      this.humGain.gain.setValueAtTime(0.01, now);
      this.humGain.gain.linearRampToValueAtTime(0.18, now + 0.05);
      this.humGain.gain.linearRampToValueAtTime(0.02, now + 0.1);
      this.humGain.gain.linearRampToValueAtTime(0.08, now + 0.2);
    }
  }

  // --- HAUNTING LIMINAL ROOM DRONE & DISTANT ECHOES ---
  private initLiminalAmbience() {
    if (!this.ctx || !this.masterGain) return;

    // Sub-bass drone: 48Hz + 72Hz fifth with slow LFO breathing
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(48, this.ctx.currentTime);
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(72, this.ctx.currentTime);

    // Filter to keep it deep and subterranean
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(140, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    this.ambientGain = gain;

    // LFO to slowly swell the liminal drone
    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.05, this.ctx.currentTime); // 20s cycle
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(0.04, this.ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc1.start();
    osc2.start();
    lfo.start();

    // Periodic distant acoustic pipe creak / hollow clink
    setInterval(() => {
      if (Math.random() > 0.4) {
        this.playDistantLiminalEcho();
      }
    }, 14000);
  }

  // Set Unique Procedural Audio Ambience Profile per Level
  public setLevelAmbiance(level: number) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    this.activeLevel = level;

    // Manage Dreamcore Chimes & Chord Progression Loop
    if (this.dreamcoreChimeTimer) {
      window.clearInterval(this.dreamcoreChimeTimer);
      this.dreamcoreChimeTimer = null;
    }
    if (this.dreamcoreChordTimer) {
      window.clearInterval(this.dreamcoreChordTimer);
      this.dreamcoreChordTimer = null;
    }

    if (level === 0) {
      // Level 0: Dreamcore Sanctuary (Prominent lush 4-chord synth pad progression, gentle subtle wind chimes, ZERO horror drone)
      if (this.humGain) this.humGain.gain.setTargetAtTime(0.0, now, 0.4);
      if (this.ambientGain) this.ambientGain.gain.setTargetAtTime(0.0, now, 0.4);
      if (this.dreamcoreGain) this.dreamcoreGain.gain.setTargetAtTime(0.36, now, 0.8);

      // Start Dreamcore Chord Progression Loop (Fmaj9 -> Em7 -> Dm9 -> Cmaj9)
      this.dreamcoreChordIndex = 0;
      this.applyDreamcoreChord(0);

      this.dreamcoreChordTimer = window.setInterval(() => {
        this.dreamcoreChordIndex = (this.dreamcoreChordIndex + 1) % DREAM_CHORDS.length;
        this.applyDreamcoreChord(this.dreamcoreChordIndex);
      }, 7500);

      // Play very gentle, occasional background wind chimes (subtle ambient sparkle)
      this.dreamcoreChimeTimer = window.setInterval(() => {
        if (Math.random() > 0.45) {
          this.playDreamcoreChime();
        }
      }, 10000);
    } else {
      if (this.dreamcoreGain) this.dreamcoreGain.gain.setTargetAtTime(0.0, now, 0.4);
      this.dreamcoreChordIndex = 0;

      if (level === 2) {
        // Level 2: Sublimity Poolrooms (Watery echo, near-zero ballast buzz, quiet ripples)
        if (this.humGain) this.humGain.gain.setTargetAtTime(0.015, now, 0.4);
        if (this.ambientGain) this.ambientGain.gain.setTargetAtTime(0.08, now, 0.4);
      } else if (level === 3) {
        // Level 3: Endless Archive & Hotel (Muffled antique silence, deep hollow stillness)
        if (this.humGain) this.humGain.gain.setTargetAtTime(0.008, now, 0.4);
        if (this.ambientGain) this.ambientGain.gain.setTargetAtTime(0.10, now, 0.4);
      } else if (level === 4) {
        // Level 4: Machine Sub-level & Boiler (Heavy mechanical boiler rumble & hum)
        if (this.humGain) this.humGain.gain.setTargetAtTime(0.05, now, 0.4);
        if (this.ambientGain) this.ambientGain.gain.setTargetAtTime(0.18, now, 0.4);
      } else {
        // Level 1: The Yellow Halls (Authentic 60Hz fluorescent buzz & dry liminal drone)
        if (this.humGain) this.humGain.gain.setTargetAtTime(0.08, now, 0.4);
        if (this.ambientGain) this.ambientGain.gain.setTargetAtTime(0.12, now, 0.4);
      }
    }
  }

  // --- PROCEDURAL DREAMCORE ETHEREAL SYNTH PADS & BREEZE ---
  private initDreamcoreAmbience() {
    if (!this.ctx || !this.masterGain) return;

    this.dreamcoreGain = this.ctx.createGain();
    this.dreamcoreGain.gain.setValueAtTime(0.0, this.ctx.currentTime);
    this.dreamcoreGain.connect(this.masterGain);

    // 1. Synth Pad Resonant Lowpass Filter (Warm 24dB-style analog feel: 1800 Hz cutoff with Q=2.0)
    const masterPadFilter = this.ctx.createBiquadFilter();
    masterPadFilter.type = 'lowpass';
    masterPadFilter.frequency.setValueAtTime(1800, this.ctx.currentTime);
    masterPadFilter.Q.setValueAtTime(2.0, this.ctx.currentTime);

    // Breathing Filter LFO: slowly sweeps filter between 1150 Hz and 2450 Hz (~14s cycle)
    const filterLfo = this.ctx.createOscillator();
    filterLfo.type = 'sine';
    filterLfo.frequency.setValueAtTime(0.07, this.ctx.currentTime);
    const filterLfoGain = this.ctx.createGain();
    filterLfoGain.gain.setValueAtTime(650, this.ctx.currentTime);
    filterLfo.connect(filterLfoGain);
    filterLfoGain.connect(masterPadFilter.frequency);
    filterLfo.start();

    // Analog Tape Drift Pitch LFO: subtle +/- 4.5 cents vibrato across voices
    const tapeLfo = this.ctx.createOscillator();
    tapeLfo.type = 'sine';
    tapeLfo.frequency.setValueAtTime(0.22, this.ctx.currentTime);
    const tapeLfoGain = this.ctx.createGain();
    tapeLfoGain.gain.setValueAtTime(4.5, this.ctx.currentTime);
    tapeLfo.connect(tapeLfoGain);
    tapeLfo.start();

    // Pad sub-gain for prominent musical chords & dynamic breath swells
    this.dreamcorePadGain = this.ctx.createGain();
    this.dreamcorePadGain.gain.setValueAtTime(0.65, this.ctx.currentTime);
    masterPadFilter.connect(this.dreamcorePadGain);
    this.dreamcorePadGain.connect(this.dreamcoreGain);

    // Initial chord: Fmaj9
    const initChord = DREAM_CHORDS[0];

    // 2. Clean, dedicated sub-bass oscillator (soft warm sine, separated from pad filter)
    this.dreamcoreBassOsc = this.ctx.createOscillator();
    this.dreamcoreBassOsc.type = 'sine';
    this.dreamcoreBassOsc.frequency.setValueAtTime(initChord.bass, this.ctx.currentTime);

    const bassFilter = this.ctx.createBiquadFilter();
    bassFilter.type = 'lowpass';
    bassFilter.frequency.setValueAtTime(220, this.ctx.currentTime);
    bassFilter.Q.setValueAtTime(0.7, this.ctx.currentTime);

    const bassGain = this.ctx.createGain();
    bassGain.gain.setValueAtTime(0.045, this.ctx.currentTime); // gentle warm anchor

    this.dreamcoreBassOsc.connect(bassFilter);
    bassFilter.connect(bassGain);
    bassGain.connect(this.dreamcoreGain);
    this.dreamcoreBassOsc.start();

    // 3. Polyphonic Synth Pad Voice Oscillators (Prominent detuned sawtooth + warm triangle pairs)
    this.dreamcoreVoiceOscs = [];
    const voiceCount = initChord.voices.length;

    initChord.voices.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      // Alternate triangle (warm core) and sawtooth (harmonic shimmer)
      osc.type = idx % 2 === 0 ? 'triangle' : 'sawtooth';

      const staticDetune = (idx - 2) * 5.5; // slight detuning spread across chord voices
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.detune.setValueAtTime(staticDetune, this.ctx.currentTime);
      tapeLfoGain.connect(osc.detune);

      const voiceGain = this.ctx.createGain();
      voiceGain.gain.setValueAtTime(0.14, this.ctx.currentTime);

      // Stereo field spread
      const panner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
      if (panner) {
        const panValue = ((idx / (voiceCount - 1)) * 2 - 1) * 0.65;
        panner.pan.setValueAtTime(panValue, this.ctx.currentTime);
        osc.connect(voiceGain);
        voiceGain.connect(panner);
        panner.connect(masterPadFilter);
      } else {
        osc.connect(voiceGain);
        voiceGain.connect(masterPadFilter);
      }

      osc.start();
      this.dreamcoreVoiceOscs.push(osc);
    });

    // 4. Gentle surreal summer meadow breeze noise (filtered pink noise)
    const bufferSize = this.ctx.sampleRate * 3;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      data[i] = (b0 + b1 + b2) * 0.12;
    }

    const breeze = this.ctx.createBufferSource();
    breeze.buffer = noiseBuffer;
    breeze.loop = true;

    const breezeFilter = this.ctx.createBiquadFilter();
    breezeFilter.type = 'bandpass';
    breezeFilter.frequency.setValueAtTime(420, this.ctx.currentTime);
    breezeFilter.Q.setValueAtTime(0.8, this.ctx.currentTime);

    const breezeGain = this.ctx.createGain();
    breezeGain.gain.setValueAtTime(0.04, this.ctx.currentTime);

    breeze.connect(breezeFilter);
    breezeFilter.connect(breezeGain);
    breezeGain.connect(this.dreamcoreGain);
    breeze.start();
  }

  // Apply smooth analog portamento chord glide in Dreamcore Sanctuary
  private applyDreamcoreChord(chordIdx: number) {
    if (!this.ctx || !this.dreamcoreGain) return;
    const chord = DREAM_CHORDS[chordIdx % DREAM_CHORDS.length];
    const now = this.ctx.currentTime;

    // 1. Smooth analog portamento glide for bass root
    if (this.dreamcoreBassOsc) {
      this.dreamcoreBassOsc.frequency.setTargetAtTime(chord.bass, now, 0.75);
    }

    // 2. Smooth analog portamento glide for each chord voice
    for (let i = 0; i < this.dreamcoreVoiceOscs.length; i++) {
      const osc = this.dreamcoreVoiceOscs[i];
      if (osc && chord.voices[i]) {
        osc.frequency.setTargetAtTime(chord.voices[i], now, 0.65);
      }
    }

    // 3. Gentle volume breath (subtle swell like musical breathing on chord change)
    if (this.dreamcorePadGain) {
      this.dreamcorePadGain.gain.cancelScheduledValues(now);
      this.dreamcorePadGain.gain.setValueAtTime(this.dreamcorePadGain.gain.value, now);
      this.dreamcorePadGain.gain.setTargetAtTime(0.48, now, 0.35);
      this.dreamcorePadGain.gain.setTargetAtTime(0.68, now + 0.9, 1.2);
    }

    // 4. Soft nostalgic bell / music box chime note on the downbeat
    this.playDreamcoreChordAccent(chord.melody, now);
  }

  // Play peaceful downbeat bell chime note for the active chord
  private playDreamcoreChordAccent(freq: number, startTime: number) {
    if (!this.ctx || !this.dreamcoreGain) return;

    // Primary bell tone
    const osc1 = this.ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, startTime + 0.06);

    // Sparkling 2nd harmonic
    const osc2 = this.ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2, startTime + 0.06);

    const gain1 = this.ctx.createGain();
    gain1.gain.setValueAtTime(0.0001, startTime + 0.06);
    gain1.gain.linearRampToValueAtTime(0.035, startTime + 0.10);
    gain1.gain.exponentialRampToValueAtTime(0.0001, startTime + 4.2);

    const gain2 = this.ctx.createGain();
    gain2.gain.setValueAtTime(0.0001, startTime + 0.06);
    gain2.gain.linearRampToValueAtTime(0.012, startTime + 0.10);
    gain2.gain.exponentialRampToValueAtTime(0.0001, startTime + 2.5);

    osc1.connect(gain1);
    gain1.connect(this.dreamcoreGain);

    osc2.connect(gain2);
    gain2.connect(this.dreamcoreGain);

    osc1.start(startTime + 0.06);
    osc1.stop(startTime + 4.3);
    osc2.start(startTime + 0.06);
    osc2.stop(startTime + 2.6);
  }

  // Play peaceful crystalline wind chime notes in Dreamcore Sanctuary
  private playDreamcoreChime() {
    if (!this.ctx || !this.dreamcoreGain) return;
    const now = this.ctx.currentTime;

    // Pentatonic bell/chime frequencies
    const chimeFreqs = [1318.5, 1567.98, 1760.0, 1975.53, 2349.32, 2637.0];
    const count = 1 + Math.floor(Math.random() * 2);

    for (let i = 0; i < count; i++) {
      const delay = i * 0.18 + Math.random() * 0.08;
      const freq = chimeFreqs[Math.floor(Math.random() * chimeFreqs.length)];

      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + delay);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, now + delay);
      gain.gain.linearRampToValueAtTime(0.022, now + delay + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 2.8);

      osc.connect(gain);
      gain.connect(this.dreamcoreGain);

      osc.start(now + delay);
      osc.stop(now + delay + 2.9);
    }
  }

  private playDistantLiminalEcho() {
    if (!this.ctx || !this.masterGain || this.activeLevel === 0) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    // Pentatonic eerie note
    const notes = [220, 277, 330, 440, 554];
    const freq = notes[Math.floor(Math.random() * notes.length)];
    osc.frequency.setValueAtTime(freq, now);

    const panner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
    if (panner) {
      panner.pan.setValueAtTime((Math.random() - 0.5) * 1.6, now);
    }

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.035, now + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 3.5);

    if (panner) {
      osc.connect(gain);
      gain.connect(panner);
      panner.connect(this.masterGain);
    } else {
      osc.connect(gain);
      gain.connect(this.masterGain);
    }

    osc.start(now);
    osc.stop(now + 3.6);
  }

  // --- PROXIMITY RADIO STATIC ---
  private initProximityStatic() {
    if (!this.ctx || !this.masterGain) return;

    // 2-second looped white noise buffer
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const bandpass = this.ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(1400, this.ctx.currentTime);
    bandpass.Q.setValueAtTime(2.5, this.ctx.currentTime);

    this.staticGain = this.ctx.createGain();
    this.staticGain.gain.setValueAtTime(0.0, this.ctx.currentTime);

    whiteNoise.connect(bandpass);
    bandpass.connect(this.staticGain);
    this.staticGain.connect(this.masterGain);

    whiteNoise.start();
    this.staticSource = whiteNoise;
  }

  /**
   * Scales entity static noise based on distance (0.0 far away, 1.0 right next to player)
   */
  public updateProximityStatic(intensity: number) {
    if (!this.staticGain || !this.ctx) return;
    const clamped = Math.max(0, Math.min(1, intensity));
    const targetGain = clamped * 0.45;
    this.staticGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.1);
  }

  // --- REALISTIC DYNAMIC FOOTSTEP SYNTHESIZER (SOFT & BASS-Y) ---
  public playFootstep(surface: 'carpet' | 'tile' | 'water' | 'metal' = 'carpet', isSprinting = false) {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const dur = isSprinting ? 0.16 : 0.22;

    // 1. Soft Sub-Bass Heel Impact (Deep, grounded physical thud without harsh clicks)
    const heelOsc = this.ctx.createOscillator();
    heelOsc.type = 'sine';
    const startFreq = isSprinting ? 68 : 52;
    heelOsc.frequency.setValueAtTime(startFreq, now);
    heelOsc.frequency.exponentialRampToValueAtTime(24, now + dur);

    const heelFilter = this.ctx.createBiquadFilter();
    heelFilter.type = 'lowpass';
    heelFilter.frequency.setValueAtTime(95, now);

    const heelGain = this.ctx.createGain();
    const heelVol = isSprinting ? 0.24 : 0.16;
    heelGain.gain.setValueAtTime(0.001, now);
    heelGain.gain.linearRampToValueAtTime(heelVol, now + 0.02);
    heelGain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    heelOsc.connect(heelFilter);
    heelFilter.connect(heelGain);
    heelGain.connect(this.masterGain);
    heelOsc.start(now);
    heelOsc.stop(now + dur);

    // 2. Soft, Muffled Surface Acoustic Transient
    const bufferSize = Math.floor(this.ctx.sampleRate * (isSprinting ? 0.12 : 0.18));
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    const noiseGain = this.ctx.createGain();
    const noiseVol = isSprinting ? 0.14 : 0.09;

    switch (surface) {
      case 'water': {
        // Rich hydrodynamic liquid wading splash & droplet displacement
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(680, now);
        filter.frequency.exponentialRampToValueAtTime(220, now + dur);
        noiseGain.gain.setValueAtTime(noiseVol * 1.6, now);

        // Liquid droplet resonance chirp (air bubble / water drop slap)
        const dropOsc = this.ctx.createOscillator();
        dropOsc.type = 'sine';
        dropOsc.frequency.setValueAtTime(1480, now);
        dropOsc.frequency.exponentialRampToValueAtTime(580, now + 0.08);

        const dropGain = this.ctx.createGain();
        dropGain.gain.setValueAtTime(0.001, now);
        dropGain.gain.linearRampToValueAtTime(0.12, now + 0.015);
        dropGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        dropOsc.connect(dropGain);
        dropGain.connect(this.masterGain);
        dropOsc.start(now);
        dropOsc.stop(now + 0.08);
        break;
      }

      case 'tile':
        // Muffled rubber sole pressure on tile
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(820, now);
        filter.Q.setValueAtTime(1.6, now);
        noiseGain.gain.setValueAtTime(noiseVol * 0.95, now);
        break;

      case 'metal':
        // Low industrial hollow grate resonance
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(980, now);
        filter.Q.setValueAtTime(2.2, now);
        noiseGain.gain.setValueAtTime(noiseVol * 0.85, now);
        break;

      case 'carpet':
      default:
        // Deep soft fabric scuff
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(240, now);
        noiseGain.gain.setValueAtTime(noiseVol * 0.8, now);
        break;
    }

    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + dur);
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.masterGain);

    noise.start(now);
  }

  // --- ROTARY TELEPHONE RING ---
  public playRotaryPhone() {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    // US ring frequencies: 440Hz + 480Hz
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    osc1.frequency.setValueAtTime(440, now);
    osc2.frequency.setValueAtTime(480, now);

    const tremolo = this.ctx.createOscillator();
    tremolo.frequency.setValueAtTime(20, now); // 20Hz hammer strike
    const tremGain = this.ctx.createGain();
    tremGain.gain.setValueAtTime(0.5, now);

    const ringGain = this.ctx.createGain();
    ringGain.gain.setValueAtTime(0.18, now);
    ringGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    osc1.connect(ringGain);
    osc2.connect(ringGain);
    ringGain.connect(this.masterGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 1.2);
    osc2.stop(now + 1.2);
  }

  // --- INTERACTION SOUNDS ---
  public playPickup() {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(1040, now + 0.12);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.12);
  }

  // Industrial high-pressure steam valve burst for Level 4 Boiler Rooms
  public playSteamHiss(volume = 0.14) {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const dur = 0.6 + Math.random() * 0.4;
    const bufferSize = Math.floor(this.ctx.sampleRate * dur);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2400 + Math.random() * 800, now);
    filter.Q.setValueAtTime(1.8, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start(now);
    noise.stop(now + dur);
  }

  public playDoor(type: 'open' | 'close') {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';

    const gain = this.ctx.createGain();

    if (type === 'open') {
      // Squeaking hinge
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.linearRampToValueAtTime(680, now + 0.35);
      osc.frequency.linearRampToValueAtTime(240, now + 0.6);
      filter.frequency.setValueAtTime(800, now);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc.stop(now + 0.6);
    } else {
      // Heavy metal latch slam
      osc.frequency.setValueAtTime(110, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.25);
      filter.frequency.setValueAtTime(450, now);
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.stop(now + 0.25);
    }

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
  }

  public playFlashlightClick() {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.03);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.03);
  }

  // --- DYNAMIC HEARTBEAT ---
  public setHeartbeatActive(active: boolean, bpm: number = 75) {
    if (this.heartbeatTimer) {
      window.clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    if (!active || !this.ctx) return;

    const intervalMs = (60 / bpm) * 1000;
    this.heartbeatTimer = window.setInterval(() => {
      this.triggerSingleHeartbeat();
    }, intervalMs);
  }

  // --- RANDOM PARANOIA ADRENALINE HEARTBEAT BURST ---
  public triggerParanoiaHeartbeatBurst(beatCount: number = 4) {
    if (!this.ctx || !this.masterGain) return;
    let beatsRemaining = beatCount;
    // Initial thump
    this.triggerSingleHeartbeat();
    beatsRemaining--;

    const interval = 720; // ~83 BPM tense adrenaline thump
    const timer = window.setInterval(() => {
      this.triggerSingleHeartbeat();
      beatsRemaining--;
      if (beatsRemaining <= 0) {
        window.clearInterval(timer);
      }
    }, interval);
  }

  private triggerSingleHeartbeat() {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    // Sub-bass physiological Lub-Dub (Soft, deep internal chest throb)
    const playThump = (timeOffset: number, startFreq: number, duration: number, vol: number) => {
      if (!this.ctx || !this.masterGain) return;
      const t = now + timeOffset;

      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(startFreq, t);
      osc.frequency.exponentialRampToValueAtTime(22, t + duration);

      // Subterranean lowpass filter so only warm sub-bass passes
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(80, t);
      filter.Q.setValueAtTime(1.5, t);

      const gain = this.ctx.createGain();
      // Smooth attack ramp (0.035s) eliminates sharp clicks, creating a soft deep swell
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(vol, t + 0.035);
      gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + duration);
    };

    // Deep, soft, bass-heavy chest contractions
    playThump(0, 48, 0.22, 0.32);
    playThump(0.16, 54, 0.24, 0.26);
  }

  // --- JUMPSCARE OR ATMOSPHERIC FADE STINGER ---
  public triggerDeathSound() {
    if (!this.ctx || !this.masterGain) return;

    if (!this.enableJumpscares) {
      // Atmospheric No-Jumpscare mode: Somber low-frequency resonant fade drone
      this.playAtmosphericFade();
      return;
    }

    // High intensity screamer stinger
    const now = this.ctx.currentTime;

    // 1. Violent detuned saws
    const freqs = [380, 392, 570, 780];
    freqs.forEach((freq) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.8, now + 0.4);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(400, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 1.2);
    });

    // 2. White noise explosive burst
    const bufferSize = this.ctx.sampleRate * 0.8;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.45, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    noise.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    noise.start(now);

    // 3. 30Hz sub-bass shockwave drop
    const subOsc = this.ctx.createOscillator();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(80, now);
    subOsc.frequency.exponentialRampToValueAtTime(25, now + 0.9);
    const subGain = this.ctx.createGain();
    subGain.gain.setValueAtTime(0.6, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
    subOsc.connect(subGain);
    subGain.connect(this.masterGain);
    subOsc.start(now);
    subOsc.stop(now + 0.9);
  }

  private playAtmosphericFade() {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    // Low mysterious resonant drone
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(55, now);
    osc.frequency.linearRampToValueAtTime(35, now + 3.0);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(150, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.8);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 3.5);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 3.5);
  }
}

export const AudioEngine = new AudioEngineClass();
