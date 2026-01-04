import * as THREE from "three";

/**
 * Abstract base class for all world objects
 * Provides common interface for disposal and lifecycle management
 */
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

  /**
   * Get the Three.js group containing this object
   * @returns {THREE.Group} The object's group
   */
  getGroup() {
    return this.group;
  }

  /**
   * Add a mesh to the object
   * @param {THREE.Mesh} mesh - Mesh to add
   */
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

  /**
   * Set the position of the object
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} z - Z coordinate
   */
  setPosition(x, y, z) {
    this.group.position.set(x, y, z);
  }

  /**
   * Get the position of the object
   * @returns {THREE.Vector3} Current position
   */
  getPosition() {
    return this.group.position.clone();
  }

  /**
   * Dispose of all resources
   * Must be called when object is no longer needed
   */
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

