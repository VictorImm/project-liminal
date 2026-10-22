# THE THRESHOLD // LIMINAL DRIFT 🕳️

A browser-based 3D psychological liminal horror game built with **Three.js**, **React**, and **100% Procedural Web Audio API**. Every playthrough generates an entirely unique labyrinth of liminal rooms, flickering 60Hz fluorescent ballasts, scattered reality anchors, and an evolving eldritch stalker.

---

## 🎮 Playable Premise
You awaken inside **Sector 0**, an endless subterranean threshold complex.
The airlock is sealed. To survive and escape:
1. Search the interconnected rooms across **4 Unique Procedural Levels**:
   - **Level 1 // The Yellow Mono-Halls**: Classic Backrooms wallpaper, damp office carpets, and 60Hz humming sodium lights.
   - **Level 2 // Sublimity Poolrooms**: Flooded aqueducts, reflective cyan tile atriums, and submerged columned basins.
   - **Level 3 // Endless Archive & Hotel**: Victorian mahogany wainscoting, crimson hotel runner carpets, and towering bookcases.
   - **Level 4 // Machine Sub-level & Boiler**: Claustrophobic serpentine steel bulkheads, overhead steam pipes, and glowing boiler grates.
2. Locate **3 Level-Specific Reality Anchors** on each floor to unseal the airlock.
3. Manage your **Flashlight Battery**—search dark corners for glowing green 9V battery cells.
4. Use the **RADAR Minimap (`M`)** to navigate the dynamic floorplan and track your continuous heading.
5. If the lights flicker and static rises, an **Eldritch Stalker** is hunting. Crouch, extinguish your flashlight, and listen to the muffled footsteps.
6. Reach the **Exit Airlock** with all 3 Anchors to descend into the next sector and reach the final reality breach.

---

## ⚙️ Game Settings & Features
- **With / No Jumpscares Toggle**:
  - **With Jumpscares (Default)**: Full horror experience with sudden generative SVG eldritch attacks, screen shaking, and multi-oscillator synthesized audio shrieks.
  - **No Jumpscares (Atmospheric Mode)**: For players who want pure liminal exploration and eerie ambiance. Being caught triggers an atmospheric analog fade-out ("SIGNAL TERMINATED") without violent screamers.
- **Master Volume & Mouse Sensitivity Sliders**: Fine-tune your experience.
- **Retro CRT Scanlines & Grain Toggle**: Toggle between retro VHS analog aesthetic and clean modern rendering.
- **Shareable Reality Seeds**: Each run generates a unique seed (e.g. `LIMINAL-849201`). Enter any seed to replay the exact room layout and item distribution with friends.
- **Mobile Touch Controls**: Full on-screen touch D-pad and swipe-to-look controls for smartphone/tablet browsers.

---

## 🕹️ Controls

| Action | Desktop Controls | Mobile Touch |
| :--- | :--- | :--- |
| **Move** | `W`, `A`, `S`, `D` or Arrow Keys | Left Virtual D-Pad |
| **Look Around** | Mouse (Pointer Lock) | Right Screen Swipe |
| **Toggle Flashlight** | `F` | Flashlight Button `[🔦]` |
| **Interact / Collect** | `E`, `Space`, or Left Click | Hand Button `[✋]` |
| **Sprint** | `Shift` | - |
| **Crouch** | `C` | - |
| **Settings / Pause** | `ESC` or Gear Icon | Gear Icon `[⚙️]` |

---

## 🚀 Instant Deployment to GitHub Pages

This project is built as a static Single Page Application (SPA) with relative asset paths (`base: './'`).

### Automated CI/CD (GitHub Actions)
1. Push this repository to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: The Threshold Liminal Horror Game"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```
2. In your GitHub repository:
   - Go to **Settings** > **Pages**.
   - Under **Build and deployment** > **Source**, select **GitHub Actions**.
3. Every commit to `main` will automatically build and publish the game to:
   `https://<your-username>.github.io/<your-repo-name>/`

---

## 🛠️ Architecture & Tech Stack
- **Engine**: Three.js (WebGL) + React 18 + TypeScript + Vite.
- **Zero External Assets**:
  - **100% Procedural Web Audio API**: Ambient 60Hz hum, material-reactive footsteps (carpet, tile, water, metal), telephone bell synthesis, proximity radio static, dynamic heartbeats, and shrieker stingers.
  - **100% Procedural Textures**: Real-time HTML5 Canvas texture generation for yellow wallpaper, poolroom cyan tiles, acoustic ceiling dots, and rusted iron panels.
  - **Generative SVG Eldritch Entity**: Algorithmic bezier-curve jaws, asymmetric twitching eyes, and glitch displacement filters.
