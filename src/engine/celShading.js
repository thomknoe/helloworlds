import * as THREE from "three";
export function createCelShadedMaterial(baseMaterial) {
  if (baseMaterial.isShaderMaterial) {
    return baseMaterial;
  }
  return new THREE.ShaderMaterial({
    uniforms: {
      color: { value: baseMaterial.color || new THREE.Color(0xffffff) },
      lightDir: { value: new THREE.Vector3(0.4, 1, 0.3).normalize() },
      lightColor: { value: new THREE.Color(1.0, 1.0, 1.0) },
      ambientColor: { value: new THREE.Color(0.3, 0.3, 0.3) },
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
      uniform vec3 color;
      uniform vec3 lightDir;
      uniform vec3 lightColor;
      uniform vec3 ambientColor;
      varying vec3 vNormal;
      varying vec3 vWorldPos;
      
      float celShade(float ndl) {
        
        if (ndl < 0.2) return 0.3;      
        if (ndl < 0.5) return 0.6;      
        if (ndl < 0.8) return 0.9;      
        return 1.0;                      
      }
      void main() {
        vec3 normal = normalize(vNormal);
        float ndl = max(dot(normal, lightDir), 0.0);
        
        float cel = celShade(ndl);
        
        vec3 viewDir = normalize(cameraPosition - vWorldPos);
        float rim = 1.0 - max(dot(normal, viewDir), 0.0);
        rim = step(0.7, rim); 
        vec3 finalColor = color * mix(ambientColor, lightColor, cel);
        finalColor += rim * 0.3; 
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `,
  });
}
export const celShadingFunction = `
  
  float celShade(float ndl) {
    
    if (ndl < 0.2) return 0.3;      
    if (ndl < 0.5) return 0.6;      
    if (ndl < 0.8) return 0.9;      
    return 1.0;                      
  }
  
  float celShadeDetailed(float ndl) {
    if (ndl < 0.15) return 0.25;    
    if (ndl < 0.35) return 0.45;    
    if (ndl < 0.55) return 0.65;    
    if (ndl < 0.75) return 0.85;    
    return 1.0;                      
  }
`;
