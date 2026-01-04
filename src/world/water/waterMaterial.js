import * as THREE from "three";

export function createWaterMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0.0 },
      lightDir: { value: new THREE.Vector3(0.4, 1.0, 0.3).normalize() },
      skyColor: { value: new THREE.Color(0.5, 0.75, 0.95) }, // Medium sky blue
      sunColor: { value: new THREE.Color(1.0, 0.95, 0.85) }, // Warm sun color
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vWorldPos;
      varying vec3 vNormal;
      
      void main(){
        vUv = uv;
        vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform vec3 lightDir;
      uniform vec3 skyColor;
      uniform vec3 sunColor;
      
      varying vec2 vUv;
      varying vec3 vWorldPos;
      varying vec3 vNormal;

      // Soft noise for organic movement
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
        
        for (int i = 0; i < 4; i++) {
          value += smoothNoise(p * frequency) * amplitude;
          frequency *= 2.0;
          amplitude *= 0.5;
        }
        
        return value;
      }

      void main(){
        // Water tinted to match sky color
        vec3 skyTint = vec3(0.5, 0.75, 0.95); // Sky blue color matching the sky
        
        // Organic, wind-mediated movement for wave patterns
        vec2 flow = vec2(
          organicNoise(vUv * 0.5 + vec2(time * 0.1, 0.0)),
          organicNoise(vUv * 0.5 + vec2(0.0, time * 0.08))
        );
        
        // Soft, continuous wave pattern
        float wave = organicNoise(vUv * 2.0 + flow * 0.5 + vec2(time * 0.15, time * 0.12));
        float waveDetail = organicNoise(vUv * 6.0 + flow * 0.3 + vec2(time * 0.2, time * 0.18));
        wave = wave * 0.4 + waveDetail * 0.2 + 0.6;
        
        // Start with sky-colored base
        vec3 color = skyTint;
        
        // Enhanced reflective water - primary texture is sky reflection
        // Use a simpler approach that doesn't require camera position
        float fresnel = pow(1.0 - max(dot(vNormal, vec3(0.0, 1.0, 0.0)), 0.0), 1.2);
        
        // Strong sky reflection - this is the primary texture
        vec3 skyReflection = skyColor * 1.5; // Very bright sky reflection
        color = mix(color, skyReflection, fresnel * 0.85); // Very reflective
        
        // Sun reflection on water
        float sunReflection = pow(max(dot(vNormal, lightDir), 0.0), 32.0);
        color += sunColor * sunReflection * 1.0;
        
        // Specular highlights from wave peaks
        vec3 halfVec = normalize(lightDir + vec3(0.0, 1.0, 0.0));
        float specular = pow(max(dot(vNormal, halfVec), 0.0), 64.0);
        color += sunColor * specular * 0.6;
        
        // Subtle wave variation
        color *= 0.98 + wave * 0.02;
        
        // Cel-shaded lighting for water - hard edges instead of smooth gradients
        float diff = max(dot(vNormal, lightDir), 0.0);
        // Use step functions instead of if statements for better compatibility
        float band1 = step(0.3, diff);  // 1.0 if diff >= 0.3
        float band2 = step(0.7, diff);  // 1.0 if diff >= 0.7
        float celDiff = 0.6;              // Base: shadow
        celDiff = mix(celDiff, 0.85, band1); // If >= 0.3, use 0.85
        celDiff = mix(celDiff, 1.0, band2);  // If >= 0.7, use 1.0
        color *= 0.75 + celDiff * 0.25;
        
        // Hard-edged rim lighting for cel-shading (simpler approach)
        float rimDot = max(dot(vNormal, vec3(0.0, 1.0, 0.0)), 0.0);
        float rim = 1.0 - rimDot;
        rim = step(0.75, rim); // Hard rim edge
        color += rim * 0.15; // Rim highlight
        
        // Preserve vibrant blue colors
        float gray = dot(color, vec3(0.299, 0.587, 0.114));
        color = mix(color, vec3(gray), 0.05);
        
        // Final color grading - enhance vibrancy
        color = pow(color, vec3(0.92));
        
        // No fog - removed as requested
        
        // Less transparency for more solid blue appearance
        float alpha = 0.5 + wave * 0.1;
        
        gl_FragColor = vec4(color, alpha);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide,
  });
}
