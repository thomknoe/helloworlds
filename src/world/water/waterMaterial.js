import * as THREE from "three";
export function createWaterMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0.0 },
      lightDir: { value: new THREE.Vector3(0.4, 1.0, 0.3).normalize() },
      skyColor: { value: new THREE.Color(0.5, 0.75, 0.95) }, 
      sunColor: { value: new THREE.Color(1.0, 0.95, 0.85) }, 
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
        
        vec3 skyTint = vec3(0.5, 0.75, 0.95); 
        
        vec2 flow = vec2(
          organicNoise(vUv * 0.5 + vec2(time * 0.1, 0.0)),
          organicNoise(vUv * 0.5 + vec2(0.0, time * 0.08))
        );
        
        float wave = organicNoise(vUv * 2.0 + flow * 0.5 + vec2(time * 0.15, time * 0.12));
        float waveDetail = organicNoise(vUv * 6.0 + flow * 0.3 + vec2(time * 0.2, time * 0.18));
        wave = wave * 0.4 + waveDetail * 0.2 + 0.6;
        
        vec3 color = skyTint;
        
        
        float fresnel = pow(1.0 - max(dot(vNormal, vec3(0.0, 1.0, 0.0)), 0.0), 1.2);
        
        vec3 skyReflection = skyColor * 1.5; 
        color = mix(color, skyReflection, fresnel * 0.85); 
        
        float sunReflection = pow(max(dot(vNormal, lightDir), 0.0), 32.0);
        color += sunColor * sunReflection * 1.0;
        
        vec3 halfVec = normalize(lightDir + vec3(0.0, 1.0, 0.0));
        float specular = pow(max(dot(vNormal, halfVec), 0.0), 64.0);
        color += sunColor * specular * 0.6;
        
        color *= 0.98 + wave * 0.02;
        
        float diff = max(dot(vNormal, lightDir), 0.0);
        
        float band1 = step(0.3, diff);  
        float band2 = step(0.7, diff);  
        float celDiff = 0.6;              
        celDiff = mix(celDiff, 0.85, band1); 
        celDiff = mix(celDiff, 1.0, band2);  
        color *= 0.75 + celDiff * 0.25;
        
        float rimDot = max(dot(vNormal, vec3(0.0, 1.0, 0.0)), 0.0);
        float rim = 1.0 - rimDot;
        rim = step(0.75, rim); 
        color += rim * 0.15; 
        
        float gray = dot(color, vec3(0.299, 0.587, 0.114));
        color = mix(color, vec3(gray), 0.05);
        
        color = pow(color, vec3(0.92));
        
        
        float alpha = 0.5 + wave * 0.1;
        gl_FragColor = vec4(color, alpha);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide,
  });
}
