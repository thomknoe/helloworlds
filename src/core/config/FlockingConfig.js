import * as THREE from "three";

/**
 * Configuration class for flocking behavior systems
 * Encapsulates all flocking-related parameters
 */
export class FlockingConfig {
  constructor(config = {}) {
    this.separation = config.separation ?? 1.5;
    this.alignment = config.alignment ?? 1.0;
    this.cohesion = config.cohesion ?? 1.0;
    this.separationRadius = config.separationRadius ?? 2.0;
    this.neighborRadius = config.neighborRadius ?? 5.0;
    this.maxSpeed = config.maxSpeed ?? 5.0;
    this.maxForce = config.maxForce ?? 0.1;
    this.boundsWidth = config.boundsWidth ?? 50;
    this.boundsDepth = config.boundsDepth ?? 50;
    this.planeHeight = config.planeHeight ?? 50;
    this.noiseConfig = config.noiseConfig ?? null;
  }

  /**
   * Get bounds as an object
   * @returns {Object} Bounds object with width, height, depth
   */
  getBounds() {
    return {
      width: this.boundsWidth,
      height: this.planeHeight,
      depth: this.boundsDepth,
    };
  }

  /**
   * Get center position
   * @returns {THREE.Vector3} Center vector
   */
  getCenter() {
    return new THREE.Vector3(0, this.planeHeight, 0);
  }

  /**
   * Create a copy of this configuration
   * @returns {FlockingConfig} New configuration instance
   */
  clone() {
    return new FlockingConfig({
      separation: this.separation,
      alignment: this.alignment,
      cohesion: this.cohesion,
      separationRadius: this.separationRadius,
      neighborRadius: this.neighborRadius,
      maxSpeed: this.maxSpeed,
      maxForce: this.maxForce,
      boundsWidth: this.boundsWidth,
      boundsDepth: this.boundsDepth,
      planeHeight: this.planeHeight,
      noiseConfig: this.noiseConfig ? { ...this.noiseConfig } : null,
    });
  }

  /**
   * Update configuration with new values
   * @param {Object} updates - Partial configuration updates
   */
  update(updates) {
    Object.assign(this, updates);
  }

  /**
   * Convert to plain object for serialization
   * @returns {Object} Plain object representation
   */
  toObject() {
    return {
      separation: this.separation,
      alignment: this.alignment,
      cohesion: this.cohesion,
      separationRadius: this.separationRadius,
      neighborRadius: this.neighborRadius,
      maxSpeed: this.maxSpeed,
      maxForce: this.maxForce,
      boundsWidth: this.boundsWidth,
      boundsDepth: this.boundsDepth,
      planeHeight: this.planeHeight,
      noiseConfig: this.noiseConfig,
    };
  }
}

