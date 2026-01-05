import * as THREE from "three";
import Perlin from "../../algorithms/perlin.js";
import { sampleTerrainHeight } from "../terrain/sampleHeight.js";
import { createCelShadedMaterial } from "../../engine/createCelShadedMaterial.js";
export function createFlowers(config, scene, terrainConfig) {
  if (!config) return null;
  const {
    count = 50,
    spread = 50.0,
    size = 1.0,
    noiseConfig,
  } = config;
  const WATER_LEVEL = 20;
  const group = new THREE.Group();
  group.name = "flowers";
  const redMaterial = createCelShadedMaterial(0xff4444, {
    rimIntensity: 0.3,
  });
  const whiteMaterial = createCelShadedMaterial(0xffffff, {
    rimIntensity: 0.25,
  });
  const stemMaterial = createCelShadedMaterial(0x4a7c59, {
    rimIntensity: 0.2,
  });
  const leafMaterial = createCelShadedMaterial(0x4a7c59, {
    rimIntensity: 0.2,
  });
  const yellowCenterMaterial = createCelShadedMaterial(0xffffaa, {
    rimIntensity: 0.35,
  });
  const orangeCenterMaterial = createCelShadedMaterial(0xffaa00, {
    rimIntensity: 0.35,
  });
  const flowers = [];
  let attempts = 0;
  const maxAttempts = count * 20;
  if (noiseConfig) {
    Perlin.init(noiseConfig.seed ?? 42);
  }
  while (flowers.length < count && attempts < maxAttempts) {
    attempts++;
    const x = (Math.random() - 0.5) * spread;
    const z = (Math.random() - 0.5) * spread;
    let noiseValue = 0.5;
    if (noiseConfig) {
      const noiseScale = noiseConfig.scale ?? 0.05;
      noiseValue = Perlin.noise2D(x * noiseScale, z * noiseScale);
    }
    const threshold = 0.35;
    if (noiseValue < threshold) {
      continue;
    }
    let terrainHeight = 0;
    if (terrainConfig) {
      terrainHeight = sampleTerrainHeight(x, z, terrainConfig);
    } else {
      terrainHeight = sampleTerrainHeight(x, z, {
        type: "perlinNoise",
        seed: 42,
        scale: 0.05,
        octaves: 4,
        persistence: 0.5,
        amplitude: 10,
        frequency: 1,
      });
    }
    if (terrainHeight <= WATER_LEVEL) {
      continue;
    }
    const isRed = Math.random() > 0.5;
    const petalMaterial = isRed ? redMaterial : whiteMaterial;
    const flowerGroup = new THREE.Group();
    const stemHeight = size * 0.8;
    const stemRadius = size * 0.05;
    const stemGeometry = new THREE.CylinderGeometry(stemRadius, stemRadius, stemHeight, 8);
    const stemMesh = new THREE.Mesh(stemGeometry, stemMaterial);
    stemMesh.position.y = stemHeight / 2;
    stemMesh.castShadow = true;
    stemMesh.receiveShadow = false;
    flowerGroup.add(stemMesh);
    const flowerHeadY = stemHeight;
    const petalSize = size * 0.4;
    const petalCount = 6;
    for (let i = 0; i < petalCount; i++) {
      const angle = (i / petalCount) * Math.PI * 2;
      const petalGeometry = new THREE.ConeGeometry(petalSize * 0.5, petalSize, 8);
      const petalMesh = new THREE.Mesh(petalGeometry, petalMaterial);
      petalMesh.position.x = Math.cos(angle) * petalSize * 0.3;
      petalMesh.position.z = Math.sin(angle) * petalSize * 0.3;
      petalMesh.position.y = flowerHeadY;
      petalMesh.rotation.z = angle + Math.PI / 2;
      petalMesh.rotation.x = -Math.PI / 3;
      petalMesh.castShadow = true;
      petalMesh.receiveShadow = false;
      flowerGroup.add(petalMesh);
    }
    const centerSize = size * 0.25;
    const centerGeometry = new THREE.SphereGeometry(centerSize, 12, 12);
    const centerMesh = new THREE.Mesh(
      centerGeometry,
      isRed ? orangeCenterMaterial : yellowCenterMaterial
    );
    centerMesh.position.y = flowerHeadY;
    centerMesh.castShadow = true;
    centerMesh.receiveShadow = false;
    flowerGroup.add(centerMesh);
    const leafCount = 2;
    for (let i = 0; i < leafCount; i++) {
      const leafY = (stemHeight / (leafCount + 1)) * (i + 1);
      const leafGeometry = new THREE.ConeGeometry(size * 0.15, size * 0.3, 6);
      const leafMesh = new THREE.Mesh(leafGeometry, leafMaterial);
      leafMesh.position.y = leafY;
      leafMesh.position.x = stemRadius * 1.5;
      leafMesh.rotation.z = Math.PI / 4;
      leafMesh.rotation.y = Math.PI / 6;
      leafMesh.castShadow = true;
      leafMesh.receiveShadow = false;
      flowerGroup.add(leafMesh);
    }
    flowerGroup.position.set(x, terrainHeight, z);
    flowerGroup.rotation.y = Math.random() * Math.PI * 2;
    flowerGroup.castShadow = true;
    flowerGroup.receiveShadow = false;
    group.add(flowerGroup);
    flowers.push(flowerGroup);
  }
  scene.add(group);
  return {
    group,
    flowers,
    dispose: () => {
      flowers.forEach((flower) => {
        flower.traverse((child) => {
          if (child.isMesh) {
            child.geometry.dispose();
          }
        });
      });
      redMaterial.dispose();
      whiteMaterial.dispose();
      stemMaterial.dispose();
      leafMaterial.dispose();
      yellowCenterMaterial.dispose();
      orangeCenterMaterial.dispose();
      scene.remove(group);
    },
    updateConfig: (newConfig) => {
      if (
        newConfig.count !== count ||
        newConfig.spread !== spread ||
        newConfig.size !== size ||
        newConfig.noiseConfig !== noiseConfig
      ) {
        return false;
      }
      return true;
    },
  };
}
