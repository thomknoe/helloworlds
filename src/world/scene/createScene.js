// src/world/scene/createScene.js
import * as THREE from "three";
import { loadSkybox } from "../../engine/loadSkybox.js";
import { loadTexture } from "../../engine/loadTexture.js";
import { createRenderer } from "../../engine/createRenderer.js";

import { createTerrain } from "../terrain/createTerrain.js";
import { createWater } from "../water/createWater.js";

// NOTE: We no longer bake Perlin noise into geometry here.
// All height displacement happens in terrainMaterial via shader uniforms.

export default function createScene(mount) {
  const scene = new THREE.Scene();

  // -----------------------------
  // SKY
  // -----------------------------
  scene.background = loadSkybox([
    "assets/skybox/px.jpg",
    "assets/skybox/nx.jpg",
    "assets/skybox/py.jpg",
    "assets/skybox/ny.jpg",
    "assets/skybox/pz.jpg",
    "assets/skybox/nz.jpg",
  ]);

  scene.fog = new THREE.Fog(0xddefff, 120, 280);

  // -----------------------------
  // CAMERA
  // -----------------------------
  const camera = new THREE.PerspectiveCamera(
    75,
    mount.clientWidth / mount.clientHeight,
    0.1,
    2000
  );
  camera.position.set(0, 10, 15);

  // -----------------------------
  // RENDERER
  // -----------------------------
  const renderer = createRenderer(mount);

  // -----------------------------
  // TERRAIN (flat mesh + shader deformation)
  // -----------------------------
  const grass = loadTexture("assets/terrain/grass/albedo.jpg", 20);
  const sand = loadTexture("assets/terrain/sand/albedo.jpg", 20);

  const terrain = createTerrain({ grassMap: grass, sandMap: sand });
  scene.add(terrain);

  // Expose terrain for your TerrainPreview system
  if (typeof window !== "undefined") {
    window.__terrainReference = terrain;

    // remove old __updateTerrain: deformation now happens inside shader,
    // not by modifying geometry in CPU space. This keeps everything in sync
    // with your PerlinNoiseNode’s parameters.
    window.__updateTerrain = null;
  }

  // -----------------------------
  // WATER
  // -----------------------------
  const water = createWater({ height: 20, size: 400 });
  scene.add(water);

  // -----------------------------
  // LIGHTING
  // -----------------------------
  const hemi = new THREE.HemisphereLight("#ffffff", "#88aa77", 0.7);
  scene.add(hemi);

  const sun = new THREE.DirectionalLight("#ffffff", 1.0);
  sun.position.set(60, 100, 10);
  scene.add(sun);

  return { scene, camera, renderer, water, terrain };
}
