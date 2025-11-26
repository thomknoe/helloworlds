// src/player/cameraRig.js
import * as THREE from "three";

export function createCameraRig(camera) {
  const player = new THREE.Group();
  player.position.set(0, 5, 10);

  player.add(camera); // Camera rotates itself
  return player;
}
