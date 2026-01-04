import * as THREE from "three";
import { MarkovChain } from "./markovChain.js";

export class NPC {
  constructor(config = {}) {
    this.id = config.id || `npc-${Math.random().toString(36).slice(2, 8)}`;
    this.position = new THREE.Vector3(
      config.positionX || 0,
      config.positionY || 0,
      config.positionZ || 0
    );

    this.movementType = config.movementType || "stationary";
    this.speed = config.speed || 2.0;
    this.wanderRadius = config.wanderRadius || 10.0;
    this.wanderCenter = new THREE.Vector3(
      config.wanderCenterX || this.position.x,
      config.wanderCenterY || this.position.y,
      config.wanderCenterZ || this.position.z
    );

    this.pathPoints = config.pathPoints || [];
    this.currentPathIndex = 0;
    this.pathLoop = config.pathLoop !== false;

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
    this.interactionRadius = config.interactionRadius || 10.0;

    this.markovChain = new MarkovChain({
      states: this.dialogueWords,
    });

    this.currentDialogue = "";
    this.targetPosition = null;
    this.velocity = new THREE.Vector3();
    this.isPlayerNearby = false;

    this.generateDialogue();
  }

  generateDialogue() {
    const sequence = this.markovChain.generateSequence(this.dialogueLength);
    this.currentDialogue = sequence.join(" ");
    return this.currentDialogue;
  }

  updateMovement(deltaTime, terrainHeightFn = null) {
    switch (this.movementType) {
      case "random":
        this.updateRandomMovement(deltaTime, terrainHeightFn);
        break;
      case "path":
        this.updatePathMovement(deltaTime, terrainHeightFn);
        break;
      case "stationary":
        break;
    }
  }

  updateRandomMovement(deltaTime, terrainHeightFn) {
    if (!this.targetPosition) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * this.wanderRadius;

      const targetX = this.wanderCenter.x + Math.cos(angle) * radius;
      const targetZ = this.wanderCenter.z + Math.sin(angle) * radius;

      let targetY = this.position.y;
      if (terrainHeightFn) {
        const terrainY = terrainHeightFn(targetX, targetZ);
        targetY = terrainY + 6.0;
      } else {
        targetY = Math.max(targetY, 6.0);
      }

      this.targetPosition = new THREE.Vector3(targetX, targetY, targetZ);
    }

    const dx = this.targetPosition.x - this.position.x;
    const dz = this.targetPosition.z - this.position.z;
    const distanceToTarget = Math.sqrt(dx * dx + dz * dz);

    if (distanceToTarget < 0.5) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * this.wanderRadius;

      const targetX = this.wanderCenter.x + Math.cos(angle) * radius;
      const targetZ = this.wanderCenter.z + Math.sin(angle) * radius;

      let targetY = this.position.y;
      if (terrainHeightFn) {
        const terrainY = terrainHeightFn(targetX, targetZ);
        targetY = terrainY + 6.0;
      } else {
        targetY = Math.max(targetY, 6.0);
      }

      this.targetPosition = new THREE.Vector3(targetX, targetY, targetZ);
    }

    const direction = new THREE.Vector3(
      this.targetPosition.x - this.position.x,
      0,
      this.targetPosition.z - this.position.z
    ).normalize();

    const moveX = direction.x * this.speed * deltaTime;
    const moveZ = direction.z * this.speed * deltaTime;
    this.position.x += moveX;
    this.position.z += moveZ;

    if (terrainHeightFn) {
      const terrainY = terrainHeightFn(this.position.x, this.position.z);
      this.position.y = terrainY + 6.0;
    } else {
      this.position.y = Math.max(this.position.y, 6.0);
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

    if (terrainHeightFn) {
      const terrainY = terrainHeightFn(targetPos.x, targetPos.z);
      targetPos.y = terrainY + 6.0;
    } else {
      targetPos.y = Math.max(targetPos.y, 6.0);
    }

    const distance = this.position.distanceTo(targetPos);

    if (distance < 0.5) {
      this.currentPathIndex++;
      if (this.currentPathIndex >= this.pathPoints.length) {
        if (this.pathLoop) {
          this.currentPathIndex = 0;
        } else {
          this.pathPoints.reverse();
          this.currentPathIndex = 1;
        }
      }
    } else {
      const direction = new THREE.Vector3()
        .subVectors(targetPos, this.position)
        .normalize();

      this.velocity.copy(direction.multiplyScalar(this.speed));
      this.position.add(this.velocity.clone().multiplyScalar(deltaTime));

      if (terrainHeightFn) {
        const terrainY = terrainHeightFn(this.position.x, this.position.z);
        this.position.y = terrainY + 6.0;
      } else {
        this.position.y = Math.max(this.position.y, 6.0);
      }
    }
  }

  checkPlayerProximity(playerPosition) {
    const distance = this.position.distanceTo(playerPosition);
    const wasNearby = this.isPlayerNearby;
    this.isPlayerNearby = distance <= this.interactionRadius;

    if (this.isPlayerNearby && !wasNearby) {
      this.generateDialogue();
    }

    return this.isPlayerNearby;
  }

  getDialogue() {
    return this.isPlayerNearby ? this.currentDialogue : "";
  }
}

export default NPC;
