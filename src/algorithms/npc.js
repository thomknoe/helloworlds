import * as THREE from "three";
import { MarkovChain } from "./markovChain.js";

/**
 * NPC Entity System
 * Handles movement patterns, dialogue generation, and player interaction
 */
export class NPC {
  constructor(config = {}) {
    this.id = config.id || `npc-${Math.random().toString(36).slice(2, 8)}`;
    this.position = new THREE.Vector3(
      config.positionX || 0,
      config.positionY || 0,
      config.positionZ || 0
    );

    // Movement
    this.movementType = config.movementType || "random"; // "random", "path", "stationary"
    this.speed = config.speed || 2.0;
    this.wanderRadius = config.wanderRadius || 10.0;
    this.wanderCenter = new THREE.Vector3(
      config.wanderCenterX || this.position.x,
      config.wanderCenterY || this.position.y,
      config.wanderCenterZ || this.position.z
    );

    // Path-based movement
    this.pathPoints = config.pathPoints || [];
    this.currentPathIndex = 0;
    this.pathLoop = config.pathLoop !== false;

    // Dialogue
    this.dialogueWords =
      Array.isArray(config.dialogueWords) && config.dialogueWords.length > 0
        ? config.dialogueWords
        : [
            "hello",
            "world",
            "greetings",
            "traveler",
            "welcome",
            "friend",
            "adventure",
            "journey",
            "path",
            "destiny",
            "quest",
            "story",
          ];
    this.dialogueLength = config.dialogueLength || 5;
    this.interactionRadius = config.interactionRadius || 5.0;

    // Initialize Markov Chain for dialogue
    this.markovChain = new MarkovChain({
      states: this.dialogueWords,
    });

    // Current state
    this.currentDialogue = "";
    this.targetPosition = null; // Will be set on first movement update
    this.velocity = new THREE.Vector3();
    this.isPlayerNearby = false;

    // Generate initial dialogue
    this.generateDialogue();
  }

  // Generate dialogue using Markov Chain
  generateDialogue() {
    const sequence = this.markovChain.generateSequence(this.dialogueLength);
    this.currentDialogue = sequence.join(" ");
    return this.currentDialogue;
  }

  // Update movement based on type
  updateMovement(deltaTime, terrainHeightFn = null) {
    switch (this.movementType) {
      case "random":
        this.updateRandomMovement(deltaTime, terrainHeightFn);
        break;
      case "path":
        this.updatePathMovement(deltaTime, terrainHeightFn);
        break;
      case "stationary":
        // No movement
        break;
    }
  }

  updateRandomMovement(deltaTime, terrainHeightFn) {
    // If no target, pick new target first
    if (!this.targetPosition) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * this.wanderRadius;

      // Only set X and Z, Y will be set based on terrain
      const targetX = this.wanderCenter.x + Math.cos(angle) * radius;
      const targetZ = this.wanderCenter.z + Math.sin(angle) * radius;
      
      // Get Y from terrain height at target position
      let targetY = this.position.y; // Default to current Y
      if (terrainHeightFn) {
        const terrainY = terrainHeightFn(targetX, targetZ);
        targetY = terrainY + 3.5; // Float higher above terrain
      }

      this.targetPosition = new THREE.Vector3(targetX, targetY, targetZ);
    }

    // Calculate distance only in X-Z plane (ignore Y)
    const dx = this.targetPosition.x - this.position.x;
    const dz = this.targetPosition.z - this.position.z;
    const distanceToTarget = Math.sqrt(dx * dx + dz * dz);

    // If reached target, pick new target (only in X-Z plane)
    if (distanceToTarget < 0.5) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * this.wanderRadius;

      // Only set X and Z, Y will be set based on terrain
      const targetX = this.wanderCenter.x + Math.cos(angle) * radius;
      const targetZ = this.wanderCenter.z + Math.sin(angle) * radius;
      
      // Get Y from terrain height at target position
      let targetY = this.position.y; // Default to current Y
      if (terrainHeightFn) {
        const terrainY = terrainHeightFn(targetX, targetZ);
        targetY = terrainY + 3.5; // Float higher above terrain
      }

      this.targetPosition = new THREE.Vector3(targetX, targetY, targetZ);
    }

    // Move towards target (only in X-Z plane, Y stays constant)
    const direction = new THREE.Vector3(
      this.targetPosition.x - this.position.x,
      0, // No Y movement
      this.targetPosition.z - this.position.z
    ).normalize();

    // Move only in X and Z
    const moveX = direction.x * this.speed * deltaTime;
    const moveZ = direction.z * this.speed * deltaTime;
    this.position.x += moveX;
    this.position.z += moveZ;

    // Update Y based on terrain height (keep floating at constant height above terrain)
    if (terrainHeightFn) {
      const terrainY = terrainHeightFn(this.position.x, this.position.z);
      this.position.y = terrainY + 3.5; // Float higher above terrain
    }
  }

  updatePathMovement(deltaTime, terrainHeightFn) {
    if (this.pathPoints.length === 0) return;

    const currentTarget = this.pathPoints[this.currentPathIndex];
    if (!currentTarget) return;

    const targetPos = new THREE.Vector3(
      currentTarget.x || currentTarget[0] || 0,
      currentTarget.y || currentTarget[1] || 0,
      currentTarget.z || currentTarget[2] || 0
    );

    // Adjust height to terrain (with floating offset)
    if (terrainHeightFn) {
      const terrainY = terrainHeightFn(targetPos.x, targetPos.z);
      targetPos.y = terrainY + 3.5; // Float higher above terrain
    }

    const distance = this.position.distanceTo(targetPos);

    if (distance < 0.5) {
      // Reached waypoint, move to next
      this.currentPathIndex++;
      if (this.currentPathIndex >= this.pathPoints.length) {
        if (this.pathLoop) {
          this.currentPathIndex = 0;
        } else {
          // Reverse path
          this.pathPoints.reverse();
          this.currentPathIndex = 1;
        }
      }
    } else {
      // Move towards waypoint
      const direction = new THREE.Vector3()
        .subVectors(targetPos, this.position)
        .normalize();

      this.velocity.copy(direction.multiplyScalar(this.speed));
      this.position.add(this.velocity.clone().multiplyScalar(deltaTime));

      // Adjust height to terrain (with floating offset)
      if (terrainHeightFn) {
        const terrainY = terrainHeightFn(this.position.x, this.position.z);
        this.position.y = terrainY + 3.5; // Float higher above terrain
      }
    }
  }

  // Check if player is nearby
  checkPlayerProximity(playerPosition) {
    const distance = this.position.distanceTo(playerPosition);
    const wasNearby = this.isPlayerNearby;
    this.isPlayerNearby = distance <= this.interactionRadius;

    // Generate new dialogue when player approaches
    if (this.isPlayerNearby && !wasNearby) {
      this.generateDialogue();
    }

    return this.isPlayerNearby;
  }

  // Get current dialogue (empty if player not nearby)
  getDialogue() {
    return this.isPlayerNearby ? this.currentDialogue : "";
  }
}

export default NPC;
