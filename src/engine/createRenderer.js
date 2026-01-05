import * as THREE from "three";
import { engineConfig } from "./engineConfig.js";
export function createRenderer(mount) {
  const renderer = new THREE.WebGLRenderer({
    antialias: engineConfig.antialias,
  });
  renderer.setSize(mount.clientWidth, mount.clientHeight);
  renderer.setPixelRatio(engineConfig.pixelRatio);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = engineConfig.toneMappingExposure;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  mount.appendChild(renderer.domElement);
  return renderer;
}
