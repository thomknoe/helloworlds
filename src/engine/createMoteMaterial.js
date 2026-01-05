import * as THREE from "three";
export function createMoteMaterial(options = {}) {
  const { enableFloating = true } = options;
  return new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 } },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: `
      attribute float aBaseY;
      attribute float aPhase;
      attribute float aSize;
      uniform float time;
      varying float vAlpha;
      varying float vPhase;
      void main(){
        vPhase = aPhase;
        vec3 pos = position;
        ${
          enableFloating
            ? `
        pos.y = aBaseY + sin(time * 0.9 + aPhase) * 0.5;
        pos.x += sin(time * 0.15 + aPhase * 1.3) * 0.5;
        pos.z += cos(time * 0.12 + aPhase * 1.5) * 0.5;
        `
            : `
        `
        }
        vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mvPos;
        float dist = length(pos.xz);
        vAlpha = 1.0 - smoothstep(110.0, 240.0, dist);
        gl_PointSize = aSize * (260.0 / -mvPos.z);
      }
    `,
    fragmentShader: `
      uniform float time;
      varying float vAlpha;
      varying float vPhase;
      void main(){
        float flick = 0.84 + sin(time * 0.8 + vPhase * 4.0) * 0.14;
        gl_FragColor = vec4(vec3(1.0), vAlpha * flick);
      }
    `,
  });
}
