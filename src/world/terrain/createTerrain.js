import * as THREE from "three";
import Perlin from "../../algorithms/perlin.js";
import { defaultTerrainConfig } from "./terrainConfig.js";
import { createTerrainMaterial } from "./terrainMaterial.js";

function applyPerlinToGeometry(geometry, perlinConfig) {
  const positionAttr = geometry.getAttribute("position");
  const arr = positionAttr.array;
  const count = positionAttr.count;

  const seed = perlinConfig.seed ?? 42;
  const scale = perlinConfig.scale ?? perlinConfig.noiseScale ?? 0.05;
  const octaves = Math.max(1, Math.floor(perlinConfig.octaves ?? 4));
  const persistence = perlinConfig.persistence ?? 0.5;
  const amplitude = perlinConfig.amplitude ?? perlinConfig.elevation ?? 10;
  const baseFreq = perlinConfig.frequency ?? 1;

  const safeScale = scale > 0 ? scale : 0.0001;

  Perlin.init(seed);

  for (let i = 0; i < count; i++) {
    const idx = i * 3;
    const x = arr[idx];
    const z = arr[idx + 2];

    let total = 0;
    let freq = baseFreq;
    let amp = 1;
    let maxAmp = 0;

    for (let o = 0; o < octaves; o++) {
      total += Perlin.noise2D(x * safeScale * freq, z * safeScale * freq) * amp;
      maxAmp += amp;
      amp *= persistence;
      freq *= 2;
    }

    const normalized = maxAmp > 0 ? total / maxAmp : total;

    arr[idx + 1] = normalized * amplitude;
  }

  positionAttr.needsUpdate = true;
  geometry.computeVertexNormals();
}

export function createTerrain({
  grassMap,
  sandMap,
  config = defaultTerrainConfig,
}) {
  const geometry = new THREE.PlaneGeometry(
    config.width,
    config.depth,
    config.segments,
    config.segments
  );

  geometry.rotateX(-Math.PI / 2);

  applyPerlinToGeometry(geometry, {
    seed: config.seed ?? 42,
    scale: config.noiseScale ?? 0.05,
    octaves: config.octaves ?? 4,
    persistence: config.persistence ?? 0.5,
    amplitude: config.amplitude ?? 10,
    frequency: config.frequency ?? 1,
  });

  const material = createTerrainMaterial({
    grassMap,
    sandMap,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.receiveShadow = false;

  return mesh;
}

export function updateTerrainGeometry(terrain, perlinConfig) {
  if (!terrain || !terrain.geometry) return;
  applyPerlinToGeometry(terrain.geometry, perlinConfig || {});
}
