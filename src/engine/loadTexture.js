// src/engine/loadTexture.js
import * as THREE from "three";

export function loadTexture(url, repeat = 1) {
  const loader = new THREE.TextureLoader();
  const tex = loader.load(url);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeat, repeat);
  return tex;
}
