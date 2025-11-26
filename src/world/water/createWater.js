// src/world/water/createWater.js
import * as THREE from "three";
import { createWaterMaterial } from "./waterMaterial.js";

export function createWater({
  size = 400,
  height = 20, // matches the old scene's look
} = {}) {
  const material = createWaterMaterial();

  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(size, size).rotateX(-Math.PI / 2),
    material
  );

  mesh.position.y = height;

  return mesh;
}
