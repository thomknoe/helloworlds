import * as THREE from "three";

export function createTerrainMaterial({
  waterHeight = 0, // Lower shoreline - much closer to water edge (water is at 18)
  lightDir = new THREE.Vector3(0.4, 1, 0.3).normalize(),
  time = 0.0,
}) {
  return new THREE.ShaderMaterial({
    uniforms: {
      waterHeight: { value: waterHeight },
      lightDir: { value: lightDir },
      time: { value: time },
      contrast: { value: 1.18 },
    },
    vertexShader: `
      varying vec2 vUv;
      varying float vHeight;
      varying vec3 vNormal;
      varying vec3 vWorldPos;
      varying float vDist;
      varying vec3 vViewPosition;

      void main(){
        vUv = uv;
        vHeight = position.y;
        vNormal = normalize(normalMatrix * normal);
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPos = worldPos.xyz;
        vDist = length(worldPos.xz);
        vViewPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float waterHeight;
      uniform vec3 lightDir;
      uniform float time;
      uniform float contrast;

      varying vec2 vUv;
      varying float vHeight;
      varying vec3 vNormal;
      varying vec3 vWorldPos;
      varying float vDist;
      varying vec3 vViewPosition;

      // Soft noise function for organic variation
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

      float organicNoise(vec2 p) {
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

      // Cel-shading function - creates hard bands of light/shadow for cartoon look
      // Using step functions for hard edges (more reliable than if statements)
      float celShade(float ndl) {
        // Clamp input to valid range
        ndl = clamp(ndl, 0.0, 1.0);
        
        // Create distinct bands using step functions for hard edges
        // Deep shadow: 0.0-0.2 -> 0.3
        // Mid shadow: 0.2-0.5 -> 0.6
        // Light: 0.5-0.8 -> 0.9
        // Highlight: 0.8-1.0 -> 1.0
        float s1 = step(0.2, ndl);  // 1.0 if ndl >= 0.2, else 0.0
        float s2 = step(0.5, ndl);  // 1.0 if ndl >= 0.5, else 0.0
        float s3 = step(0.8, ndl);  // 1.0 if ndl >= 0.8, else 0.0
        
        // Build result from bands
        float r = 0.3;
        r = mix(r, 0.6, s1);
        r = mix(r, 0.9, s2);
        r = mix(r, 1.0, s3);
        return clamp(r, 0.0, 1.0);
      }
      
      // Legacy band function for compatibility
      float band(float v) {
        return celShade(v);
      }

      void main(){
        // Color palette - yellowish desert sand, more prominent near shoreline
        // Low areas (near/under water): muted yellowish desert sand
        vec3 lowColor = vec3(0.82, 0.76, 0.60); // Muted yellowish desert sand
        // Shoreline area: muted warm golden sand (more prominent, higher up)
        vec3 shorelineColor = vec3(0.80, 0.74, 0.62); // Muted warm golden sand
        // Mid-low areas: transition from sand
        vec3 midLowColor = vec3(0.72, 0.70, 0.62); // Muted light sandy earth
        // Mid areas: earth tones transitioning to green
        vec3 midColor = vec3(0.50, 0.65, 0.50); // Yellow-green transition
        // High areas: darker, richer green
        vec3 highColor = vec3(0.20, 0.40, 0.25); // Darker green (darker than before)
        
        // Contour rings - circular patterns around shoreline
        float distFromCenter = length(vWorldPos.xz);
        
        // Create contour rings with organic variation
        float contourSpacing = 8.0;
        float noise = organicNoise(vWorldPos.xz * 0.05 + vec2(time * 0.01, 0.0));
        float spacing = contourSpacing * (0.7 + noise * 0.6);
        
        // Circular contour rings
        float contour = mod(distFromCenter, spacing);
        float ring = step(spacing * 0.85, contour); // Harsh step function for sharp rings
        
        // Height-based contour rings
        float heightContour = mod(vHeight - waterHeight, spacing * 0.6);
        float heightRing = step(spacing * 0.6 * 0.85, heightContour);
        
        // Combine rings for layered effect
        float combinedRing = min(ring, heightRing);
        
        // Harsh division at shoreline - less gradient, more contour
        float shorelineDivision = step(waterHeight, vHeight);
        float shorelineContour = mod(vHeight - waterHeight, 3.0);
        float shorelineRing = step(2.5, shorelineContour);
        
        // Apply contour-based color transitions
        // Sand/shoreline zone
        vec3 baseColor = mix(lowColor, shorelineColor, shorelineDivision * 0.3);
        // Light green transition - brought down closer to shoreline
        baseColor = mix(baseColor, midColor, step(waterHeight + 2.0, vHeight) * step(vHeight, waterHeight + 4.0) * 0.5);
        // Dark green grass - expanded to start lower
        baseColor = mix(baseColor, highColor, step(waterHeight + 4.0, vHeight));
        
        // Apply contour rings - darker rings for definition
        baseColor = mix(baseColor, baseColor * 0.7, combinedRing * 0.4);
        baseColor = mix(baseColor, baseColor * 0.8, shorelineRing * 0.3);
        
        // Grainy texture variation - more pronounced for desert feel
        float grain = organicNoise(vWorldPos.xz * 0.15 + vec2(time * 0.01, 0.0));
        grain = grain * 0.08 + 0.92; // Subtle grainy variation
        
        // Texture variation with sin waves (from Background3D.jsx)
        float tx = sin(vWorldPos.x * 0.2 + vWorldPos.z * 0.15) * 0.025;
        float ty = sin(vWorldPos.x * 0.08 - vWorldPos.z * 0.22) * 0.02;
        baseColor *= (1.0 + tx + ty) * grain;
        
        // Cel-shaded lighting for stylized look
        vec3 normal = normalize(vNormal);
        vec3 light = normalize(lightDir);
        float ndl = max(dot(normal, light), 0.0);
        float ndlNormalized = ndl * 0.5 + 0.5; // Normalize to 0-1 range
        float diff = celShade(ndlNormalized);
        vec3 litColor = baseColor * diff * contrast;
        
        // Barely perceptible ambient occlusion approximation
        float aoFactor = 1.0 - (1.0 - abs(dot(normal, vec3(0.0, 1.0, 0.0)))) * 0.005;
        litColor *= aoFactor;
        
        // Almost imperceptible distance-based depth shading
        float depthFactor = 1.0 - smoothstep(100.0, 400.0, vDist) * 0.003;
        litColor *= depthFactor;
        
        // Barely perceptible rim lighting for cel-shading
        vec3 viewDir = normalize(-vViewPosition);
        float rimDot = max(dot(normal, viewDir), 0.0);
        float rim = 1.0 - rimDot;
        rim = smoothstep(0.5, 0.9, rim);
        litColor += rim * 0.005 * baseColor; // Almost imperceptible rim
        
        // Barely perceptible upward-facing highlight
        float upHighlight = max(dot(normal, vec3(0.0, 1.0, 0.0)), 0.0);
        upHighlight = smoothstep(0.7, 1.0, upHighlight);
        litColor += upHighlight * 0.003; // Almost imperceptible highlight
        
        // Ensure color is valid
        litColor = clamp(litColor, vec3(0.0), vec3(1.0));
        
        // Preserve vibrant colors - minimal desaturation
        float gray = dot(litColor, vec3(0.299, 0.587, 0.114));
        litColor = mix(litColor, vec3(gray), 0.05);
        
        gl_FragColor = vec4(litColor, 1.0);
      }
    `,
  });
}
