import * as THREE from "three";
import { Entity } from "../core/world/Entity.js";

/**
 * Boid entity for flocking behavior
 * Extends Entity base class
 */
export class Boid extends Entity {
  constructor(position = new THREE.Vector3(), velocity = new THREE.Vector3()) {
    super(position, velocity);
  }

  /**
   * Update boid state
   * @param {number} deltaTime - Time since last update
   * @param {number} maxSpeed - Maximum speed limit
   */
  update(deltaTime, maxSpeed = 5.0) {
    this.velocity.add(this.acceleration.clone().multiplyScalar(deltaTime));
    this.limitVelocity(maxSpeed);
    this.position.add(this.velocity.clone().multiplyScalar(deltaTime));
    this.acceleration.multiplyScalar(0);
    super.update(deltaTime);
  }
}

import { FlockingConfig } from "../core/config/FlockingConfig.js";

/**
 * Flocking system for managing boid behavior
 * Uses FlockingConfig for configuration
 */
export class FlockingSystem {
  constructor(config = {}) {
    this.boids = [];
    this.config = config instanceof FlockingConfig ? config : new FlockingConfig(config);
  }

  addBoid(boid) {
    this.boids.push(boid);
  }

  removeBoid(boid) {
    const index = this.boids.indexOf(boid);
    if (index > -1) {
      this.boids.splice(index, 1);
    }
  }

  separate(boid) {
    const steer = new THREE.Vector3();
    let count = 0;
    const separationRadiusSq = this.config.separationRadius * this.config.separationRadius;
    const maxNeighbors = 8; // Limit neighbor checks for performance

    for (const other of this.boids) {
      if (other === boid) continue;
      if (count >= maxNeighbors) break; // Early exit optimization

      // Use distance squared to avoid expensive sqrt
      const dx = boid.position.x - other.position.x;
      const dy = boid.position.y - other.position.y;
      const dz = boid.position.z - other.position.z;
      const distanceSq = dx * dx + dy * dy + dz * dz;

      if (distanceSq > 0 && distanceSq < separationRadiusSq) {
        const distance = Math.sqrt(distanceSq);
        const diff = new THREE.Vector3(dx, dy, dz).normalize().divideScalar(distance);
        steer.add(diff);
        count++;
      }
    }

    if (count > 0) {
      steer.divideScalar(count);
      steer.normalize();
      steer.multiplyScalar(this.config.maxSpeed);
      steer.sub(boid.velocity);
      steer.clampLength(0, this.config.maxForce);
    }

    return steer;
  }

  align(boid) {
    const sum = new THREE.Vector3();
    let count = 0;
    const neighborRadiusSq = this.config.neighborRadius * this.config.neighborRadius;
    const maxNeighbors = 8; // Limit neighbor checks for performance

    for (const other of this.boids) {
      if (other === boid) continue;
      if (count >= maxNeighbors) break; // Early exit optimization

      // Use distance squared to avoid expensive sqrt
      const dx = boid.position.x - other.position.x;
      const dy = boid.position.y - other.position.y;
      const dz = boid.position.z - other.position.z;
      const distanceSq = dx * dx + dy * dy + dz * dz;

      if (distanceSq > 0 && distanceSq < neighborRadiusSq) {
        sum.add(other.velocity);
        count++;
      }
    }

    if (count > 0) {
      sum.divideScalar(count);
      sum.normalize();
      sum.multiplyScalar(this.config.maxSpeed);
      const steer = new THREE.Vector3().subVectors(sum, boid.velocity);
      steer.clampLength(0, this.config.maxForce);
      return steer;
    }

    return new THREE.Vector3();
  }

  cohesion(boid) {
    const sum = new THREE.Vector3();
    let count = 0;
    const neighborRadiusSq = this.config.neighborRadius * this.config.neighborRadius;
    const maxNeighbors = 8; // Limit neighbor checks for performance

    for (const other of this.boids) {
      if (other === boid) continue;
      if (count >= maxNeighbors) break; // Early exit optimization

      // Use distance squared to avoid expensive sqrt
      const dx = boid.position.x - other.position.x;
      const dy = boid.position.y - other.position.y;
      const dz = boid.position.z - other.position.z;
      const distanceSq = dx * dx + dy * dy + dz * dz;

      if (distanceSq > 0 && distanceSq < neighborRadiusSq) {
        sum.add(other.position);
        count++;
      }
    }

    if (count > 0) {
      sum.divideScalar(count);
      const desired = new THREE.Vector3().subVectors(sum, boid.position);
      desired.normalize();
      desired.multiplyScalar(this.config.maxSpeed);
      const steer = new THREE.Vector3().subVectors(desired, boid.velocity);
      steer.clampLength(0, this.config.maxForce);
      return steer;
    }

    return new THREE.Vector3();
  }

  boundaries(boid) {
    const margin = 5.0;
    const steer = new THREE.Vector3();
    const bounds = this.config.getBounds();
    const center = this.config.getCenter();
    const planeHeight = this.config.planeHeight;

    if (boid.position.x < center.x - bounds.width / 2 + margin) {
      steer.x = 1;
    } else if (boid.position.x > center.x + bounds.width / 2 - margin) {
      steer.x = -1;
    }

    if (boid.position.z < center.z - bounds.depth / 2 + margin) {
      steer.z = 1;
    } else if (boid.position.z > center.z + bounds.depth / 2 - margin) {
      steer.z = -1;
    }

    if (boid.position.y < planeHeight - margin) {
      steer.y = 1;
    } else if (boid.position.y > planeHeight + margin) {
      steer.y = -1;
    }

    if (steer.length() > 0) {
      steer.normalize();
      steer.multiplyScalar(this.config.maxSpeed);
      steer.sub(boid.velocity);
      steer.clampLength(0, this.config.maxForce);
    }

    return steer;
  }

  update(deltaTime) {
    for (const boid of this.boids) {
      const sep = this.separate(boid).multiplyScalar(this.config.separation);
      const ali = this.align(boid).multiplyScalar(this.config.alignment);
      const coh = this.cohesion(boid).multiplyScalar(this.config.cohesion);
      const bounds = this.boundaries(boid).multiplyScalar(1.0);

      boid.applyForce(sep);
      boid.applyForce(ali);
      boid.applyForce(coh);
      boid.applyForce(bounds);

      boid.update(deltaTime, this.config.maxSpeed);
    }
  }

  /**
   * Update configuration
   * @param {Object|FlockingConfig} newConfig - New configuration
   */
  updateConfig(newConfig) {
    if (newConfig instanceof FlockingConfig) {
      this.config = newConfig;
    } else {
      this.config.update(newConfig);
    }
  }
}
