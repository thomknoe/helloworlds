import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { FXAAShader } from "three/examples/jsm/shaders/FXAAShader.js";
const VignetteShader = {
  uniforms: {
    tDiffuse: { value: null },
    offset: { value: 1.0 },
    darkness: { value: 0.5 },
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
    uniform float offset;
    uniform float darkness;
    varying vec2 vUv;
    void main() {
      vec4 texel = texture2D(tDiffuse, vUv);
      vec2 uv = (vUv - vec2(0.5)) * vec2(offset);
      float vignette = 1.0 - smoothstep(0.0, 0.7, dot(uv, uv));
      vignette = mix(1.0, 1.0 - darkness, vignette);
      gl_FragColor = texel * vignette;
    }
  `,
};
const ColorGradingShader = {
  uniforms: {
    tDiffuse: { value: null },
    saturation: { value: 1.005 },
    contrast: { value: 1.002 },
    brightness: { value: 1.0 },
    warmth: { value: 0.001 },
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
    uniform float warmth;
    varying vec2 vUv;
    void main() {
      vec4 texel = texture2D(tDiffuse, vUv);
      vec3 color = texel.rgb;
      color *= brightness;
      color = (color - 0.5) * contrast + 0.5;
      float gray = dot(color, vec3(0.299, 0.587, 0.114));
      color = mix(vec3(gray), color, saturation);
      color.r += warmth * 0.3;
      color.g += warmth * 0.2;
      gl_FragColor = vec4(color, texel.a);
    }
  `,
};
const ChromaticAberrationShader = {
  uniforms: {
    tDiffuse: { value: null },
    amount: { value: 0.00005 },
    angle: { value: 0.0 },
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
    uniform float amount;
    uniform float angle;
    varying vec2 vUv;
    void main() {
      vec2 offset = amount * vec2(cos(angle), sin(angle));
      float r = texture2D(tDiffuse, vUv + offset).r;
      float g = texture2D(tDiffuse, vUv).g;
      float b = texture2D(tDiffuse, vUv - offset).b;
      float a = texture2D(tDiffuse, vUv).a;
      gl_FragColor = vec4(r, g, b, a);
    }
  `,
};
export function createPostProcessing(renderer, scene, camera) {
  const composer = new EffectComposer(renderer);
  const size = new THREE.Vector2();
  renderer.getSize(size);
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);
  const combinedColorPass = new ShaderPass({
    uniforms: {
      tDiffuse: { value: null },
      saturation: { value: 1.005 },
      contrast: { value: 1.002 },
      brightness: { value: 1.0 },
      vignetteOffset: { value: 1.5 },
      vignetteDarkness: { value: 0.01 },
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
    fxaaPass.material.uniforms["resolution"].value.x = 1 / (size.x * pixelRatio);
    fxaaPass.material.uniforms["resolution"].value.y = 1 / (size.y * pixelRatio);
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
