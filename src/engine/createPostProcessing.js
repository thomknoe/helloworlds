import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { FXAAShader } from "three/examples/jsm/shaders/FXAAShader.js";

// Custom vignette shader for depth and richness
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

// Custom color grading shader for barely perceptible enhancement
const ColorGradingShader = {
  uniforms: {
    tDiffuse: { value: null },
    saturation: { value: 1.005 }, // Barely perceptible
    contrast: { value: 1.002 }, // Barely perceptible
    brightness: { value: 1.0 }, // No change
    warmth: { value: 0.001 }, // Barely perceptible warm tint
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
      
      // Brightness
      color *= brightness;
      
      // Contrast
      color = (color - 0.5) * contrast + 0.5;
      
      // Saturation
      float gray = dot(color, vec3(0.299, 0.587, 0.114));
      color = mix(vec3(gray), color, saturation);
      
      // Subtle warmth (add slight red/yellow tint)
      color.r += warmth * 0.3;
      color.g += warmth * 0.2;
      
      gl_FragColor = vec4(color, texel.a);
    }
  `,
};

// Barely perceptible chromatic aberration
const ChromaticAberrationShader = {
  uniforms: {
    tDiffuse: { value: null },
    amount: { value: 0.00005 }, // Almost imperceptible
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
  
  // Get renderer size
  const size = new THREE.Vector2();
  renderer.getSize(size);
  
  // Base render pass
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);
  
  // Optimized: Combine color grading and vignette into single pass for better performance
  // Removed barely perceptible chromatic aberration (0.00005 amount) - not worth the cost
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
        
        // Brightness
        color *= brightness;
        
        // Contrast
        color = (color - 0.5) * contrast + 0.5;
        
        // Saturation
        float gray = dot(color, vec3(0.299, 0.587, 0.114));
        color = mix(vec3(gray), color, saturation);
        
        // Vignette (combined with color grading)
        vec2 uv = (vUv - vec2(0.5)) * vec2(vignetteOffset);
        float vignette = 1.0 - smoothstep(0.0, 0.7, dot(uv, uv));
        vignette = mix(1.0, 1.0 - vignetteDarkness, vignette);
        color *= vignette;
        
        gl_FragColor = vec4(color, texel.a);
      }
    `,
  });
  composer.addPass(combinedColorPass);
  
  // FXAA for better anti-aliasing
  const fxaaPass = new ShaderPass(FXAAShader);
  const pixelRatio = renderer.getPixelRatio();
  fxaaPass.material.uniforms["resolution"].value.x = 1 / (size.x * pixelRatio);
  fxaaPass.material.uniforms["resolution"].value.y = 1 / (size.y * pixelRatio);
  composer.addPass(fxaaPass);
  
  // Output pass removed - was causing desaturation/white layer
  // Tone mapping is already handled by the renderer
  
  // Handle window resize
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

