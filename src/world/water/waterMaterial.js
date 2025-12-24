import * as THREE from "three";

export function createWaterMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0.0 },
      skyColor: { value: new THREE.Color(0xe3f3ff) },
      deepColor: { value: new THREE.Color(0x73c6ff) },
      lightDir: { value: new THREE.Vector3(0.4, 1.0, 0.3).normalize() },
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vWorldPos;
      void main(){
        vUv = uv * 4.0;
        vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform vec3 skyColor;
      uniform vec3 deepColor;
      uniform vec3 lightDir;
      varying vec2 vUv;
      varying vec3 vWorldPos;

      float hash(vec2 p){
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }

      float noise(vec2 p){
        vec2 i = floor(p);
        vec2 f = fract(p);
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(a, b, u.x) +
               (c - a) * u.y * (1.0 - u.x) +
               (d - b) * u.x * u.y;
      }

      void main(){

        float n = noise(vUv * 3.0 + vec2(time * 0.25,  time * 0.18));
        n += noise(vUv * 8.0 - vec2(time * 0.15, time * 0.10)) * 0.3;

        float depth = smoothstep(-3.0, 1.0, vWorldPos.y);
        vec3 color = mix(deepColor, skyColor, depth);

        vec3 viewDir = normalize(vec3(0.0, 1.0, 1.0));
        float fres = pow(1.0 - dot(viewDir, vec3(0.0, 1.0, 0.0)), 3.0);
        vec3 reflection = mix(vec3(0.0), skyColor * 2.0, fres);
        color += reflection * 0.5;

        float highlight = smoothstep(0.82, 1.0, n);
        color += highlight * vec3(0.2, 0.25, 0.28);

        color *= 0.96 + n * 0.04;

        gl_FragColor = vec4(color, 0.45);
      }
    `,
    transparent: true,
  });
}
