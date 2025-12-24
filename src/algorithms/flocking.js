import * as THREE from "three";

export class Boid {
  constructor(position, velocity) {
    this.position = position;
    this.velocity = velocity;
    this.acceleration = new THREE.Vector3();
  }

  update(deltaTime) {

    this.velocity.add(this.acceleration.clone().multiplyScalar(deltaTime));

    const maxSpeed = 5.0;
    if (this.velocity.length() > maxSpeed) {
      this.velocity.normalize().multiplyScalar(maxSpeed);
    }

    this.position.add(this.velocity.clone().multiplyScalar(deltaTime));

    this.acceleration.multiplyScalar(0);
  }

  applyForce(force) {
    this.acceleration.add(force);
  }
}

export class FlockingSystem {
  constructor(config = {}) {
    this.boids = [];
    this.config = {
      separation: config.separation ?? 1.5,
      alignment: config.alignment ?? 1.0,
      cohesion: config.cohesion ?? 1.0,
      separationRadius: config.separationRadius ?? 2.0,
      neighborRadius: config.neighborRadius ?? 5.0,
      maxSpeed: config.maxSpeed ?? 5.0,
      maxForce: config.maxForce ?? 0.1,
      bounds: config.bounds ?? { width: 50, height: 50, depth: 50 },
      center: config.center ?? new THREE.Vector3(0, 50, 0),
      planeHeight: config.planeHeight ?? 50,
    };
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

    for (const other of this.boids) {
      if (other === boid) continue;

      const distance = boid.position.distanceTo(other.position);

      if (distance > 0 && distance < this.config.separationRadius) {
        const diff = new THREE.Vector3()
          .subVectors(boid.position, other.position)
          .normalize()
          .divideScalar(distance);
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

    for (const other of this.boids) {
      if (other === boid) continue;

      const distance = boid.position.distanceTo(other.position);

      if (distance > 0 && distance < this.config.neighborRadius) {
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

    for (const other of this.boids) {
      if (other === boid) continue;

      const distance = boid.position.distanceTo(other.position);

      if (distance > 0 && distance < this.config.neighborRadius) {
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
    const { bounds, center, planeHeight } = this.config;

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

      boid.update(deltaTime);
    }
  }

  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }
}
