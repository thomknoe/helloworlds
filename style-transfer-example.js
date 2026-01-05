import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { FXAAShader } from "three/examples/jsm/shaders/FXAAShader.js";

export const HelloWorldsStyle = {
  COLORS: {
    SKY: {
      baseHorizon: new THREE.Color(0.7, 0.85, 0.95),
      baseMid: new THREE.Color(0.5, 0.75, 0.9),
      baseZenith: new THREE.Color(0.3, 0.6, 0.85),
      blueGreenHorizon: new THREE.Color(0.65, 0.88, 0.92),
      blueGreenMid: new THREE.Color(0.45, 0.78, 0.88),
      blueGreenZenith: new THREE.Color(0.25, 0.65, 0.82),
      sunColor: new THREE.Color(1.0, 0.95, 0.85),
      adjustedSunColor: new THREE.Color(1.0, 0.92, 0.75),
      cloudColor: new THREE.Color(0.95, 0.95, 0.98),
      background: 0x7db8e8,
    },
    TERRAIN: {
      low: new THREE.Color(0.82, 0.76, 0.6),
      shoreline: new THREE.Color(0.8, 0.74, 0.62),
      midLow: new THREE.Color(0.72, 0.7, 0.62),
      mid: new THREE.Color(0.5, 0.65, 0.5),
      high: new THREE.Color(0.2, 0.4, 0.25),
    },
    WATER: {
      skyTint: new THREE.Color(0.5, 0.75, 0.95),
      skyColor: new THREE.Color(0.5, 0.75, 0.95),
      sunColor: new THREE.Color(1.0, 0.95, 0.85),
    },
    GLASSY: {
      tint: new THREE.Color(0.7, 0.85, 0.95),
    },
    LIGHTING: {
      hemisphereSky: 0xfff5e6,
      hemisphereGround: 0xd4c5b8,
      directional: 0xfff8f0,
      ambient: 0xf5e6d3,
      fill: 0xfff5e6,
    },
  },
  LIGHTING: {
    hemisphereIntensity: 0.6,
    directionalIntensity: 0.6,
    directionalPosition: new THREE.Vector3(60, 100, 10),
    ambientIntensity: 0.4,
    fillIntensity: 0.008,
    fillPosition: new THREE.Vector3(-40, 50, -30),
    lightDirection: new THREE.Vector3(0.4, 1, 0.3).normalize(),
    shadows: {
      mapSize: { width: 4096, height: 4096 },
      camera: {
        near: 0.5,
        far: 500,
        left: -200,
        right: 200,
        top: 200,
        bottom: -200,
      },
      bias: -0.0001,
      normalBias: 0.02,
      radius: 4,
    },
  },
  POST_PROCESSING: {
    saturation: 1.005,
    contrast: 1.002,
    brightness: 1.0,
    warmth: 0.001,
    vignetteOffset: 1.5,
    vignetteDarkness: 0.01,
  },
  CEL_SHADING: {
    bands: [0.2, 0.5, 0.8],
    values: [0.3, 0.6, 0.9, 1.0],
    rimThreshold: 0.7,
    rimIntensity: 0.3,
  },
};

export function createCelShadedMaterial(color, options = {}) {
  const baseColor =
    color instanceof THREE.Color ? color : new THREE.Color(color);
  const {
    lightDir = HelloWorldsStyle.LIGHTING.lightDirection.clone(),
    lightColor = new THREE.Color(1.0, 1.0, 1.0),
    ambientColor = new THREE.Color(0.4, 0.4, 0.4),
    rimIntensity = HelloWorldsStyle.CEL_SHADING.rimIntensity,
    rimThreshold = HelloWorldsStyle.CEL_SHADING.rimThreshold,
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
        vec3 litColor = color * mix(ambientColor, lightColor, cel);
        litColor += rim * rimIntensity;
        litColor = clamp(litColor, vec3(0.0), vec3(1.0));
        gl_FragColor = vec4(litColor, 1.0);
      }
    `,
  });
}

export function createGradientSky(terrainComposition = 0.0) {
  const geometry = new THREE.SphereGeometry(500, 32, 32);
  const sunPosition = new THREE.Vector3(0.3, 0.7, 0.2).normalize();
  const material = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0.0 },
      sunPosition: { value: sunPosition },
      sunColor: { value: HelloWorldsStyle.COLORS.SKY.sunColor },
      terrainComposition: { value: terrainComposition },
    },
    vertexShader: `
      varying vec3 vWorldPosition;
      varying vec3 vDirection;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        vDirection = normalize(worldPosition.xyz);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform vec3 sunPosition;
      uniform vec3 sunColor;
      uniform float terrainComposition;
      varying vec3 vWorldPosition;
      varying vec3 vDirection;
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
      float fbm(vec2 p) {
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
      void main() {
        vec3 dir = normalize(vDirection);
        vec3 baseHorizonColor = vec3(0.7, 0.85, 0.95);
        vec3 baseMidColor = vec3(0.5, 0.75, 0.9);
        vec3 baseZenithColor = vec3(0.3, 0.6, 0.85);
        vec3 blueGreenHorizonColor = vec3(0.65, 0.88, 0.92);
        vec3 blueGreenMidColor = vec3(0.45, 0.78, 0.88);
        vec3 blueGreenZenithColor = vec3(0.25, 0.65, 0.82);
        float grassBlend = smoothstep(0.0, 1.0, terrainComposition);
        vec3 horizonColor = mix(baseHorizonColor, blueGreenHorizonColor, grassBlend * 0.85);
        vec3 midColor = mix(baseMidColor, blueGreenMidColor, grassBlend * 0.85);
        vec3 zenithColor = mix(baseZenithColor, blueGreenZenithColor, grassBlend * 0.85);
        float t = smoothstep(-0.3, 0.7, dir.y);
        vec3 skyColor = mix(horizonColor, midColor, smoothstep(0.0, 0.5, t));
        skyColor = mix(skyColor, zenithColor, smoothstep(0.3, 1.0, t));
        vec2 cloudUV = dir.xz * 0.3 + vec2(time * 0.02, 0.0);
        float clouds = fbm(cloudUV);
        clouds = smoothstep(0.3, 0.7, clouds);
        clouds *= smoothstep(0.0, 0.4, dir.y);
        vec3 cloudColor = vec3(0.95, 0.95, 0.98);
        float cloudAlbedo = 0.6 + clouds * 0.4;
        skyColor = mix(skyColor, cloudColor * cloudAlbedo, clouds * 0.4);
        vec3 adjustedSunColor = vec3(1.0, 0.92, 0.75);
        float sunDot = dot(dir, sunPosition);
        float sunDisk = smoothstep(0.998, 1.0, sunDot);
        float sunGlow = pow(max(sunDot, 0.0), 8.0);
        float sunHalo = pow(max(sunDot, 0.0), 3.0);
        skyColor += adjustedSunColor * sunDisk * 2.2;
        skyColor += adjustedSunColor * sunGlow * 0.5;
        skyColor += adjustedSunColor * sunHalo * 0.18;
        float horizonGlow = pow(max(1.0 - abs(dir.y), 0.0), 2.0);
        float timeVariation = sin(time * 0.1) * 0.02 + 1.0;
        skyColor *= timeVariation;
        float gray = dot(skyColor, vec3(0.299, 0.587, 0.114));
        skyColor = mix(skyColor, vec3(gray), 0.02);
        skyColor.g += 0.025;
        gl_FragColor = vec4(skyColor, 1.0);
      }
    `,
    side: THREE.BackSide,
  });
  const sky = new THREE.Mesh(geometry, material);
  return sky;
}

export function createGlassyMaterial(options = {}) {
  const {
    lightDir = HelloWorldsStyle.LIGHTING.lightDirection.clone(),
    lightColor = new THREE.Color(1.0, 1.0, 1.0),
    ambientColor = new THREE.Color(0.4, 0.4, 0.4),
    rimIntensity = 0.5,
    rimThreshold = 0.7,
    tintColor = HelloWorldsStyle.COLORS.GLASSY.tint.clone(),
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
            : ``
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

export function createWaterMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0.0 },
      lightDir: { value: HelloWorldsStyle.LIGHTING.lightDirection.clone() },
      skyColor: { value: HelloWorldsStyle.COLORS.WATER.skyColor },
      sunColor: { value: HelloWorldsStyle.COLORS.WATER.sunColor },
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

export function setupHelloWorldsLighting(scene) {
  const hemi = new THREE.HemisphereLight(
    HelloWorldsStyle.COLORS.LIGHTING.hemisphereSky,
    HelloWorldsStyle.COLORS.LIGHTING.hemisphereGround,
    HelloWorldsStyle.LIGHTING.hemisphereIntensity
  );
  scene.add(hemi);

  const sun = new THREE.DirectionalLight(
    HelloWorldsStyle.COLORS.LIGHTING.directional,
    HelloWorldsStyle.LIGHTING.directionalIntensity
  );
  sun.position.copy(HelloWorldsStyle.LIGHTING.directionalPosition);
  sun.castShadow = true;
  sun.shadow.mapSize.width = HelloWorldsStyle.LIGHTING.shadows.mapSize.width;
  sun.shadow.mapSize.height = HelloWorldsStyle.LIGHTING.shadows.mapSize.height;
  sun.shadow.camera.near = HelloWorldsStyle.LIGHTING.shadows.camera.near;
  sun.shadow.camera.far = HelloWorldsStyle.LIGHTING.shadows.camera.far;
  sun.shadow.camera.left = HelloWorldsStyle.LIGHTING.shadows.camera.left;
  sun.shadow.camera.right = HelloWorldsStyle.LIGHTING.shadows.camera.right;
  sun.shadow.camera.top = HelloWorldsStyle.LIGHTING.shadows.camera.top;
  sun.shadow.camera.bottom = HelloWorldsStyle.LIGHTING.shadows.camera.bottom;
  sun.shadow.bias = HelloWorldsStyle.LIGHTING.shadows.bias;
  sun.shadow.normalBias = HelloWorldsStyle.LIGHTING.shadows.normalBias;
  sun.shadow.radius = HelloWorldsStyle.LIGHTING.shadows.radius;
  scene.add(sun);

  const ambient = new THREE.AmbientLight(
    HelloWorldsStyle.COLORS.LIGHTING.ambient,
    HelloWorldsStyle.LIGHTING.ambientIntensity
  );
  scene.add(ambient);

  const fillLight = new THREE.DirectionalLight(
    HelloWorldsStyle.COLORS.LIGHTING.fill,
    HelloWorldsStyle.LIGHTING.fillIntensity
  );
  fillLight.position.copy(HelloWorldsStyle.LIGHTING.fillPosition);
  scene.add(fillLight);

  return { hemi, sun, ambient, fillLight };
}

export function createPostProcessing(renderer, scene, camera) {
  const composer = new EffectComposer(renderer);
  const size = new THREE.Vector2();
  renderer.getSize(size);

  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  const combinedColorPass = new ShaderPass({
    uniforms: {
      tDiffuse: { value: null },
      saturation: { value: HelloWorldsStyle.POST_PROCESSING.saturation },
      contrast: { value: HelloWorldsStyle.POST_PROCESSING.contrast },
      brightness: { value: HelloWorldsStyle.POST_PROCESSING.brightness },
      vignetteOffset: {
        value: HelloWorldsStyle.POST_PROCESSING.vignetteOffset,
      },
      vignetteDarkness: {
        value: HelloWorldsStyle.POST_PROCESSING.vignetteDarkness,
      },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D tDiffuse;
      uniform float saturation;
      uniform float contrast;
      uniform float brightness;
      uniform float vignetteOffset;
      uniform float vignetteDarkness;
      varying vec2 vUv;
      void main() {
        vec4 texel = texture2D(tDiffuse, vUv);
        vec3 color = texel.rgb;
        color *= brightness;
        color = (color - 0.5) * contrast + 0.5;
        float gray = dot(color, vec3(0.299, 0.587, 0.114));
        color = mix(vec3(gray), color, saturation);
        vec2 uv = (vUv - vec2(0.5)) * vec2(vignetteOffset);
        float vignette = 1.0 - smoothstep(0.0, 0.7, dot(uv, uv));
        vignette = mix(1.0, 1.0 - vignetteDarkness, vignette);
        color *= vignette;
        gl_FragColor = vec4(color, texel.a);
      }
    `,
  });
  composer.addPass(combinedColorPass);

  const fxaaPass = new ShaderPass(FXAAShader);
  const pixelRatio = renderer.getPixelRatio();
  fxaaPass.material.uniforms["resolution"].value.x = 1 / (size.x * pixelRatio);
  fxaaPass.material.uniforms["resolution"].value.y = 1 / (size.y * pixelRatio);
  composer.addPass(fxaaPass);

  const handleResize = () => {
    renderer.getSize(size);
    composer.setSize(size.x, size.y);
    fxaaPass.material.uniforms["resolution"].value.x =
      1 / (size.x * pixelRatio);
    fxaaPass.material.uniforms["resolution"].value.y =
      1 / (size.y * pixelRatio);
  };
  window.addEventListener("resize", handleResize);

  return {
    composer,
    dispose: () => {
      window.removeEventListener("resize", handleResize);
      composer.dispose();
    },
  };
}

export function setupEnvironmentMap(renderer, scene) {
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();

  const envScene = new THREE.Scene();
  envScene.background = new THREE.Color(HelloWorldsStyle.COLORS.SKY.background);

  const envSphere = new THREE.Mesh(
    new THREE.SphereGeometry(100, 32, 32),
    new THREE.MeshBasicMaterial({
      color: HelloWorldsStyle.COLORS.SKY.background,
      side: THREE.BackSide,
    })
  );
  envScene.add(envSphere);

  const envMapRT = pmremGenerator.fromScene(envScene, 0.04).texture;
  scene.environment = envMapRT;

  pmremGenerator.dispose();

  return envMapRT;
}

export function exampleUsage() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(HelloWorldsStyle.COLORS.SKY.background);

  const sky = createGradientSky(0.0);
  scene.add(sky);

  const lights = setupHelloWorldsLighting(scene);

  const envMap = setupEnvironmentMap(renderer, scene);

  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    2000
  );
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const postProcessing = createPostProcessing(renderer, scene, camera);

  const exampleMesh = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    createCelShadedMaterial(new THREE.Color(0.5, 0.7, 0.9))
  );
  scene.add(exampleMesh);

  function animate() {
    requestAnimationFrame(animate);
    const time = performance.now() / 1000;
    sky.material.uniforms.time.value = time;
    postProcessing.composer.render();
  }
  animate();
}
