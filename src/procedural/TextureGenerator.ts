import * as THREE from 'three';

/**
 * 100% Procedural Canvas Texture Generator.
 * Creates seamless materials for walls, floors, ceilings, and signs without any external image files.
 */
export class TextureGenerator {
  // Classic Backrooms Damp Yellow Wallpaper (Faded mustard, vintage watermark, damp seams)
  static createYellowWallpaperTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Base aged mono-yellow tone
    ctx.fillStyle = '#bda85d';
    ctx.fillRect(0, 0, 512, 512);

    // Subtle alternating wallpaper panel strips (128px rolls)
    for (let x = 0; x < 512; x += 128) {
      ctx.fillStyle = x % 256 === 0 ? 'rgba(175, 154, 80, 0.22)' : 'rgba(205, 184, 105, 0.15)';
      ctx.fillRect(x, 0, 128, 512);

      // Fine seam between wallpaper panels
      ctx.fillStyle = 'rgba(70, 60, 25, 0.35)';
      ctx.fillRect(x, 0, 1.5, 512);
      ctx.fillStyle = 'rgba(240, 225, 160, 0.15)';
      ctx.fillRect(x + 1.5, 0, 1, 512);
    }

    // Subtle vintage damask / repeating vertical office wallpaper micro-pattern
    ctx.strokeStyle = 'rgba(145, 128, 62, 0.25)';
    ctx.lineWidth = 1.2;
    for (let x = 16; x < 512; x += 32) {
      for (let y = 16; y < 512; y += 48) {
        // Small faded diamond/fleur motif
        ctx.beginPath();
        ctx.moveTo(x, y - 10);
        ctx.lineTo(x + 7, y);
        ctx.lineTo(x, y + 10);
        ctx.lineTo(x - 7, y);
        ctx.closePath();
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(145, 128, 62, 0.18)';
        ctx.fill();
      }
    }

    // Organic damp paper noise & grime
    const imgData = ctx.getImageData(0, 0, 512, 512);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 32;
      data[i] = Math.max(0, Math.min(255, data[i] + noise));
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
    }
    ctx.putImageData(imgData, 0, 0);

    // Water stain seepage at bottom (rising from damp carpet)
    const baseGradient = ctx.createLinearGradient(0, 512, 0, 320);
    baseGradient.addColorStop(0, 'rgba(65, 55, 25, 0.60)');
    baseGradient.addColorStop(0.35, 'rgba(85, 75, 35, 0.30)');
    baseGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = baseGradient;
    ctx.fillRect(0, 320, 512, 192);

    // Organic damp moisture patches along wall
    const patchGrad = ctx.createRadialGradient(160, 420, 20, 160, 420, 180);
    patchGrad.addColorStop(0, 'rgba(75, 65, 28, 0.40)');
    patchGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = patchGrad;
    ctx.fillRect(0, 200, 320, 312);

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

  // Authentic Moist Office Carpet Floor (50x50cm modular tiles, water stain rings, loop pile)
  static createCarpetTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Dirty mustard / brownish-yellow base
    ctx.fillStyle = '#786c38';
    ctx.fillRect(0, 0, 512, 512);

    // Modular 4x4 commercial carpet tiles (128x128px each)
    const tileSize = 128;
    for (let x = 0; x < 512; x += tileSize) {
      for (let y = 0; y < 512; y += tileSize) {
        // Subtle directional pile shift per tile
        const shift = ((x + y) / tileSize) % 2 === 0 ? 8 : -8;
        ctx.fillStyle = `rgba(${118 + shift}, ${106 + shift}, ${55 + shift}, 0.25)`;
        ctx.fillRect(x + 1, y + 1, tileSize - 2, tileSize - 2);

        // Subtle tile seam border
        ctx.strokeStyle = 'rgba(45, 40, 18, 0.45)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x, y, tileSize, tileSize);
      }
    }

    // Dense organic loop-pile stippling noise
    const imgData = ctx.getImageData(0, 0, 512, 512);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const grain = (Math.random() - 0.5) * 48;
      data[i] = Math.max(0, Math.min(255, data[i] + grain));
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + grain));
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + grain));
    }
    ctx.putImageData(imgData, 0, 0);

    // Water damage puddles & evaporation rings (The classic "stink of old moist carpet")
    const drawWaterRing = (cx: number, cy: number, r: number) => {
      // Dark wet center
      const grad = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r);
      grad.addColorStop(0, 'rgba(42, 36, 16, 0.45)');
      grad.addColorStop(0.7, 'rgba(55, 48, 22, 0.35)');
      grad.addColorStop(0.92, 'rgba(35, 30, 12, 0.55)'); // dark edge evaporation ring
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    };

    drawWaterRing(140, 160, 95);
    drawWaterRing(380, 360, 120);
    drawWaterRing(220, 420, 65);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  // 1990s Drop-Ceiling Acoustic Tiles (Armstrong-style beveled T-bar grid & acoustic fissure worms)
  static createCeilingTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Faded aged beige / off-white acoustic tile base
    ctx.fillStyle = '#cbc4b4';
    ctx.fillRect(0, 0, 512, 512);

    const tileSize = 256;
    for (let x = 0; x < 512; x += tileSize) {
      for (let y = 0; y < 512; y += tileSize) {
        // Individual tile recessed surface
        ctx.fillStyle = '#d3ccc0';
        ctx.fillRect(x + 4, y + 4, tileSize - 8, tileSize - 8);

        // Acoustic worm fissures (irregular worm scratches typical of acoustic drop ceilings)
        ctx.strokeStyle = 'rgba(100, 94, 82, 0.45)';
        ctx.lineWidth = 1.8;
        for (let k = 0; k < 45; k++) {
          const fx = x + 16 + Math.random() * (tileSize - 32);
          const fy = y + 16 + Math.random() * (tileSize - 32);
          const len = 4 + Math.random() * 9;
          const angle = Math.random() * Math.PI;

          ctx.beginPath();
          ctx.moveTo(fx, fy);
          ctx.quadraticCurveTo(
            fx + Math.cos(angle) * (len / 2) + (Math.random() - 0.5) * 4,
            fy + Math.sin(angle) * (len / 2) + (Math.random() - 0.5) * 4,
            fx + Math.cos(angle) * len,
            fy + Math.sin(angle) * len
          );
          ctx.stroke();
        }

        // Fine acoustic stippling dots
        ctx.fillStyle = 'rgba(90, 84, 72, 0.35)';
        for (let p = 0; p < 80; p++) {
          const px = x + 8 + Math.random() * (tileSize - 16);
          const py = y + 8 + Math.random() * (tileSize - 16);
          ctx.fillRect(px, py, 1.8, 1.8);
        }

        // Beveled T-bar suspension grid border
        // Top & Left highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.fillRect(x, y, tileSize, 2);
        ctx.fillRect(x, y, 2, tileSize);

        // Bottom & Right shadow
        ctx.fillStyle = 'rgba(50, 46, 38, 0.50)';
        ctx.fillRect(x, y + tileSize - 3, tileSize, 3);
        ctx.fillRect(x + tileSize - 3, y, 3, tileSize);

        // Metal T-bar runner line
        ctx.strokeStyle = '#6e675b';
        ctx.lineWidth = 4;
        ctx.strokeRect(x + 1, y + 1, tileSize - 2, tileSize - 2);
      }
    }

    // Yellow-brown water stain leakage in one tile corner (condensation drip)
    const leakGrad = ctx.createRadialGradient(256, 256, 10, 256, 256, 110);
    leakGrad.addColorStop(0, 'rgba(110, 85, 40, 0.45)');
    leakGrad.addColorStop(0.7, 'rgba(130, 105, 55, 0.25)');
    leakGrad.addColorStop(0.95, 'rgba(90, 70, 30, 0.40)'); // dark evaporation ring
    leakGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = leakGrad;
    ctx.beginPath();
    ctx.arc(256, 256, 110, 0, Math.PI * 2);
    ctx.fill();

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
  // Level 0 Dreamcore: Soft nostalgic sun-warmed meadow with gentle chamomile and forget-me-not wildflowers
  static createDreamcoreGrassTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Sun-warmed nostalgic meadow base (faded sage, soft clover, warm golden undertones)
    const grad = ctx.createLinearGradient(0, 0, 512, 512);
    grad.addColorStop(0, '#3f7e49');
    grad.addColorStop(0.35, '#569b61');
    grad.addColorStop(0.7, '#488c54');
    grad.addColorStop(1, '#3b7545');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    // Subtle sun-kissed grass blades & clover texture
    for (let i = 0; i < 4500; i++) {
      const gx = Math.random() * 512;
      const gy = Math.random() * 512;
      const gh = Math.random() * 8 + 3;
      const hues = ['#72b87d', '#5ba366', '#87c891', '#9dd7a6', '#69ad73'];
      ctx.fillStyle = hues[Math.floor(Math.random() * hues.length)];
      ctx.fillRect(gx, gy, 1.8, gh);
    }

    // Delicate nostalgic wildflowers (Chamomile daisies, misty forget-me-nots, soft lavender, pale buttercups)
    const petalPalettes = [
      { petal: '#fefefe', center: '#eab308' }, // Chamomile daisy (nostalgic white)
      { petal: '#f8fafc', center: '#facc15' }, // Soft cream daisy
      { petal: '#bfdbfe', center: '#fef08a' }, // Pale blue forget-me-not
      { petal: '#ddd6fe', center: '#ffffff' }, // Misty lavender
      { petal: '#fde68a', center: '#ca8a04' }, // Pale meadow buttercup
      { petal: '#fed7aa', center: '#ffffff' }, // Faded peach blossom
    ];

    for (let i = 0; i < 380; i++) {
      const fx = Math.random() * 512;
      const fy = Math.random() * 512;
      const choice = petalPalettes[Math.floor(Math.random() * petalPalettes.length)];
      const radius = Math.random() * 2.0 + 1.6;

      // 5 soft round petals
      ctx.fillStyle = choice.petal;
      for (let p = 0; p < 5; p++) {
        const angle = (p * Math.PI * 2) / 5;
        const px = fx + Math.cos(angle) * radius;
        const py = fy + Math.sin(angle) * radius;
        ctx.beginPath();
        ctx.arc(px, py, radius * 0.7, 0, Math.PI * 2);
        ctx.fill();
      }

      // Warm center pollen dot
      ctx.fillStyle = choice.center;
      ctx.beginPath();
      ctx.arc(fx, fy, radius * 0.45, 0, Math.PI * 2);
      ctx.fill();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  // Level 0 Dreamcore: Soft Surreal Checkerboard with Ethereal Lavender & Porcelain Sheen
  static createCheckeredDreamTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    const tileSize = 64;
    for (let x = 0; x < 512; x += tileSize) {
      for (let y = 0; y < 512; y += tileSize) {
        const isDark = ((x / tileSize) + (y / tileSize)) % 2 === 0;
        ctx.fillStyle = isDark ? '#333b56' : '#fcfbf7';
        ctx.fillRect(x, y, tileSize, tileSize);

        // Soft pastel perimeter bevel line on each tile
        ctx.strokeStyle = isDark ? '#47557e' : '#e2e8f0';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x + 1, y + 1, tileSize - 2, tileSize - 2);
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  // Level 0 Dreamcore: Atmospheric Sky Dome Gradient (Perpetual Nostalgic Golden-Hour Dream)
  static createRealisticSkyTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Atmospheric Rayleigh & Mie scattering vertical gradient:
    // Zenith azure -> soft cornflower blue -> ethereal lavender haze -> golden peach horizon -> meadow ground
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0.0, '#2563eb');   // Soft rich sky blue
    grad.addColorStop(0.20, '#3b82f6');  // Pure serene blue
    grad.addColorStop(0.38, '#60a5fa');  // Cornflower blue
    grad.addColorStop(0.50, '#93c5fd');  // Soft atmospheric cerulean
    grad.addColorStop(0.58, '#c4b5fd');  // Ethereal lavender twilight haze
    grad.addColorStop(0.65, '#fde68a');  // Warm golden peach horizon glow
    grad.addColorStop(0.72, '#fed7aa');  // Gentle apricot horizon kiss
    grad.addColorStop(0.82, '#86efac');  // Soft distant knoll blend
    grad.addColorStop(1.0, '#3f7e49');   // Ground undertone

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 512);

    // Soft diffused golden-hour sun disc with wide atmospheric corona
    const sunX = 720;
    const sunY = 280;
    const sunGrad = ctx.createRadialGradient(sunX, sunY, 12, sunX, sunY, 280);
    sunGrad.addColorStop(0, 'rgba(255, 255, 245, 0.92)');
    sunGrad.addColorStop(0.08, 'rgba(254, 243, 199, 0.65)');
    sunGrad.addColorStop(0.25, 'rgba(253, 230, 138, 0.3)');
    sunGrad.addColorStop(0.55, 'rgba(254, 215, 170, 0.12)');
    sunGrad.addColorStop(1.0, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = sunGrad;
    ctx.fillRect(0, 0, 1024, 512);

    const tex = new THREE.CanvasTexture(canvas);
    tex.mapping = THREE.EquirectangularReflectionMapping;
    return tex;
  }
}
