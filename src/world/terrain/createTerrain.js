import * as THREE from "three";
import { defaultTerrainConfig } from "./terrainConfig.js";
import { createTerrainMaterial } from "./terrainMaterial.js";
import { sampleNoise2D } from "./sampleNoise.js";

function applyNoiseToGeometry(geometry, noiseConfig) {
  const positionAttr = geometry.getAttribute("position");
  const arr = positionAttr.array;
  const count = positionAttr.count;

  const amplitude = noiseConfig.amplitude ?? noiseConfig.elevation ?? 10;
  const noiseType = noiseConfig.type || "perlinNoise";

  for (let i = 0; i < count; i++) {
    const idx = i * 3;
    const x = arr[idx];
    const z = arr[idx + 2];

    // Use the unified noise sampler
    const noiseValue = sampleNoise2D(x, z, {
      type: noiseType,
      seed: noiseConfig.seed ?? 42,
      scale: noiseConfig.scale ?? noiseConfig.noiseScale ?? 0.05,
      octaves: noiseConfig.octaves ?? 4,
      persistence: noiseConfig.persistence ?? 0.5,
      frequency: noiseConfig.frequency ?? 1,
      amplitude: amplitude,
      // Voronoi specific
      mode: noiseConfig.mode,
      // Domain Warping specific
      baseScale: noiseConfig.baseScale,
      warpStrength: noiseConfig.warpStrength,
      warpScale: noiseConfig.warpScale,
      // Ridge Noise specific
      offset: noiseConfig.offset,
      power: noiseConfig.power,
      // Simplex specific
      zOffset: noiseConfig.zOffset,
    });

    arr[idx + 1] = noiseValue * amplitude;
  }

  positionAttr.needsUpdate = true;
  geometry.computeVertexNormals();
}

export function createTerrain({
  config = defaultTerrainConfig,
  time = 0.0,
}) {
  const geometry = new THREE.PlaneGeometry(
    config.width,
    config.depth,
    config.segments,
    config.segments
  );

  geometry.rotateX(-Math.PI / 2);

  applyNoiseToGeometry(geometry, {
    type: config.type || "perlinNoise",
    seed: config.seed ?? 42,
    scale: config.noiseScale ?? 0.05,
    octaves: config.octaves ?? 4,
    persistence: config.persistence ?? 0.5,
    amplitude: config.amplitude ?? 10,
    frequency: config.frequency ?? 1,
  });

  const material = createTerrainMaterial({
    time,
    waterHeight: config.waterHeight ?? 20,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.receiveShadow = true; // Enable shadow receiving for flat aesthetic

  return mesh;
}

export function updateTerrainGeometry(terrain, noiseConfig) {
  if (!terrain || !terrain.geometry) return;
  applyNoiseToGeometry(terrain.geometry, noiseConfig || {});
}
