import * as THREE from "three";
import { NPC } from "../../algorithms/npc.js";
import { sampleTerrainHeight } from "../terrain/sampleHeight.js";
import { createCelShadedMaterial } from "../../engine/createCelShadedMaterial.js";

export function createNPC(config, scene, terrainConfig = null) {
  if (!config) return null;

  const npc = new NPC({
    id: config.id,
    positionX: config.positionX || 0,
    positionY: config.positionY || 0,
    positionZ: config.positionZ || 0,
    movementType: config.movementType || "stationary",
    speed: config.speed || 2.0,
    wanderRadius: config.wanderRadius || 10.0,
    wanderCenterX: config.wanderCenterX || config.positionX || 0,
    wanderCenterY: config.wanderCenterY || config.positionY || 0,
    wanderCenterZ: config.wanderCenterZ || config.positionZ || 0,
    pathPoints: config.pathPoints || [],
    interactionRadius: config.interactionRadius || 10.0,
    dialogueWords: config.dialogueWords || [],
    dialogueLength: config.dialogueLength || 5,
  });

  if (terrainConfig) {
    const terrainY = sampleTerrainHeight(
      npc.position.x,
      npc.position.z,
      terrainConfig
    );
    npc.position.y = terrainY + 6.0;
  } else {
    npc.position.y = Math.max(npc.position.y, 6.0);
  }

  const group = new THREE.Group();
  group.name = `npc-${npc.id}`;
  group.position.copy(npc.position);

  const size = config.size || 3.5;

  const material = createCelShadedMaterial(0xffffff, {
    rimIntensity: 0.25,
  });

  const geometry = new THREE.BoxGeometry(size, size, size);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(0, 0, 0);
  mesh.castShadow = false;
  mesh.receiveShadow = false;

  group.add(mesh);

  group.userData.npc = npc;
  group.userData.npcId = npc.id;
  group.userData.dialogue = "";

  scene.add(group);

  return {
    group,
    npc,
  };
}

export function updateNPCs(
  npcs,
  deltaTime,
  playerPosition,
  terrainConfig = null,
  time = 0
) {
  if (!npcs || npcs.length === 0) return;

  const terrainHeightFn = terrainConfig
    ? (x, z) => sampleTerrainHeight(x, z, terrainConfig)
    : null;

  npcs.forEach(({ npc, group }) => {
    if (!npc || !group) return;

    npc.updateMovement(deltaTime, terrainHeightFn);

    let baseY = npc.position.y;

    if (terrainHeightFn) {
      const terrainY = terrainHeightFn(npc.position.x, npc.position.z);
      baseY = Math.max(npc.position.y, terrainY + 6.0);
    }

    group.position.set(npc.position.x, baseY, npc.position.z);

    const mesh = group.children[0];
    if (mesh && mesh.isMesh) {
      const floatOffset = Math.sin(time * 0.4 + npc.id.charCodeAt(0)) * 0.8;
      group.position.y += floatOffset;

      const rotationSpeed = 0.5 + (npc.id.charCodeAt(0) % 10) * 0.1;
      group.rotation.y = time * rotationSpeed;
    }

    if (playerPosition) {
      npc.checkPlayerProximity(playerPosition);
      group.userData.dialogue = npc.getDialogue();
    }
  });
}
