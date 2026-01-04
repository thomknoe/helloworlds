import * as THREE from "three";

/**
 * Creates a cel-shaded material with hard-edged lighting
 * @param {THREE.Color|number|string} color - Base color
 * @param {Object} options - Additional options
 * @returns {THREE.ShaderMaterial} Cel-shaded material
 */
export function createCelShadedMaterial(color, options = {}) {
  const baseColor = color instanceof THREE.Color ? color : new THREE.Color(color);
  const {
    lightDir = new THREE.Vector3(0.4, 1, 0.3).normalize(),
    lightColor = new THREE.Color(1.0, 1.0, 1.0),
    ambientColor = new THREE.Color(0.4, 0.4, 0.4),
    rimIntensity = 0.3,
    rimThreshold = 0.7,
  } = options;

  return new THREE.ShaderMaterial({
    uniforms: {
      color: { value: baseColor },
      lightDir: { value: lightDir },
      lightColor: { value: lightColor },
      ambientColor: { value: ambientColor },
      rimIntensity: { value: rimIntensity },
      rimThreshold: { value: rimThreshold },
    },
    vertexShader: `
      varying vec3 vNormal;
      
      void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 color;
      uniform vec3 lightDir;
      uniform vec3 lightColor;
      uniform vec3 ambientColor;
      uniform float rimIntensity;
      uniform float rimThreshold;
      
      varying vec3 vNormal;
      
      // Cel-shading function - creates hard bands of light/shadow
      // Using step functions instead of if statements for better compatibility
      float celShade(float ndl) {
        ndl = clamp(ndl, 0.0, 1.0);
        float s1 = step(0.2, ndl);  // 1.0 if ndl >= 0.2
        float s2 = step(0.5, ndl);  // 1.0 if ndl >= 0.5
        float s3 = step(0.8, ndl);  // 1.0 if ndl >= 0.8
        float r = 0.3;              // Base: deep shadow
        r = mix(r, 0.6, s1);        // If >= 0.2, use 0.6
        r = mix(r, 0.9, s2);        // If >= 0.5, use 0.9
        r = mix(r, 1.0, s3);        // If >= 0.8, use 1.0
        return r;
      }
      
      void main() {
        vec3 normal = normalize(vNormal);
        float ndl = max(dot(normal, lightDir), 0.0);
        
        // Apply cel-shading
        float cel = celShade(ndl);
        
        // Rim lighting for edge definition (hard edge)
        // Use simpler approach that doesn't require camera position
        float rimDot = max(dot(normal, vec3(0.0, 1.0, 0.0)), 0.0);
        float rim = 1.0 - rimDot;
        rim = step(rimThreshold, rim); // Hard rim edge using step function
        
        // Combine lighting
        vec3 litColor = color * mix(ambientColor, lightColor, cel);
        litColor += rim * rimIntensity; // Add rim highlight
        
        // Ensure valid color
        litColor = clamp(litColor, vec3(0.0), vec3(1.0));
        
        gl_FragColor = vec4(litColor, 1.0);
      }
    `,
  });
}

