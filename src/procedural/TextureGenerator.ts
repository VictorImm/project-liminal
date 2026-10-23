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

  // Level 3: Archive Institutional Walnut Wainscoting & Aged Olive Plaster Wall
  static createArchiveWallTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Upper 55%: Aged institutional olive/sage plaster (y: 0 to 276)
    ctx.fillStyle = '#242a22';
    ctx.fillRect(0, 0, 512, 276);

    // Subtle plaster mottling
    for (let i = 0; i < 400; i++) {
      const px = Math.random() * 512;
      const py = Math.random() * 276;
      const r = 4 + Math.random() * 14;
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(42, 50, 39, 0.22)' : 'rgba(26, 32, 24, 0.25)';
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Water stain seepage running down from ceiling
    ctx.fillStyle = 'rgba(16, 12, 8, 0.28)';
    ctx.fillRect(80, 0, 48, 190);
    ctx.fillRect(290, 0, 70, 240);
    ctx.fillRect(410, 0, 32, 140);

    // Hairline settlement cracks in plaster
    ctx.strokeStyle = 'rgba(12, 15, 11, 0.55)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(120, 40);
    ctx.lineTo(145, 95);
    ctx.lineTo(135, 150);
    ctx.lineTo(160, 210);
    ctx.stroke();

    // Faint stenciled departmental archive classification markings
    ctx.font = 'bold 13px monospace';
    ctx.fillStyle = 'rgba(80, 95, 75, 0.32)';
    ctx.fillText('SEC-B // RECORD DEPOSITORY 03', 28, 65);
    ctx.fillText('CLASS-IV RESTRICTED ARCHIVE', 28, 85);

    // Chair rail trim (y: 276 to 292): Weathered brass & dark timber rail
    ctx.fillStyle = '#5a462b';
    ctx.fillRect(0, 276, 512, 16);
    ctx.fillStyle = '#836b44';
    ctx.fillRect(0, 276, 512, 3); // Upper highlight
    ctx.fillStyle = '#261c10';
    ctx.fillRect(0, 290, 512, 2); // Lower drop shadow

    // Brass screw studs on chair rail
    for (let x = 32; x < 512; x += 64) {
      ctx.fillStyle = '#1c150c';
      ctx.beginPath();
      ctx.arc(x, 284, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#9c8153';
      ctx.beginPath();
      ctx.arc(x, 283, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Lower 45%: Heavy dark walnut wainscoting (y: 292 to 512)
    ctx.fillStyle = '#1c120a';
    ctx.fillRect(0, 292, 512, 220);

    // Vertical walnut planks and beveled moldings
    for (let x = 0; x < 512; x += 64) {
      // Plank tone variation
      ctx.fillStyle = x % 128 === 0 ? '#24170e' : '#191008';
      ctx.fillRect(x + 2, 292, 60, 220);

      // Vertical wood grain lines
      ctx.strokeStyle = 'rgba(10, 6, 3, 0.4)';
      ctx.lineWidth = 1;
      for (let gx = x + 8; gx < x + 56; gx += 10) {
        ctx.beginPath();
        ctx.moveTo(gx, 292);
        ctx.lineTo(gx + (Math.sin(gx) * 4), 512);
        ctx.stroke();
      }

      // Recessed beveled panel molding
      ctx.strokeStyle = '#0e0804';
      ctx.lineWidth = 3;
      ctx.strokeRect(x + 6, 306, 52, 188);

      ctx.strokeStyle = 'rgba(75, 50, 30, 0.25)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 7, 307, 50, 186);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  // Level 3: Institutional Archive Corridor Runner Carpet
  static createHotelCarpetTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Outer borders: Dark moss / charcoal loop pile (x: 0-64 and 448-512)
    ctx.fillStyle = '#141a14';
    ctx.fillRect(0, 0, 512, 512);

    // Inner corridor runner (x: 64 to 448)
    ctx.fillStyle = '#221e17';
    ctx.fillRect(64, 0, 384, 512);

    // Runner border pinstripes
    ctx.strokeStyle = '#52432a';
    ctx.lineWidth = 4;
    ctx.strokeRect(66, 0, 380, 512);
    ctx.strokeStyle = '#382e1d';
    ctx.lineWidth = 2;
    ctx.strokeRect(74, 0, 364, 512);

    // Muted geometric diamond runner motif
    ctx.strokeStyle = '#3a3224';
    ctx.lineWidth = 2.5;
    const diamondSize = 64;
    for (let x = 80; x < 432; x += diamondSize) {
      for (let y = 0; y <= 512; y += diamondSize) {
        ctx.beginPath();
        ctx.moveTo(x + diamondSize / 2, y);
        ctx.lineTo(x + diamondSize, y + diamondSize / 2);
        ctx.lineTo(x + diamondSize / 2, y + diamondSize);
        ctx.lineTo(x, y + diamondSize / 2);
        ctx.closePath();
        ctx.stroke();

        // Inner rosette dot
        ctx.fillStyle = '#483d2b';
        ctx.beginPath();
        ctx.arc(x + diamondSize / 2, y + diamondSize / 2, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Center traffic wear path (dusty grey-beige faded pile along x: 210 to 302)
    ctx.fillStyle = 'rgba(165, 155, 135, 0.09)';
    ctx.fillRect(200, 0, 112, 512);

    // Dense organic carpet stippling
    for (let i = 0; i < 600; i++) {
      const rx = 64 + Math.random() * 384;
      const ry = Math.random() * 512;
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(0,0,0,0.22)' : 'rgba(255,255,255,0.06)';
      ctx.fillRect(rx, ry, 2, 2);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  // Level 4: Cast-Iron Drainage Grating & Oiled Industrial Treadplate Floor
  static createIndustrialFloorTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Oiled cold dark steel base
    ctx.fillStyle = '#14171b';
    ctx.fillRect(0, 0, 512, 512);

    // 4 modular floor quadrant tiles (256x256 each)
    const qSize = 256;
    for (let qx = 0; qx < 512; qx += qSize) {
      for (let qy = 0; qy < 512; qy += qSize) {
        // Tile panel plate
        ctx.fillStyle = (qx + qy) % 512 === 0 ? '#1b2026' : '#181d22';
        ctx.fillRect(qx + 6, qy + 6, qSize - 12, qSize - 12);

        // Anti-slip diamond steel treadplate pattern
        ctx.fillStyle = '#2d3540';
        for (let x = qx + 20; x < qx + qSize - 20; x += 32) {
          for (let y = qy + 20; y < qy + qSize - 20; y += 32) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(Math.PI / 4);
            ctx.fillRect(-7, -2.5, 14, 5);
            ctx.fillStyle = '#424d5c'; // Highlight
            ctx.fillRect(-7, -2.5, 14, 1.5);
            ctx.fillStyle = '#2d3540';
            ctx.restore();
          }
        }

        // Corner hex bolts on plate corners
        const corners = [
          [qx + 14, qy + 14],
          [qx + qSize - 14, qy + 14],
          [qx + 14, qy + qSize - 14],
          [qx + qSize - 14, qy + qSize - 14],
        ];
        corners.forEach(([bx, by]) => {
          ctx.fillStyle = '#0e1114';
          ctx.beginPath();
          ctx.arc(bx, by, 4.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#566270';
          ctx.beginPath();
          ctx.arc(bx - 1, by - 1, 2.5, 0, Math.PI * 2);
          ctx.fill();
        });
      }
    }

    // Heavy drainage gutter channel between quadrants (Cross)
    ctx.fillStyle = '#090b0d';
    ctx.fillRect(250, 0, 12, 512);
    ctx.fillRect(0, 250, 512, 12);

    // Cast-iron drainage grating slots in gutter
    ctx.fillStyle = '#040506';
    for (let y = 8; y < 512; y += 16) {
      ctx.fillRect(252, y, 8, 8);
    }
    for (let x = 8; x < 512; x += 16) {
      ctx.fillRect(x, 252, 8, 8);
    }

    // Dark hydraulic grease & oil puddle slicks
    ctx.fillStyle = 'rgba(7, 9, 11, 0.55)';
    ctx.beginPath();
    ctx.ellipse(140, 180, 55, 38, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(370, 340, 68, 44, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // Dark rust oxidation spots
    ctx.fillStyle = 'rgba(95, 38, 16, 0.32)';
    ctx.fillRect(40, 60, 60, 50);
    ctx.fillRect(320, 110, 80, 45);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  // Level 4: Heavy Riveted Boiler Steel Wall with Weathered Hazard Markings
  static createHazardWallTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Cold boiler steel plate base
    ctx.fillStyle = '#1e2328';
    ctx.fillRect(0, 0, 512, 512);

    // Vertical steel panel divider seams
    ctx.fillStyle = '#121519';
    ctx.fillRect(170, 0, 6, 512);
    ctx.fillRect(342, 0, 6, 512);

    // Perimeter weld border
    ctx.strokeStyle = '#121519';
    ctx.lineWidth = 8;
    ctx.strokeRect(4, 4, 504, 504);

    // Heavy industrial rivet rows along seams & borders
    const rivetX = [14, 162, 180, 334, 352, 498];
    for (let rx of rivetX) {
      for (let y = 20; y < 512; y += 32) {
        ctx.fillStyle = '#0d0f12';
        ctx.beginPath();
        ctx.arc(rx, y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#424c57';
        ctx.beginPath();
        ctx.arc(rx - 1, y - 1, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Weathered & scuffed diagonal hazard warning stripe band along center (y: 205 to 305)
    const bandY = 205;
    const bandHeight = 100;
    ctx.fillStyle = '#151719';
    ctx.fillRect(0, bandY, 512, bandHeight);

    // Weathered industrial yellow stripes
    ctx.fillStyle = '#d99b16';
    for (let x = -512; x < 1024; x += 54) {
      ctx.beginPath();
      ctx.moveTo(x, bandY);
      ctx.lineTo(x + 26, bandY);
      ctx.lineTo(x + 26 + bandHeight, bandY + bandHeight);
      ctx.lineTo(x + bandHeight, bandY + bandHeight);
      ctx.closePath();
      ctx.fill();
    }

    // Weathering scuffs & scratches on hazard band
    ctx.strokeStyle = '#1a1f24';
    ctx.lineWidth = 2;
    for (let i = 0; i < 20; i++) {
      const sx = Math.random() * 512;
      const sy = bandY + Math.random() * bandHeight;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + 15 + Math.random() * 25, sy + (Math.random() - 0.5) * 8);
      ctx.stroke();
    }

    // Grease and rust drip seepages dripping down from top rivets
    ctx.fillStyle = 'rgba(10, 8, 6, 0.42)';
    ctx.fillRect(174, 0, 16, 180);
    ctx.fillRect(346, 0, 22, 230);
    ctx.fillRect(80, 0, 12, 130);

    // Stenciled machinery unit designation markings
    ctx.font = 'bold 12px monospace';
    ctx.fillStyle = 'rgba(140, 155, 170, 0.45)';
    ctx.fillText('SUB-CORE 04 // BOILER SECTOR B', 28, 60);
    ctx.fillText('MAX PRESSURE: 350 PSI // CAUTION', 28, 80);

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

  // Level 2 Floor: Submerged Small Mosaic Pool Tiles with Multi-Layered Caustics
  static createSubmergedPoolFloorTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Dark submerged basin underlay
    ctx.fillStyle = '#082f34';
    ctx.fillRect(0, 0, 512, 512);

    // High-density ceramic mosaic tiles (24px)
    const mSize = 24;
    for (let x = 0; x < 512; x += mSize) {
      for (let y = 0; y < 512; y += mSize) {
        const shade = Math.floor(Math.random() * 26) - 13;
        // Aged liminal pool ceramic tones
        ctx.fillStyle = `rgb(${14 + shade}, ${92 + shade}, ${108 + shade})`;
        ctx.fillRect(x + 1, y + 1, mSize - 2, mSize - 2);

        // Subtle specular bevel edge on ceramic
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.fillRect(x + 1, y + 1, mSize - 2, 2);
        ctx.fillRect(x + 1, y + 1, 2, mSize - 2);
      }
    }

    // Waterproof epoxy grout grid
    ctx.strokeStyle = '#051c20';
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

    // Procedural refracted caustics web overlay
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(110, 225, 220, 0.16)';
    ctx.filter = 'blur(2px)';

    // Layer 1: Primary caustic loops
    for (let i = 0; i < 28; i++) {
      const cx = (i * 37) % 512;
      const cy = (i * 59) % 512;
      const r = 24 + ((i * 13) % 36);
      ctx.beginPath();
      ctx.ellipse(cx, cy, r, r * 0.65, (i * 0.4), 0, Math.PI * 2);
      ctx.stroke();
    }

    // Layer 2: Secondary fine filament nodes
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(160, 245, 240, 0.22)';
    for (let i = 0; i < 18; i++) {
      const cx = (i * 71) % 512;
      const cy = (i * 43) % 512;
      const r = 16 + ((i * 7) % 24);
      ctx.beginPath();
      ctx.ellipse(cx, cy, r * 0.8, r * 1.2, (i * 0.7), 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  // Level 3 Ceiling: Dark Oak Coffered Ceiling with Acoustic Soundproofing Insets
  static createCofferedCeilingTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Recessed deep wood panel
    ctx.fillStyle = '#180e08';
    ctx.fillRect(0, 0, 512, 512);

    // Coffered boxes
    const boxSize = 256;
    for (let bx = 0; bx < 512; bx += boxSize) {
      for (let by = 0; by < 512; by += boxSize) {
        // Inner depression: Acoustic sound-dampening fibrous archive tile
        ctx.fillStyle = '#100905';
        ctx.fillRect(bx + 20, by + 20, boxSize - 40, boxSize - 40);

        // Acoustic pinhole perforation grid
        ctx.fillStyle = '#070402';
        for (let hx = bx + 36; hx < bx + boxSize - 36; hx += 16) {
          for (let hy = by + 36; hy < by + boxSize - 36; hy += 16) {
            ctx.beginPath();
            ctx.arc(hx, hy, 1.8, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Stepped molding
        ctx.strokeStyle = '#2d180e';
        ctx.lineWidth = 10;
        ctx.strokeRect(bx + 16, by + 16, boxSize - 32, boxSize - 32);

        ctx.strokeStyle = '#3e2215';
        ctx.lineWidth = 2;
        ctx.strokeRect(bx + 12, by + 12, boxSize - 24, boxSize - 24);
      }
    }

    // Heavy main beams
    ctx.fillStyle = '#221109';
    ctx.fillRect(244, 0, 24, 512);
    ctx.fillRect(0, 244, 512, 24);

    // Beam highlight seams
    ctx.fillStyle = '#3a2013';
    ctx.fillRect(244, 0, 2, 512);
    ctx.fillRect(0, 244, 512, 2);

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  // Level 3 Prop: Multi-Tier Archive Shelving with Document Boxes & Ledgers
  static createArchiveStackTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Dark shelving background shadow
    ctx.fillStyle = '#0a0d0b';
    ctx.fillRect(0, 0, 512, 512);

    const shelfHeight = 128;

    // 4 horizontal tiers
    for (let tier = 0; tier < 4; tier++) {
      const topY = tier * shelfHeight;
      const shelfY = topY + shelfHeight - 12;

      // Draw shelf contents (Books, Hollinger boxes, file bundles)
      if (tier === 0) {
        // Tier 0: Hollinger beige document boxes with white spine labels
        for (let x = 12; x < 490; x += 38) {
          if (x > 320 && x < 390) continue; // Gap where box was checked out decades ago
          const shade = Math.floor(Math.random() * 20) - 10;
          ctx.fillStyle = `rgb(${165 + shade}, ${155 + shade}, ${130 + shade})`;
          ctx.fillRect(x, topY + 16, 34, shelfHeight - 30);

          // White spine label with black code
          ctx.fillStyle = '#f0ece1';
          ctx.fillRect(x + 4, topY + 32, 26, 44);

          ctx.fillStyle = '#222';
          ctx.fillRect(x + 8, topY + 40, 18, 3);
          ctx.fillRect(x + 8, topY + 48, 14, 3);
          ctx.fillRect(x + 8, topY + 56, 16, 2);

          // Metal pull hole
          ctx.fillStyle = '#3a3224';
          ctx.beginPath();
          ctx.arc(x + 17, topY + 92, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (tier === 1) {
        // Tier 1: Heavy buckram-bound legal ledgers with gold foil spine bands
        let curX = 14;
        while (curX < 490) {
          const w = 18 + Math.floor(Math.random() * 16);
          const colRoll = Math.random();
          // Buckram colors: faded oxblood, institutional drab green, dark slate
          ctx.fillStyle = colRoll < 0.4 ? '#4a1c1d' : colRoll < 0.75 ? '#243426' : '#1d2224';
          ctx.fillRect(curX, topY + 12, w - 2, shelfHeight - 26);

          // Gold spine bands
          ctx.fillStyle = 'rgba(215, 180, 110, 0.7)';
          ctx.fillRect(curX, topY + 28, w - 2, 3);
          ctx.fillRect(curX, topY + 34, w - 2, 2);
          ctx.fillRect(curX, topY + 95, w - 2, 3);

          curX += w;
        }
      } else if (tier === 2) {
        // Tier 2: Manila document folders bundled with archival tape & legal dossiers
        let curX = 10;
        while (curX < 490) {
          const bundleW = 32 + Math.floor(Math.random() * 24);
          if (curX > 180 && curX < 240) {
            curX += 60; // Shelf void
            continue;
          }
          ctx.fillStyle = '#c5ba9a';
          ctx.fillRect(curX, topY + 20, bundleW - 4, shelfHeight - 34);

          // Archival black cotton tying strap
          ctx.fillStyle = '#221e1a';
          ctx.fillRect(curX, topY + 55, bundleW - 4, 4);

          // Manila tabs
          ctx.fillStyle = '#d4c9aa';
          ctx.fillRect(curX + 4, topY + 14, 14, 8);

          curX += bundleW;
        }
      } else {
        // Tier 3: Oversized catalog folios & classified archive registers
        for (let x = 16; x < 480; x += 44) {
          ctx.fillStyle = '#2a2018';
          ctx.fillRect(x, topY + 8, 38, shelfHeight - 22);

          // Red stamped mark
          ctx.fillStyle = 'rgba(180, 40, 30, 0.6)';
          ctx.fillRect(x + 6, topY + 45, 26, 12);
        }
      }

      // Horizontal steel shelf beam with rivet studs
      ctx.fillStyle = '#181f1b';
      ctx.fillRect(0, shelfY, 512, 12);
      ctx.fillStyle = '#2d3832';
      ctx.fillRect(0, shelfY, 512, 2); // Lip highlight
      ctx.fillStyle = '#0c100e';
      ctx.fillRect(0, shelfY + 10, 512, 2); // Shadow

      // Steel shelf brackets & rivets
      for (let rx = 24; rx < 512; rx += 120) {
        ctx.fillStyle = '#404f47';
        ctx.beginPath();
        ctx.arc(rx, shelfY + 6, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Vertical metal upright uprights on left & right
    ctx.fillStyle = '#141816';
    ctx.fillRect(0, 0, 10, 512);
    ctx.fillRect(502, 0, 10, 512);

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  // Level 3 Prop: 4-Drawer Institutional Steel Filing Cabinet Front
  static createFilingCabinetTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Institutional dark olive-slate steel body
    ctx.fillStyle = '#232924';
    ctx.fillRect(0, 0, 512, 512);

    // Cabinet outer frame border
    ctx.strokeStyle = '#151916';
    ctx.lineWidth = 12;
    ctx.strokeRect(6, 6, 500, 500);

    const drawerHeight = 122;

    // 4 drawers
    for (let i = 0; i < 4; i++) {
      const dy = 12 + i * drawerHeight;

      // Drawer panel face
      ctx.fillStyle = i % 2 === 0 ? '#262d27' : '#222823';
      ctx.fillRect(16, dy + 2, 480, drawerHeight - 6);

      // Drawer face beveled border
      ctx.strokeStyle = '#181d19';
      ctx.lineWidth = 3;
      ctx.strokeRect(16, dy + 2, 480, drawerHeight - 6);
      ctx.strokeStyle = 'rgba(70, 85, 75, 0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(18, dy + 4, 476, drawerHeight - 10);

      // Center: Recessed Brass Card Label Holder
      const cx = 256;
      ctx.fillStyle = '#7a6438';
      ctx.fillRect(cx - 50, dy + 28, 100, 36);
      ctx.fillStyle = '#9e844f';
      ctx.fillRect(cx - 48, dy + 30, 96, 2); // highlight
      ctx.fillStyle = '#42341b';
      ctx.fillRect(cx - 48, dy + 62, 96, 2); // shadow

      // Off-white index card insert
      ctx.fillStyle = '#ede8db';
      ctx.fillRect(cx - 40, dy + 34, 80, 24);
      // Index card classification text
      ctx.fillStyle = '#222';
      ctx.font = 'bold 9px monospace';
      ctx.fillText(`REC // 0${i + 1}-A`, cx - 35, dy + 49);

      // Center: Recessed Steel Pull Handle Cup
      ctx.fillStyle = '#101411';
      ctx.fillRect(cx - 44, dy + 74, 88, 20);
      ctx.fillStyle = '#4b574f';
      ctx.fillRect(cx - 40, dy + 76, 80, 5); // handle bar

      // Keyhole cylinder on top drawer
      if (i === 0) {
        ctx.fillStyle = '#7a6438';
        ctx.beginPath();
        ctx.arc(440, dy + 45, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#100c06';
        ctx.fillRect(439, dy + 41, 2, 9);
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  // Level 4 Ceiling: Industrial Corrugated Steel Deck with Structural I-Beams & Soot
  static createCorrugatedCeilingTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Cold dark industrial steel base
    ctx.fillStyle = '#16191d';
    ctx.fillRect(0, 0, 512, 512);

    // Corrugated iron ribs with 3D shadow/highlight gradient
    for (let x = 0; x < 512; x += 32) {
      ctx.fillStyle = '#252a32';
      ctx.fillRect(x, 0, 16, 512);
      ctx.fillStyle = '#363d47';
      ctx.fillRect(x, 0, 3, 512); // Rib edge highlight
      ctx.fillStyle = '#101216';
      ctx.fillRect(x + 16, 0, 16, 512);
    }

    // Heavy dark soot and heat burn plumes from boiler vents
    ctx.fillStyle = 'rgba(6, 7, 9, 0.65)';
    ctx.beginPath();
    ctx.arc(160, 256, 120, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(380, 180, 95, 0, Math.PI * 2);
    ctx.fill();

    // Rust oxidation streaks
    ctx.fillStyle = 'rgba(105, 42, 18, 0.4)';
    ctx.fillRect(40, 0, 60, 240);
    ctx.fillRect(280, 140, 90, 372);

    // Heavy cross structural I-Beams (Horizontal & Vertical)
    ctx.fillStyle = '#0f1115';
    ctx.fillRect(0, 236, 512, 40);
    ctx.fillStyle = '#323942';
    ctx.fillRect(0, 254, 512, 4); // I-beam web ridge

    // Rivet studs along I-beam flanges
    for (let rx = 16; rx < 512; rx += 32) {
      ctx.fillStyle = '#090a0d';
      ctx.beginPath();
      ctx.arc(rx, 242, 3, 0, Math.PI * 2);
      ctx.arc(rx, 270, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#55606e';
      ctx.beginPath();
      ctx.arc(rx - 1, 241, 1.5, 0, Math.PI * 2);
      ctx.arc(rx - 1, 269, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  // Level 4 Prop: High-Contrast Analog Boiler Steam Pressure Gauge Dial
  static createPressureGaugeTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    // Outer brass casing rim
    ctx.fillStyle = '#5c4a28';
    ctx.beginPath();
    ctx.arc(128, 128, 124, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#8a7242';
    ctx.beginPath();
    ctx.arc(128, 128, 118, 0, Math.PI * 2);
    ctx.fill();

    // Dark inset bezel shadow
    ctx.fillStyle = '#1c170d';
    ctx.beginPath();
    ctx.arc(128, 128, 110, 0, Math.PI * 2);
    ctx.fill();

    // Aged off-white dial face
    ctx.fillStyle = '#e8e2d2';
    ctx.beginPath();
    ctx.arc(128, 128, 104, 0, Math.PI * 2);
    ctx.fill();

    // Red critical pressure hazard zone arc (from 80 to 120 PSI, ~30 to 90 deg)
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(128, 128, 86, 0.25 * Math.PI, 0.75 * Math.PI);
    ctx.stroke();

    // Scale graduation ticks & numbers
    ctx.strokeStyle = '#1a1814';
    ctx.fillStyle = '#1a1814';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const numTicks = 24;
    for (let i = 0; i <= numTicks; i++) {
      const angle = Math.PI * 0.75 + (i / numTicks) * Math.PI * 1.5;
      const isMajor = i % 4 === 0;
      const rInner = isMajor ? 78 : 84;
      const rOuter = 92;

      ctx.lineWidth = isMajor ? 3 : 1.5;
      ctx.beginPath();
      ctx.moveTo(128 + Math.cos(angle) * rInner, 128 + Math.sin(angle) * rInner);
      ctx.lineTo(128 + Math.cos(angle) * rOuter, 128 + Math.sin(angle) * rOuter);
      ctx.stroke();

      if (isMajor) {
        const val = i * 15;
        const rText = 66;
        ctx.fillText(`${val}`, 128 + Math.cos(angle) * rText, 128 + Math.sin(angle) * rText);
      }
    }

    // Gauge center label
    ctx.font = 'bold 9px monospace';
    ctx.fillText('STEAM PSI', 128, 158);
    ctx.font = '7px monospace';
    ctx.fillStyle = '#7a2218';
    ctx.fillText('MAX 350', 128, 172);

    // Center brass pivot stud
    ctx.fillStyle = '#3a2e18';
    ctx.beginPath();
    ctx.arc(128, 128, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#8a7242';
    ctx.beginPath();
    ctx.arc(128, 128, 5, 0, Math.PI * 2);
    ctx.fill();

    const tex = new THREE.CanvasTexture(canvas);
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
