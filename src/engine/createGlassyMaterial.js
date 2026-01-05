import * as THREE from "three";
export function createGlassyMaterial(options = {}) {
  const {
    lightDir = new THREE.Vector3(0.4, 1, 0.3).normalize(),
    lightColor = new THREE.Color(1.0, 1.0, 1.0),
    ambientColor = new THREE.Color(0.4, 0.4, 0.4),
    rimIntensity = 0.5,
    rimThreshold = 0.7,
    tintColor = new THREE.Color(0.7, 0.85, 0.95), 
    opacity = 0.6, 
    reflectivity = 0.8, 
  } = options;
  return new THREE.ShaderMaterial({
    uniforms: {
      lightDir: { value: lightDir },
      lightColor: { value: lightColor },
      ambientColor: { value: ambientColor },
      rimIntensity: { value: rimIntensity },
      rimThreshold: { value: rimThreshold },
      tintColor: { value: tintColor },
      opacity: { value: opacity },
      reflectivity: { value: reflectivity },
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vWorldPos;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPos = worldPos.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 lightDir;
      uniform vec3 lightColor;
      uniform vec3 ambientColor;
      uniform float rimIntensity;
      uniform float rimThreshold;
      uniform vec3 tintColor;
      uniform float opacity;
      uniform float reflectivity;
      varying vec3 vNormal;
      varying vec3 vWorldPos;
      
      float celShade(float ndl) {
        ndl = clamp(ndl, 0.0, 1.0);
        float s1 = step(0.2, ndl);
        float s2 = step(0.5, ndl);
        float s3 = step(0.8, ndl);
        float r = 0.3;
        r = mix(r, 0.6, s1);
        r = mix(r, 0.9, s2);
        r = mix(r, 1.0, s3);
        return r;
      }
      void main() {
        vec3 normal = normalize(vNormal);
        float ndl = max(dot(normal, lightDir), 0.0);
        
        float cel = celShade(ndl);
        
        float rimDot = max(dot(normal, vec3(0.0, 1.0, 0.0)), 0.0);
        float rim = 1.0 - rimDot;
        rim = step(rimThreshold, rim);
        
        vec3 baseColor = tintColor;
        
        vec3 litColor = baseColor * mix(ambientColor, lightColor, cel);
        litColor += rim * rimIntensity;
        
        vec3 reflection = vec3(0.5, 0.7, 0.9) * reflectivity; 
        litColor = mix(litColor, reflection, reflectivity * 0.3);
        
        litColor = clamp(litColor, vec3(0.0), vec3(1.0));
        
        float alpha = opacity + rim * 0.2; 
        gl_FragColor = vec4(litColor, alpha);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide,
  });
}
