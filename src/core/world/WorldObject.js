import * as THREE from "three";
export class WorldObject {
  constructor() {
    if (this.constructor === WorldObject) {
      throw new Error("WorldObject is an abstract class and cannot be instantiated directly");
    }
    this.group = new THREE.Group();
    this.meshes = [];
    this.materials = [];
    this.geometries = [];
  }
  getGroup() {
    return this.group;
  }
  addMesh(mesh) {
    this.group.add(mesh);
    this.meshes.push(mesh);
    if (mesh.material) {
      if (Array.isArray(mesh.material)) {
        this.materials.push(...mesh.material);
      } else {
        this.materials.push(mesh.material);
      }
    }
    if (mesh.geometry) {
      this.geometries.push(mesh.geometry);
    }
  }
  setPosition(x, y, z) {
    this.group.position.set(x, y, z);
  }
  getPosition() {
    return this.group.position.clone();
  }
  dispose() {
    this.meshes.forEach((mesh) => {
      if (mesh.parent) {
        mesh.parent.remove(mesh);
      }
    });
    this.materials.forEach((material) => {
      if (material.dispose) {
        material.dispose();
      }
    });
    this.geometries.forEach((geometry) => {
      if (geometry.dispose) {
        geometry.dispose();
      }
    });
    if (this.group.parent) {
      this.group.parent.remove(this.group);
    }
    this.meshes = [];
    this.materials = [];
    this.geometries = [];
  }
}
