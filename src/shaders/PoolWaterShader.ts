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
  emitRipple: (x: number, z: number) => void;
} {
  const MAX_RIPPLES = 8;
  const ripplesArray = new Float32Array(MAX_RIPPLES * 4);
  let rippleIndex = 0;

  // Initialize ripples as inactive (w = amplitude = 0.0)
  for (let i = 0; i < MAX_RIPPLES; i++) {
    ripplesArray[i * 4 + 0] = 0; // x
    ripplesArray[i * 4 + 1] = 0; // z
    ripplesArray[i * 4 + 2] = -999; // startTime
    ripplesArray[i * 4 + 3] = 0; // amplitude
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
      // Wave 1: Gentle primary swell (~16 deg)
      vec2 k1 = vec2(0.82, 0.24);
      float phase1 = dot(k1, pos) - uTime * 0.72;

      // Wave 2: Opposing cross-swell (~115 deg)
      vec2 k2 = vec2(-0.42, 0.96);
      float phase2 = dot(k2, pos) - uTime * 1.08;

      // Wave 3: Subtle capillary surface ripple (~ -45 deg)
      vec2 k3 = vec2(1.30, -1.30);
      float phase3 = dot(k3, pos) - uTime * 1.48;

      // Analytical gradient dh/dx, dh/dz
      vec2 grad = vec2(0.0);
      grad += k1 * (0.012 * cos(phase1));
      grad += k2 * (0.007 * cos(phase2));
      grad += k3 * (0.004 * cos(phase3));

      // 2. Dynamic player footstep ripple propagation
      for (int i = 0; i < ${MAX_RIPPLES}; i++) {
        vec4 rip = uRipples[i];
        if (rip.w > 0.0) {
          float dt = uTime - rip.z;
          if (dt > 0.0 && dt < 2.4) {
            vec2 diff = pos - rip.xy;
            float dist = length(diff);

            // Water ripple propagation velocity (~1.9 m/s)
            float waveFront = dt * 1.9;
            float distFromFront = dist - waveFront;

            // Concentrated wavefront packet envelope
            float envelope = exp(-pow(distFromFront / 0.32, 2.0));
            // Spatial & temporal dissipation
            float damping = exp(-dt * 1.35) / sqrt(dist + 0.25);

            float waveAmp = rip.w * 0.026 * envelope * damping;

            if (waveAmp > 0.0001 && dist > 0.02) {
              vec2 dir = diff / dist;
              float kRipple = 15.0;
              float wRipple = 28.5;
              float ripPhase = kRipple * dist - wRipple * dt;
              grad += dir * (waveAmp * kRipple * cos(ripPhase));
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

      // 5. Water color synthesis
      vec3 waterColor = mix(uDeepColor, uShallowColor, 0.45);
      vec3 finalColor = mix(waterColor, uSurfaceColor, fresnel * 0.72);

      // Add fluorescent highlight
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

  const emitRipple = (x: number, z: number) => {
    const now = performance.now() * 0.001;
    const base = rippleIndex * 4;
    ripplesArray[base + 0] = x;
    ripplesArray[base + 1] = z;
    ripplesArray[base + 2] = now;
    ripplesArray[base + 3] = 1.0; // amplitude
    rippleIndex = (rippleIndex + 1) % MAX_RIPPLES;
  };

  return { material, updateTime, emitRipple };
}
