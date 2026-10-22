import * as THREE from 'three';

/**
 * 100% Procedural Canvas Texture Generator.
 * Creates seamless materials for walls, floors, ceilings, and signs without any external image files.
 */
export class TextureGenerator {
  // Yellow Backrooms Damp Wallpaper
  static createYellowWallpaperTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Base mono-yellow
    ctx.fillStyle = '#bfad63';
    ctx.fillRect(0, 0, 512, 512);

    // Subtle stripe / vintage pattern
    ctx.fillStyle = '#ab9850';
    for (let x = 0; x < 512; x += 32) {
      ctx.fillRect(x, 0, 8, 512);
    }

    // Organic damp noise / grime stains
    const imgData = ctx.getImageData(0, 0, 512, 512);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 35;
      data[i] = Math.max(0, Math.min(255, data[i] + noise));
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
    }
    ctx.putImageData(imgData, 0, 0);

    // Add water stain seepage
    const gradient = ctx.createRadialGradient(256, 512, 50, 256, 512, 350);
    gradient.addColorStop(0, 'rgba(80, 70, 35, 0.45)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  // Cyan Poolroom Ceramic Tile
  static createPoolTileTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Teal / cyan base
    ctx.fillStyle = '#1b787e';
    ctx.fillRect(0, 0, 512, 512);

    const tileSize = 64;
    for (let x = 0; x < 512; x += tileSize) {
      for (let y = 0; y < 512; y += tileSize) {
        // Subtle tile color variations
        const lightness = Math.floor(Math.random() * 20) - 10;
        ctx.fillStyle = `rgb(${25 + lightness}, ${135 + lightness}, ${145 + lightness})`;
        ctx.fillRect(x + 2, y + 2, tileSize - 4, tileSize - 4);

        // Highlight top-left border
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.fillRect(x + 2, y + 2, tileSize - 4, 3);
        ctx.fillRect(x + 2, y + 2, 3, tileSize - 4);
      }
    }

    // Grout lines
    ctx.strokeStyle = '#0f484d';
    ctx.lineWidth = 3;
    for (let x = 0; x <= 512; x += tileSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 512);
      ctx.stroke();
    }
    for (let y = 0; y <= 512; y += tileSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(512, y);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  // Damp Moldy Carpet Floor
  static createCarpetTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#8a7d48';
    ctx.fillRect(0, 0, 256, 256);

    const imgData = ctx.getImageData(0, 0, 256, 256);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const grain = (Math.random() - 0.5) * 55;
      data[i] = Math.max(0, Math.min(255, data[i] + grain));
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + grain));
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + grain));
    }
    ctx.putImageData(imgData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  // Acoustic Ceiling Tiles
  static createCeilingTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#ded9cf';
    ctx.fillRect(0, 0, 256, 256);

    // Grid lines for 2x2 drop-ceiling tiles
    ctx.strokeStyle = '#7c766b';
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, 256, 256);
    ctx.strokeRect(0, 0, 128, 128);
    ctx.strokeRect(128, 0, 128, 128);
    ctx.strokeRect(0, 128, 128, 128);
    ctx.strokeRect(128, 128, 128, 128);

    // Speckled acoustic dots
    ctx.fillStyle = '#9e978a';
    for (let i = 0; i < 300; i++) {
      const px = Math.random() * 256;
      const py = Math.random() * 256;
      ctx.fillRect(px, py, 2, 2);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  // Industrial Concrete / Rust for Red Sub-level
  static createRustConcreteTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#3a2d28';
    ctx.fillRect(0, 0, 256, 256);

    ctx.fillStyle = '#6e301e';
    for (let i = 0; i < 25; i++) {
      const rx = Math.random() * 256;
      const ry = Math.random() * 256;
      const rw = Math.random() * 60 + 20;
      const rh = Math.random() * 60 + 20;
      ctx.fillRect(rx, ry, rw, rh);
    }

    const imgData = ctx.getImageData(0, 0, 256, 256);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 40;
      data[i] = Math.max(0, Math.min(255, data[i] + noise));
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
    }
    ctx.putImageData(imgData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  // Level 3: Archive Mahogany Wood Paneling Wall
  static createArchiveWallTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Rich dark mahogany wood
    ctx.fillStyle = '#2b1810';
    ctx.fillRect(0, 0, 512, 512);

    // Wood grain planks
    for (let x = 0; x < 512; x += 64) {
      ctx.fillStyle = x % 128 === 0 ? '#382015' : '#23130c';
      ctx.fillRect(x + 2, 0, 60, 512);
      ctx.strokeStyle = '#140a06';
      ctx.lineWidth = 4;
      ctx.strokeRect(x + 4, 32, 56, 448);
    }

    // Vintage damask wallpaper strip on upper half
    ctx.fillStyle = 'rgba(60, 40, 25, 0.4)';
    for (let y = 0; y < 256; y += 32) {
      for (let x = 0; x < 512; x += 32) {
        ctx.beginPath();
        ctx.arc(x + 16, y + 16, 8, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  // Level 3: Burgundy Patterned Hotel Carpet
  static createHotelCarpetTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    // Deep burgundy
    ctx.fillStyle = '#380d12';
    ctx.fillRect(0, 0, 256, 256);

    // Geometric diamond hotel runner pattern
    ctx.strokeStyle = '#631820';
    ctx.lineWidth = 3;
    for (let x = 0; x <= 256; x += 64) {
      for (let y = 0; y <= 256; y += 64) {
        ctx.beginPath();
        ctx.moveTo(x + 32, y);
        ctx.lineTo(x + 64, y + 32);
        ctx.lineTo(x + 32, y + 64);
        ctx.lineTo(x, y + 32);
        ctx.closePath();
        ctx.stroke();
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  // Level 4: Industrial Diamond Plate Steel Grating Floor
  static createIndustrialFloorTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    // Dark iron
    ctx.fillStyle = '#1c1f24';
    ctx.fillRect(0, 0, 256, 256);

    // Diamond steel treadplate marks
    ctx.fillStyle = '#3a4049';
    for (let x = 0; x < 256; x += 32) {
      for (let y = 0; y < 256; y += 32) {
        ctx.save();
        ctx.translate(x + 16, y + 16);
        ctx.rotate(Math.PI / 4);
        ctx.fillRect(-6, -2, 12, 4);
        ctx.restore();
      }
    }

    // Rust oxidation spots
    ctx.fillStyle = 'rgba(120, 45, 20, 0.35)';
    ctx.fillRect(20, 40, 80, 60);
    ctx.fillRect(140, 160, 90, 70);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  // Level 4: Heavy Steel Wall with Yellow/Black Hazard Stripes
  static createHazardWallTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Iron wall base
    ctx.fillStyle = '#22262b';
    ctx.fillRect(0, 0, 512, 512);

    // Steel plate seams & rivets
    ctx.strokeStyle = '#111417';
    ctx.lineWidth = 6;
    ctx.strokeRect(8, 8, 496, 496);

    // Yellow and black diagonal hazard warning stripe band along center
    const bandY = 200;
    const bandHeight = 112;
    ctx.fillStyle = '#111';
    ctx.fillRect(0, bandY, 512, bandHeight);

    ctx.fillStyle = '#eab308'; // Warning yellow
    for (let x = -512; x < 1024; x += 64) {
      ctx.beginPath();
      ctx.moveTo(x, bandY);
      ctx.lineTo(x + 32, bandY);
      ctx.lineTo(x + 32 + bandHeight, bandY + bandHeight);
      ctx.lineTo(x + bandHeight, bandY + bandHeight);
      ctx.closePath();
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  // Exit Sign Graphic Texture
  static createExitSignTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, 256, 128);

    ctx.strokeStyle = '#e63946';
    ctx.lineWidth = 6;
    ctx.strokeRect(10, 10, 236, 108);

    ctx.fillStyle = '#e63946';
    ctx.font = 'bold 58px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('EXIT →', 128, 64);

    return new THREE.CanvasTexture(canvas);
  }

  // Level 2 Ceiling: Pristine White/Cyan Plaster Ceiling with Recessed Skylight Panel
  static createPoolPlasterCeilingTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Clean white-teal plaster
    ctx.fillStyle = '#e8f7f8';
    ctx.fillRect(0, 0, 512, 512);

    // Recessed diffuse skylight center
    ctx.fillStyle = '#d0eff2';
    ctx.fillRect(64, 64, 384, 384);

    ctx.fillStyle = '#bce6eb';
    ctx.fillRect(80, 80, 352, 352);

    // Subtle plaster texture noise
    const imgData = ctx.getImageData(0, 0, 512, 512);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const n = (Math.random() - 0.5) * 15;
      data[i] = Math.max(0, Math.min(255, data[i] + n));
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + n));
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + n));
    }
    ctx.putImageData(imgData, 0, 0);

    // Skylight mullion cross
    ctx.strokeStyle = '#99d2d8';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(256, 64);
    ctx.lineTo(256, 448);
    ctx.moveTo(64, 256);
    ctx.lineTo(448, 256);
    ctx.stroke();

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  // Level 2 Floor: Submerged Small Mosaic Pool Tiles with Caustics
  static createSubmergedPoolFloorTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#10565e';
    ctx.fillRect(0, 0, 512, 512);

    const mSize = 32;
    for (let x = 0; x < 512; x += mSize) {
      for (let y = 0; y < 512; y += mSize) {
        const shade = Math.floor(Math.random() * 30) - 15;
        ctx.fillStyle = `rgb(${16 + shade}, ${115 + shade}, ${135 + shade})`;
        ctx.fillRect(x + 1, y + 1, mSize - 2, mSize - 2);
      }
    }

    // Grout grid
    ctx.strokeStyle = '#09363b';
    ctx.lineWidth = 2;
    for (let x = 0; x <= 512; x += mSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 512);
      ctx.stroke();
    }
    for (let y = 0; y <= 512; y += mSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(512, y);
      ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  // Level 3 Ceiling: Dark Oak Coffered Ceiling with Heavy Beams
  static createCofferedCeilingTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Recessed deep wood panel
    ctx.fillStyle = '#1c100a';
    ctx.fillRect(0, 0, 512, 512);

    // Coffered boxes
    const boxSize = 256;
    for (let bx = 0; bx < 512; bx += boxSize) {
      for (let by = 0; by < 512; by += boxSize) {
        // Inner depression
        ctx.fillStyle = '#120a06';
        ctx.fillRect(bx + 24, by + 24, boxSize - 48, boxSize - 48);

        // Stepped molding
        ctx.strokeStyle = '#311a10';
        ctx.lineWidth = 12;
        ctx.strokeRect(bx + 18, by + 18, boxSize - 36, boxSize - 36);

        // Center rosette
        ctx.fillStyle = '#4a291a';
        ctx.beginPath();
        ctx.arc(bx + boxSize / 2, by + boxSize / 2, 16, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Heavy main beams
    ctx.fillStyle = '#26140c';
    ctx.fillRect(244, 0, 24, 512);
    ctx.fillRect(0, 244, 512, 24);

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  // Level 4 Ceiling: Industrial Corrugated Steel Deck with Rust
  static createCorrugatedCeilingTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#181b20';
    ctx.fillRect(0, 0, 512, 512);

    // Corrugated iron ribs
    for (let x = 0; x < 512; x += 32) {
      ctx.fillStyle = '#2b313a';
      ctx.fillRect(x, 0, 16, 512);
      ctx.fillStyle = '#121417';
      ctx.fillRect(x + 16, 0, 16, 512);
    }

    // Rust seepage streaks
    ctx.fillStyle = 'rgba(100, 35, 15, 0.45)';
    ctx.fillRect(40, 0, 80, 300);
    ctx.fillRect(260, 100, 120, 412);

    // Cross I-beams
    ctx.fillStyle = '#0f1114';
    ctx.fillRect(0, 230, 512, 52);
    ctx.fillStyle = '#3a414d';
    ctx.fillRect(0, 252, 512, 8);

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  // Soft Luminescent Radial Halo Texture (For light sources and atmospheric haze motes)
  static createSoftGlowTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;

    const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
    grad.addColorStop(0.2, 'rgba(255, 255, 255, 0.7)');
    grad.addColorStop(0.55, 'rgba(255, 255, 255, 0.2)');
    grad.addColorStop(1.0, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);

    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  }

  // Level 0 Dreamcore: Ultra-Vibrant Colorful Rolling Meadow Grass with Multicolored Flowers
  static createDreamcoreGrassTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Rich saturated sunny lime-green meadow base (Windows Bliss / Studio Ghibli style)
    const grad = ctx.createLinearGradient(0, 0, 512, 512);
    grad.addColorStop(0, '#38c558');
    grad.addColorStop(0.35, '#4ade80');
    grad.addColorStop(0.7, '#22c55e');
    grad.addColorStop(1, '#16a34a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    // Sunlit bright grass blades & clover patches
    for (let i = 0; i < 5000; i++) {
      const gx = Math.random() * 512;
      const gy = Math.random() * 512;
      const gh = Math.random() * 10 + 4;
      const hues = ['#86efac', '#4ade80', '#22c55e', '#a7f3d0', '#6ee7b7'];
      ctx.fillStyle = hues[Math.floor(Math.random() * hues.length)];
      ctx.fillRect(gx, gy, 2, gh);
    }

    // Abundant Multicolored Surreal Wildflowers (Poppies, Buttercups, Forget-me-nots, Daisies, Lilacs)
    const petalPalettes = [
      { petal: '#f43f5e', center: '#fef08a' }, // Hot Pink Poppy
      { petal: '#fb7185', center: '#ffffff' }, // Rose Pink
      { petal: '#facc15', center: '#ca8a04' }, // Sunburst Buttercup
      { petal: '#38bdf8', center: '#fef08a' }, // Sky Blue Forget-me-not
      { petal: '#06b6d4', center: '#ffffff' }, // Turquoise
      { petal: '#a855f7', center: '#fde047' }, // Purple Violet
      { petal: '#c084fc', center: '#ffffff' }, // Lavender
      { petal: '#ffffff', center: '#eab308' }, // Chamomile Daisy
      { petal: '#f97316', center: '#fef08a' }, // Bright Marigold
    ];

    for (let i = 0; i < 480; i++) {
      const fx = Math.random() * 512;
      const fy = Math.random() * 512;
      const choice = petalPalettes[Math.floor(Math.random() * petalPalettes.length)];
      const radius = Math.random() * 2.5 + 2.0;

      // Draw 4-5 petals
      ctx.fillStyle = choice.petal;
      for (let p = 0; p < 5; p++) {
        const angle = (p * Math.PI * 2) / 5;
        const px = fx + Math.cos(angle) * radius;
        const py = fy + Math.sin(angle) * radius;
        ctx.beginPath();
        ctx.arc(px, py, radius * 0.75, 0, Math.PI * 2);
        ctx.fill();
      }

      // Bright flower center dot
      ctx.fillStyle = choice.center;
      ctx.beginPath();
      ctx.arc(fx, fy, radius * 0.55, 0, Math.PI * 2);
      ctx.fill();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  // Level 0 Dreamcore: Vivid Surreal Checkerboard with Iridescent Accents
  static createCheckeredDreamTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    const tileSize = 64;
    for (let x = 0; x < 512; x += tileSize) {
      for (let y = 0; y < 512; y += tileSize) {
        const isDark = ((x / tileSize) + (y / tileSize)) % 2 === 0;
        ctx.fillStyle = isDark ? '#312e81' : '#ffffff';
        ctx.fillRect(x, y, tileSize, tileSize);

        // Vibrant pastel perimeter glow line on each tile
        ctx.strokeStyle = isDark ? '#4338ca' : '#e0e7ff';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 1, y + 1, tileSize - 2, tileSize - 2);
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  // Level 0 Dreamcore: Realistic Atmospheric Sky Dome Gradient with Natural Horizon & Sun Glow
  static createRealisticSkyTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Atmospheric Rayleigh & Mie scattering vertical gradient:
    // Y: 0 (Zenith straight up) -> Y: 280 (Horizon line) -> Y: 512 (Below horizon)
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0.0, '#1d4ed8');   // Deep cobalt / zenith azure
    grad.addColorStop(0.16, '#2563eb');  // Royal sky blue
    grad.addColorStop(0.32, '#3b82f6');  // Classic clear sunny blue
    grad.addColorStop(0.44, '#60a5fa');  // Soft atmospheric scatter
    grad.addColorStop(0.54, '#93c5fd');  // Lower atmosphere cerulean
    grad.addColorStop(0.60, '#c7d2fe');  // Pale lavender-blue haze
    grad.addColorStop(0.66, '#fef08a');  // Warm horizon sunlight glow
    grad.addColorStop(0.72, '#fed7aa');  // Golden horizon kiss
    grad.addColorStop(0.82, '#86efac');  // Meadow horizon blend
    grad.addColorStop(1.0, '#22c55e');   // Deep ground

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 512);

    // Warm radiant sun disc & atmospheric solar halo near the horizon
    const sunX = 720;
    const sunY = 280;
    const sunGrad = ctx.createRadialGradient(sunX, sunY, 15, sunX, sunY, 260);
    sunGrad.addColorStop(0, 'rgba(255, 255, 240, 0.95)');
    sunGrad.addColorStop(0.08, 'rgba(254, 240, 138, 0.7)');
    sunGrad.addColorStop(0.25, 'rgba(253, 230, 138, 0.35)');
    sunGrad.addColorStop(0.55, 'rgba(254, 215, 170, 0.15)');
    sunGrad.addColorStop(1.0, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = sunGrad;
    ctx.fillRect(0, 0, 1024, 512);

    const tex = new THREE.CanvasTexture(canvas);
    tex.mapping = THREE.EquirectangularReflectionMapping;
    return tex;
  }
}
