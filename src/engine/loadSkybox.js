// src/engine/loadSkybox.js
import * as THREE from "three";

export function loadSkybox(pathArray) {
  const loader = new THREE.CubeTextureLoader();
  return loader.load(pathArray);
}
