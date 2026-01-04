import * as THREE from "three";
import { WorldObject } from "./WorldObject.js";

/**
 * Base class for entities that can move and interact
 * Extends WorldObject with movement and behavior capabilities
 */
export class Entity extends WorldObject {
  constructor(position = new THREE.Vector3(), velocity = new THREE.Vector3()) {
    super();
    this.position = position;
    this.velocity = velocity;
    this.acceleration = new THREE.Vector3();
    this.setPosition(position.x, position.y, position.z);
  }

  /**
   * Update entity state
   * @param {number} deltaTime - Time since last update in seconds
   */
  update(deltaTime) {
    this.velocity.add(this.acceleration.clone().multiplyScalar(deltaTime));
    this.position.add(this.velocity.clone().multiplyScalar(deltaTime));
    this.acceleration.multiplyScalar(0);
    this.setPosition(this.position.x, this.position.y, this.position.z);
  }

  /**
   * Apply a force to the entity
   * @param {THREE.Vector3} force - Force vector to apply
   */
  applyForce(force) {
    this.acceleration.add(force);
  }

  /**
   * Limit the velocity to a maximum speed
   * @param {number} maxSpeed - Maximum speed
   */
  limitVelocity(maxSpeed) {
    if (this.velocity.length() > maxSpeed) {
      this.velocity.normalize().multiplyScalar(maxSpeed);
    }
  }

  /**
   * Get distance to another entity
   * @param {Entity} other - Other entity
   * @returns {number} Distance
   */
  distanceTo(other) {
    return this.position.distanceTo(other.position);
  }
}

