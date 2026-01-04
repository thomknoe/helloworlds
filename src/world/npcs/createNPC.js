import * as THREE from "three";
import { NPC } from "../../algorithms/npc.js";
import { sampleTerrainHeight } from "../terrain/sampleHeight.js";

/**
 * Create an NPC entity in the world
 */
export function createNPC(config, scene, terrainConfig = null) {
  if (!config) return null;

  const npc = new NPC({
    id: config.id,
    positionX: config.positionX || 0,
    positionY: config.positionY || 0,
    positionZ: config.positionZ || 0,
    movementType: config.movementType || "random",
    speed: config.speed || 2.0,
    wanderRadius: config.wanderRadius || 10.0,
    wanderCenterX: config.wanderCenterX || config.positionX || 0,
    wanderCenterY: config.wanderCenterY || config.positionY || 0,
    wanderCenterZ: config.wanderCenterZ || config.positionZ || 0,
    pathPoints: config.pathPoints || [],
    interactionRadius: config.interactionRadius || 5.0,
    dialogueWords: config.dialogueWords || [],
    dialogueLength: config.dialogueLength || 5,
  });

  // Adjust initial position to terrain (float higher)
  if (terrainConfig) {
    const terrainY = sampleTerrainHeight(
      npc.position.x,
      npc.position.z,
      terrainConfig
    );
    npc.position.y = terrainY + 3.5; // Float higher above terrain
  } else {
    npc.position.y += 3.5; // Float higher above ground
  }

  // Create visual representation (floating reflective cube like boids)
  const group = new THREE.Group();
  group.name = `npc-${npc.id}`;
  group.position.copy(npc.position);

  // Use interaction radius for size, make it slightly larger
  const interactionRadius = config.interactionRadius || 6.0;
  const size = config.size || (interactionRadius * 0.15); // Scale size based on interaction radius

  // Get color from config or default to white
  const color = new THREE.Color(config.color || "#ffffff");

  // Get environment map for reflection (same as boids)
  const envMap = scene.environment?.isCubeTexture
    ? scene.environment
    : (scene.background?.isCubeTexture ? scene.background : null);

  // Create material with color and reflective layer (like boids)
  const material = new THREE.MeshStandardMaterial({
    color: color,
    metalness: 1.0,
    roughness: 0.0,
    envMap: envMap,
    envMapIntensity: 1.5,
  });

  // Create floating cube
  const geometry = new THREE.BoxGeometry(size, size, size);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = false;
  
  // Store initial Y position for floating animation
  mesh.userData.baseY = npc.position.y;
  mesh.userData.floatOffset = 0;
  mesh.userData.floatSpeed = 0.5 + Math.random() * 0.5; // Random float speed
  mesh.userData.floatAmplitude = 0.3 + Math.random() * 0.2; // Random float amplitude
  
  // Rotation animation data
  mesh.userData.rotationSpeed = {
    x: (Math.random() - 0.5) * 0.5,
    y: (Math.random() - 0.5) * 0.5,
    z: (Math.random() - 0.5) * 0.5,
  };
  
  group.add(mesh);

  // Store NPC reference in userData
  group.userData.npc = npc;
  group.userData.npcId = npc.id;
  group.userData.dialogue = "";

  scene.add(group);

  return {
    group,
    npc,
  };
}

/**
 * Update NPC system (movement, dialogue, interaction)
 */
export function updateNPCs(
  npcs,
  deltaTime,
  playerPosition,
  terrainConfig = null
) {
  if (!npcs || npcs.length === 0) return;

  const terrainHeightFn = terrainConfig
    ? (x, z) => sampleTerrainHeight(x, z, terrainConfig)
    : null;

  npcs.forEach(({ npc, group }) => {
    if (!npc || !group) return;

    // Update movement
    npc.updateMovement(deltaTime, terrainHeightFn);

    // Update base position from NPC
    const mesh = group.children[0];
    if (mesh && mesh.userData.baseY !== undefined) {
      // Update base Y if terrain height changes
      if (terrainHeightFn) {
        const terrainY = terrainHeightFn(npc.position.x, npc.position.z);
        mesh.userData.baseY = terrainY + 3.5; // Float higher
      } else {
        mesh.userData.baseY = npc.position.y;
      }
      
      // Floating animation (bobbing up and down)
      mesh.userData.floatOffset += deltaTime * mesh.userData.floatSpeed;
      const floatY = Math.sin(mesh.userData.floatOffset) * mesh.userData.floatAmplitude;
      
      // Set group position (X, Z from NPC, Y from base + float)
      group.position.set(npc.position.x, mesh.userData.baseY + floatY, npc.position.z);
      
      // Rotation animation
      if (mesh.userData.rotationSpeed) {
        mesh.rotation.x += mesh.userData.rotationSpeed.x * deltaTime;
        mesh.rotation.y += mesh.userData.rotationSpeed.y * deltaTime;
        mesh.rotation.z += mesh.userData.rotationSpeed.z * deltaTime;
      }
    } else {
      // Fallback: just copy NPC position
      group.position.copy(npc.position);
    }

    // Check player proximity and update dialogue
    if (playerPosition) {
      npc.checkPlayerProximity(playerPosition);
      group.userData.dialogue = npc.getDialogue();
    }
  });
}
