import * as THREE from "three";

/**
 * Creates a contour shader material with ring-like patterns
 * Can be applied to any object for consistent rendering style
 */
export function createContourMaterial({
  baseColor = new THREE.Color(0xffffff),
  contourColor = new THREE.Color(0x000000),
  contourSpacing = 2.0,
  contourWidth = 0.1,
  contourIntensity = 0.3,
  lightDir = new THREE.Vector3(0.4, 1, 0.3).normalize(),
  time = 0.0,
} = {}) {
  return new THREE.ShaderMaterial({
    uniforms: {
      baseColor: { value: baseColor },
      contourColor: { value: contourColor },
      contourSpacing: { value: contourSpacing },
      contourWidth: { value: contourWidth },
      contourIntensity: { value: contourIntensity },
      lightDir: { value: lightDir },
      time: { value: time },
    },
    vertexShader: `
      varying vec3 vWorldPos;
      varying vec3 vNormal;
      varying float vHeight;
      
      void main() {
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPos = worldPos.xyz;
        vHeight = worldPos.y;
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 baseColor;
      uniform vec3 contourColor;
      uniform float contourSpacing;
      uniform float contourWidth;
      uniform float contourIntensity;
      uniform vec3 lightDir;
      uniform float time;
      
      varying vec3 vWorldPos;
      varying vec3 vNormal;
      varying float vHeight;
      
      // Noise for organic contour variation
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
        
        for (int i = 0; i < 3; i++) {
          value += smoothNoise(p * frequency) * amplitude;
          frequency *= 2.0;
          amplitude *= 0.5;
        }
        
        return value;
      }
      
      void main() {
        // Calculate distance from origin for circular/ring patterns
        float dist = length(vWorldPos.xz);
        
        // Add organic variation to spacing
        float noise = fbm(vWorldPos.xz * 0.1 + vec2(time * 0.01, 0.0));
        float spacing = contourSpacing * (0.8 + noise * 0.4);
        
        // Create contour rings - harsher, more defined
        float contour = mod(dist, spacing);
        float ring = smoothstep(spacing * (1.0 - contourWidth), spacing * (1.0 - contourWidth * 0.5), contour);
        ring = 1.0 - ring; // Invert for dark rings
        
        // Add height-based contours
        float heightContour = mod(vHeight, spacing * 0.5);
        float heightRing = smoothstep(spacing * 0.5 * (1.0 - contourWidth), spacing * 0.5 * (1.0 - contourWidth * 0.5), heightContour);
        heightRing = 1.0 - heightRing;
        
        // Combine contours
        float combinedContour = min(ring, heightRing);
        
        // Lighting
        float diff = max(dot(normalize(vNormal), normalize(lightDir)), 0.0);
        float lighting = 0.6 + diff * 0.4;
        
        // Apply contour
        vec3 color = mix(baseColor, contourColor, combinedContour * contourIntensity);
        color *= lighting;
        
        gl_FragColor = vec4(color, 1.0);
      }
    `,
  });
}

