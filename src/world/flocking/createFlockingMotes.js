import * as THREE from "three";
import { Boid, FlockingSystem } from "../../algorithms/flocking.js";
import { FlockingConfig } from "../../core/config/FlockingConfig.js";

export function createFlockingMotes(config, scene) {
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

  const envMap = scene.environment?.isCubeTexture
    ? scene.environment
    : (scene.background?.isCubeTexture ? scene.background : null);

  const material = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 1.0,
    roughness: 0.0,
    envMap: envMap,
    envMapIntensity: 1.5,
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
    const position = new THREE.Vector3(
      agentConfig.positionX,
      agentConfig.positionY,
      agentConfig.positionZ
    );
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
    mesh.castShadow = true;
    mesh.receiveShadow = false;
    mesh.userData.agentId = agentConfig.id;

    group.add(mesh);
    meshes.push(mesh);
  });

  scene.add(group);

  return {
    group,
    flockingSystem,
    boids,
    meshes,
    agentMap,
    update: (deltaTime) => {

      flockingSystem.update(deltaTime);

      for (let i = 0; i < boids.length; i++) {
        meshes[i].position.copy(boids[i].position);

        if (boids[i].velocity.length() > 0.01) {
          meshes[i].lookAt(
            boids[i].position.clone().add(boids[i].velocity.clone().normalize())
          );
        }
      }
    },
    updateConfig: (newConfig) => {
      if (!newConfig || !newConfig.agents) return;

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
            meshes[index].scale.setScalar(agentConfig.size / (agentConfig.size || 0.3));
          }
        } else {

          const position = new THREE.Vector3(
            agentConfig.positionX,
            agentConfig.positionY,
            agentConfig.positionZ
          );
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
          mesh.castShadow = true;
          mesh.receiveShadow = false;
          mesh.userData.agentId = agentConfig.id;
          group.add(mesh);
          meshes.push(mesh);
        }
      });

      for (let i = boids.length - 1; i >= 0; i--) {
        const agentId = Array.from(agentMap.entries()).find(([_, idx]) => idx === i)?.[0];
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
