import * as THREE from 'three';

/**
 * Creates a high-performance GLSL ShaderMaterial for Level 2 Sublimity Poolrooms.
 * Features:
 * - 3-octave analytical wave normal generation (zero polygon mesh tessellation overhead)
 * - Dynamic footstep ripple propagation ring buffer in GLSL
 * - Physically plausible Schlick Fresnel gradient (transparent top-down, reflective at grazing angles)
 * - Anisotropic specular highlight simulation for elongated fluorescent ceiling troffers
 * - Seamless integration with Three.js FogExp2
 */
export function createPoolWaterMaterial(): {
  material: THREE.ShaderMaterial;
  updateTime: (timeSec: number) => void;
  emitRipple: (x: number, z: number, intensity?: number) => void;
} {
  const MAX_RIPPLES = 12;
  const ripplesArray = new Float32Array(MAX_RIPPLES * 4);
  let rippleIndex = 0;

  // Initialize ripples as inactive (w = amplitude = 0.0)
  for (let i = 0; i < MAX_RIPPLES; i++) {
    ripplesArray[i * 4 + 0] = 0; // x
    ripplesArray[i * 4 + 1] = 0; // z
    ripplesArray[i * 4 + 2] = -999; // startTime
    ripplesArray[i * 4 + 3] = 0; // amplitude / intensity
  }

  const uniforms = THREE.UniformsUtils.merge([
    THREE.UniformsLib.fog,
    {
      uTime: { value: 0 },
      uRipples: { value: ripplesArray },
      uDeepColor: { value: new THREE.Color(0x0c3338) }, // Subdued dark aquatic teal
      uShallowColor: { value: new THREE.Color(0x195d66) }, // Liminal muted turquoise
      uSurfaceColor: { value: new THREE.Color(0x76c2be) }, // Pale aged fluorescent pool reflection
      uLightColor: { value: new THREE.Color(0xecfeff) }, // Cold fluorescent troffer specular highlight
    },
  ]);

  const vertexShader = `
    #include <common>
    #include <fog_pars_vertex>

    varying vec3 vWorldPosition;
    varying vec3 vViewPosition;
    varying vec2 vUv;

    void main() {
      vUv = uv;
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPos.xyz;
      vec4 mvPosition = viewMatrix * worldPos;
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
      #include <fog_vertex>
    }
  `;

  const fragmentShader = `
    #include <common>
    #include <fog_pars_fragment>

    uniform float uTime;
    uniform vec4 uRipples[${MAX_RIPPLES}];
    uniform vec3 uDeepColor;
    uniform vec3 uShallowColor;
    uniform vec3 uSurfaceColor;
    uniform vec3 uLightColor;

    varying vec3 vWorldPosition;
    varying vec3 vViewPosition;
    varying vec2 vUv;

    void main() {
      vec2 pos = vWorldPosition.xz;

      // 1. Multi-octave continuous calm wave superposition (Analytical trigonometric derivatives)
      // Wave 1: Gentle primary swell (~18 deg, slow ~12s cycle)
      vec2 k1 = vec2(0.55, 0.18);
      float phase1 = dot(k1, pos) - uTime * 0.52;

      // Wave 2: Opposing cross-swell (~125 deg, ~9s cycle)
      vec2 k2 = vec2(-0.28, 0.62);
      float phase2 = dot(k2, pos) - uTime * 0.76;

      // Wave 3: Subtle capillary surface shimmer (~ -42 deg)
      vec2 k3 = vec2(0.95, -0.85);
      float phase3 = dot(k3, pos) - uTime * 1.15;

      // Wave 4: Delicate transverse capillary ripple (~ -130 deg)
      vec2 k4 = vec2(-0.72, -0.58);
      float phase4 = dot(k4, pos) - uTime * 1.38;

      // Analytical gradient dh/dx, dh/dz
      vec2 grad = vec2(0.0);
      grad += k1 * (0.0055 * cos(phase1));
      grad += k2 * (0.0035 * cos(phase2));
      grad += k3 * (0.0022 * cos(phase3));
      grad += k4 * (0.0016 * cos(phase4));

      // 2. Dynamic player footstep water ripple propagation with physical packet dispersion
      for (int i = 0; i < ${MAX_RIPPLES}; i++) {
        vec4 rip = uRipples[i];
        float ripIntensity = rip.w;
        if (ripIntensity > 0.0) {
          float dt = uTime - rip.z;
          if (dt > 0.0 && dt < 3.2) {
            vec2 diff = pos - rip.xy;
            float dist = length(diff);

            // Water ripple propagation velocity (~1.85 m/s)
            float waveFront = dt * 1.85;
            float distFromFront = dist - waveFront;

            // Physical dispersion: wavefront packet envelope gently broadens over distance/time
            float packetWidth = 0.30 + dt * 0.12;
            float envelope = exp(-pow(distFromFront / packetWidth, 2.0));

            // Smooth temporal & spatial dissipation (Hermite fade prevents sudden pop)
            float lifeFade = smoothstep(3.2, 0.35, dt);
            float distFade = smoothstep(4.2, 0.15, dist);
            float damping = (exp(-dt * 0.95) / sqrt(dist + 0.30)) * lifeFade * distFade;

            float waveAmp = ripIntensity * 0.024 * envelope * damping;

            if (waveAmp > 0.00005 && dist > 0.02) {
              vec2 dir = diff / dist;
              float kRipple = 13.5;
              float wRipple = 25.0;
              float ripPhase = kRipple * dist - wRipple * dt;
              // Concentric wave packet with trailing harmonic
              float packetForm = cos(ripPhase) + 0.32 * cos(ripPhase * 1.55 + 0.4);
              grad += dir * (waveAmp * kRipple * packetForm);
            }
          }
        }
      }

      // Perturbed liquid surface normal
      vec3 normal = normalize(vec3(-grad.x, 1.0, -grad.y));

      // View direction
      vec3 viewDir = normalize(vViewPosition);

      // 3. Schlick's Fresnel gradient
      // Top-down: NdotV ~ 1.0 -> fresnel ~ 0.08 (high transparency, clear view of submerged tiles & drain)
      // Glancing: NdotV ~ 0.0 -> fresnel ~ 0.75 (high reflection of walls & cool ceiling ambience)
      float NdotV = max(dot(normal, viewDir), 0.0);
      float fresnel = 0.08 + (1.0 - 0.08) * pow(1.0 - NdotV, 3.8);

      // 4. Anisotropic elongated fluorescent troffer specular highlight
      // Fluorescent troffers are 2.4m x 0.6m fixtures oriented along the room axis
      vec2 roomCenter = floor((pos + 5.0) / 10.0) * 10.0;
      vec3 lightPos = vec3(roomCenter.x, 3.45, roomCenter.y);
      vec3 lightDir = normalize(lightPos - vWorldPosition);

      vec3 H = normalize(lightDir + viewDir);
      // Elongate specular lobe along Z axis
      vec3 anisoNormal = normalize(vec3(normal.x * 2.6, normal.y, normal.z * 0.65));
      float NdotH = max(dot(anisoNormal, H), 0.0);
      float specular = pow(NdotH, 42.0) * 1.25;

      // 5. Subtle micro-caustic light shimmer on surface
      float surfaceShimmer = clamp(dot(grad, vec2(0.707, 0.707)) * 0.75, -0.15, 0.25);

      // 6. Water color synthesis
      vec3 waterColor = mix(uDeepColor, uShallowColor, 0.45);
      vec3 finalColor = mix(waterColor, uSurfaceColor, fresnel * 0.72);
      finalColor += uSurfaceColor * surfaceShimmer * (1.0 - fresnel * 0.4);

      // Add fluorescent highlight (subtly distorted by wave normals)
      finalColor += uLightColor * (specular * (0.35 + 0.65 * fresnel));

      // Optical transparency gradient
      float alpha = mix(0.32, 0.78, fresnel);

      gl_FragColor = vec4(finalColor, alpha);

      #include <fog_fragment>
    }
  `;

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
    transparent: true,
    fog: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  });

  const updateTime = (timeSec: number) => {
    material.uniforms.uTime.value = timeSec;
  };

  const emitRipple = (x: number, z: number, intensity: number = 0.5) => {
    const now = performance.now() * 0.001;
    const base = rippleIndex * 4;
    ripplesArray[base + 0] = x;
    ripplesArray[base + 1] = z;
    ripplesArray[base + 2] = now;
    ripplesArray[base + 3] = Math.max(0.1, Math.min(1.5, intensity));
    rippleIndex = (rippleIndex + 1) % MAX_RIPPLES;
  };

  return { material, updateTime, emitRipple };
}
