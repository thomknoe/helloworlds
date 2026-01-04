import * as THREE from "three";
import { Boid, FlockingSystem } from "../../algorithms/flocking.js";
import { FlockingConfig } from "../../core/config/FlockingConfig.js";
import { sampleTerrainHeight } from "../terrain/sampleHeight.js";
import { createCelShadedMaterial } from "../../engine/createCelShadedMaterial.js";

export function createFlockingMotes(
  config,
  scene,
  terrainConfig = null,
  buildingRefs = []
) {
  if (!config || !config.agents || config.agents.length === 0) return null;

  const { agents: agentConfigs, behavior } = config;

  const behaviorConfig = behavior || {
    separation: 1.5,
    alignment: 1.0,
    cohesion: 1.0,
    separationRadius: 2.0,
    neighborRadius: 5.0,
    maxSpeed: 5.0,
    maxForce: 0.1,
    boundsWidth: 50,
    boundsDepth: 50,
    planeHeight: 50,
  };

  const material = createCelShadedMaterial(0xffffff, {
    rimIntensity: 0.25,
  });

  const group = new THREE.Group();
  group.name = "flockingAgents";

  const boids = [];
  const meshes = [];
  const agentMap = new Map();

  const flockingConfig = new FlockingConfig({
    separation: behaviorConfig.separation,
    alignment: behaviorConfig.alignment,
    cohesion: behaviorConfig.cohesion,
    separationRadius: behaviorConfig.separationRadius,
    neighborRadius: behaviorConfig.neighborRadius,
    maxSpeed: behaviorConfig.maxSpeed,
    maxForce: behaviorConfig.maxForce,
    boundsWidth: behaviorConfig.boundsWidth,
    boundsDepth: behaviorConfig.boundsDepth,
    planeHeight: behaviorConfig.planeHeight,
    noiseConfig: behaviorConfig.noiseConfig,
  });

  const flockingSystem = new FlockingSystem(flockingConfig);

  agentConfigs.forEach((agentConfig) => {
    let position = new THREE.Vector3(
      agentConfig.positionX,
      agentConfig.positionY,
      agentConfig.positionZ
    );

    if (terrainConfig) {
      const terrainY = sampleTerrainHeight(
        position.x,
        position.z,
        terrainConfig
      );
      const minHeight = terrainY + (agentConfig.size || 0.3) * 0.5 + 1.0;
      if (position.y < minHeight) {
        position.y = minHeight;
      }
    }

    let velocity = new THREE.Vector3(
      agentConfig.velocityX ?? (Math.random() - 0.5) * 4,
      agentConfig.velocityY ?? (Math.random() - 0.5) * 1,
      agentConfig.velocityZ ?? (Math.random() - 0.5) * 4
    );

    if (velocity.length() < 0.01) {
      velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 1,
        (Math.random() - 0.5) * 4
      );
    }

    velocity.normalize().multiplyScalar(3);

    const boid = new Boid(position, velocity);
    flockingSystem.addBoid(boid);
    boids.push(boid);
    agentMap.set(agentConfig.id, boids.length - 1);

    const geometry = new THREE.BoxGeometry(
      agentConfig.size || 0.3,
      agentConfig.size || 0.3,
      agentConfig.size || 0.3
    );
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    mesh.userData.agentId = agentConfig.id;

    group.add(mesh);
    meshes.push(mesh);
  });

  scene.add(group);

  const buildingBoundsCache = new Map();
  let cacheInvalidated = false;

  const updateBuildingBoundsCache = (buildingRefsToCheck) => {
    if (!cacheInvalidated && buildingBoundsCache.size > 0) {
      return;
    }

    buildingBoundsCache.clear();

    for (const buildingRef of buildingRefsToCheck) {
      if (!buildingRef || !buildingRef.group) continue;

      const groupBox = new THREE.Box3().setFromObject(buildingRef.group);
      if (!groupBox.isEmpty()) {
        buildingBoundsCache.set(buildingRef, {
          box: groupBox,
          center: groupBox.getCenter(new THREE.Vector3()),
        });
      }
    }

    cacheInvalidated = false;
  };

  const tempVec1 = new THREE.Vector3();
  const tempVec2 = new THREE.Vector3();
  const tempBox = new THREE.Box3();

  const checkBuildingCollision = (position, size, buildingRefsToCheck) => {
    const boidRadius = size * 0.5;
    tempBox.setFromCenterAndSize(
      position,
      tempVec1.set(boidRadius * 2, boidRadius * 2, boidRadius * 2)
    );

    updateBuildingBoundsCache(buildingRefsToCheck);

    for (const [, cached] of buildingBoundsCache) {
      if (tempBox.intersectsBox(cached.box)) {
        tempVec1.subVectors(position, cached.center).normalize();

        if (tempVec1.lengthSq() < 0.0001) {
          tempVec1.set(0, 1, 0);
        }

        return tempVec1.clone();
      }
    }

    return null;
  };

  return {
    group,
    flockingSystem,
    boids,
    meshes,
    agentMap,
    update: (
      deltaTime,
      currentTerrainConfig = null,
      currentBuildingRefs = []
    ) => {
      flockingSystem.update(deltaTime);

      const terrainConfigToUse = currentTerrainConfig || terrainConfig;
      const buildingRefsToUse =
        currentBuildingRefs.length > 0 ? currentBuildingRefs : buildingRefs;

      for (let i = 0; i < boids.length; i++) {
        const boid = boids[i];
        const mesh = meshes[i];
        const boidSize = mesh.scale.x * 0.3;

        if (terrainConfigToUse) {
          const terrainY = sampleTerrainHeight(
            boid.position.x,
            boid.position.z,
            terrainConfigToUse
          );
          const minHeight = terrainY + boidSize * 0.5 + 0.1;

          if (boid.position.y < minHeight) {
            boid.position.y = minHeight;
            if (boid.velocity.y < 0) {
              boid.velocity.y = Math.abs(boid.velocity.y) * 0.5;
            }
          }
        }

        const buildingCollision = checkBuildingCollision(
          boid.position,
          boidSize,
          buildingRefsToUse
        );
        if (buildingCollision) {
          tempVec1.copy(buildingCollision).multiplyScalar(2.0);
          boid.velocity.add(tempVec1);
          tempVec1.copy(buildingCollision).multiplyScalar(0.1);
          boid.position.add(tempVec1);
        }

        mesh.position.copy(boid.position);

        if (boid.velocity.lengthSq() > 0.0001) {
          tempVec2.copy(boid.velocity).normalize().add(boid.position);
          mesh.lookAt(tempVec2);
        }
      }
    },
    invalidateBuildingCache: () => {
      cacheInvalidated = true;
    },
    updateConfig: (newConfig) => {
      if (!newConfig || !newConfig.agents) return;

      cacheInvalidated = true;

      const { agents: newAgentConfigs, behavior: newBehavior } = newConfig;

      if (newBehavior) {
        const newFlockingConfig = new FlockingConfig({
          separation: newBehavior.separation,
          alignment: newBehavior.alignment,
          cohesion: newBehavior.cohesion,
          separationRadius: newBehavior.separationRadius,
          neighborRadius: newBehavior.neighborRadius,
          maxSpeed: newBehavior.maxSpeed,
          maxForce: newBehavior.maxForce,
          boundsWidth: newBehavior.boundsWidth,
          boundsDepth: newBehavior.boundsDepth,
          planeHeight: newBehavior.planeHeight,
          noiseConfig: newBehavior.noiseConfig,
        });
        flockingSystem.updateConfig(newFlockingConfig);
      }

      const existingIds = new Set();

      newAgentConfigs.forEach((agentConfig) => {
        existingIds.add(agentConfig.id);

        const index = agentMap.get(agentConfig.id);
        if (index !== undefined) {
          const boid = boids[index];
          boid.position.set(
            agentConfig.positionX,
            agentConfig.positionY,
            agentConfig.positionZ
          );

          if (agentConfig.size !== undefined) {
            meshes[index].scale.setScalar(
              agentConfig.size / (agentConfig.size || 0.3)
            );
          }
        } else {
          let position = new THREE.Vector3(
            agentConfig.positionX,
            agentConfig.positionY,
            agentConfig.positionZ
          );

          if (terrainConfig) {
            const terrainY = sampleTerrainHeight(
              position.x,
              position.z,
              terrainConfig
            );
            const minHeight = terrainY + (agentConfig.size || 0.3) * 0.5 + 1.0;
            if (position.y < minHeight) {
              position.y = minHeight;
            }
          }

          let velocity = new THREE.Vector3(
            agentConfig.velocityX ?? (Math.random() - 0.5) * 4,
            agentConfig.velocityY ?? (Math.random() - 0.5) * 1,
            agentConfig.velocityZ ?? (Math.random() - 0.5) * 4
          );

          if (velocity.length() < 0.01) {
            velocity = new THREE.Vector3(
              (Math.random() - 0.5) * 4,
              (Math.random() - 0.5) * 1,
              (Math.random() - 0.5) * 4
            );
          }

          velocity.normalize().multiplyScalar(3);

          const boid = new Boid(position, velocity);
          flockingSystem.addBoid(boid);
          boids.push(boid);
          agentMap.set(agentConfig.id, boids.length - 1);

          const geometry = new THREE.BoxGeometry(
            agentConfig.size || 0.3,
            agentConfig.size || 0.3,
            agentConfig.size || 0.3
          );
          const mesh = new THREE.Mesh(geometry, material);
          mesh.position.copy(position);
          mesh.castShadow = false;
          mesh.receiveShadow = false;
          mesh.userData.agentId = agentConfig.id;
          group.add(mesh);
          meshes.push(mesh);
        }
      });

      for (let i = boids.length - 1; i >= 0; i--) {
        const agentId = Array.from(agentMap.entries()).find(
          ([, idx]) => idx === i
        )?.[0];
        if (agentId && !existingIds.has(agentId)) {
          const boid = boids[i];
          flockingSystem.removeBoid(boid);
          boids.splice(i, 1);

          const mesh = meshes[i];
          group.remove(mesh);
          mesh.geometry.dispose();
          meshes.splice(i, 1);

          agentMap.delete(agentId);

          agentMap.forEach((idx, id) => {
            if (idx > i) agentMap.set(id, idx - 1);
          });
        }
      }
    },
    dispose: () => {
      meshes.forEach((mesh) => {
        mesh.geometry.dispose();
      });
      material.dispose();
      scene.remove(group);
    },
  };
}
