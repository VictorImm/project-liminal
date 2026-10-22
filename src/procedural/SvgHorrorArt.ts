import * as THREE from 'three';

/**
 * Procedural SVG Art Generator
 * Creates creepy paintings, cryptic warning notices, and distorted polaroids
 * that hang inside picture frames in the procedural rooms.
 */
export class SvgHorrorArt {
  public static createArtTexture(seed: number, type: 'portrait' | 'warning' | 'polaroid' | 'diagram'): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 340;
    const ctx = canvas.getContext('2d')!;

    // Frame Border
    ctx.fillStyle = '#1c1712';
    ctx.fillRect(0, 0, 256, 340);
    ctx.fillStyle = '#2d241c';
    ctx.fillRect(8, 8, 240, 324);

    if (type === 'portrait') {
      // Distorted Eldritch Portrait
      ctx.fillStyle = '#e8ded0';
      ctx.fillRect(20, 20, 216, 300);

      // Aged sepia vignette
      const grad = ctx.createRadialGradient(128, 170, 40, 128, 170, 150);
      grad.addColorStop(0, 'rgba(160, 130, 95, 0.2)');
      grad.addColorStop(1, 'rgba(60, 40, 25, 0.85)');
      ctx.fillStyle = grad;
      ctx.fillRect(20, 20, 216, 300);

      // Head silhouette
      ctx.fillStyle = '#221a15';
      ctx.beginPath();
      ctx.ellipse(128, 150, 48, 68, 0, 0, Math.PI * 2);
      ctx.fill();

      // Shoulders
      ctx.beginPath();
      ctx.ellipse(128, 270, 80, 55, 0, 0, Math.PI);
      ctx.fill();

      // Gouged / Glitched eyes
      ctx.fillStyle = '#050505';
      const eyeOffset = (seed % 7) - 3;
      ctx.fillRect(108 + eyeOffset, 142, 12, 6);
      ctx.fillRect(136 - eyeOffset, 140, 14, 8);

      // Black streak / tear dripping down
      ctx.fillStyle = '#100c0a';
      ctx.fillRect(112, 148, 4, 38);
      ctx.fillRect(140, 148, 5, 52);

      // Distorted stretched mouth
      ctx.beginPath();
      ctx.ellipse(128, 185, 20, 28 + (seed % 15), 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'warning') {
      // Cryptic warning document
      ctx.fillStyle = '#c7bfa9';
      ctx.fillRect(20, 20, 216, 300);

      // Red stamp
      ctx.strokeStyle = '#991b1b';
      ctx.lineWidth = 4;
      ctx.strokeRect(35, 35, 186, 65);

      ctx.fillStyle = '#991b1b';
      ctx.font = 'bold 22px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('DO NOT LOITER', 128, 62);
      ctx.font = '13px monospace';
      ctx.fillText('THRESHOLD BREACHED', 128, 84);

      // Fake classified text lines
      ctx.fillStyle = '#3f382a';
      for (let y = 130; y < 290; y += 14) {
        const lineLen = 140 + Math.sin(y + seed) * 40;
        ctx.fillRect(40, y, lineLen, 4);
      }

      // Red crossed out marker
      ctx.strokeStyle = 'rgba(180, 20, 20, 0.7)';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(40, 150);
      ctx.lineTo(210, 270);
      ctx.stroke();
    } else if (type === 'diagram') {
      // Architectural / Liminal Grid Blueprint
      ctx.fillStyle = '#12232e';
      ctx.fillRect(20, 20, 216, 300);

      ctx.strokeStyle = '#206a8e';
      ctx.lineWidth = 1;
      for (let x = 20; x <= 236; x += 18) {
        ctx.beginPath();
        ctx.moveTo(x, 20);
        ctx.lineTo(x, 320);
        ctx.stroke();
      }
      for (let y = 20; y <= 320; y += 18) {
        ctx.beginPath();
        ctx.moveTo(20, y);
        ctx.lineTo(236, y);
        ctx.stroke();
      }

      // Floorplan red rooms
      ctx.fillStyle = 'rgba(230, 57, 70, 0.6)';
      ctx.fillRect(56, 74, 54, 54);
      ctx.fillRect(128, 128, 72, 72);

      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.strokeRect(56, 74, 54, 54);
      ctx.strokeRect(128, 128, 72, 72);

      ctx.fillStyle = '#fff';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('NO ESCAPE', 128, 300);
    } else {
      // Polaroid photo
      ctx.fillStyle = '#f4f1ea';
      ctx.fillRect(20, 20, 216, 300);

      ctx.fillStyle = '#0f1416';
      ctx.fillRect(35, 35, 186, 210);

      // Deep dark corridor silhouette in photo
      ctx.fillStyle = '#223038';
      ctx.beginPath();
      ctx.moveTo(35, 245);
      ctx.lineTo(100, 140);
      ctx.lineTo(156, 140);
      ctx.lineTo(221, 245);
      ctx.fill();

      // Glowing white eyes in dark hallway
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#00ffff';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(122, 138, 3, 0, Math.PI * 2);
      ctx.arc(134, 138, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Handwritten note on polaroid bottom
      ctx.fillStyle = '#2b2b2b';
      ctx.font = 'italic 12px serif';
      ctx.textAlign = 'center';
      ctx.fillText('it sees you when you blink', 128, 280);
    }

    return new THREE.CanvasTexture(canvas);
  }
}
