import * as THREE from "three";

/**
 * Creates a glassy, see-through, light blue tinted material with cel-shading and reflection
 * @param {Object} options - Material options
 * @returns {THREE.ShaderMaterial} Glassy material
 */
export function createGlassyMaterial(options = {}) {
  const {
    lightDir = new THREE.Vector3(0.4, 1, 0.3).normalize(),
    lightColor = new THREE.Color(1.0, 1.0, 1.0),
    ambientColor = new THREE.Color(0.4, 0.4, 0.4),
    rimIntensity = 0.5,
    rimThreshold = 0.7,
    tintColor = new THREE.Color(0.7, 0.85, 0.95), // Light blue tint
    opacity = 0.6, // See-through
    reflectivity = 0.8, // Reflective quality
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
      
      // Cel-shading function - creates hard bands of light/shadow
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
        
        // Apply cel-shading
        float cel = celShade(ndl);
        
        // Rim lighting for edge definition (hard edge)
        float rimDot = max(dot(normal, vec3(0.0, 1.0, 0.0)), 0.0);
        float rim = 1.0 - rimDot;
        rim = step(rimThreshold, rim);
        
        // Base color with light blue tint
        vec3 baseColor = tintColor;
        
        // Combine lighting
        vec3 litColor = baseColor * mix(ambientColor, lightColor, cel);
        litColor += rim * rimIntensity;
        
        // Add reflective quality (simulate environment reflection)
        vec3 reflection = vec3(0.5, 0.7, 0.9) * reflectivity; // Sky-like reflection
        litColor = mix(litColor, reflection, reflectivity * 0.3);
        
        // Ensure valid color
        litColor = clamp(litColor, vec3(0.0), vec3(1.0));
        
        // Glassy appearance: use opacity for see-through effect
        float alpha = opacity + rim * 0.2; // More opaque at edges
        
        gl_FragColor = vec4(litColor, alpha);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide,
  });
}

