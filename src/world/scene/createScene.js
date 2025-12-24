import * as THREE from "three";
import { loadSkybox } from "../../engine/loadSkybox.js";
import { loadTexture } from "../../engine/loadTexture.js";
import { createRenderer } from "../../engine/createRenderer.js";

import { createTerrain } from "../terrain/createTerrain.js";
import { createWater } from "../water/createWater.js";

export default function createScene(mount) {
  const scene = new THREE.Scene();

  const skybox = loadSkybox([
    "assets/skybox/px.jpg",
    "assets/skybox/nx.jpg",
    "assets/skybox/py.jpg",
    "assets/skybox/ny.jpg",
    "assets/skybox/pz.jpg",
    "assets/skybox/nz.jpg",
  ]);
  scene.background = skybox;
  scene.environment = skybox;

  scene.fog = new THREE.Fog(0xddefff, 120, 280);

  const camera = new THREE.PerspectiveCamera(
    75,
    mount.clientWidth / mount.clientHeight,
    0.1,
    2000
  );
  camera.position.set(0, 10, 15);

  const renderer = createRenderer(mount);

  const grass = loadTexture("assets/terrain/grass/albedo.jpg", 20);
  const sand = loadTexture("assets/terrain/sand/albedo.jpg", 20);

  const terrain = createTerrain({ grassMap: grass, sandMap: sand });
  scene.add(terrain);

  if (typeof window !== "undefined") {
    window.__terrainReference = terrain;
    window.__updateTerrain = null;
  }

  const water = createWater({ height: 20, size: 400 });
  scene.add(water);

  const hemi = new THREE.HemisphereLight("#ffffff", "#88aa77", 0.7);
  scene.add(hemi);

  const sun = new THREE.DirectionalLight("#ffffff", 1.0);
  sun.position.set(60, 100, 10);
  scene.add(sun);

  return { scene, camera, renderer, water, terrain };
}
