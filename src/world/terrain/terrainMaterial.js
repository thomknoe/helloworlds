import * as THREE from "three";

export function createTerrainMaterial({
  grassMap,
  sandMap,
  waterHeight = 23,
  blendRange = 5.0,
  lightDir = new THREE.Vector3(0.4, 1, 0.3).normalize(),
  desaturate = 0.2,
  fogColor = new THREE.Color(0xddefff),
}) {
  return new THREE.ShaderMaterial({
    uniforms: {
      grassMap: { value: grassMap },
      sandMap: { value: sandMap },
      waterHeight: { value: waterHeight },
      blendRange: { value: blendRange },
      desaturate: { value: desaturate },
      lightDir: { value: lightDir },
      fogColor: { value: fogColor },
    },
    vertexShader: `
      varying vec2 vUv;
      varying float vHeight;
      varying vec3 vNormal;
      varying vec3 vWorldPos;
      varying float vDist;

      void main(){
        vUv = uv * 20.0;
        vHeight = position.y;
        vNormal = normalize(normalMatrix * normal);
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPos = worldPos.xyz;
        vDist = length(worldPos.xz);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D grassMap;
      uniform sampler2D sandMap;
      uniform float waterHeight;
      uniform float blendRange;
      uniform float desaturate;
      uniform vec3 lightDir;
      uniform vec3 fogColor;

      varying vec2 vUv;
      varying float vHeight;
      varying vec3 vNormal;
      varying vec3 vWorldPos;
      varying float vDist;

      void main(){
        vec3 grass = texture2D(grassMap, vUv).rgb;
        vec3 sand  = texture2D(sandMap,  vUv).rgb;

        float t = smoothstep(
          waterHeight - blendRange,
          waterHeight + blendRange,
          vHeight
        );
        vec3 base = mix(sand, grass, t);

        float diff = max(dot(normalize(vNormal), normalize(lightDir)), 0.0);
        vec3 litColor = base * (0.45 + diff * 0.9);

        float slope = 1.0 - abs(vNormal.y);
        float ao = smoothstep(0.0, 1.0, slope + (vHeight + 10.0) * 0.03);
        litColor *= 0.9 - 0.25 * ao;

        vec3 lowTint  = vec3(0.85, 0.90, 1.05);
        vec3 highTint = vec3(1.10, 1.05, 0.95);
        float heightMix = smoothstep(-5.0, 15.0, vHeight);
        litColor *= mix(lowTint, highTint, heightMix);

        float rim = pow(
          1.0 - max(dot(normalize(vNormal), normalize(lightDir)), 0.0),
          3.0
        );
        litColor += rim * 0.12;

        float gray = dot(litColor, vec3(0.299, 0.587, 0.114));
        litColor = mix(litColor, vec3(gray), desaturate);

        float heightFog = smoothstep(-5.0, 25.0, vHeight);
        litColor = mix(litColor, mix(fogColor, litColor, 0.85), heightFog * 0.3);

        float edgeFog = smoothstep(180.0, 220.0, vDist);
        litColor = mix(litColor, mix(fogColor, litColor, 0.8), edgeFog * 0.4);

        gl_FragColor = vec4(litColor, 1.0);
      }
    `,
  });
}
