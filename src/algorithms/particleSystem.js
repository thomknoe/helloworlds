import * as THREE from "three";

/**
 * Simple Particle System
 * Gravity + wind forces, spawn/despawn logic for leaves, dust, rain, snow
 */
export class Particle {
  constructor(position, velocity, lifetime = 5.0) {
    this.position = new THREE.Vector3().copy(position);
    this.velocity = new THREE.Vector3().copy(velocity);
    this.lifetime = lifetime;
    this.age = 0;
    this.alive = true;
  }

  update(deltaTime, gravity, wind) {
    if (!this.alive) return;

    // Apply forces
    this.velocity.add(gravity.clone().multiplyScalar(deltaTime));
    this.velocity.add(wind.clone().multiplyScalar(deltaTime));

    // Update position
    this.position.add(this.velocity.clone().multiplyScalar(deltaTime));

    // Update age
    this.age += deltaTime;
    if (this.age >= this.lifetime) {
      this.alive = false;
    }
  }
}

export class ParticleSystem {
  constructor(config = {}) {
    this.particles = [];
    this.maxParticles = config.maxParticles || 1000;
    this.spawnRate = config.spawnRate || 10; // particles per second
    this.spawnTimer = 0;
    
    // Physics
    this.gravity = new THREE.Vector3(
      config.gravityX || 0,
      config.gravityY || -9.8,
      config.gravityZ || 0
    );
    this.wind = new THREE.Vector3(
      config.windX || 0,
      config.windY || 0,
      config.windZ || 0
    );

    // Spawn area
    this.spawnArea = {
      center: new THREE.Vector3(
        config.spawnX || 0,
        config.spawnY || 50,
        config.spawnZ || 0
      ),
      size: new THREE.Vector3(
        config.spawnSizeX || 10,
        config.spawnSizeY || 5,
        config.spawnSizeZ || 10
      ),
    };

    // Initial velocity range
    this.velocityRange = {
      min: new THREE.Vector3(
        config.velMinX || -1,
        config.velMinY || 0,
        config.velMinZ || -1
      ),
      max: new THREE.Vector3(
        config.velMaxX || 1,
        config.velMaxY || 2,
        config.velMaxZ || 1
      ),
    };

    this.lifetime = config.lifetime || 5.0;
    this.lifetimeVariation = config.lifetimeVariation || 2.0;
  }

  spawnParticle() {
    if (this.particles.length >= this.maxParticles) {
      // Remove oldest dead particle
      const deadIndex = this.particles.findIndex(p => !p.alive);
      if (deadIndex >= 0) {
        this.particles.splice(deadIndex, 1);
      } else {
        return; // All particles alive, can't spawn
      }
    }

    // Random position in spawn area
    const pos = new THREE.Vector3(
      this.spawnArea.center.x + (Math.random() - 0.5) * this.spawnArea.size.x,
      this.spawnArea.center.y + (Math.random() - 0.5) * this.spawnArea.size.y,
      this.spawnArea.center.z + (Math.random() - 0.5) * this.spawnArea.size.z
    );

    // Random velocity
    const vel = new THREE.Vector3(
      this.velocityRange.min.x + Math.random() * (this.velocityRange.max.x - this.velocityRange.min.x),
      this.velocityRange.min.y + Math.random() * (this.velocityRange.max.y - this.velocityRange.min.y),
      this.velocityRange.min.z + Math.random() * (this.velocityRange.max.z - this.velocityRange.min.z)
    );

    // Random lifetime
    const lifetime = this.lifetime + (Math.random() - 0.5) * this.lifetimeVariation;

    this.particles.push(new Particle(pos, vel, lifetime));
  }

  update(deltaTime) {
    // Spawn new particles
    this.spawnTimer += deltaTime;
    const spawnInterval = 1.0 / this.spawnRate;
    while (this.spawnTimer >= spawnInterval && this.particles.length < this.maxParticles) {
      this.spawnParticle();
      this.spawnTimer -= spawnInterval;
    }

    // Update all particles
    for (const particle of this.particles) {
      particle.update(deltaTime, this.gravity, this.wind);
    }

    // Remove dead particles
    this.particles = this.particles.filter(p => p.alive);
  }

  getParticles() {
    return this.particles.filter(p => p.alive);
  }

  reset() {
    this.particles = [];
    this.spawnTimer = 0;
  }
}

export default ParticleSystem;

