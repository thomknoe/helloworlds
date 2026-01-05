import * as THREE from "three";
import { WorldObject } from "./WorldObject.js";
export class Entity extends WorldObject {
  constructor(position = new THREE.Vector3(), velocity = new THREE.Vector3()) {
    super();
    this.position = position;
    this.velocity = velocity;
    this.acceleration = new THREE.Vector3();
    this.setPosition(position.x, position.y, position.z);
  }
  update(deltaTime) {
    this.velocity.add(this.acceleration.clone().multiplyScalar(deltaTime));
    this.position.add(this.velocity.clone().multiplyScalar(deltaTime));
    this.acceleration.multiplyScalar(0);
    this.setPosition(this.position.x, this.position.y, this.position.z);
  }
  applyForce(force) {
    this.acceleration.add(force);
  }
  limitVelocity(maxSpeed) {
    if (this.velocity.length() > maxSpeed) {
      this.velocity.normalize().multiplyScalar(maxSpeed);
    }
  }
  distanceTo(other) {
    return this.position.distanceTo(other.position);
  }
}
