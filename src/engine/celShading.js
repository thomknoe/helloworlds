import * as THREE from "three";

/**
 * Cel-shading utility functions for creating hard-edged, cartoon-like lighting
 */

/**
 * Creates a cel-shaded version of a standard material
 * Uses step functions to create hard transitions between light and shadow
 */
export function createCelShadedMaterial(baseMaterial) {
  if (baseMaterial.isShaderMaterial) {
    // For shader materials, we'll modify the lighting in the shader itself
    return baseMaterial;
  }

  // For standard materials, we can use a custom shader
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
      
      // Cel-shading function - creates hard bands of light/shadow
      float celShade(float ndl) {
        // Create 3-4 distinct bands: shadow, mid-tone, light, highlight
        if (ndl < 0.2) return 0.3;      // Deep shadow
        if (ndl < 0.5) return 0.6;      // Mid shadow
        if (ndl < 0.8) return 0.9;      // Light
        return 1.0;                      // Highlight
      }
      
      void main() {
        vec3 normal = normalize(vNormal);
        float ndl = max(dot(normal, lightDir), 0.0);
        
        // Apply cel-shading
        float cel = celShade(ndl);
        
        // Rim lighting for edge definition
        vec3 viewDir = normalize(cameraPosition - vWorldPos);
        float rim = 1.0 - max(dot(normal, viewDir), 0.0);
        rim = step(0.7, rim); // Hard rim edge
        
        vec3 finalColor = color * mix(ambientColor, lightColor, cel);
        finalColor += rim * 0.3; // Add rim highlight
        
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `,
  });
}

/**
 * Cel-shading function for use in custom shaders
 * Returns stepped lighting values for hard-edged shadows
 */
export const celShadingFunction = `
  // Cel-shading function - creates hard bands of light/shadow
  float celShade(float ndl) {
    // Create 3-4 distinct bands: shadow, mid-tone, light, highlight
    if (ndl < 0.2) return 0.3;      // Deep shadow
    if (ndl < 0.5) return 0.6;      // Mid shadow
    if (ndl < 0.8) return 0.9;      // Light
    return 1.0;                      // Highlight
  }
  
  // Alternative cel-shading with more bands
  float celShadeDetailed(float ndl) {
    if (ndl < 0.15) return 0.25;    // Deep shadow
    if (ndl < 0.35) return 0.45;    // Shadow
    if (ndl < 0.55) return 0.65;    // Mid-tone
    if (ndl < 0.75) return 0.85;    // Light
    return 1.0;                      // Highlight
  }
`;

