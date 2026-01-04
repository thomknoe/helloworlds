import * as THREE from "three";

/**
 * Creates a procedural gradient sky inspired by Journey/Flow aesthetic
 * Soft, ethereal gradients that transition organically
 */
export function createGradientSky() {
  const geometry = new THREE.SphereGeometry(500, 32, 32);

  const sunPosition = new THREE.Vector3(0.3, 0.7, 0.2).normalize();

  const material = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0.0 },
      sunPosition: { value: sunPosition },
      sunColor: { value: new THREE.Color(1.0, 0.95, 0.85) },
      terrainComposition: { value: 0.0 }, // 0 = no grass (neutral), 1 = all grass (blue-green)
    },
    vertexShader: `
      varying vec3 vWorldPosition;
      varying vec3 vDirection;
      
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        vDirection = normalize(worldPosition.xyz);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform vec3 sunPosition;
      uniform vec3 sunColor;
      uniform float terrainComposition;
      
      varying vec3 vWorldPosition;
      varying vec3 vDirection;
      
      // Noise functions for clouds
      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }
      
      float smoothNoise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
      }
      
      float fbm(vec2 p) {
        float value = 0.0;
        float amplitude = 0.5;
        float frequency = 1.0;
        
        for (int i = 0; i < 4; i++) {
          value += smoothNoise(p * frequency) * amplitude;
          frequency *= 2.0;
          amplitude *= 0.5;
        }
        
        return value;
      }
      
      void main() {
        vec3 dir = normalize(vDirection);
        
        // Original rich blue sky colors
        vec3 baseHorizonColor = vec3(0.7, 0.85, 0.95); // Rich light blue horizon
        vec3 baseMidColor = vec3(0.5, 0.75, 0.9); // Rich medium blue mid
        vec3 baseZenithColor = vec3(0.3, 0.6, 0.85); // Rich deep blue zenith
        vec3 blueGreenHorizonColor = vec3(0.65, 0.88, 0.92); // Slightly green-tinted horizon
        vec3 blueGreenMidColor = vec3(0.45, 0.78, 0.88); // Slightly green-tinted mid
        vec3 blueGreenZenithColor = vec3(0.25, 0.65, 0.82); // Slightly green-tinted zenith
        
        // Blend between base (composition = 0, no grass) and blue-green (composition = 1, all grass)
        // Use smoothstep for beautiful, smooth transitions
        float grassBlend = smoothstep(0.0, 1.0, terrainComposition);
        
        // Mix colors based on grass ratio - rich, vibrant blending
        vec3 horizonColor = mix(baseHorizonColor, blueGreenHorizonColor, grassBlend * 0.85);
        vec3 midColor = mix(baseMidColor, blueGreenMidColor, grassBlend * 0.85);
        vec3 zenithColor = mix(baseZenithColor, blueGreenZenithColor, grassBlend * 0.85);
        
        // Beautiful, smooth vertical gradient with high contrast
        float t = smoothstep(-0.3, 0.7, dir.y);
        vec3 skyColor = mix(horizonColor, midColor, smoothstep(0.0, 0.5, t));
        skyColor = mix(skyColor, zenithColor, smoothstep(0.3, 1.0, t));
        
        // Procedural clouds
        vec2 cloudUV = dir.xz * 0.3 + vec2(time * 0.02, 0.0);
        float clouds = fbm(cloudUV);
        clouds = smoothstep(0.3, 0.7, clouds);
        clouds *= smoothstep(0.0, 0.4, dir.y); // Clouds mainly in upper sky
        
        // Cloud color with albedo variation
        vec3 cloudColor = vec3(0.95, 0.95, 0.98); // White clouds
        float cloudAlbedo = 0.6 + clouds * 0.4; // Varying cloud brightness
        skyColor = mix(skyColor, cloudColor * cloudAlbedo, clouds * 0.4);
        
        // Sun disk - bright, vibrant, and prominent
        vec3 adjustedSunColor = vec3(1.0, 0.92, 0.75); // Rich, warm sun color
        
        float sunDot = dot(dir, sunPosition);
        float sunDisk = smoothstep(0.998, 1.0, sunDot);
        float sunGlow = pow(max(sunDot, 0.0), 8.0);
        float sunHalo = pow(max(sunDot, 0.0), 3.0);
        
        // Sun with rich shine and vibrant glow
        skyColor += adjustedSunColor * sunDisk * 2.2; // Bright, vibrant sun disk
        skyColor += adjustedSunColor * sunGlow * 0.5; // Rich sun glow
        skyColor += adjustedSunColor * sunHalo * 0.18; // Vibrant sun halo
        
        // Atmospheric scattering at horizon
        float horizonGlow = pow(max(1.0 - abs(dir.y), 0.0), 2.0);
        
        // Subtle time-based variation (subtle breathing effect)
        float timeVariation = sin(time * 0.1) * 0.02 + 1.0;
        skyColor *= timeVariation;
        
        // Preserve rich, vibrant colors - minimal desaturation for depth
        float gray = dot(skyColor, vec3(0.299, 0.587, 0.114));
        skyColor = mix(skyColor, vec3(gray), 0.02); // Very minimal desaturation to preserve richness
        
        // Subtle green tint to the sky - slightly more pronounced
        skyColor.g += 0.025; // Slightly stronger green boost
        
        gl_FragColor = vec4(skyColor, 1.0);
      }
    `,
    side: THREE.BackSide,
  });

  const sky = new THREE.Mesh(geometry, material);
  return sky;
}
